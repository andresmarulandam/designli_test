import { create } from 'zustand';
import { stockApi, finnhubApi } from '../services/api';
import { connectWebSocket, addPriceListener, subscribeToSymbol } from '../services/websocket';
import type { Stock, StockPrice } from '../types';

interface StockState {
  stocks: Stock[];
  prices: Record<string, number>;
  loading: boolean;
  fetchStocks: () => Promise<void>;
  addStock: (symbol: string) => Promise<void>;
  removeStock: (id: string) => Promise<void>;
  startRealTimeUpdates: () => void;
  stopRealTimeUpdates: () => void;
}

let unsubscribe: (() => void) | null = null;

export const useStockStore = create<StockState>((set, get) => ({
  stocks: [],
  prices: {},
  loading: false,

  fetchStocks: async () => {
    set({ loading: true });
    try {
      const { data } = await stockApi.getAll();
      set({ stocks: data, loading: false });
      data.forEach((stock: Stock) => subscribeToSymbol(stock.symbol));
    } catch (error) {
      set({ loading: false });
      console.error('Failed to fetch stocks:', error);
    }
  },

  addStock: async (symbol: string) => {
    try {
      const { data } = await stockApi.add(symbol.toUpperCase());
      set((state) => ({ stocks: [...state.stocks, data] }));
      subscribeToSymbol(symbol.toUpperCase());
    } catch (error) {
      console.error('Failed to add stock:', error);
      throw error;
    }
  },

  removeStock: async (id: string) => {
    try {
      await stockApi.remove(id);
      set((state) => ({ stocks: state.stocks.filter((s) => s._id !== id) }));
    } catch (error) {
      console.error('Failed to remove stock:', error);
    }
  },

  startRealTimeUpdates: () => {
    connectWebSocket();
    if (unsubscribe) unsubscribe();

    unsubscribe = addPriceListener((data: StockPrice) => {
      set((state) => ({
        prices: { ...state.prices, [data.symbol]: data.price },
      }));
    });
  },

  stopRealTimeUpdates: () => {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  },
}));
