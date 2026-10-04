import type { PlayerState } from '../models/PlayerState';
import { player } from '../hooks/usePlayer';
import { formatTime } from '../utils/format';
import { EmptyState } from './EmptyState';
import { Icon } from './Icon';

export function QueuePanel({ state }: { state: PlayerState }) {
  return (
    <section aria-labelledby="queue-title" className="panel">
      <div className="view-header">
        <h1 id="queue-title">Cola de reproducción</h1>
        <p className="view-header__meta">Estructura: Queue (FIFO). Tiene prioridad sobre la lista.</p>
      </div>

      {state.queue.length === 0 ? (
        <EmptyState title="La cola está vacía" text="Usa el botón de cola en cualquier canción para reproducirla a continuación." />
      ) : (
        <>
          <ol className="simple-list">
            {state.queue.map((song, index) => (
              <li key={`${song.id}-${index}`}>
                <span>{song.title} <span className="muted">· {song.artist} · {formatTime(song.duration)}</span></span>
                <button type="button" className="icon-button" aria-label={`Quitar ${song.title} de la cola`} onClick={() => player.removeFromQueue(song)}>
                  <Icon name="close" size={18} />
                </button>
              </li>
            ))}
          </ol>
          <button type="button" className="button" onClick={() => player.clearQueue()}>Vaciar cola</button>
        </>
      )}

      <h2 className="panel__subtitle">Historial</h2>
      <p className="muted">Estructura: Stack (LIFO). Lo último reproducido aparece primero.</p>
      {state.recent.length === 0 ? (
        <p className="muted">Todavía no has reproducido canciones.</p>
      ) : (
        <ol className="simple-list">
          {state.recent.map((song) => (
            <li key={song.id}>
              <button type="button" className="link-button" onClick={() => player.playSong(song)}>
                {song.title}
              </button>
              <span className="muted">{song.artist}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
