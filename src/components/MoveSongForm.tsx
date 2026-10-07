import { useState, type FormEvent } from 'react';

interface MoveSongFormProps {
  title: string;
  position: number;
  total: number;
  onMove: (position: number) => void;
  onClose: () => void;
}

export function MoveSongForm({ title, position, total, onMove, onClose }: MoveSongFormProps) {
  const [draft, setDraft] = useState(String(position));

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const target = Math.min(Math.max(Math.round(Number(draft)), 1), total);
    if (Number.isFinite(target)) onMove(target);
    onClose();
  }

  return (
    <form className="move-form" onSubmit={handleSubmit}>
      <label htmlFor={`move-${title}`}>
        Mover «{title}» a la posición (1 a {total})
      </label>
      <input
        id={`move-${title}`}
        type="number"
        className="number-input"
        min={1}
        max={total}
        autoFocus
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
      />
      <button type="submit" className="button button--primary">Mover</button>
      <button type="button" className="button" disabled={position <= 1} onClick={() => onMove(position - 1)}>Subir una</button>
      <button type="button" className="button" disabled={position >= total} onClick={() => onMove(position + 1)}>Bajar una</button>
      <button type="button" className="button" onClick={onClose}>Cerrar</button>
    </form>
  );
}
