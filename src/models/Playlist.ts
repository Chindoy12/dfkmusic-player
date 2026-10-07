import { DoublyLinkedList } from '../data-structures/DoublyLinkedList';
import type { SongNode } from '../data-structures/SongNode';
import type { SortStrategy } from '../patterns/SortStrategy';
import type { Song } from './Song';

export class Playlist {
  readonly songs = new DoublyLinkedList<Song>();
  private current: SongNode<Song> | null = null;
  private pendingKeys = new Set<string>();

  constructor(
    readonly id: string,
    private displayName: string,
  ) {}

  get name(): string {
    return this.displayName;
  }

  rename(name: string): void {
    this.displayName = name;
  }

  getCurrentSong(): Song | null {
    return this.current?.value ?? null;
  }

  contains(song: Song): boolean {
    return this.songs.find((candidate) => candidate === song) !== null;
  }

  addLast(song: Song): void {
    this.songs.addLast(song);
  }

  insertAt(index: number, song: Song): void {
    this.songs.insertAt(index, song);
  }

  remove(song: Song): boolean {
    if (this.current?.value === song) {
      this.current = this.current.next ?? this.current.previous;
    }
    return this.songs.remove(song);
  }

  moveSong(song: Song, targetIndex: number): boolean {
    const node = this.songs.find((candidate) => candidate === song);
    return node ? this.songs.moveNode(node, targetIndex) : false;
  }

  select(song: Song): boolean {
    const node = this.songs.find((candidate) => candidate === song);
    if (!node) return false;
    this.current = node;
    return true;
  }

  moveNext(): Song | null {
    const node = this.current ? this.songs.next(this.current) : this.songs.getHead();
    return this.moveTo(node);
  }

  movePrevious(): Song | null {
    const node = this.current ? this.songs.previous(this.current) : this.songs.getTail();
    return this.moveTo(node);
  }

  moveToHead(): Song | null {
    return this.moveTo(this.songs.getHead());
  }

  moveRandom(): Song | null {
    const size = this.songs.getSize();
    if (size === 0) return null;

    let candidate: SongNode<Song> | null;
    do {
      candidate = this.songs.getNode(Math.floor(Math.random() * size));
    } while (size > 1 && candidate === this.current);
    return this.moveTo(candidate);
  }

  sort(strategy: SortStrategy): void {
    strategy.apply(this.songs);
  }

  getTotalDuration(): number {
    let total = 0;
    for (const song of this.songs) total += song.duration;
    return total;
  }

  getSongKeys(): string[] {
    return [...this.songs.toArray().map((song) => song.key), ...this.pendingKeys];
  }

  setPendingKeys(keys: string[]): void {
    this.pendingKeys = new Set(keys);
  }

  resolve(song: Song): boolean {
    if (!this.pendingKeys.delete(song.key)) return false;
    this.songs.addLast(song);
    return true;
  }

  unloadSongs(): void {
    this.pendingKeys = new Set(this.getSongKeys());
    this.songs.clear();
    this.current = null;
  }

  clear(): void {
    this.songs.clear();
    this.pendingKeys.clear();
    this.current = null;
  }

  private moveTo(node: SongNode<Song> | null): Song | null {
    if (!node) return null;
    this.current = node;
    return node.value;
  }
}
