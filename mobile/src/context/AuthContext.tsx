import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, getApiUrl, getToken, setToken } from '../api/client';
import type { User } from '../types/api';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (name: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const { user: u } = await api.me();
      setUser(u);
      return u;
    } catch {
      setUser(null);
      await setToken(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        const token = await getToken();
        if (!token) return;
        await refreshUser();
      } finally {
        if (mounted) setLoading(false);
      }
    }

    bootstrap();

    return () => {
      mounted = false;
    };
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const loginUrl = getApiUrl('/auth/login');
    console.log('[3Bite] login started');
    console.log('[3Bite] API URL being called:', loginUrl);
    try {
      const { token, user: u } = await api.login({ email, password });
      console.log('[3Bite] response received');
      await setToken(token);
      setUser(u);
      return u;
    } catch (err) {
      console.log('[3Bite] error caught', err);
      throw err;
    } finally {
      console.log('[3Bite] finally reached');
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    const { token, user: u } = await api.signup({ name, email, password });
    await setToken(token);
    setUser(u);
    return u;
  };

  const logout = useCallback(async () => {
    await setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, signup, logout, refreshUser, updateUser: setUser }),
    [user, loading, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
