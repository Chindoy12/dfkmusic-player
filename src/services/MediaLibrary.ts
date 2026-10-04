import { SinglyLinkedList } from '../data-structures/SinglyLinkedList';
import type { PersistedPlaylist } from '../models/PersistedState';
import { Playlist } from '../models/Playlist';
import type { Song } from '../models/Song';

export type InsertPosition = { mode: 'start' } | { mode: 'end' } | { mode: 'index'; index: number };

export interface AddSongsResult {
  added: Song[];
  duplicates: Song[];
}

export const LIBRARY_ID = 'library';

export class MediaLibrary {
  readonly library = new Playlist(LIBRARY_ID, 'Biblioteca');
  private playlists: Playlist[] = [];
  private readonly favorites = new SinglyLinkedList<Song>();
  private pendingFavoriteKeys = new Set<string>();
  private insertionCounter = 0;

  getPlaylists(): Playlist[] {
    return this.playlists;
  }

  getFavorites(): Song[] {
    return this.favorites.toArray();
  }

  getFavoriteKeys(): string[] {
    return [...this.favorites.toArray().map((song) => song.key), ...this.pendingFavoriteKeys];
  }

  findPlaylist(id: string): Playlist | null {
    return id === LIBRARY_ID ? this.library : (this.playlists.find((playlist) => playlist.id === id) ?? null);
  }

  hasSong(song: Song): boolean {
    return this.library.contains(song);
  }

  addSongs(songs: Song[], position: InsertPosition): AddSongsResult {
    const knownKeys = new Set(this.library.songs.toArray().map((song) => song.key));
    const added: Song[] = [];
    const duplicates: Song[] = [];
    for (const song of songs) {
      if (knownKeys.has(song.key)) {
        duplicates.push(song);
      } else {
        knownKeys.add(song.key);
        added.push(song);
      }
    }

    const startIndex = this.resolveStartIndex(position);
    added.forEach((song, offset) => {
      song.insertionOrder = this.insertionCounter++;
      this.library.insertAt(startIndex + offset, song);
      this.restoreMemberships(song);
    });
    return { added, duplicates };
  }

  removeSong(song: Song): void {
    this.library.remove(song);
    this.playlists.forEach((playlist) => playlist.remove(song));
    this.favorites.remove(song);
    song.release();
  }

  clearLibrary(): void {
    this.library.songs.toArray().forEach((song) => song.release());
    this.library.clear();
    this.playlists.forEach((playlist) => playlist.unloadSongs());
    this.pendingFavoriteKeys = new Set(this.getFavoriteKeys());
    this.favorites.clear();
  }

  toggleFavorite(song: Song): void {
    if (!this.favorites.remove(song)) this.favorites.addFirst(song);
  }

  createPlaylist(name: string): Playlist {
    const playlist = new Playlist(crypto.randomUUID(), name.trim());
    this.playlists.push(playlist);
    return playlist;
  }

  deletePlaylist(id: string): void {
    this.playlists = this.playlists.filter((playlist) => playlist.id !== id);
  }

  restore(playlists: PersistedPlaylist[], favoriteKeys: string[]): void {
    this.playlists = playlists.map(({ id, name, songKeys }) => {
      const playlist = new Playlist(id, name);
      playlist.setPendingKeys(songKeys);
      return playlist;
    });
    this.favorites.clear();
    this.pendingFavoriteKeys = new Set(favoriteKeys);
    this.library.songs.toArray().forEach((song) => this.restoreMemberships(song));
  }

  reset(): void {
    this.clearLibrary();
    this.playlists = [];
    this.pendingFavoriteKeys.clear();
    this.insertionCounter = 0;
  }

  private resolveStartIndex(position: InsertPosition): number {
    const size = this.library.songs.getSize();
    if (position.mode === 'start') return 0;
    if (position.mode === 'end') return size;
    return Math.min(Math.max(position.index, 0), size);
  }

  private restoreMemberships(song: Song): void {
    this.playlists.forEach((playlist) => playlist.resolve(song));
    if (this.pendingFavoriteKeys.delete(song.key)) this.favorites.addFirst(song);
  }
}
