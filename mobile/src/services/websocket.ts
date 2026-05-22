import { getWsUrl } from '../config';

type PriceCallback = (data: { symbol: string; price: number; timestamp: string }) => void;

let ws: WebSocket | null = null;
const callbacks: Set<PriceCallback> = new Set();
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

export const connectWebSocket = () => {
  if (ws && ws.readyState === WebSocket.OPEN) return;

  const url = getWsUrl();
  ws = new WebSocket(url);

  ws.onopen = () => {
    console.log('WebSocket connected');
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      callbacks.forEach((cb) => cb(data));
    } catch (error) {
      console.error('WebSocket parse error:', error);
    }
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  ws.onclose = () => {
    console.log('WebSocket disconnected. Reconnecting...');
    if (reconnectTimer) clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(connectWebSocket, 5000);
  };
};

export const subscribeToSymbol = (symbol: string) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ action: 'subscribe', symbol }));
  }
};

export const addPriceListener = (callback: PriceCallback) => {
  callbacks.add(callback);
  return () => {
    callbacks.delete(callback);
  };
};

export const disconnectWebSocket = () => {
  if (reconnectTimer) clearTimeout(reconnectTimer);
  if (ws) {
    ws.close();
    ws = null;
  }
};
