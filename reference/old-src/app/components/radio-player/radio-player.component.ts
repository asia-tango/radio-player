import { Component, OnInit, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { RadioSchedulerService, Track } from 'src/app/services/radioSchedulerService.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-radio-player',
  templateUrl: './radio-player.component.html',
  styleUrls: ['./radio-player.component.scss']
})
export class RadioPlayerComponent implements OnInit, OnDestroy {
  private audio: HTMLAudioElement | null = null;
  
  currentTrackIndex = new BehaviorSubject(0);
  isPlaying = new BehaviorSubject(false);

  playlist: Track[] = [];
  private currentPlaylistId: string | null = null;
  
  get currentTrack() {
    const index = this.currentTrackIndex.value;
    return this.playlist[index] || this.playlist[0] || {
      id: 'default',
      title: 'Radio Stream',
      artist: 'My Radio Station',
      url: ''
    };
  }

  constructor(
    private radioSchedulerService: RadioSchedulerService,
    private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.initializeAudio();
    this.subscribeToPlaylistChanges();
  }

  private subscribeToPlaylistChanges(): void {
    // Load tracks from query param 'playlist' if provided; otherwise random playlist
    this.route.queryParamMap.subscribe(params => {
      const pid = params.get('playlist') || undefined;
      const changed = (pid || null) !== this.currentPlaylistId;

      if (changed && this.audio && !this.audio.paused) {
        this.audio.pause();
        this.isPlaying.next(false);
      }
      this.currentPlaylistId = pid || null;

      this.radioSchedulerService.loadTracks(pid).subscribe(tracks => {
        this.playlist = tracks || [];
        this.prepareFirstTrack();
      });
    });
  }

  private prepareFirstTrack(): void {
    if (this.audio && this.playlist.length) {
      const idx = Math.floor(Math.random() * this.playlist.length);
      this.currentTrackIndex.next(idx);
      this.audio.src = this.playlist[idx].url;
    }
  }

  private initializeAudio(): void {
    this.audio = new Audio();
    this.audio.preload = 'metadata';
    
    this.audio.addEventListener('ended', () => {
      this.playNextTrack();
    });
    
    this.audio.addEventListener('play', () => {
      this.isPlaying.next(true);
    });
  }

  private loadRandomTrack(): void {//TODO: fix random to play music without duplicates
    if (this.audio && this.playlist.length > 0) {
      const randomIndex = Math.floor(Math.random() * this.playlist.length);
      this.audio.src = this.playlist[randomIndex].url;
      this.currentTrackIndex.next(randomIndex);
    }
  }

  private playNextTrack(): void {
    this.loadRandomTrack();
    this.audio?.play();
  }

  playPause(): void {
    if (!this.audio) return;
    
    if (this.isPlaying.value) {
      this.audio.pause();
      this.isPlaying.next(false);
    } else {
      this.audio.play();
    }
  }

  ngOnDestroy(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
  }
} 