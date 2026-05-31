import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, setToken } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const { user: u } = await api.me();
      setUser(u);
      return u;
    } catch {
      setUser(null);
      setToken(null);
      return null;
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('3bite_token');
    if (!token) {
      setLoading(false);
      return;
    }
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  const login = async (email, password) => {
    const { token, user: u } = await api.login({ email, password });
    setToken(token);
    setUser(u);
    setLoading(false);
    return u;
  };

  const signup = async (name, email, password) => {
    const { token, user: u } = await api.signup({ name, email, password });
    setToken(token);
    setUser(u);
    setLoading(false);
    return u;
  };

  const logout = useCallback(async () => {
    setToken(null);
    setUser(null);
    setLoading(false);
  }, []);

  const updateUser = (u) => setUser(u);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, signup, logout, refreshUser, updateUser }}
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
