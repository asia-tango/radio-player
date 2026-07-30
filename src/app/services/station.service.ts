import { HttpClient, HttpParams } from '@angular/common/http';
import { httpResource } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, map } from 'rxjs';

import { RADIO_BROWSER_API_BASE } from '../data/radio-browser.config';
import { Station } from '../models/station.model';

@Injectable({ providedIn: 'root' })
export class StationService {
  private readonly http = inject(HttpClient);

  readonly searchQuery = signal('');
  readonly selectedTag = signal<string | null>(null);
  readonly selectedCountryCode = signal<string | null>(null);

  private readonly searchUrl = computed(() => {
    const query = this.searchQuery().trim();
    const tag = this.selectedTag();
    const countryCode = this.selectedCountryCode();

    if (!query && !tag && !countryCode) {
      return undefined;
    }

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

    return `${RADIO_BROWSER_API_BASE}/json/stations/search?${params.toString()}`;
  });

  private readonly stationsResource = httpResource<Station[]>(() => this.searchUrl(), {
    defaultValue: [],
  });

  readonly stations = this.stationsResource.value;
  readonly isLoading = this.stationsResource.isLoading;
  readonly error = this.stationsResource.error;
  readonly hasSearched = computed(() => this.searchUrl() !== undefined);

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

  /** One-off pick of a random station from the top 100 by votes, for the "Random" button. */
  fetchRandomTopStation(): Observable<Station | undefined> {
    const params = new HttpParams({
      fromObject: {
        limit: '100',
        hidebroken: 'true',
        order: 'votes',
        reverse: 'true',
      },
    });

    return this.http
      .get<Station[]>(`${RADIO_BROWSER_API_BASE}/json/stations/search?${params.toString()}`)
      .pipe(map((stations) => stations[Math.floor(Math.random() * stations.length)]));
  }
}
