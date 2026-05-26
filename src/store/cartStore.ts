import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CartItem {
  id: string;
  nameEn: string;
  nameAf?: string;
  price: number;
  unit: string;
  qty: number;
  butchery_id?: string;
  image_url?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'qty'>) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clear: () => void;
  total: () => number;
  init: () => Promise<void>;
}

const persist = (items: CartItem[]) =>
  AsyncStorage.setItem('vleiskraft_cart', JSON.stringify(items));

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (item) => {
    const existing = get().items.find((i) => i.id === item.id);
    const items = existing
      ? get().items.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i))
      : [...get().items, { ...item, qty: 1 }];
    set({ items });
    persist(items);
  },

  removeItem: (id) => {
    const items = get().items.filter((i) => i.id !== id);
    set({ items });
    persist(items);
  },

  updateQty: (id, qty) => {
    const items =
      qty <= 0
        ? get().items.filter((i) => i.id !== id)
        : get().items.map((i) => (i.id === id ? { ...i, qty } : i));
    set({ items });
    persist(items);
  },

  clear: () => {
    set({ items: [] });
    AsyncStorage.removeItem('vleiskraft_cart');
  },

  total: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0),

  init: async () => {
    try {
      const d = await AsyncStorage.getItem('vleiskraft_cart');
      if (d) set({ items: JSON.parse(d) });
    } catch {}
  },
}));
