import { useSyncExternalStore } from 'react';
import type { PlaybackTime, PlayerState } from '../models/PlayerState';
import { MusicPlayer } from '../services/MusicPlayer';

export const player = MusicPlayer.getInstance();

export function usePlayerState(): PlayerState {
  return useSyncExternalStore(player.subscribe, player.getState);
}

export function usePlaybackTime(): PlaybackTime {
  return useSyncExternalStore(player.subscribeToTime, player.getTime);
}
