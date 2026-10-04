import { useState } from 'react';
import { AddMusicPanel } from '../components/AddMusicPanel';
import { useAuth } from '../components/AuthProvider';
import { Header } from '../components/Header';
import { Icon } from '../components/Icon';
import { PlayerBar } from '../components/PlayerBar';
import { QueuePanel } from '../components/QueuePanel';
import { Sidebar } from '../components/Sidebar';
import { SongCollectionView } from '../components/SongCollectionView';
import { StructureView } from '../components/StructureView';
import { player, usePlayerState } from '../hooks/usePlayer';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { usePersistence } from '../hooks/usePersistence';
import { LIBRARY_ID } from '../services/MediaLibrary';
import { describeError } from '../utils/errorMessages';

export type ViewId = 'library' | 'recent' | 'favorites' | 'queue' | 'add' | 'structure' | `playlist:${string}`;

export function LibraryPage() {
  const state = usePlayerState();
  const { logout } = useAuth();
  const [view, setView] = useState<ViewId>('library');
  const [search, setSearch] = useState('');
  const syncErrorCode = usePersistence(() => void logout());
  useKeyboardShortcuts();

  const playlist = view.startsWith('playlist:') ? state.playlists.find((item) => `playlist:${item.id}` === view) : undefined;
  const errorCode = state.errorCode ?? syncErrorCode;
  const goToAdd = () => setView('add');

  function renderView() {
    if (view === 'add') return <AddMusicPanel librarySize={state.library.length} />;
    if (view === 'queue') return <QueuePanel state={state} />;
    if (view === 'structure') return <StructureView state={state} />;

    if (view === 'recent') {
      return (
        <SongCollectionView title="Reproducidas hace poco" songs={state.recent} state={state} search={search} playlistId={LIBRARY_ID} isSortable={false} removeLabel="Quitar de la biblioteca" emptyTitle="Aún no hay historial" emptyText="Las canciones que reproduzcas aparecerán aquí." onRemove={(song) => player.removeSong(song)} onAddMusic={goToAdd} />
      );
    }
    if (view === 'favorites') {
      return (
        <SongCollectionView title="Favoritas" songs={state.favorites} state={state} search={search} playlistId={LIBRARY_ID} isSortable={false} removeLabel="Quitar de favoritas" emptyTitle="Sin favoritas" emptyText="Marca una canción con el corazón para encontrarla rápido." onRemove={(song) => player.toggleFavorite(song)} onAddMusic={goToAdd} />
      );
    }
    if (playlist) {
      return (
        <SongCollectionView key={playlist.id} title={playlist.name} songs={playlist.songs} state={state} search={search} playlistId={playlist.id} isSortable isCustomPlaylist removeLabel="Quitar de la lista" emptyTitle="Esta lista está vacía" emptyText="Usa «Añadir a…» en una canción de tu biblioteca para incluirla aquí." onRemove={(song) => player.removeFromPlaylist(playlist.id, song)} onAddMusic={goToAdd} onPlaylistDeleted={() => setView('library')} />
      );
    }
    return (
      <SongCollectionView title="Biblioteca" songs={state.library} state={state} search={search} playlistId={LIBRARY_ID} isSortable removeLabel="Eliminar" emptyTitle="Tu biblioteca está vacía" emptyText="Selecciona archivos de audio de tu computador o celular para empezar." onRemove={(song) => player.removeSong(song)} onAddMusic={goToAdd} />
    );
  }

  return (
    <div className="app">
      <Header search={search} onSearchChange={setSearch} />
      <Sidebar view={view} state={state} onNavigate={setView} />
      <main className="main">
        {errorCode && (
          <div className="banner" role="alert">
            <span>{describeError(errorCode)}</span>
            {state.errorCode && (
              <button type="button" className="icon-button" aria-label="Cerrar aviso" onClick={() => player.dismissError()}>
                <Icon name="close" size={18} />
              </button>
            )}
          </div>
        )}
        {renderView()}
      </main>
      <PlayerBar />
    </div>
  );
}
