import type { PlayerState } from '../models/PlayerState';
import type { Song } from '../models/Song';
import { player } from '../hooks/usePlayer';
import { formatTime } from '../utils/format';
import { Cover } from './Cover';
import { Icon } from './Icon';

interface SongListProps {
  songs: Song[];
  state: PlayerState;
  playlistId: string;
  removeLabel: string;
  onRemove: (song: Song) => void;
}

export function SongList({ songs, state, playlistId, removeLabel, onRemove }: SongListProps) {
  const targetPlaylists = state.playlists.filter((playlist) => playlist.id !== playlistId);

  return (
    <ul className="song-list">
      <li className="song-list__header" aria-hidden="true">
        <span>Título</span>
        <span>Duración</span>
        <span>Acciones</span>
      </li>
      {songs.map((song) => {
        const isCurrent = state.currentSong === song;
        const isFavorite = state.favorites.includes(song);
        return (
          <li key={song.id} className={`song-row${isCurrent ? ' song-row--current' : ''}`} aria-current={isCurrent ? 'true' : undefined}>
            <button type="button" className="song-row__main" aria-label={`Reproducir ${song.title}`} onClick={() => player.playSong(song, playlistId)}>
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
              <button type="button" className="icon-button icon-button--danger" aria-label={`${removeLabel} ${song.title}`} onClick={() => onRemove(song)}>
                <Icon name="trash" size={20} />
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
