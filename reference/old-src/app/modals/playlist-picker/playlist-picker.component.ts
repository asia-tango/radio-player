import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface MoodMeta {
  title: string;
  subtitle?: string;
}

const MOOD_LABELS: Record<string, MoodMeta> = {
  party: { title: 'Party', subtitle: 'Upbeat & energetic' },
  night: { title: 'Night', subtitle: 'Late-night vibes' },
  chill: { title: 'Chill', subtitle: 'Easy listening' },
};

@Component({
  selector: 'app-playlist-picker',
  templateUrl: './playlist-picker.component.html',
  styleUrls: ['./playlist-picker.component.scss']
})
export class PlaylistPickerComponent {

  constructor(
    public dialogRef: MatDialogRef<PlaylistPickerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { playlistIds: string[]; selectedId?: string | null }
  ) {}

  getMood(id: string): MoodMeta {
    if (MOOD_LABELS[id]) {
      return MOOD_LABELS[id];
    }
    const title = id.charAt(0).toUpperCase() + id.slice(1);
    return { title };
  }

  isSelected(id: string): boolean {
    const selected = (this.data.selectedId ?? '').trim().toLowerCase();
    return selected !== '' && selected === id.trim().toLowerCase();
  }

  choosePlaylist(pid: string): void {
    this.dialogRef.close(pid);
  }

  randomPlaylist(): void {
    this.dialogRef.close('');
  }
}
