import { create } from 'zustand';
import { alertApi } from '../services/api';
import type { Alert } from '../types';

interface AlertState {
  alerts: Alert[];
  loading: boolean;
  fetchAlerts: () => Promise<void>;
  createAlert: (symbol: string, targetPrice: number) => Promise<void>;
  deleteAlert: (id: string) => Promise<void>;
}

export const useAlertStore = create<AlertState>((set) => ({
  alerts: [],
  loading: false,

  fetchAlerts: async () => {
    set({ loading: true });
    try {
      const { data } = await alertApi.getAll();
      set({ alerts: data, loading: false });
    } catch (error) {
      set({ loading: false });
      console.error('Failed to fetch alerts:', error);
    }
  },

  createAlert: async (symbol: string, targetPrice: number) => {
    try {
      const { data } = await alertApi.create(symbol.toUpperCase(), targetPrice);
      set((state) => ({ alerts: [...state.alerts, data] }));
    } catch (error) {
      console.error('Failed to create alert:', error);
      throw error;
    }
  },

  deleteAlert: async (id: string) => {
    try {
      await alertApi.delete(id);
      set((state) => ({ alerts: state.alerts.filter((a) => a._id !== id) }));
    } catch (error) {
      console.error('Failed to delete alert:', error);
    }
  },
}));
