import { useState } from 'react';
import type { PlayerState } from '../models/PlayerState';
import type { Song } from '../models/Song';
import { player } from '../hooks/usePlayer';
import { formatTime } from '../utils/format';
import { Cover } from './Cover';
import { Icon } from './Icon';
import { MoveSongForm } from './MoveSongForm';

interface SongListProps {
  songs: Song[];
  state: PlayerState;
  playlistId: string;
  removeLabel: string;
  onRemove: (song: Song) => void;
  onMove?: (song: Song, position: number) => void;
}

export function SongList({ songs, state, playlistId, removeLabel, onRemove, onMove }: SongListProps) {
  const [movingSongId, setMovingSongId] = useState<string | null>(null);
  const targetPlaylists = state.playlists.filter((playlist) => playlist.id !== playlistId);

  return (
    <ul className="song-list">
      <li className="song-list__header" aria-hidden="true">
        <span>Título</span>
        <span>Duración</span>
        <span>Acciones</span>
      </li>
      {songs.map((song, index) => {
        const isCurrent = state.currentSong === song;
        const isFavorite = state.favorites.includes(song);
        const isMoving = onMove !== undefined && movingSongId === song.id;
        return (
          <li key={song.id} className={`song-row${isCurrent ? ' song-row--current' : ''}`} aria-current={isCurrent ? 'true' : undefined}>
            <button type="button" className="song-row__main" aria-label={`Reproducir ${song.title}`} onClick={() => player.playSong(song, playlistId)}>
              {onMove && <span className="song-row__index">{index + 1}</span>}
              <Cover song={song} size="small" />
              <span className="song-row__text">
                <span className="song-row__title">{song.title}</span>
                <span className="song-row__artist">{song.artist}</span>
              </span>
            </button>
            <span className="song-row__duration">{formatTime(song.duration)}</span>
            <div className="song-row__actions">
              <button type="button" className="icon-button" aria-label={isFavorite ? `Quitar ${song.title} de favoritas` : `Marcar ${song.title} como favorita`} aria-pressed={isFavorite} onClick={() => player.toggleFavorite(song)}>
                <Icon name={isFavorite ? 'heartFilled' : 'heart'} size={20} />
              </button>
              <button type="button" className="icon-button" aria-label={`Añadir ${song.title} a la cola`} onClick={() => player.enqueue(song)}>
                <Icon name="queueAdd" size={20} />
              </button>
              {targetPlaylists.length > 0 && (
                <select
                  className="select"
                  aria-label={`Añadir ${song.title} a una lista`}
                  value=""
                  onChange={(event) => event.target.value && player.addToPlaylist(event.target.value, song)}
                >
                  <option value="">Añadir a…</option>
                  {targetPlaylists.map((playlist) => (
                    <option key={playlist.id} value={playlist.id}>
                      {playlist.name}
                    </option>
                  ))}
                </select>
              )}
              {onMove && (
                <button type="button" className="icon-button" aria-label={`Mover ${song.title} a otra posición`} aria-expanded={isMoving} onClick={() => setMovingSongId(isMoving ? null : song.id)}>
                  <Icon name="move" size={20} />
                </button>
              )}
              <button type="button" className="icon-button icon-button--danger" aria-label={`${removeLabel} ${song.title}`} onClick={() => onRemove(song)}>
                <Icon name="trash" size={20} />
              </button>
            </div>
            {isMoving && (
              <MoveSongForm
                key={index}
                title={song.title}
                position={index + 1}
                total={songs.length}
                onMove={(position) => onMove(song, position)}
                onClose={() => setMovingSongId(null)}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}
