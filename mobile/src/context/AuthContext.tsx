import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, setToken } from '../api/client';
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
    console.log("refreshUser called");

    try {
      const { user: u } = await api.me();
      console.log("api.me success", u?.email);
      setUser(u);
      return u;
    } catch (err) {
      console.log("api.me failed, clearing user/token", err);
      setUser(null);
      await setToken(null);
      return null;
    }
  }, []);
  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        const token = await import('../api/client').then((m) => m.getToken());
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
  }, []);

  const login = async (email: string, password: string) => {
    const { token, user: u } = await api.login({ email, password });
    await setToken(token);
    setUser(u);
    setLoading(false);
    return u;
  };

  const signup = async (name: string, email: string, password: string) => {
    const { token, user: u } = await api.signup({ name, email, password });
    await setToken(token);
    setUser(u);
    setLoading(false);
    return u;
  };

  const logout = useCallback(async () => {
    await setToken(null);
    setUser(null);
    setLoading(false);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, signup, logout, refreshUser, updateUser: setUser }),
    [user, loading, logout, refreshUser]
  );

  console.log('AuthProvider render', {
    loading,
    hasUser: !!user,
    userEmail: user?.email,
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
