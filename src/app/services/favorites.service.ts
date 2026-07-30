import { Injectable, effect, inject, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Station } from '../models/station.model';

const STORAGE_KEY = 'rw-favorites';

function readInitialFavorites(): Station[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Station[]) : [];
  } catch {
    return [];
  }
}

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly snackBar = inject(MatSnackBar);

  readonly favorites = signal<Station[]>(readInitialFavorites());

  constructor() {
    effect(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.favorites()));
    });
  }

  isFavorite(stationuuid: string): boolean {
    return this.favorites().some((station) => station.stationuuid === stationuuid);
  }

  toggle(station: Station): void {
    if (this.isFavorite(station.stationuuid)) {
      this.remove(station.stationuuid);
      this.snackBar.open('Removed from favorites', undefined, { duration: 2000 });
    } else {
      this.add(station);
      this.snackBar.open('Added to favorites', undefined, { duration: 2000 });
    }
  }

  add(station: Station): void {
    if (this.isFavorite(station.stationuuid)) {
      return;
    }
    this.favorites.update((list) => [...list, station]);
  }

  remove(stationuuid: string): void {
    this.favorites.update((list) => list.filter((station) => station.stationuuid !== stationuuid));
  }
}
