import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import * as api from '../api/client';
import { setApiTokenGetter, setApiUnauthorizedHandler } from '../api/client';
import type { MobileUser } from '../api/types';
import { clearSession, loadSession, saveSession } from './storage';

function normalizeUser(raw: any): MobileUser | null {
  if (!raw?.id) return null;
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    role: raw.role,
    image: raw.image ?? raw.avatar ?? null,
    organizationId: raw.organizationId ?? null,
  };
}

type AuthState = {
  bootstrapping: boolean;
  token: string | null;
  user: MobileUser | null;
  signIn: (input: {
    email: string;
    password: string;
    organizationCode: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [bootstrapping, setBootstrapping] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<MobileUser | null>(null);

  const signOut = useCallback(async () => {
    await clearSession();
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    setApiTokenGetter(() => token);
  }, [token]);

  useEffect(() => {
    setApiUnauthorizedHandler(() => {
      void signOut();
    });
    return () => setApiUnauthorizedHandler(() => {});
  }, [signOut]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const session = await loadSession();
        if (!session || cancelled) return;
        const cleanToken = session.token.trim();
        setToken(cleanToken);
        setUser(session.user);
        try {
          const me = await api.fetchMe(cleanToken);
          const nextUser = normalizeUser((me as any).user ?? me);
          if (!cancelled && nextUser) {
            setUser(nextUser);
            await saveSession(cleanToken, nextUser);
          }
        } catch {
          if (!cancelled) {
            await clearSession();
            setToken(null);
            setUser(null);
          }
        }
      } finally {
        if (!cancelled) setBootstrapping(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(
    async (input: { email: string; password: string; organizationCode: string }) => {
      const result = await api.login(input);
      const cleanToken = result.accessToken.trim();
      const me = await api.fetchMe(cleanToken);
      const nextUser = normalizeUser((me as any).user ?? me) ?? result.user;
      await saveSession(cleanToken, nextUser);
      setToken(cleanToken);
      setUser(nextUser);
    },
    [],
  );

  const refreshMe = useCallback(async () => {
    if (!token) return;
    const me = await api.fetchMe(token);
    const nextUser = normalizeUser((me as any).user ?? me);
    if (nextUser) {
      setUser(nextUser);
      await saveSession(token, nextUser);
    }
  }, [token]);

  const value = useMemo(
    () => ({ bootstrapping, token, user, signIn, signOut, refreshMe }),
    [bootstrapping, token, user, signIn, signOut, refreshMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
