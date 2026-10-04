import { player, usePlaybackTime, usePlayerState } from '../hooks/usePlayer';
import { formatTime } from '../utils/format';
import { Cover } from './Cover';
import { Icon } from './Icon';

function ProgressBar() {
  const { currentTime, duration } = usePlaybackTime();
  const max = Math.max(duration, 0);
  return (
    <div className="progress">
      <span className="progress__time">{formatTime(currentTime)}</span>
      <input
        type="range"
        aria-label="Progreso de la canción"
        aria-valuetext={`${formatTime(currentTime)} de ${formatTime(max)}`}
        min={0}
        max={max || 1}
        step={1}
        value={Math.min(currentTime, max || 1)}
        disabled={max === 0}
        onChange={(event) => player.seek(Number(event.target.value))}
      />
      <span className="progress__time">{formatTime(max)}</span>
    </div>
  );
}

export function PlayerBar() {
  const { currentSong, isPlaying, volume, muted, repeat, shuffle } = usePlayerState();
  const hasSong = currentSong !== null;

  return (
    <footer className="player" aria-label="Reproductor">
      <div className="player__track">
        <Cover song={currentSong} size="large" />
        <div className="player__info">
          <p className="player__title">{currentSong?.title ?? 'Nada en reproducción'}</p>
          <p className="player__artist">{currentSong?.artist ?? 'Elige una canción de tu biblioteca'}</p>
        </div>
      </div>

      <div className="player__center">
        <div className="player__controls">
          <button type="button" className="icon-button" aria-label="Orden aleatorio" aria-pressed={shuffle} onClick={() => player.toggleShuffle()}>
            <Icon name="shuffle" />
          </button>
          <button type="button" className="icon-button" aria-label="Canción anterior" onClick={() => player.previous()}>
            <Icon name="previous" size={26} />
          </button>
          <button type="button" className="play-button" aria-label={isPlaying ? 'Pausar' : 'Reproducir'} onClick={() => player.togglePlayPause()}>
            <Icon name={isPlaying ? 'pause' : 'play'} size={28} />
          </button>
          <button type="button" className="icon-button" aria-label="Canción siguiente" onClick={() => player.next()}>
            <Icon name="next" size={26} />
          </button>
          <button
            type="button"
            className="icon-button"
            aria-label={`Repetir: ${repeat === 'off' ? 'desactivado' : repeat === 'all' ? 'toda la lista' : 'una canción'}`}
            aria-pressed={repeat !== 'off'}
            onClick={() => player.cycleRepeat()}
          >
            <Icon name={repeat === 'one' ? 'repeatOne' : 'repeat'} />
          </button>
        </div>
        {hasSong ? <ProgressBar /> : <p className="progress__idle">00:00 — 00:00</p>}
      </div>

      <div className="player__volume">
        <button type="button" className="icon-button" aria-label={muted ? 'Activar sonido' : 'Silenciar'} aria-pressed={muted} onClick={() => player.toggleMute()}>
          <Icon name={muted || volume === 0 ? 'mute' : 'volume'} />
        </button>
        <input
          type="range"
          aria-label="Volumen"
          min={0}
          max={1}
          step={0.05}
          value={muted ? 0 : volume}
          onChange={(event) => player.setVolume(Number(event.target.value))}
        />
      </div>
    </footer>
  );
}
