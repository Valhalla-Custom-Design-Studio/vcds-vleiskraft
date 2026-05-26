import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  tier: string;
  butchery_id?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  language: 'en' | 'af';
  isLoading: boolean;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  setLanguage: (lang: 'en' | 'af') => void;
  logout: () => Promise<void>;
  init: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  language: 'en',
  isLoading: true,

  setToken: async (token) => {
    set({ token });
    if (token) {
      await AsyncStorage.setItem('token', token);
    } else {
      await AsyncStorage.removeItem('token');
    }
  },

  setUser: async (user) => {
    set({ user });
    if (user) {
      await AsyncStorage.setItem('user', JSON.stringify(user));
    } else {
      await AsyncStorage.removeItem('user');
    }
  },

  setLanguage: async (language) => {
    set({ language });
    await AsyncStorage.setItem('language', language);
  },

  logout: async () => {
    await AsyncStorage.multiRemove(['token', 'user']);
    set({ token: null, user: null });
  },

  init: async () => {
    try {
      const [token, userStr, lang] = await AsyncStorage.multiGet(['token', 'user', 'language']);
      set({
        token: token[1],
        user: userStr[1] ? JSON.parse(userStr[1]) : null,
        language: (lang[1] as 'en' | 'af') || 'en',
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },
}));
