import { useState, type FormEvent } from 'react';
import type { PlayerState } from '../models/PlayerState';
import { player } from '../hooks/usePlayer';
import type { ViewId } from '../pages/LibraryPage';

interface SidebarProps {
  view: ViewId;
  state: PlayerState;
  onNavigate: (view: ViewId) => void;
}

export function Sidebar({ view, state, onNavigate }: SidebarProps) {
  const [newName, setNewName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const mainItems: { id: ViewId; label: string; count?: number }[] = [
    { id: 'library', label: 'Biblioteca', count: state.library.length },
    { id: 'recent', label: 'Reproducidas hace poco', count: state.recent.length },
    { id: 'favorites', label: 'Favoritas', count: state.favorites.length },
    { id: 'queue', label: 'Cola', count: state.queue.length },
    { id: 'structure', label: 'Estructura de la lista' },
    { id: 'add', label: 'Añadir música' },
  ];

  function handleCreate(event: FormEvent) {
    event.preventDefault();
    if (!newName.trim()) return;
    const id = player.createPlaylist(newName);
    setNewName('');
    setIsCreating(false);
    onNavigate(`playlist:${id}`);
  }

  function renderItem(id: ViewId, label: string, count?: number) {
    return (
      <li key={id}>
        <button type="button" className="nav__item" aria-current={view === id ? 'page' : undefined} onClick={() => onNavigate(id)}>
          <span>{label}</span>
          {count !== undefined && <span className="nav__count">{count}</span>}
        </button>
      </li>
    );
  }

  return (
    <nav className="sidebar" aria-label="Navegación principal">
      <ul className="nav">{mainItems.map((item) => renderItem(item.id, item.label, item.count))}</ul>

      <div className="nav__section">
        <h2 className="nav__heading">Mis listas</h2>
        <ul className="nav">
          {state.playlists.map((playlist) => renderItem(`playlist:${playlist.id}`, playlist.name, playlist.songs.length))}
        </ul>
        {isCreating ? (
          <form className="nav__create" onSubmit={handleCreate}>
            <label htmlFor="new-playlist" className="visually-hidden">
              Nombre de la nueva lista
            </label>
            <input id="new-playlist" autoFocus value={newName} maxLength={100} placeholder="Nombre de la lista" onChange={(event) => setNewName(event.target.value)} />
            <button type="submit" className="button button--primary">
              Crear
            </button>
            <button type="button" className="button" onClick={() => setIsCreating(false)}>
              Cancelar
            </button>
          </form>
        ) : (
          <button type="button" className="button nav__new" onClick={() => setIsCreating(true)}>
            Nueva lista
          </button>
        )}
      </div>

      <details className="shortcuts">
        <summary>Atajos de teclado</summary>
        <dl>
          <dt>Espacio</dt><dd>Reproducir / pausar</dd>
          <dt>N / P</dt><dd>Siguiente / anterior</dd>
          <dt>← / →</dt><dd>Retroceder / avanzar 5 s</dd>
          <dt>M</dt><dd>Silenciar</dd>
          <dt>S / R</dt><dd>Aleatorio / repetir</dd>
        </dl>
      </details>
    </nav>
  );
}
