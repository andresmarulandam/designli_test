import { WebSocketServer, WebSocket as WSWebSocket } from 'ws';
import { Server } from 'http';
import { subscribeToUpdates, subscribeToStock, unsubscribeFromStock } from './finnhub.service';

let wss: WebSocketServer | null = null;

export const initWebSocketServer = (server: Server): void => {
  wss = new WebSocketServer({ server, path: '/ws/stocks' });

  wss.on('connection', (ws: WSWebSocket) => {
    console.log('Client connected to stock WebSocket');

    const unsubscribe = subscribeToUpdates((data) => {
      if (ws.readyState === WSWebSocket.OPEN) {
        ws.send(JSON.stringify(data));
      }
    });

    ws.on('message', (message: string) => {
      try {
        const { action, symbol } = JSON.parse(message);
        if (action === 'subscribe' && symbol) {
          subscribeToStock(symbol);
        } else if (action === 'unsubscribe' && symbol) {
          unsubscribeFromStock(symbol);
        }
      } catch (error) {
        console.error('Invalid WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      unsubscribe();
      console.log('Client disconnected from stock WebSocket');
    });
  });

  console.log('WebSocket server initialized at /ws/stocks');
};
