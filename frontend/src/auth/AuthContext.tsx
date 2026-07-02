import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { User, LoginCredentials } from '../types/user';
import * as authService from '../services/authService';

// ─── Context shape ────────────────────────────────────────────────────────────

interface AuthContextValue {
  /** Null while loading or unauthenticated */
  user: User | null;
  isAuthenticated: boolean;
  /** True during the initial localStorage check and during login network call */
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ error?: string }>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

interface AuthProviderProps {
  children: ReactNode;
  /** Called after successful logout so parent can reset app state */
  onLogout?: () => void;
}

export function AuthProvider({ children, onLogout }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate session from localStorage on mount
  useEffect(() => {
    const stored = authService.getCurrentUser();
    setUser(stored);
    setLoading(false);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setLoading(true);
    const result = await authService.login(credentials);
    setLoading(false);
    if (result.success && result.user) {
      setUser(result.user);
      return {};
    }
    return { error: result.error ?? 'Authentication failed.' };
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    onLogout?.();
  }, [onLogout]);

  const refresh = useCallback(async () => {
    const refreshed = await authService.refresh();
    setUser(refreshed);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        loading,
        login,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within <AuthProvider>');
  }
  return ctx;
}
