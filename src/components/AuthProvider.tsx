import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { User } from '../models/User';
import { player } from '../hooks/usePlayer';
import { AuthenticationService, type Credentials } from '../services/AuthenticationService';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login(credentials: Credentials): Promise<void>;
  register(credentials: Credentials & { confirmPassword: string }): Promise<void>;
  logout(): Promise<void>;
}

const authService = new AuthenticationService();
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    authService
      .getSession()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (credentials: Credentials) => {
    setUser(await authService.login(credentials));
  }, []);

  const register = useCallback(async (credentials: Credentials & { confirmPassword: string }) => {
    setUser(await authService.register(credentials));
  }, []);

  const logout = useCallback(async () => {
    await authService.logout().catch(() => undefined);
    player.reset();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, isLoading, login, register, logout }), [user, isLoading, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('AUTH_PROVIDER_MISSING');
  return context;
}
