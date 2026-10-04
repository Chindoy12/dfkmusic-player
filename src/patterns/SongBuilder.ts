import { Song } from '../models/Song';
import type { SongSource } from '../models/SongSource';

export class SongBuilder {
  private artist = 'Artista desconocido';
  private album = '';
  private duration = 0;
  private coverUrl: string | null = null;

  constructor(
    private readonly source: SongSource,
    private readonly key: string,
    private readonly title: string,
  ) {}

  withArtist(artist?: string): this {
    if (artist) this.artist = artist;
    return this;
  }

  withAlbum(album?: string): this {
    if (album) this.album = album;
    return this;
  }

  withDuration(duration: number): this {
    this.duration = Number.isFinite(duration) ? duration : 0;
    return this;
  }

  withCover(coverUrl: string | null): this {
    this.coverUrl = coverUrl;
    return this;
  }

  build(): Song {
    return new Song({
      id: crypto.randomUUID(),
      key: this.key,
      title: this.title,
      artist: this.artist,
      album: this.album,
      duration: this.duration,
      coverUrl: this.coverUrl,
      source: this.source,
    });
  }
}
