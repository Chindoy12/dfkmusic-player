import { useRef, useState, type ChangeEvent } from 'react';
import { player } from '../hooks/usePlayer';
import type { InsertPosition } from '../services/MediaLibrary';
import { AUDIO_ACCEPT, LocalFileService } from '../services/LocalFileService';
import { RemoteUrlSongCreator } from '../patterns/SongCreator';

const fileService = new LocalFileService();
const remoteCreator = new RemoteUrlSongCreator();

type PositionMode = InsertPosition['mode'];

export function AddMusicPanel({ librarySize }: { librarySize: number }) {
  const [files, setFiles] = useState<File[]>([]);
  const [mode, setMode] = useState<PositionMode>('end');
  const [position, setPosition] = useState(1);
  const [url, setUrl] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fallbackInput = useRef<HTMLInputElement>(null);

  function selectedPosition(): InsertPosition {
    return mode === 'index' ? { mode, index: position - 1 } : { mode };
  }

  function addToSelection(picked: File[]) {
    const audioFiles = fileService.filterAudioFiles(picked);
    const ignored = picked.length - audioFiles.length;
    setFiles((current) => [...current, ...audioFiles]);
    setMessage(ignored > 0 ? `${ignored} archivo(s) se ignoraron porque no son audio.` : null);
  }

  async function chooseFiles() {
    try {
      const picked = await fileService.pickFiles();
      if (picked === null) fallbackInput.current?.click();
      else addToSelection(picked);
    } catch {
      setMessage('No se pudo abrir el selector de archivos. Inténtalo de nuevo.');
    }
  }

  function handleFallbackChange(event: ChangeEvent<HTMLInputElement>) {
    addToSelection(Array.from(event.target.files ?? []));
    event.target.value = '';
  }

  function reportResult(addedCount: number, duplicateCount: number, failedCount: number) {
    const parts = [`${addedCount} canción(es) añadida(s).`];
    if (duplicateCount > 0) parts.push(`${duplicateCount} ya estaban en la biblioteca.`);
    if (failedCount > 0) parts.push(`${failedCount} no se pudieron leer.`);
    setMessage(parts.join(' '));
  }

  async function importSelection() {
    setIsImporting(true);
    const { songs, failedCount } = await fileService.importFiles(files);
    const { added, duplicates } = player.addSongs(songs, selectedPosition());
    reportResult(added.length, duplicates.length, failedCount);
    setFiles([]);
    setIsImporting(false);
  }

  async function importUrl() {
    setIsImporting(true);
    try {
      const parsed = new URL(url.trim());
      if (!/^https?:$/.test(parsed.protocol)) throw new Error('INVALID_PROTOCOL');
      const song = await remoteCreator.createSong(parsed.href);
      const { added, duplicates } = player.addSongs([song], selectedPosition());
      reportResult(added.length, duplicates.length, 0);
      setUrl('');
    } catch {
      setMessage('No se pudo cargar esa dirección. Verifica que sea un enlace directo a un archivo de audio.');
    }
    setIsImporting(false);
  }

  return (
    <section aria-labelledby="add-title" className="panel">
      <h1 id="add-title">Añadir música</h1>
      <p className="panel__lead">
        Elige archivos de tu dispositivo. Se reproducen directamente desde tu navegador y no se suben a ningún servidor.
      </p>

      <fieldset className="fieldset">
        <legend>¿Dónde se insertan en la lista?</legend>
        <label className="radio"><input type="radio" name="position" checked={mode === 'start'} onChange={() => setMode('start')} /> Al inicio</label>
        <label className="radio"><input type="radio" name="position" checked={mode === 'end'} onChange={() => setMode('end')} /> Al final</label>
        <label className="radio">
          <input type="radio" name="position" checked={mode === 'index'} onChange={() => setMode('index')} /> En la posición
          <input type="number" aria-label="Número de posición" className="number-input" min={1} max={librarySize + 1} value={position} disabled={mode !== 'index'} onChange={(event) => setPosition(Math.max(1, Number(event.target.value)))} />
          <span className="hint">(1 a {librarySize + 1})</span>
        </label>
      </fieldset>

      <div className="panel__actions">
        <button type="button" className="button button--primary" onClick={() => void chooseFiles()}>
          Seleccionar música
        </button>
        <input ref={fallbackInput} type="file" multiple accept={AUDIO_ACCEPT} className="visually-hidden" tabIndex={-1} aria-hidden="true" onChange={handleFallbackChange} />
      </div>

      {files.length > 0 && (
        <div className="selection">
          <h2>Archivos seleccionados ({files.length})</h2>
          <ul>
            {files.map((file, index) => (
              <li key={`${file.name}-${file.size}-${index}`}>{file.name}</li>
            ))}
          </ul>
          <div className="panel__actions">
            <button type="button" className="button button--primary" disabled={isImporting} onClick={() => void importSelection()}>
              {isImporting ? 'Leyendo archivos…' : 'Añadir a la biblioteca'}
            </button>
            <button type="button" className="button" disabled={isImporting} onClick={() => setFiles([])}>Quitar selección</button>
          </div>
        </div>
      )}

      <div className="url-form">
        <label htmlFor="audio-url">O añade un audio desde una dirección web</label>
        <div className="inline-form">
          <input id="audio-url" type="url" placeholder="https://ejemplo.com/cancion.mp3" value={url} onChange={(event) => setUrl(event.target.value)} />
          <button type="button" className="button" disabled={isImporting || !url.trim()} onClick={() => void importUrl()}>Añadir</button>
        </div>
      </div>

      {message && <p className="status" role="status">{message}</p>}
    </section>
  );
}
