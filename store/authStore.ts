import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import api from '@/lib/api';
import { User, Language } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  language: Language;
  isLoading: boolean;
  isAuthenticated: boolean;
  setLanguage: (lang: Language) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

interface RegisterData {
  firstName: string; lastName: string;
  email: string; phone: string; password: string;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null, token: null, language: 'af', isLoading: true, isAuthenticated: false,

  setLanguage: (lang) => set({ language: lang }),

  login: async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password });
    await SecureStore.setItemAsync('jwt', data.token);
    set({ token: data.token, user: data.user, isAuthenticated: true, language: data.user.language ?? 'af' });
  },

  register: async (regData) => {
    const { data } = await api.post('/api/signup', regData);
    await SecureStore.setItemAsync('jwt', data.token);
    set({ token: data.token, user: data.user, isAuthenticated: true });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('jwt');
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadUser: async () => {
    try {
      const token = await SecureStore.getItemAsync('jwt');
      if (!token) { set({ isLoading: false }); return; }
      const { data } = await api.get('/api/auth/me');
      set({ user: data, token, isAuthenticated: true, language: data.language ?? 'af', isLoading: false });
    } catch {
      await SecureStore.deleteItemAsync('jwt');
      set({ isLoading: false });
    }
  },

  updateProfile: async (profileData) => {
    const { data } = await api.patch('/api/users/me', profileData);
    set({ user: data });
  },
}));
