import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { FavoritesService } from '../../services/favorites.service';
import { PlayerService } from '../../services/player.service';

@Component({
  selector: 'app-radio-player',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './radio-player.component.html',
  styleUrl: './radio-player.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioPlayerComponent {
  protected readonly player = inject(PlayerService);
  protected readonly favorites = inject(FavoritesService);

  protected toggleFavorite(): void {
    const station = this.player.currentStation();
    if (station) {
      this.favorites.toggle(station);
    }
  }
}
