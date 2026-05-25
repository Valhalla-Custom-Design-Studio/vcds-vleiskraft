import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api } from '../services/api';

interface User { id: string; email: string; first_name: string; last_name: string; tier: string; business_name?: string; }
interface AuthCtx { token: string | null; user: User | null; loading: boolean; login: (email: string, password: string) => Promise<void>; logout: () => void; }

const AuthContext = createContext<AuthCtx>({} as AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const t = await SecureStore.getItemAsync('vleiskraft_token');
      if (t) { setToken(t); api.defaults.headers.common['Authorization'] = `Bearer ${t}`; }
      setLoading(false);
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const r = await api.post('/auth/login', { email, password });
    const { token: t, user: u } = r.data;
    await SecureStore.setItemAsync('vleiskraft_token', t);
    api.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    setToken(t); setUser(u);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('vleiskraft_token');
    delete api.defaults.headers.common['Authorization'];
    setToken(null); setUser(null);
  };

  return <AuthContext.Provider value={{ token, user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
