import { useAuth } from './AuthProvider';
import { Icon } from './Icon';

interface HeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export function Header({ search, onSearchChange }: HeaderProps) {
  const { user, logout } = useAuth();
  return (
    <header className="header">
      <div className="brand">
        <span className="brand__mark">
          <Icon name="note" size={20} />
        </span>
        <span className="brand__name">Reproductor</span>
      </div>

      <div className="search">
        <Icon name="search" size={20} />
        <input type="search" aria-label="Buscar canciones" placeholder="Buscar por título o artista" value={search} onChange={(event) => onSearchChange(event.target.value)} />
      </div>

      <div className="header__user">
        <span className="header__email" title={user?.email}>
          {user?.displayName}
        </span>
        <button type="button" className="button" onClick={() => void logout()}>
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
