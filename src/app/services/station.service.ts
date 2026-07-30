import { HttpParams } from '@angular/common/http';
import { httpResource } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';

import { RADIO_BROWSER_API_BASE } from '../data/radio-browser.config';
import { Station } from '../models/station.model';

@Injectable({ providedIn: 'root' })
export class StationService {
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
        order: 'clickcount',
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
}
