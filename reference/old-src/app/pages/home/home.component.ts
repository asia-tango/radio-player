import {HttpClient} from '@angular/common/http';
import { Component } from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Router, ActivatedRoute} from '@angular/router';
import {PlaylistPickerComponent} from 'src/app/modals/playlist-picker/playlist-picker.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  title = 'radio-translator';
  isHome = true;
  activePlaylistId = '';
  showMoodBar = false;
  playlistIds: string[] = [];
  currentPlaylistId: string | null = null;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.http.get<Record<string, string[]>>('assets/audio/catalog.json')
      .subscribe(cat => this.playlistIds = Object.keys(cat));

    this.route.queryParamMap.subscribe(p => {
      const pid = p.get('playlist');
      this.currentPlaylistId = pid && pid.trim() ? pid : null;
    });
  }

  get moodButtonLabel(): string {
    const id = this.currentPlaylistId;
    if (!id) {
      return 'Choose your mood';
    }
    const labels: Record<string, string> = {
      party: 'Party',
      night: 'Night',
      chill: 'Chill'
    };
    return `Mood: ${labels[id] ?? id}`;
  }

  openMoodDialog(): void {
    const ref = this.dialog.open(PlaylistPickerComponent, {
      data: { playlistIds: this.playlistIds, selectedId: this.currentPlaylistId },
      width: '100%',
      maxWidth: '420px',
      autoFocus: false,
      panelClass: 'playlist-dialog',
      backdropClass: 'playlist-backdrop'
    });

    ref.afterClosed().subscribe((pid?: string) => {
      if (pid === undefined) return;
      if (pid === '') {
        // Random
        this.router.navigate([], { queryParams: { playlist: null }, queryParamsHandling: 'merge' });
      } else {
        // Selected mood
        this.router.navigate([], { queryParams: { playlist: pid }, queryParamsHandling: 'merge' });
      }
    });
  }
}
