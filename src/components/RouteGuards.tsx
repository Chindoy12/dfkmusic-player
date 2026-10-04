import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthProvider';

function LoadingScreen() {
  return (
    <div className="loading-screen" role="status">
      Cargando…
    </div>
  );
}

export function ProtectedRoute() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

export function PublicOnlyRoute() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  return user ? <Navigate to="/" replace /> : <Outlet />;
}
