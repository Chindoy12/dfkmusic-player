import type { AudioEngine, AudioEngineListener } from './AudioEngine';

const FADE_STEP_MS = 50;

export class FadeInAudioEngine implements AudioEngine {
  private targetVolume = 1;
  private fadeTimer: number | null = null;

  constructor(
    private readonly inner: AudioEngine,
    private readonly fadeDurationMs = 600,
  ) {}

  play(): Promise<void> {
    this.cancelFade();
    this.inner.setVolume(0);
    const result = this.inner.play();
    this.startFade();
    return result;
  }

  pause(): void {
    this.cancelFade();
    this.inner.setVolume(this.targetVolume);
    this.inner.pause();
  }

  setVolume(volume: number): void {
    this.targetVolume = volume;
    this.cancelFade();
    this.inner.setVolume(volume);
  }

  load(url: string): void {
    this.inner.load(url);
  }

  seek(seconds: number): void {
    this.inner.seek(seconds);
  }

  setMuted(muted: boolean): void {
    this.inner.setMuted(muted);
  }

  getCurrentTime(): number {
    return this.inner.getCurrentTime();
  }

  getDuration(): number {
    return this.inner.getDuration();
  }

  setListener(listener: AudioEngineListener): void {
    this.inner.setListener(listener);
  }

  private startFade(): void {
    const steps = this.fadeDurationMs / FADE_STEP_MS;
    let step = 0;
    this.fadeTimer = window.setInterval(() => {
      step++;
      this.inner.setVolume(this.targetVolume * Math.min(step / steps, 1));
      if (step >= steps) this.cancelFade();
    }, FADE_STEP_MS);
  }

  private cancelFade(): void {
    if (this.fadeTimer === null) return;
    window.clearInterval(this.fadeTimer);
    this.fadeTimer = null;
  }
}
