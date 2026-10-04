import type { PlayerState } from '../models/PlayerState';
import { EmptyState } from './EmptyState';

export function StructureView({ state }: { state: PlayerState }) {
  const { libraryNodes, library, libraryBackward, currentSong } = state;
  const head = library[0];
  const tail = library[library.length - 1];

  return (
    <section aria-labelledby="structure-title" className="panel">
      <div className="view-header">
        <h1 id="structure-title">Estructura de la lista doblemente enlazada</h1>
        <p className="view-header__meta">
          size = {library.length} · head = {head?.title ?? 'null'} · tail = {tail?.title ?? 'null'}
        </p>
      </div>

      {libraryNodes.length === 0 ? (
        <EmptyState title="La lista está vacía" text="Añade canciones para ver sus nodos y enlaces previous / next." />
      ) : (
        <>
          <ol className="nodes" aria-label="Nodos de la lista">
            {libraryNodes.map(({ song, previous, next }, index) => (
              <li key={song.id} className={`node${song === currentSong ? ' node--current' : ''}`}>
                <p className="node__tags">
                  {index === 0 && <span className="tag">head</span>}
                  {index === libraryNodes.length - 1 && <span className="tag">tail</span>}
                  {song === currentSong && <span className="tag tag--gold">actual</span>}
                </p>
                <p className="node__link">previous: {previous?.title ?? 'null'}</p>
                <p className="node__title">{song.title}</p>
                <p className="node__link">next: {next?.title ?? 'null'}</p>
              </li>
            ))}
          </ol>

          <h2 className="panel__subtitle">Recorrido hacia adelante (head → tail, usando node.next)</h2>
          <p className="traversal">{library.map((song) => song.title).join(' → ')}</p>
          <h2 className="panel__subtitle">Recorrido hacia atrás (tail → head, usando node.previous)</h2>
          <p className="traversal">{libraryBackward.map((song) => song.title).join(' → ')}</p>
        </>
      )}
    </section>
  );
}
