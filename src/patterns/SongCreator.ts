import { LocalFileSource, RemoteUrlSource, type SongSource } from '../models/SongSource';
import type { Song } from '../models/Song';
import { readDuration, readTags, type AudioTags } from '../utils/audioMetadata';
import { SongBuilder } from './SongBuilder';

interface SongDraft {
  key: string;
  title: string;
  tags: AudioTags;
  duration: number;
}

export abstract class SongCreator<TInput> {
  async createSong(input: TInput): Promise<Song> {
    const source = this.createSource(input);
    try {
      const draft = await this.readDraft(input, source);
      return new SongBuilder(source, draft.key, draft.title)
        .withArtist(draft.tags.artist)
        .withAlbum(draft.tags.album)
        .withCover(draft.tags.coverUrl ?? null)
        .withDuration(draft.duration)
        .build();
    } catch (error) {
      source.release();
      throw error;
    }
  }

  protected abstract createSource(input: TInput): SongSource;

  protected abstract readDraft(input: TInput, source: SongSource): Promise<SongDraft>;
}

export class LocalFileSongCreator extends SongCreator<File> {
  protected createSource(file: File): SongSource {
    return new LocalFileSource(file);
  }

  protected async readDraft(file: File, source: SongSource): Promise<SongDraft> {
    const [duration, tags] = await Promise.all([readDuration(source.getUrl()), readTags(file)]);
    const fileName = file.name.replace(/\.[^.]+$/, '');
    return { key: `${file.name}|${file.size}`, title: tags.title || fileName, tags, duration };
  }
}

export class RemoteUrlSongCreator extends SongCreator<string> {
  protected createSource(url: string): SongSource {
    return new RemoteUrlSource(url);
  }

  protected async readDraft(url: string, source: SongSource): Promise<SongDraft> {
    const duration = await readDuration(source.getUrl());
    const lastSegment = decodeURIComponent(new URL(url).pathname.split('/').pop() ?? '');
    return { key: url, title: lastSegment.replace(/\.[^.]+$/, '') || url, tags: {}, duration };
  }
}
