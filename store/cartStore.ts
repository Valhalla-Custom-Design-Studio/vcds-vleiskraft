import { create } from 'zustand';
import api from '@/lib/api';
import { CartItem } from '@/types';

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  itemCount: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [], isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true });
    const { data } = await api.get('/api/cart');
    set({ items: data, isLoading: false });
  },

  addItem: async (productId, quantity = 1) => {
    await api.post('/api/cart', { productId, quantity });
    await get().fetchCart();
  },

  updateItem: async (itemId, quantity) => {
    if (quantity <= 0) { await get().removeItem(itemId); return; }
    await api.patch(`/api/cart/${itemId}`, { quantity });
    await get().fetchCart();
  },

  removeItem: async (itemId) => {
    await api.delete(`/api/cart/${itemId}`);
    await get().fetchCart();
  },

  clearCart: async () => {
    await api.delete('/api/cart');
    set({ items: [] });
  },

  itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
  subtotal: () => get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
}));
