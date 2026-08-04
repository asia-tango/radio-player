import { HttpClient, HttpParams } from '@angular/common/http';
import { httpResource } from '@angular/common/http';
import { Injectable, computed, inject, resource, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { excludeBannedStations } from '../data/content-policy';
import { dedupeStations } from '../data/dedupe-stations';
import { RADIO_BROWSER_API_BASE } from '../data/radio-browser.config';
import { Station } from '../models/station.model';

interface SearchParams {
  query: string;
  tag: string | null;
  countryCode: string | null;
}

interface SearchResult {
  stations: Station[];
  fellBackFromCountry: boolean;
}

// Fetches extra headroom above the 100 we actually want, since banned-country
// stations are filtered out afterwards (see content-policy.ts).
const TOP_STATIONS_URL = `${RADIO_BROWSER_API_BASE}/json/stations/search?${new HttpParams({
  fromObject: { limit: '200', hidebroken: 'true', order: 'votes', reverse: 'true' },
}).toString()}`;

@Injectable({ providedIn: 'root' })
export class StationService {
  private readonly http = inject(HttpClient);

  readonly searchQuery = signal('');
  readonly selectedTag = signal<string | null>(null);
  readonly selectedCountryCode = signal<string | null>(null);

  private readonly searchParams = computed<SearchParams | undefined>(() => {
    const query = this.searchQuery().trim();
    const tag = this.selectedTag();
    const countryCode = this.selectedCountryCode();

    if (!query && !tag && !countryCode) {
      return undefined;
    }

    return { query, tag, countryCode };
  });

  // Uses the generic `resource()` (not httpResource) because a plain declarative
  // URL isn't enough here: a country+genre combo that comes back empty needs a
  // second, worldwide-by-genre request as a fallback.
  private readonly searchResource = resource({
    params: () => this.searchParams(),
    loader: async ({ params }) => {
      const primary = await this.fetchStations(params.query, params.tag, params.countryCode);
      if (primary.length === 0 && params.tag && params.countryCode) {
        const fallback = await this.fetchStations(params.query, params.tag, null);
        return { stations: fallback, fellBackFromCountry: fallback.length > 0 };
      }
      return { stations: primary, fellBackFromCountry: false };
    },
    defaultValue: { stations: [], fellBackFromCountry: false } as SearchResult,
  });

  readonly stations = computed(() => this.searchResource.value().stations);
  readonly fellBackFromCountry = computed(() => this.searchResource.value().fellBackFromCountry);
  readonly isLoading = this.searchResource.isLoading;
  readonly error = this.searchResource.error;
  readonly hasSearched = computed(() => this.searchParams() !== undefined);

  // Loaded once at startup (constant URL) and reused by the "Random" button, so
  // clicking it can call audio.play() synchronously within the click's user
  // gesture instead of blocking on a network round-trip first.
  private readonly topStationsResource = httpResource<Station[]>(() => TOP_STATIONS_URL, {
    defaultValue: [],
    parse: (raw) => dedupeStations(excludeBannedStations(raw as Station[])).slice(0, 100),
  });

  readonly topStations = this.topStationsResource.value;

  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }

  setTag(tag: string | null): void {
    this.selectedTag.set(tag);
  }

  setCountryCode(countryCode: string | null): void {
    this.selectedCountryCode.set(countryCode);
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedTag.set(null);
    this.selectedCountryCode.set(null);
  }

  // Re-runs the last search after all automatic retries (see retry.interceptor.ts)
  // have already been exhausted and the resource is sitting in an error state.
  retry(): void {
    this.searchResource.reload();
  }

  pickRandomTopStation(): Station | undefined {
    const stations = this.topStations();
    return stations.length ? stations[Math.floor(Math.random() * stations.length)] : undefined;
  }

  private async fetchStations(
    query: string,
    tag: string | null,
    countryCode: string | null,
  ): Promise<Station[]> {
    const params = new HttpParams({
      fromObject: {
        limit: '30',
        hidebroken: 'true',
        order: 'votes',
        reverse: 'true',
        ...(query ? { name: query } : {}),
        ...(tag ? { tag } : {}),
        ...(countryCode ? { countrycode: countryCode } : {}),
      },
    });
    const url = `${RADIO_BROWSER_API_BASE}/json/stations/search?${params.toString()}`;
    const raw = await firstValueFrom(this.http.get<Station[]>(url));
    return dedupeStations(excludeBannedStations(raw));
  }
}
