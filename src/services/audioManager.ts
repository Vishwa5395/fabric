import { getPreferences, savePreferences } from './storage';

export type AudioSourceType = 'ambient' | 'recordingPlayback' | 'recordingPreview' | 'sfx';

export interface AudioManagerListener {
  onAmbientStateChange: (isPlaying: boolean, isAvailable: boolean) => void;
  onVolumeChange: (vol: number) => void;
  onPlaybackStateChange: (isPlaying: boolean, currentId?: string) => void;
  onAmbientTimeUpdate?: (currentTime: number, duration: number) => void;
}

class AudioManagerService {
  private ambientAudio: HTMLAudioElement | null = null;
  private ambientAvailable: boolean = true;
  private ambientPlaying: boolean = false;
  private userPausedAmbient: boolean = false;
  private ambientPlayPromise: Promise<void> | null = null;
  private currentVolume: number = 0.7;

  // Web Audio Context for SFX synthesis & Gain
  private audioCtx: AudioContext | null = null;
  private gainNode: GainNode | null = null;

  // Web Audio fallback soothing ambient generator nodes
  private synthAmbientOscillators: OscillatorNode[] = [];
  private synthAmbientGain: GainNode | null = null;

  // Active non-ambient playback
  private activePlaybackAudio: HTMLAudioElement | null = null;
  private activePlaybackId: string | null = null;
  private activePlaybackUrl: string | null = null;

  private listeners: Set<AudioManagerListener> = new Set();

  constructor() {
    const prefs = getPreferences();
    this.currentVolume = typeof prefs.ambientVolume === 'number' ? prefs.ambientVolume : 0.7;
    this.ambientAvailable = true;
  }

  private initAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.setValueAtTime(this.currentVolume, this.audioCtx.currentTime);
      this.gainNode.connect(this.audioCtx.destination);
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  public subscribe(listener: AudioManagerListener): () => void {
    this.listeners.add(listener);
    listener.onAmbientStateChange(this.ambientPlaying, this.ambientAvailable);
    listener.onVolumeChange(this.currentVolume);
    listener.onPlaybackStateChange(this.activePlaybackAudio !== null && !this.activePlaybackAudio.paused, this.activePlaybackId || undefined);
    if (listener.onAmbientTimeUpdate) {
      listener.onAmbientTimeUpdate(this.getAmbientCurrentTime(), this.getAmbientDuration());
    }

    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyAmbient(): void {
    for (const l of this.listeners) {
      l.onAmbientStateChange(this.ambientPlaying, this.ambientAvailable);
    }
  }

  private notifyVolume(): void {
    for (const l of this.listeners) {
      l.onVolumeChange(this.currentVolume);
    }
  }

  private notifyPlayback(): void {
    const isPlaying = this.activePlaybackAudio !== null && !this.activePlaybackAudio.paused;
    for (const l of this.listeners) {
      l.onPlaybackStateChange(isPlaying, this.activePlaybackId || undefined);
    }
  }

  public async checkAmbientFile(): Promise<boolean> {
    this.ambientAvailable = true;
    this.notifyAmbient();
    return true;
  }

  public async toggleAmbient(): Promise<void> {
    if (this.ambientPlaying) {
      this.pauseAmbient();
    } else {
      await this.playAmbient();
    }
  }

  public async playAmbient(): Promise<void> {
    // Stop any active preview/playback before starting ambient
    this.stopPlayback();
    this.userPausedAmbient = false;
    this.ambientPlaying = true;
    this.notifyAmbient();

    const ctx = this.initAudioContext();
    if (ctx.state === 'suspended') {
      await ctx.resume().catch(() => {});
    }

    let playedAudioTag = false;

    // Try HTML Audio element with Cowpoke ambient music
    if (!this.ambientAudio) {
      this.ambientAudio = new Audio();
      this.ambientAudio.loop = true;
      this.ambientAudio.preload = 'auto';

      const sourceCowpoke = document.createElement('source');
      sourceCowpoke.src = '/audio/cowpoke.m4a';
      sourceCowpoke.type = 'audio/mp4';

      const sourceM4a = document.createElement('source');
      sourceM4a.src = '/audio/ambient.m4a';
      sourceM4a.type = 'audio/mp4';

      this.ambientAudio.appendChild(sourceCowpoke);
      this.ambientAudio.appendChild(sourceM4a);
      this.ambientAudio.volume = this.currentVolume;

      this.ambientAudio.addEventListener('timeupdate', () => {
        this.notifyAmbientTime();
      });
      this.ambientAudio.addEventListener('loadedmetadata', () => {
        this.notifyAmbientTime();
      });
      this.ambientAudio.addEventListener('durationchange', () => {
        this.notifyAmbientTime();
      });
    }

    try {
      this.ambientPlayPromise = this.ambientAudio.play();
      await this.ambientPlayPromise;
      this.ambientPlayPromise = null;
      playedAudioTag = true;

      // If user paused while the play promise was resolving, pause immediately
      if (!this.ambientPlaying) {
        this.ambientAudio.pause();
        return;
      }
    } catch {
      this.ambientPlayPromise = null;
      playedAudioTag = false;
    }

    // Stop synth so both are never playing together
    this.stopSynthAmbient();

    if (!playedAudioTag && this.ambientPlaying) {
      this.startSynthAmbient();
    }

    this.notifyAmbient();

    // Media Session API
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: 'Sukoon Dhun',
          artist: 'The Unofficial Fun Department',
          album: 'Peaceful Ambient'
        });
        navigator.mediaSession.setActionHandler('play', () => this.playAmbient());
        navigator.mediaSession.setActionHandler('pause', () => this.pauseAmbient());
      } catch {
        // mediaSession optional
      }
    }
  }

  public pauseAmbient(): void {
    this.userPausedAmbient = true;
    this.ambientPlaying = false;
    if (this.ambientAudio) {
      this.ambientAudio.pause();
    }
    this.stopSynthAmbient();
    this.notifyAmbient();
  }

  /**
   * Soothing Web Audio synth generator:
   * Warm, gentle pentatonic drone (C3, G3, C4, E4, G4) through a 500Hz low-pass filter
   * creates instant calming ambient "sukoon" chords on any device.
   */
  private startSynthAmbient(): void {
    this.stopSynthAmbient();
    try {
      const ctx = this.initAudioContext();
      const masterSynthGain = ctx.createGain();
      masterSynthGain.gain.setValueAtTime(this.currentVolume * 0.45, ctx.currentTime);
      masterSynthGain.connect(ctx.destination);
      this.synthAmbientGain = masterSynthGain;

      // Low pass filter for soft warm texture
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(550, ctx.currentTime);
      filter.Q.setValueAtTime(1.2, ctx.currentTime);
      filter.connect(masterSynthGain);

      // Pentatonic warm chords: C3, G3, C4, E4, G4
      const chordFreqs = [130.81, 196.00, 261.63, 329.63, 392.00];

      this.synthAmbientOscillators = chordFreqs.map((freq, idx) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        // Gentle harmonic balance
        const amp = 0.25 / chordFreqs.length;
        oscGain.gain.setValueAtTime(amp, ctx.currentTime);

        osc.connect(oscGain);
        oscGain.connect(filter);
        osc.start();
        return osc;
      });
    } catch (e) {
      console.warn('Synth ambient failed:', e);
    }
  }

  private stopSynthAmbient(): void {
    if (this.synthAmbientOscillators.length > 0) {
      for (const osc of this.synthAmbientOscillators) {
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // ignore
        }
      }
      this.synthAmbientOscillators = [];
    }
    if (this.synthAmbientGain) {
      try {
        this.synthAmbientGain.disconnect();
      } catch {
        // ignore
      }
      this.synthAmbientGain = null;
    }
  }

  public setVolume(vol: number): void {
    const clamped = Math.max(0, Math.min(1, vol));
    this.currentVolume = clamped;
    if (this.ambientAudio) {
      this.ambientAudio.volume = clamped;
    }
    if (this.gainNode && this.audioCtx) {
      this.gainNode.gain.setValueAtTime(clamped, this.audioCtx.currentTime);
    }
    if (this.synthAmbientGain && this.audioCtx) {
      this.synthAmbientGain.gain.setValueAtTime(clamped * 0.45, this.audioCtx.currentTime);
    }
    savePreferences({ ambientVolume: clamped });
    this.notifyVolume();
  }

  public getVolume(): number {
    return this.currentVolume;
  }

  public isAmbientActive(): boolean {
    return this.ambientPlaying;
  }

  public isUserPausedAmbient(): boolean {
    return this.userPausedAmbient;
  }

  public isAmbientAvailable(): boolean {
    return true;
  }

  public getAmbientCurrentTime(): number {
    return this.ambientAudio ? this.ambientAudio.currentTime : 0;
  }

  public getAmbientDuration(): number {
    return this.ambientAudio && !isNaN(this.ambientAudio.duration) ? this.ambientAudio.duration : 0;
  }

  public seekAmbient(seconds: number): void {
    if (this.ambientAudio) {
      const dur = this.getAmbientDuration();
      const target = Math.max(0, dur > 0 ? Math.min(seconds, dur) : seconds);
      this.ambientAudio.currentTime = target;
      this.notifyAmbientTime();
    }
  }

  public stopAmbient(): void {
    this.pauseAmbient();
    if (this.ambientAudio) {
      this.ambientAudio.currentTime = 0;
      this.notifyAmbientTime();
    }
  }

  private notifyAmbientTime(): void {
    const cur = this.getAmbientCurrentTime();
    const dur = this.getAmbientDuration();
    for (const l of this.listeners) {
      if (l.onAmbientTimeUpdate) {
        l.onAmbientTimeUpdate(cur, dur);
      }
    }
  }

  /* Single non-ambient playback rule */
  public playRecording(blob: Blob, id: string): HTMLAudioElement {
    // 1. Starting playback PAUSES ambient completely
    this.pauseAmbient();

    // 2. Stop any existing playback
    this.stopPlayback();

    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    this.activePlaybackAudio = audio;
    this.activePlaybackId = id;
    this.activePlaybackUrl = url;

    audio.addEventListener('ended', () => {
      this.stopPlayback();
    });

    audio.addEventListener('pause', () => {
      this.notifyPlayback();
    });

    audio.addEventListener('play', () => {
      this.notifyPlayback();
    });

    audio.play().catch(err => {
      console.warn('Playback error:', err);
      this.stopPlayback();
    });

    this.notifyPlayback();
    return audio;
  }

  public stopPlayback(): void {
    if (this.activePlaybackAudio) {
      this.activePlaybackAudio.pause();
      this.activePlaybackAudio = null;
    }
    if (this.activePlaybackUrl) {
      URL.revokeObjectURL(this.activePlaybackUrl);
      this.activePlaybackUrl = null;
    }
    this.activePlaybackId = null;
    this.notifyPlayback();
  }

  public getActivePlayback(): { isPlaying: boolean; id?: string } {
    const isPlaying = this.activePlaybackAudio !== null && !this.activePlaybackAudio.paused;
    return { isPlaying, id: this.activePlaybackId || undefined };
  }

  /* SFX synthesiser (Web Audio API - short retro bleeps) */
  public playSfx(
    frequencyOrName: number | 'ding' | 'badge' | 'achievement' | 'gavel' = 440,
    type: OscillatorType = 'sine',
    durationSec: number = 0.15
  ): void {
    const prefs = getPreferences();
    if (!prefs.soundEffects) return;

    if (typeof frequencyOrName === 'string') {
      if (frequencyOrName === 'ding') {
        this.playSfx(880, 'sine', 0.1);
      } else if (frequencyOrName === 'badge' || frequencyOrName === 'gavel') {
        this.playSfx(220, 'triangle', 0.35);
      } else if (frequencyOrName === 'achievement') {
        this.playAchievementSound();
      }
      return;
    }

    const frequency = frequencyOrName;

    try {
      const ctx = this.initAudioContext();
      const osc = ctx.createOscillator();
      const sfxGain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      sfxGain.gain.setValueAtTime(0.3, ctx.currentTime);
      sfxGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSec);

      osc.connect(sfxGain);
      sfxGain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + durationSec);
    } catch (e) {
      console.warn('SFX audio failed:', e);
    }
  }

  public playAchievementSound(): void {
    this.playSfx(523, 'triangle', 0.1);
    setTimeout(() => this.playSfx(659, 'triangle', 0.2), 110);
  }
}

export const audioManager = new AudioManagerService();
