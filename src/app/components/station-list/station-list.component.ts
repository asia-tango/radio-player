import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { Station } from '../../models/station.model';
import { FavoritesService } from '../../services/favorites.service';
import { PlayerService } from '../../services/player.service';
import { StationService } from '../../services/station.service';

@Component({
  selector: 'app-station-list',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './station-list.component.html',
  styleUrl: './station-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StationListComponent {
  protected readonly stationService = inject(StationService);
  protected readonly player = inject(PlayerService);
  protected readonly favorites = inject(FavoritesService);

  /** When set, renders this fixed list (e.g. favorites) instead of live search results. */
  readonly stations = input<Station[] | null>(null);
  readonly emptyMessage = input('No stations found. Try a different search.');

  protected readonly displayedStations = computed(() => this.stations() ?? this.stationService.stations());
  protected readonly isLoading = computed(() => this.stations() === null && this.stationService.isLoading());
}
