import { useEffect } from 'react';
import { player } from './usePlayer';

const SEEK_STEP_SECONDS = 5;
const TEXT_ENTRY_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON']);

export function useKeyboardShortcuts(): void {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      const target = event.target as HTMLElement;
      if (TEXT_ENTRY_TAGS.has(target.tagName) || event.ctrlKey || event.metaKey || event.altKey) return;

      const shortcuts: Record<string, () => void> = {
        ' ': () => player.togglePlayPause(),
        n: () => player.next(),
        p: () => player.previous(),
        m: () => player.toggleMute(),
        s: () => player.toggleShuffle(),
        r: () => player.cycleRepeat(),
        ArrowRight: () => player.seek(player.getTime().currentTime + SEEK_STEP_SECONDS),
        ArrowLeft: () => player.seek(Math.max(0, player.getTime().currentTime - SEEK_STEP_SECONDS)),
      };
      const action = shortcuts[event.key];
      if (action) {
        event.preventDefault();
        action();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
