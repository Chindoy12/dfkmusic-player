import { Queue } from '../data-structures/Queue';
import { Stack } from '../data-structures/Stack';
import type { PersistedPlaylist, PersistedState } from '../models/PersistedState';
import type { NodeView, PlaybackTime, PlayerState, PlaylistView, RepeatMode } from '../models/PlayerState';
import type { Playlist } from '../models/Playlist';
import type { Song } from '../models/Song';
import { FadeInAudioEngine } from '../patterns/FadeInAudioEngine';
import { HtmlAudioEngine, type AudioEngine } from '../patterns/AudioEngine';
import { sortStrategies, type SortOrderId } from '../patterns/SortStrategy';
import { LIBRARY_ID, MediaLibrary, type AddSongsResult, type InsertPosition } from './MediaLibrary';

type Listener = () => void;
type Collections = Pick<
  PlayerState,
  'library' | 'libraryBackward' | 'libraryNodes' | 'playlists' | 'favorites' | 'queue' | 'recent'
>;

const RESTART_THRESHOLD_SECONDS = 3;
const REPEAT_CYCLE: Record<RepeatMode, RepeatMode> = { off: 'all', all: 'one', one: 'off' };

export class MusicPlayer {
  private static instance: MusicPlayer | null = null;

  static getInstance(): MusicPlayer {
    if (!MusicPlayer.instance) {
      MusicPlayer.instance = new MusicPlayer(new FadeInAudioEngine(new HtmlAudioEngine()));
    }
    return MusicPlayer.instance;
  }

  private readonly mediaLibrary = new MediaLibrary();
  private readonly queue = new Queue<Song>();
  private readonly history = new Stack<Song>();
  private activePlaylist: Playlist = this.mediaLibrary.library;
  private currentSong: Song | null = null;
  private isPlaying = false;
  private volume = 0.8;
  private muted = false;
  private repeat: RepeatMode = 'off';
  private shuffle = false;
  private errorCode: string | null = null;

  private readonly stateListeners = new Set<Listener>();
  private readonly timeListeners = new Set<Listener>();
  private collections: Collections = this.readCollections();
  private state: PlayerState = this.buildState();
  private time: PlaybackTime = { currentTime: 0, duration: 0 };

  private constructor(private readonly engine: AudioEngine) {
    engine.setVolume(this.volume);
    engine.setListener({
      onTimeUpdate: () => this.updateTime(),
      onEnded: () => this.handleEnded(),
      onError: () => this.fail('AUDIO_LOAD_FAILED'),
      onPlayStateChange: (isPlaying) => {
        this.isPlaying = isPlaying;
        this.emit(false);
      },
    });
  }

  subscribe = (listener: Listener): (() => void) => {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  };

  subscribeToTime = (listener: Listener): (() => void) => {
    this.timeListeners.add(listener);
    return () => this.timeListeners.delete(listener);
  };

  getState = (): PlayerState => this.state;

  getTime = (): PlaybackTime => this.time;

  addSongs(songs: Song[], position: InsertPosition): AddSongsResult {
    const result = this.mediaLibrary.addSongs(songs, position);
    result.duplicates.forEach((song) => song.release());
    this.emit();
    return result;
  }

  removeSong(song: Song): void {
    if (this.currentSong === song) this.stopAndClearCurrent();
    this.queue.remove(song);
    this.mediaLibrary.removeSong(song);
    this.emit();
  }

  clearLibrary(): void {
    this.stopAndClearCurrent();
    this.queue.clear();
    this.history.clear();
    this.activePlaylist = this.mediaLibrary.library;
    this.mediaLibrary.clearLibrary();
    this.emit();
  }

  sortPlaylist(playlistId: string, order: SortOrderId): void {
    this.mediaLibrary.findPlaylist(playlistId)?.sort(sortStrategies[order]);
    this.emit();
  }

  createPlaylist(name: string): string {
    const playlist = this.mediaLibrary.createPlaylist(name);
    this.emit();
    return playlist.id;
  }

  renamePlaylist(id: string, name: string): void {
    this.mediaLibrary.findPlaylist(id)?.rename(name.trim());
    this.emit();
  }

  deletePlaylist(id: string): void {
    if (this.activePlaylist.id === id) this.activePlaylist = this.mediaLibrary.library;
    this.mediaLibrary.deletePlaylist(id);
    this.emit();
  }

  clearPlaylist(id: string): void {
    if (id === LIBRARY_ID) return this.clearLibrary();
    this.mediaLibrary.findPlaylist(id)?.clear();
    this.emit();
  }

  addToPlaylist(playlistId: string, song: Song): void {
    const playlist = this.mediaLibrary.findPlaylist(playlistId);
    if (playlist && !playlist.contains(song)) playlist.addLast(song);
    this.emit();
  }

  removeFromPlaylist(playlistId: string, song: Song): void {
    if (playlistId === LIBRARY_ID) return this.removeSong(song);
    this.mediaLibrary.findPlaylist(playlistId)?.remove(song);
    this.emit();
  }

  toggleFavorite(song: Song): void {
    this.mediaLibrary.toggleFavorite(song);
    this.emit();
  }

  enqueue(song: Song): void {
    this.queue.enqueue(song);
    this.emit();
  }

  removeFromQueue(song: Song): void {
    this.queue.remove(song);
    this.emit();
  }

  clearQueue(): void {
    this.queue.clear();
    this.emit();
  }

  playSong(song: Song, playlistId: string = this.activePlaylist.id): void {
    let playlist = this.mediaLibrary.findPlaylist(playlistId) ?? this.mediaLibrary.library;
    if (!playlist.select(song)) {
      playlist = this.mediaLibrary.library;
      playlist.select(song);
    }
    this.activePlaylist = playlist;
    this.startPlayback(song);
  }

  togglePlayPause(): void {
    if (!this.currentSong) {
      const first = this.activePlaylist.getCurrentSong() ?? this.activePlaylist.moveToHead();
      if (first) this.playSong(first);
      return;
    }
    if (this.isPlaying) {
      this.engine.pause();
    } else {
      this.engine.play().catch(() => this.fail('PLAYBACK_FAILED'));
    }
  }

  next(): void {
    const queued = this.queue.dequeue();
    if (queued) return this.playSong(queued);

    const upcoming = this.shuffle ? this.activePlaylist.moveRandom() : this.activePlaylist.moveNext();
    if (upcoming) return this.startPlayback(upcoming);

    const first = this.repeat === 'all' ? this.activePlaylist.moveToHead() : null;
    if (first) this.startPlayback(first);
    else this.finishPlayback();
  }

  previous(): void {
    if (this.engine.getCurrentTime() > RESTART_THRESHOLD_SECONDS) return this.seek(0);

    if (this.shuffle && this.history.getSize() > 1) {
      this.history.pop();
      const earlier = this.history.pop();
      if (earlier) return this.playSong(earlier);
    }
    const preceding = this.activePlaylist.movePrevious();
    if (preceding) this.startPlayback(preceding);
    else this.seek(0);
  }

  seek(seconds: number): void {
    this.engine.seek(seconds);
    this.updateTime();
  }

  setVolume(volume: number): void {
    this.volume = volume;
    this.muted = false;
    this.engine.setVolume(volume);
    this.engine.setMuted(false);
    this.emit(false);
  }

  toggleMute(): void {
    this.muted = !this.muted;
    this.engine.setMuted(this.muted);
    this.emit(false);
  }

  toggleShuffle(): void {
    this.shuffle = !this.shuffle;
    this.emit(false);
  }

  cycleRepeat(): void {
    this.repeat = REPEAT_CYCLE[this.repeat];
    this.emit(false);
  }

  dismissError(): void {
    this.errorCode = null;
    this.emit(false);
  }

  restore(saved: PersistedState): void {
    const { preferences } = saved;
    this.volume = preferences.volume;
    this.muted = preferences.muted;
    this.repeat = preferences.repeat;
    this.shuffle = preferences.shuffle;
    this.engine.setVolume(this.volume);
    this.engine.setMuted(this.muted);
    this.mediaLibrary.restore(saved.playlists, preferences.favoriteKeys);
    this.emit();
  }

  getPersistedState(): PersistedState {
    const playlists: PersistedPlaylist[] = this.mediaLibrary
      .getPlaylists()
      .map((playlist) => ({ id: playlist.id, name: playlist.name, songKeys: playlist.getSongKeys() }));
    return {
      preferences: {
        volume: this.volume,
        muted: this.muted,
        repeat: this.repeat,
        shuffle: this.shuffle,
        favoriteKeys: this.mediaLibrary.getFavoriteKeys(),
      },
      playlists,
    };
  }

  reset(): void {
    this.stopAndClearCurrent();
    this.queue.clear();
    this.history.clear();
    this.mediaLibrary.reset();
    this.activePlaylist = this.mediaLibrary.library;
    this.repeat = 'off';
    this.shuffle = false;
    this.errorCode = null;
    this.emit();
  }

  private startPlayback(song: Song): void {
    this.currentSong = song;
    this.errorCode = null;
    this.history.push(song);
    this.engine.load(song.getUrl());
    this.engine.play().catch((error: unknown) => {
      if (!(error instanceof DOMException && error.name === 'AbortError')) this.fail('PLAYBACK_FAILED');
    });
    this.emit();
  }

  private handleEnded(): void {
    if (this.repeat === 'one') {
      this.engine.seek(0);
      this.engine.play().catch(() => this.fail('PLAYBACK_FAILED'));
    } else {
      this.next();
    }
  }

  private finishPlayback(): void {
    this.engine.pause();
    this.engine.seek(0);
    this.updateTime();
  }

  private stopAndClearCurrent(): void {
    this.engine.pause();
    this.currentSong = null;
    this.updateTime();
  }

  private fail(code: string): void {
    this.errorCode = code;
    this.isPlaying = false;
    this.emit(false);
  }

  private updateTime(): void {
    const duration = this.engine.getDuration();
    this.time = {
      currentTime: this.engine.getCurrentTime() || 0,
      duration: Number.isFinite(duration) ? duration : (this.currentSong?.duration ?? 0),
    };
    this.timeListeners.forEach((listener) => listener());
  }

  private emit(collectionsChanged = true): void {
    if (collectionsChanged) this.collections = this.readCollections();
    this.state = this.buildState();
    this.stateListeners.forEach((listener) => listener());
  }

  private buildState(): PlayerState {
    return {
      ...this.collections,
      currentSong: this.currentSong,
      isPlaying: this.isPlaying,
      volume: this.volume,
      muted: this.muted,
      repeat: this.repeat,
      shuffle: this.shuffle,
      errorCode: this.errorCode,
    };
  }

  private readCollections(): Collections {
    const songs = this.mediaLibrary.library.songs;
    const playlists: PlaylistView[] = this.mediaLibrary
      .getPlaylists()
      .map((playlist) => ({ id: playlist.id, name: playlist.name, songs: playlist.songs.toArray() }));
    const libraryNodes: NodeView[] = Array.from(songs.nodes(), (node) => ({
      song: node.value,
      previous: node.previous?.value ?? null,
      next: node.next?.value ?? null,
    }));
    const recent = this.history
      .toArray()
      .filter((song, index, all) => this.mediaLibrary.hasSong(song) && all.indexOf(song) === index);

    return {
      library: songs.toArray(),
      libraryBackward: songs.toReversedArray(),
      libraryNodes,
      playlists,
      favorites: this.mediaLibrary.getFavorites(),
      queue: this.queue.toArray(),
      recent,
    };
  }
}
