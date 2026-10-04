import type { DoublyLinkedList } from '../data-structures/DoublyLinkedList';
import type { Song } from '../models/Song';

export type SortOrderId = 'asc' | 'desc' | 'insertion';

export interface SortStrategy {
  readonly id: SortOrderId;
  apply(songs: DoublyLinkedList<Song>): void;
}

export class AlphabeticalAscending implements SortStrategy {
  readonly id = 'asc';

  apply(songs: DoublyLinkedList<Song>): void {
    songs.sortAlphabetically((song) => song.title);
  }
}

export class AlphabeticalDescending implements SortStrategy {
  readonly id = 'desc';

  apply(songs: DoublyLinkedList<Song>): void {
    songs.sortAlphabetically((song) => song.title, true);
  }
}

export class InsertionOrder implements SortStrategy {
  readonly id = 'insertion';

  apply(songs: DoublyLinkedList<Song>): void {
    songs.sort((a, b) => a.insertionOrder - b.insertionOrder);
  }
}

export const sortStrategies: Record<SortOrderId, SortStrategy> = {
  asc: new AlphabeticalAscending(),
  desc: new AlphabeticalDescending(),
  insertion: new InsertionOrder(),
};
