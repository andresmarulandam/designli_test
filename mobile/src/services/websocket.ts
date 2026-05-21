type PriceCallback = (data: { symbol: string; price: number; timestamp: string }) => void;

let ws: WebSocket | null = null;
const callbacks: Set<PriceCallback> = new Set();

export const connectWebSocket = () => {
  if (ws && ws.readyState === WebSocket.OPEN) return;

  ws = new WebSocket('ws://10.0.2.2:3000/ws/stocks');

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
    setTimeout(connectWebSocket, 5000);
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
  if (ws) {
    ws.close();
    ws = null;
  }
};
