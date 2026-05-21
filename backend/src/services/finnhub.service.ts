import WebSocket from 'ws';
import axios from 'axios';
import Alert from '../models/Alert';
import User from '../models/User';
import Stock from '../models/Stock';
import { sendPriceAlertNotification } from './fcm.service';

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const FINNHUB_REST_URL = 'https://finnhub.io/api/v1';
const FINNHUB_WS_URL = 'wss://ws.finnhub.io';

let ws: WebSocket | null = null;
const subscribers: Set<(data: any) => void> = new Set();
const priceHistory: Map<string, { price: number; timestamp: string }[]> = new Map();

export const connectFinnhubWebSocket = (): void => {
  ws = new WebSocket(`${FINNHUB_WS_URL}?token=${FINNHUB_API_KEY}`);

  ws.on('open', async () => {
    console.log('Finnhub WebSocket connected');
    await resubscribeAllStocks();
  });

  ws.on('message', async (data: string) => {
    const message = JSON.parse(data);

    if (message.type === 'trade' && message.data) {
      const items = Array.isArray(message.data) ? message.data : [message.data];

      for (const item of items) {
        const symbol = item.s || item.symbol;
        const price = item.p || item.price;

        if (!symbol || price === undefined) continue;

        if (!priceHistory.has(symbol)) {
          priceHistory.set(symbol, []);
        }
        const history = priceHistory.get(symbol)!;
        history.push({ price, timestamp: new Date().toISOString() });
        if (history.length > 1000) {
          history.splice(0, history.length - 1000);
        }

        checkAlerts(symbol, price);
        broadcastToSubscribers({ symbol, price, timestamp: new Date().toISOString() });
      }
    }
  });

  ws.on('error', (error) => {
    console.error('Finnhub WebSocket error:', error);
  });

  ws.on('close', () => {
    console.log('Finnhub WebSocket disconnected. Reconnecting...');
    setTimeout(connectFinnhubWebSocket, 5000);
  });
};

const resubscribeAllStocks = async (): Promise<void> => {
  try {
    const stocks = await Stock.find();
    const symbols = [...new Set(stocks.map(s => s.symbol.toUpperCase()))];
    for (const symbol of symbols) {
      subscribeToStock(symbol);
    }
    console.log(`Resubscribed to ${symbols.length} stocks: ${symbols.join(', ')}`);
  } catch (error) {
    console.error('Error resubscribing stocks:', error);
  }
};

export const subscribeToStock = (symbol: string): void => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'subscribe', symbol }));
    console.log(`Subscribed to ${symbol}`);
  }
};

export const unsubscribeFromStock = (symbol: string): void => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'unsubscribe', symbol }));
    console.log(`Unsubscribed from ${symbol}`);
  }
};

export const subscribeToUpdates = (callback: (data: any) => void): (() => void) => {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
};

const broadcastToSubscribers = (data: any): void => {
  subscribers.forEach((cb) => cb(data));
};

const checkAlerts = async (symbol: string, price: number): Promise<void> => {
  try {
    const alerts = await Alert.find({ symbol: symbol.toUpperCase(), active: true });

    for (const alert of alerts) {
      if (price >= alert.targetPrice) {
        const user = await User.findById(alert.userId);
        if (user?.fcmToken) {
          await sendPriceAlertNotification(user.fcmToken, symbol, price, alert.targetPrice);
        }
        alert.active = false;
        await alert.save();
      }
    }
  } catch (error) {
    console.error('Error checking alerts:', error);
  }
};

export const getStockQuote = async (symbol: string): Promise<any> => {
  const response = await axios.get(`${FINNHUB_REST_URL}/quote`, {
    params: { symbol, token: FINNHUB_API_KEY },
  });
  return response.data;
};

export const getStockCandles = (symbol: string): { price: number; timestamp: string }[] => {
  return priceHistory.get(symbol.toUpperCase()) || [];
};
