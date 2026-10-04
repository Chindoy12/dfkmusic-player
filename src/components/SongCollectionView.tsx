import { useState, type FormEvent } from 'react';
import type { PlayerState } from '../models/PlayerState';
import type { Song } from '../models/Song';
import { player } from '../hooks/usePlayer';
import { formatTotalDuration } from '../utils/format';
import { EmptyState } from './EmptyState';
import { SongList } from './SongList';

interface SongCollectionViewProps {
  title: string;
  songs: Song[];
  state: PlayerState;
  search: string;
  playlistId: string;
  isSortable: boolean;
  isCustomPlaylist?: boolean;
  removeLabel: string;
  emptyTitle: string;
  emptyText: string;
  onRemove: (song: Song) => void;
  onAddMusic: () => void;
  onPlaylistDeleted?: () => void;
}

export function SongCollectionView(props: SongCollectionViewProps) {
  const { title, songs, state, search, playlistId, isSortable, isCustomPlaylist, onPlaylistDeleted } = props;
  const [isRenaming, setIsRenaming] = useState(false);
  const [draftName, setDraftName] = useState(title);

  const visibleSongs = songs.filter((song) => song.matches(search));
  const totalDuration = songs.reduce((sum, song) => sum + song.duration, 0);

  function handleRename(event: FormEvent) {
    event.preventDefault();
    if (draftName.trim()) player.renamePlaylist(playlistId, draftName);
    setIsRenaming(false);
  }

  function handleDelete() {
    if (!window.confirm(`¿Eliminar la lista "${title}"? Las canciones seguirán en tu biblioteca.`)) return;
    player.deletePlaylist(playlistId);
    onPlaylistDeleted?.();
  }

  function handleClear() {
    if (window.confirm(`¿Vaciar "${title}"?`)) player.clearPlaylist(playlistId);
  }

  return (
    <section aria-labelledby="view-title">
      <div className="view-header">
        {isRenaming ? (
          <form className="inline-form" onSubmit={handleRename}>
            <label htmlFor="rename-playlist" className="visually-hidden">Nuevo nombre</label>
            <input id="rename-playlist" autoFocus value={draftName} maxLength={100} onChange={(event) => setDraftName(event.target.value)} />
            <button type="submit" className="button button--primary">Guardar</button>
            <button type="button" className="button" onClick={() => setIsRenaming(false)}>Cancelar</button>
          </form>
        ) : (
          <h1 id="view-title">{title}</h1>
        )}
        <p className="view-header__meta">
          {songs.length} {songs.length === 1 ? 'canción' : 'canciones'} · {formatTotalDuration(totalDuration)}
        </p>
      </div>

      <div className="toolbar">
        {isSortable && (
          <div className="toolbar__group" role="group" aria-label="Ordenar canciones">
            <button type="button" className="button" onClick={() => player.sortPlaylist(playlistId, 'asc')}>Ordenar A-Z</button>
            <button type="button" className="button" onClick={() => player.sortPlaylist(playlistId, 'desc')}>Z-A</button>
            <button type="button" className="button" onClick={() => player.sortPlaylist(playlistId, 'insertion')}>Orden de incorporación</button>
          </div>
        )}
        <div className="toolbar__group">
          {isCustomPlaylist && !isRenaming && (
            <button type="button" className="button" onClick={() => { setDraftName(title); setIsRenaming(true); }}>Renombrar</button>
          )}
          {isSortable && songs.length > 0 && <button type="button" className="button" onClick={handleClear}>Vaciar</button>}
          {isCustomPlaylist && <button type="button" className="button button--danger" onClick={handleDelete}>Eliminar lista</button>}
        </div>
      </div>

      {songs.length === 0 ? (
        <EmptyState title={props.emptyTitle} text={props.emptyText} actionLabel={playlistId === 'library' ? 'Añadir música' : undefined} onAction={props.onAddMusic} />
      ) : visibleSongs.length === 0 ? (
        <EmptyState title="Sin resultados" text={`Ninguna canción coincide con "${search}".`} />
      ) : (
        <SongList songs={visibleSongs} state={state} playlistId={playlistId} removeLabel={props.removeLabel} onRemove={props.onRemove} />
      )}
    </section>
  );
}
