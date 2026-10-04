import type { Song } from './Song';

export type RepeatMode = 'off' | 'all' | 'one';

export interface PlaylistView {
  id: string;
  name: string;
  songs: Song[];
}

export interface NodeView {
  song: Song;
  previous: Song | null;
  next: Song | null;
}

export interface PlayerState {
  library: Song[];
  libraryBackward: Song[];
  libraryNodes: NodeView[];
  playlists: PlaylistView[];
  favorites: Song[];
  queue: Song[];
  recent: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  volume: number;
  muted: boolean;
  repeat: RepeatMode;
  shuffle: boolean;
  errorCode: string | null;
}

export interface PlaybackTime {
  currentTime: number;
  duration: number;
}
