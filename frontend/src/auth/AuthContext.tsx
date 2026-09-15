import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api, TOKEN_KEY, USER_KEY, type AuthUser } from '../api/client';
import { fetchSummary, fetchTransactionsPage } from '../hooks/useDashboardData';
import { useLedgerMode, THEME_STORAGE_KEY } from '../theme/ThemeModeProvider';

/** Payload the backend returns from both /auth/login and /auth/register. */
interface AuthSession {
  token: string;
  user: AuthUser;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

/** Persist a session and remember it as the active one. */
function applySession(session: AuthSession) {
  localStorage.setItem(TOKEN_KEY, session.token);
  localStorage.setItem(USER_KEY, JSON.stringify(session.user));
  return session.user;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { setMode } = useLedgerMode();
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  });

  /** Warms every dashboard query so the first paint after sign-in has data. */
  const prefetchDashboard = useCallback(() => {
    const firstPage = { page: 0, limit: 10, sortBy: 'date', sortDir: 'desc' as const };
    // All independent — run them in parallel, not sequentially.
    void queryClient.prefetchQuery({ queryKey: ['summary'], queryFn: fetchSummary });
    void queryClient.prefetchQuery({
      queryKey: ['transactions', firstPage],
      queryFn: () => fetchTransactionsPage(firstPage),
    });
  }, [queryClient]);

  const login = useCallback(
    async (email: string, password: string) => {
      const { data } = await api.post<AuthSession>('/auth/login', { email, password });
      setUser(applySession(data));
      // The account's saved theme wins on sign-in.
      if (data.user.preferredTheme) setMode(data.user.preferredTheme);
      prefetchDashboard();
    },
    [prefetchDashboard],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const { data } = await api.post<AuthSession>('/auth/register', { name, email, password });
      setUser(applySession(data));
      if (data.user.preferredTheme) setMode(data.user.preferredTheme);
      prefetchDashboard();
    },
    [prefetchDashboard],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    // Forget this browser's theme so the next sign-in adopts the account's choice.
    localStorage.removeItem(THEME_STORAGE_KEY);
    setMode('dark');
    setUser(null);
  }, [setMode]);

  const value = useMemo(() => ({ user, login, register, logout }), [user, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
