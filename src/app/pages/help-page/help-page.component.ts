import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

interface HelpSection {
  title: string;
  body: string;
}

const HELP_SECTIONS: HelpSection[] = [
  {
    title: 'Instant random play',
    body: 'Press the "Random" button next to play/pause at any time to jump straight into a random station from the current top 100 by popularity — no setup needed.',
  },
  {
    title: 'Pick a country',
    body: "Use the country dropdown to load stations broadcasting from that country, sorted by popularity. We default to a country based on your browser's language.",
  },
  {
    title: 'Filter by genre',
    body: 'Tap one of the genre chips (jazz, rock, chill, and more) to narrow the list. Tap it again to clear it.',
  },
  {
    title: 'Search by name',
    body: "Type part of a station's name in the search box to further narrow the current list.",
  },
  {
    title: 'Favorites',
    body: 'Tap the heart icon on any station to add or remove it from your favorites. Favorites are saved in your browser and stay there after you refresh the page. Press "Show favorites" to see only your saved stations.',
  },
  {
    title: 'Playback',
    body: "Click a station in the list to start streaming it, then use the round play/pause button to control playback. RedWave FM streams live radio, so there's no seeking or track list — if a station doesn't respond, you'll see a short error message; just pick another one.",
  },
];

@Component({
  selector: 'app-help-page',
  imports: [MatIconModule],
  templateUrl: './help-page.component.html',
  styleUrl: './help-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HelpPageComponent {
  protected readonly query = signal('');

  protected readonly sections = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) {
      return HELP_SECTIONS;
    }
    return HELP_SECTIONS.filter(
      (section) => section.title.toLowerCase().includes(q) || section.body.toLowerCase().includes(q),
    );
  });

  protected onQueryInput(value: string): void {
    this.query.set(value);
  }
}
