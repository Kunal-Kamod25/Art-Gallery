import { create } from 'zustand';
import api from './api';

export const useWishlistStore = create((set, get) => ({
  wishlist: [],
  isLoading: false,

  fetchWishlist: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/users/wishlist');
      const wishlistItems = res.data.wishlist || [];
      set({ wishlist: wishlistItems, isLoading: false });
      return wishlistItems;
    } catch (error) {
      console.error('Failed to fetch wishlist:', error.message);
      set({ isLoading: false });
      return [];
    }
  },

  toggleWishlist: async (artworkId) => {
    try {
      const res = await api.post(`/users/wishlist/${artworkId}`);
      
      if (res.data.added) {
        set({ wishlist: [...get().wishlist, { _id: artworkId }] });
      } else {
        set({ wishlist: get().wishlist.filter(item => item._id !== artworkId) });
      }
      return res.data.added;
    } catch (error) {
      console.error('Failed to toggle wishlist:', error.response?.data || error.message);
      throw error;
    }
  },

  isInWishlist: (artworkId) => {
    return get().wishlist.some(item => item._id === artworkId);
  },

  clearWishlist: () => set({ wishlist: [] }),
}));

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  authModal: { isOpen: false, reason: 'cart' },

  openAuthModal: (reason = 'cart') => set({ authModal: { isOpen: true, reason } }),
  closeAuthModal: () => set({ authModal: { isOpen: false, reason: 'cart' } }),


  init: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      if (token && user) {
        set({ token, user: JSON.parse(user) });
        // Fetch wishlist on init if user exists
        try {
          useWishlistStore.getState().fetchWishlist();
        } catch (err) {
          console.error('Failed to fetch wishlist on init:', err);
        }
      }
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ token, user, isLoading: false });
      // Fetch wishlist after login
      try {
        await useWishlistStore.getState().fetchWishlist();
      } catch (err) {
        console.error('Failed to fetch wishlist after login:', err);
      }
      return user;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (name, email, password, role = 'user') => {
    set({ isLoading: true });
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ token, user, isLoading: false });
      // Fetch wishlist after register
      try {
        await useWishlistStore.getState().fetchWishlist();
      } catch (err) {
        console.error('Failed to fetch wishlist after register:', err);
      }
      return user;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
    useWishlistStore.getState().clearWishlist();
  },

  updateUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },
}));

export const useCartStore = create((set, get) => ({
  items: [],
  isOpen: false,

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set({ isOpen: !get().isOpen }),

  addItem: (artwork) => {
    const exists = get().items.find(i => i._id === artwork._id);
    if (!exists) set({ items: [...get().items, artwork], isOpen: true });
    else set({ isOpen: true });
  },

  removeItem: (id) => set({ items: get().items.filter(i => i._id !== id) }),

  clearCart: () => set({ items: [] }),

  total: () => get().items.reduce((sum, i) => sum + i.price, 0),

  count: () => get().items.length,
}));
