import type { SongSource } from './SongSource';

export interface SongProps {
  id: string;
  key: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  coverUrl: string | null;
  source: SongSource;
}

export class Song {
  readonly id: string;
  readonly key: string;
  readonly title: string;
  readonly artist: string;
  readonly album: string;
  readonly duration: number;
  readonly coverUrl: string | null;
  readonly source: SongSource;
  insertionOrder = 0;

  constructor(props: SongProps) {
    this.id = props.id;
    this.key = props.key;
    this.title = props.title;
    this.artist = props.artist;
    this.album = props.album;
    this.duration = props.duration;
    this.coverUrl = props.coverUrl;
    this.source = props.source;
  }

  getUrl(): string {
    return this.source.getUrl();
  }

  matches(query: string): boolean {
    const normalized = query.trim().toLowerCase();
    return (
      normalized === '' ||
      this.title.toLowerCase().includes(normalized) ||
      this.artist.toLowerCase().includes(normalized)
    );
  }

  release(): void {
    this.source.release();
    if (this.coverUrl) URL.revokeObjectURL(this.coverUrl);
  }
}
