import { useEffect, useRef, useState } from 'react';
import { ApiError } from '../services/apiClient';
import { LibraryStateService } from '../services/LibraryStateService';
import { player, usePlayerState } from './usePlayer';

const SAVE_DELAY_MS = 800;
const stateService = new LibraryStateService();

export function usePersistence(onSessionExpired: () => void): string | null {
  const state = usePlayerState();
  const [isLoaded, setIsLoaded] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const lastSaved = useRef('');

  useEffect(() => {
    let cancelled = false;
    stateService
      .load()
      .then((saved) => {
        if (cancelled) return;
        player.restore(saved);
        lastSaved.current = JSON.stringify(player.getPersistedState());
        setIsLoaded(true);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        if (error instanceof ApiError && error.status === 401) onSessionExpired();
        else setErrorCode('STATE_LOAD_FAILED');
      });
    return () => {
      cancelled = true;
    };
  }, [onSessionExpired]);

  useEffect(() => {
    if (!isLoaded) return;
    const snapshot = player.getPersistedState();
    const serialized = JSON.stringify(snapshot);
    if (serialized === lastSaved.current) return;

    const timer = window.setTimeout(() => {
      stateService
        .save(snapshot)
        .then(() => {
          lastSaved.current = serialized;
          setErrorCode(null);
        })
        .catch((error: unknown) => {
          if (error instanceof ApiError && error.status === 401) onSessionExpired();
          else setErrorCode('STATE_SAVE_FAILED');
        });
    }, SAVE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [state, isLoaded, onSessionExpired]);

  return errorCode;
}
