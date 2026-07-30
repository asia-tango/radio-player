import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

export interface Track {
  id: string;
  title: string;
  artist?: string;
  url: string;
  playlistId: string;
}

type Catalog = Record<string, string[]>;

@Injectable({ providedIn: 'root' })
export class RadioSchedulerService {

  constructor(private http: HttpClient) {}

  getCatalog() {
    return this.http.get<Record<string, string[]>>('assets/audio/catalog.json');
  }

  private normalizePlaylistName(id?: string): string {
    return (id || '').trim().toLowerCase();
  }

  private pickRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  private resolvePlaylistId(catalog: Catalog, requested?: string): string {
    const keys = Object.keys(catalog);
    if (!keys.length) return '';
    if (!requested) return this.pickRandom(keys);
    const selectedPlaylist = this.normalizePlaylistName(requested);
    return keys.find(k => this.normalizePlaylistName(k) === selectedPlaylist) || this.pickRandom(keys);
  }

  private correctTrack(pid: string, path: string): Track {
    const name = path.split('/').pop() || path;
    return {
      id: `${pid}:${name}`,
      title: name.replace(/\.[^/.]+$/, ''),
      url: `assets/audio/${path}`,
      playlistId: pid
    };
  }

  private mapToCorrectTracks(pid: string, paths: string[]): Track[] {
    return paths.map(p => this.correctTrack(pid, p));
  }

  loadTracks(playlistId?: string): Observable<Track[]> {
    return this.getCatalog().pipe(
      map(catalog => {
        if (!Object.keys(catalog).length) return [];
        const pid = this.resolvePlaylistId(catalog, playlistId);
        const paths = catalog[pid] ?? [];
        return this.mapToCorrectTracks(pid, paths);
      })
    );
  }
}
