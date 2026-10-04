export interface AudioEngineListener {
  onTimeUpdate(): void;
  onEnded(): void;
  onError(): void;
  onPlayStateChange(isPlaying: boolean): void;
}

export interface AudioEngine {
  load(url: string): void;
  play(): Promise<void>;
  pause(): void;
  seek(seconds: number): void;
  setVolume(volume: number): void;
  setMuted(muted: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  setListener(listener: AudioEngineListener): void;
}

export class HtmlAudioEngine implements AudioEngine {
  private readonly audio = new Audio();

  constructor() {
    this.audio.preload = 'auto';
  }

  load(url: string): void {
    this.audio.src = url;
    this.audio.load();
  }

  play(): Promise<void> {
    return this.audio.play();
  }

  pause(): void {
    this.audio.pause();
  }

  seek(seconds: number): void {
    this.audio.currentTime = seconds;
  }

  setVolume(volume: number): void {
    this.audio.volume = volume;
  }

  setMuted(muted: boolean): void {
    this.audio.muted = muted;
  }

  getCurrentTime(): number {
    return this.audio.currentTime;
  }

  getDuration(): number {
    return this.audio.duration;
  }

  setListener(listener: AudioEngineListener): void {
    this.audio.ontimeupdate = () => listener.onTimeUpdate();
    this.audio.onloadedmetadata = () => listener.onTimeUpdate();
    this.audio.onended = () => listener.onEnded();
    this.audio.onerror = () => listener.onError();
    this.audio.onplay = () => listener.onPlayStateChange(true);
    this.audio.onpause = () => listener.onPlayStateChange(false);
  }
}
