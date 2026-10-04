import type { RepeatMode } from './PlayerState';

export interface UserPreferences {
  volume: number;
  muted: boolean;
  repeat: RepeatMode;
  shuffle: boolean;
  favoriteKeys: string[];
}

export interface PersistedPlaylist {
  id: string;
  name: string;
  songKeys: string[];
}

export interface PersistedState {
  preferences: UserPreferences;
  playlists: PersistedPlaylist[];
}
