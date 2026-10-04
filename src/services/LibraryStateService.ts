import type { PersistedState } from '../models/PersistedState';
import { requestJson } from './apiClient';

export class LibraryStateService {
  load(): Promise<PersistedState> {
    return requestJson<PersistedState>('/api/library-state');
  }

  async save(state: PersistedState): Promise<void> {
    await requestJson('/api/library-state', { method: 'PUT', body: state });
  }
}
