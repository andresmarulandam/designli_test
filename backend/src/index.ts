import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import http from 'node:http';
import authRoutes from './routes/auth.routes';
import stockRoutes from './routes/stock.routes';
import alertRoutes from './routes/alert.routes';
import finnhubRoutes from './routes/finnhub.routes';
import { connectFinnhubWebSocket } from './services/finnhub.service';
import { initWebSocketServer } from './services/websocket.service';
import { initFirebase } from './services/fcm.service';

const app = express();
const server = http.createServer(app);

// Initialize Firebase
initFirebase();

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => {
    console.log('MongoDB connected');
    connectFinnhubWebSocket();
  })
  .catch((err) => console.error('MongoDB error:', err));

// Routes
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/finnhub', finnhubRoutes);

// Initialize WebSocket server for real-time client updates
initWebSocketServer(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
