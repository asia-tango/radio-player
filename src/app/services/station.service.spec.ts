import { HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { retryInterceptor } from '../interceptors/retry.interceptor';
import { Station } from '../models/station.model';
import { StationService } from './station.service';

const FAKE_STATION: Station = {
  stationuuid: '1',
  name: 'Test FM',
  url: 'https://example.com/stream',
  url_resolved: 'https://example.com/stream',
  favicon: '',
  tags: '',
  country: 'Testland',
  countrycode: 'US',
  codec: 'MP3',
  bitrate: 128,
  lastcheckok: 1,
};

// Only the search request (limit=30&...&countrycode=US), not the top-stations
// preload request that also fires at startup (limit=200).
const isSearchRequest = (r: { url: string }) => r.url.includes('countrycode=US');

describe('StationService error handling', () => {
  let service: StationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([retryInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(StationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  async function nextSearchRequest() {
    return vi.waitFor(
      () => {
        const [req] = httpMock.match(isSearchRequest);
        expect(req).toBeDefined();
        return req;
      },
      { timeout: 5000 },
    );
  }

  async function failSearchThreeTimes(): Promise<void> {
    for (let i = 0; i < 3; i++) {
      const req = await nextSearchRequest();
      req.flush('down', { status: 503, statusText: 'Service Unavailable' });
      TestBed.tick();
    }
  }

  it('sets error() after retries are exhausted on repeated 503s', async () => {
    service.setCountryCode('US');
    TestBed.tick();

    await failSearchThreeTimes();

    await vi.waitFor(
      () => {
        TestBed.tick();
        expect(service.error()).toBeInstanceOf(HttpErrorResponse);
      },
      { timeout: 5000 },
    );
    expect(service.isLoading()).toBe(false);

    httpMock.match(() => true).forEach((r) => r.flush([]));
  });

  it('retry() re-runs the search and can recover from a prior error', async () => {
    service.setCountryCode('US');
    TestBed.tick();

    await failSearchThreeTimes();

    await vi.waitFor(
      () => {
        TestBed.tick();
        expect(service.error()).toBeInstanceOf(HttpErrorResponse);
      },
      { timeout: 5000 },
    );

    service.retry();
    TestBed.tick();

    const req = await nextSearchRequest();
    req.flush([FAKE_STATION]);
    TestBed.tick();

    await vi.waitFor(
      () => {
        TestBed.tick();
        expect(service.error()).toBeUndefined();
      },
      { timeout: 5000 },
    );
    expect(service.stations().length).toBe(1);

    httpMock.match(() => true).forEach((r) => r.flush([]));
  });
});
