import { LocalFileSongCreator } from '../patterns/SongCreator';
import type { Song } from '../models/Song';

const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac'];
export const AUDIO_ACCEPT = ['audio/*', ...AUDIO_EXTENSIONS].join(',');

interface FilePickerWindow {
  showOpenFilePicker?: (options: {
    multiple: boolean;
    types: { description: string; accept: Record<string, string[]> }[];
  }) => Promise<{ getFile(): Promise<File> }[]>;
}

export interface SongImportResult {
  songs: Song[];
  failedCount: number;
}

export class LocalFileService {
  private readonly creator = new LocalFileSongCreator();

  async pickFiles(): Promise<File[] | null> {
    const picker = (window as FilePickerWindow).showOpenFilePicker;
    if (!picker) return null;

    try {
      const handles = await picker({
        multiple: true,
        types: [{ description: 'Audio', accept: { 'audio/*': AUDIO_EXTENSIONS } }],
      });
      return await Promise.all(handles.map((handle) => handle.getFile()));
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return [];
      throw error;
    }
  }

  filterAudioFiles(files: File[]): File[] {
    return files.filter(
      (file) =>
        file.type.startsWith('audio/') ||
        AUDIO_EXTENSIONS.some((extension) => file.name.toLowerCase().endsWith(extension)),
    );
  }

  async importFiles(files: File[]): Promise<SongImportResult> {
    const results = await Promise.allSettled(files.map((file) => this.creator.createSong(file)));
    const songs = results.flatMap((result) => (result.status === 'fulfilled' ? [result.value] : []));
    return { songs, failedCount: results.length - songs.length };
  }
}
