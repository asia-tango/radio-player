import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

import { RadioPlayerComponent } from '../../components/radio-player/radio-player.component';
import { StationListComponent } from '../../components/station-list/station-list.component';
import { COUNTRIES } from '../../data/countries';
import { TAGS } from '../../data/tags';
import { FavoritesService } from '../../services/favorites.service';
import { StationService } from '../../services/station.service';

function detectDefaultCountryCode(): string {
  const fallback = 'UA';
  try {
    const region = new Intl.Locale(navigator.language).maximize().region;
    return region && COUNTRIES.some((country) => country.code === region) ? region : fallback;
  } catch {
    return fallback;
  }
}

@Component({
  selector: 'app-home',
  imports: [RadioPlayerComponent, StationListComponent, MatButtonModule, MatIconModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private readonly router = inject(Router);
  protected readonly stationService = inject(StationService);
  protected readonly favorites = inject(FavoritesService);

  readonly q = input('', { alias: 'q' });
  readonly tag = input<string | null>(null);
  readonly country = input<string | null>(null);

  protected readonly countries = COUNTRIES;
  protected readonly tags = TAGS;
  protected readonly showFavoritesOnly = signal(false);

  private readonly defaultCountryCode = detectDefaultCountryCode();
  protected readonly effectiveCountryCode = computed(() => this.country() ?? this.defaultCountryCode);

  constructor() {
    effect(() => this.stationService.setSearchQuery(this.q()));
    effect(() => this.stationService.setTag(this.tag()));
    effect(() => this.stationService.setCountryCode(this.effectiveCountryCode()));
  }

  protected onSearchInput(value: string): void {
    this.updateQueryParams({ q: value || null });
  }

  protected onCountryChange(code: string): void {
    this.updateQueryParams({ country: code || null });
  }

  protected toggleTag(tag: string): void {
    this.updateQueryParams({ tag: this.tag() === tag ? null : tag });
  }

  protected toggleFavoritesOnly(): void {
    this.showFavoritesOnly.update((value) => !value);
  }

  private updateQueryParams(params: Record<string, string | null>): void {
    this.router.navigate([], { queryParams: params, queryParamsHandling: 'merge' });
  }
}
