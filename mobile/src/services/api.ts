import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://10.0.2.2:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (email: string, password: string) =>
    api.post('/auth/register', { email, password }),
  saveFcmToken: (fcmToken: string) =>
    api.post('/auth/fcm-token', { fcmToken }),
};

export const stockApi = {
  getAll: () => api.get('/stocks'),
  add: (symbol: string) => api.post('/stocks', { symbol }),
  remove: (id: string) => api.delete(`/stocks/${id}`),
};

export const alertApi = {
  getAll: () => api.get('/alerts'),
  create: (symbol: string, targetPrice: number) =>
    api.post('/alerts', { symbol, targetPrice }),
  delete: (id: string) => api.delete(`/alerts/${id}`),
};

export const finnhubApi = {
  getQuote: (symbol: string) => api.get(`/finnhub/quote/${symbol}`),
  getCandles: (symbol: string) => api.get(`/finnhub/candles/${symbol}`),
};

export default api;
