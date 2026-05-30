import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
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
    (async () => {
      const token = await import('../api/client').then((m) => m.getToken());
      if (!token) {
        setLoading(false);
        return;
      }
      await refreshUser();
      setLoading(false);
    })();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const { token, user: u } = await api.login({ email, password });
    await setToken(token);
    setUser(u);
    return u;
  };

  const signup = async (name: string, email: string, password: string) => {
    const { token, user: u } = await api.signup({ name, email, password });
    await setToken(token);
    setUser(u);
    return u;
  };

  const logout = async () => {
    await setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, signup, logout, refreshUser, updateUser: setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
