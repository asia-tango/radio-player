import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { RADIO_BROWSER_API_BASE } from '../data/radio-browser.config';
import { createRetryInterceptor } from './retry.interceptor';

const TEST_URL = `${RADIO_BROWSER_API_BASE}/json/stations/search?limit=30`;

// Small values so the suite doesn't have to wait out the real 8s production timeout.
const TEST_CONFIG = { maxRetries: 2, baseDelayMs: 5, requestTimeoutMs: 50 };

describe('retryInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([createRetryInterceptor(TEST_CONFIG)])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('retries a failing request up to maxRetries and then surfaces the error', async () => {
    const resultPromise = firstValueFrom(http.get(TEST_URL));

    for (let i = 0; i < TEST_CONFIG.maxRetries; i++) {
      const req = await vi.waitFor(() => httpMock.expectOne(TEST_URL));
      req.flush('down', { status: 503, statusText: 'Service Unavailable' });
    }
    // Final attempt: still fails, no more retries left.
    const lastReq = await vi.waitFor(() => httpMock.expectOne(TEST_URL));
    lastReq.flush('down', { status: 503, statusText: 'Service Unavailable' });

    await expect(resultPromise).rejects.toBeInstanceOf(HttpErrorResponse);
  });

  it('treats a request that never responds as a failure once it times out', async () => {
    const resultPromise = firstValueFrom(http.get(TEST_URL));

    // Never call req.flush() - simulates a hung connection. Each retry attempt
    // times out on its own and gets counted, exactly like a real dropped request.
    for (let i = 0; i <= TEST_CONFIG.maxRetries; i++) {
      await vi.waitFor(() => httpMock.expectOne(TEST_URL));
    }

    await expect(resultPromise).rejects.toBeTruthy();
  });

  it('passes through requests to other hosts untouched', () => {
    TestBed.runInInjectionContext(() => {
      http.get('https://example.com/other').subscribe();
    });
    httpMock.expectOne('https://example.com/other').flush({});
  });
});
