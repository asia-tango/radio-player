import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

import { RadioPlayerComponent } from '../../components/radio-player/radio-player.component';
import {
  StationPickerComponent,
  StationPickerData,
} from '../../components/station-picker/station-picker.component';
import { StationListComponent } from '../../components/station-list/station-list.component';
import { COUNTRIES } from '../../data/countries';
import { FavoritesService } from '../../services/favorites.service';
import { StationService } from '../../services/station.service';

@Component({
  selector: 'app-home',
  imports: [RadioPlayerComponent, StationListComponent, MatButtonModule, MatIconModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  protected readonly stationService = inject(StationService);
  protected readonly favorites = inject(FavoritesService);

  readonly q = input('', { alias: 'q' });
  readonly tag = input<string | null>(null);
  readonly country = input<string | null>(null);

  protected readonly countries = COUNTRIES;
  protected readonly showFavoritesOnly = signal(false);

  constructor() {
    effect(() => this.stationService.setSearchQuery(this.q()));
    effect(() => this.stationService.setTag(this.tag()));
    effect(() => this.stationService.setCountryCode(this.country()));
  }

  protected onSearchInput(value: string): void {
    this.updateQueryParams({ q: value || null });
  }

  protected onCountryChange(code: string): void {
    this.updateQueryParams({ country: code || null });
  }

  protected openTagPicker(): void {
    const ref = this.dialog.open<StationPickerComponent, StationPickerData, string | null>(
      StationPickerComponent,
      {
        data: { selectedTag: this.tag() },
        width: '100%',
        maxWidth: '420px',
        autoFocus: false,
        panelClass: 'station-picker-dialog',
        backdropClass: 'station-picker-backdrop',
      },
    );

    ref.afterClosed().subscribe((tag) => {
      if (tag === undefined) {
        return;
      }
      this.updateQueryParams({ tag: tag || null });
    });
  }

  protected toggleFavoritesOnly(): void {
    this.showFavoritesOnly.update((value) => !value);
  }

  private updateQueryParams(params: Record<string, string | null>): void {
    this.router.navigate([], { queryParams: params, queryParamsHandling: 'merge' });
  }
}
