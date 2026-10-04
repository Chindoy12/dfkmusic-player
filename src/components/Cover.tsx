import type { Song } from '../models/Song';
import { Icon } from './Icon';

export function Cover({ song, size }: { song: Song | null; size: 'small' | 'large' }) {
  return (
    <span className={`cover cover--${size}`}>
      {song?.coverUrl ? <img src={song.coverUrl} alt="" /> : <Icon name="note" size={size === 'large' ? 28 : 20} />}
    </span>
  );
}
