import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { RADIO_BROWSER_API_BASE } from '../data/radio-browser.config';
import { Station } from '../models/station.model';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private readonly http = inject(HttpClient);
  private readonly snackBar = inject(MatSnackBar);
  private readonly audio = new Audio();

  readonly currentStation = signal<Station | null>(null);
  readonly isPlaying = signal(false);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    this.audio.addEventListener('playing', () => {
      this.isLoading.set(false);
      this.isPlaying.set(true);
    });
    this.audio.addEventListener('pause', () => {
      this.isPlaying.set(false);
    });
    this.audio.addEventListener('waiting', () => {
      this.isLoading.set(true);
    });
    // Live streams have no "ended" event worth acting on and no next-track concept
    // (unlike the old local-mp3 playlist) — a broken stream just surfaces an error.
    this.audio.addEventListener('error', () => {
      this.isLoading.set(false);
      this.isPlaying.set(false);
      const message = 'Station unavailable — try another one';
      this.error.set(message);
      this.snackBar.open(message, undefined, { duration: 3000 });
    });
  }

  play(station: Station): void {
    this.audio.pause();
    this.error.set(null);
    this.isLoading.set(true);
    this.currentStation.set(station);
    this.audio.src = station.url_resolved || station.url;
    this.audio.play().catch(() => {
      // handled by the 'error' listener
    });
    this.reportClick(station.stationuuid);
  }

  togglePlayPause(): void {
    if (!this.currentStation()) {
      return;
    }
    if (this.audio.paused) {
      this.audio.play().catch(() => {
        // handled by the 'error' listener
      });
    } else {
      this.audio.pause();
    }
  }

  stop(): void {
    this.audio.pause();
    this.audio.removeAttribute('src');
    this.currentStation.set(null);
    this.isPlaying.set(false);
    this.isLoading.set(false);
  }

  private reportClick(stationuuid: string): void {
    this.http.get(`${RADIO_BROWSER_API_BASE}/json/url/${stationuuid}`).subscribe({
      error: () => {
        // telemetry only, safe to ignore failures
      },
    });
  }
}
