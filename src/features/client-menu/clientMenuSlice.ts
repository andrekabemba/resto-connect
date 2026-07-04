import { create } from 'zustand';
import { apiService } from '../services/apiService';

interface OrderStore {
  cart: any[];
  addToCart: (item: any) => void;
  removeFromCart: (itemId: number) => void;
  placeOrder: (orderData: any) => Promise<void>;
  makeReservation: (reservationData: any) => Promise<void>;
}

export const useClientStore = create<OrderStore>((set) => ({
  cart: [],
  addToCart: (item) => set((state) => ({ cart: [...state.cart, item] })),
  removeFromCart: (itemId) => set((state) => ({ cart: state.cart.filter(i => i.id !== itemId) })),
  
  placeOrder: async (orderData) => {
    await apiService.post('/orders', orderData);
    set({ cart: [] });
  },

  makeReservation: async (reservationData) => {
    await apiService.post('/reservations', reservationData);
  },
}));
