# DesignLI — Full-Stack Stock Tracker

A real-time stock tracking application built with React Native (Expo) and Node.js/Express, powered by Finnhub APIs. Users can view live stock prices, search stocks, create price alerts, and receive push notifications via Firebase Cloud Messaging.

---

## Tech Stack

| Layer       | Technology                                      |
| ----------- | ----------------------------------------------- |
| **Mobile**  | React Native (Expo SDK 56), TypeScript, Zustand |
| **Backend** | Node.js, Express, TypeScript, Mongoose           |
| **Database**| MongoDB 7 (Docker)                              |
| **APIs**    | Finnhub (REST + WebSocket)                      |
| **Auth**    | JWT + bcrypt                                    |
| **Push**    | Firebase Cloud Messaging (FCM)                  |
| **Docker**  | docker-compose for MongoDB                      |

---

## Project Structure

```
DESIGNLI/
├── backend/                  # Node.js + Express API
│   ├── src/
│   │   ├── controllers/      # Route handlers
│   │   ├── middleware/       # JWT auth middleware
│   │   ├── models/           # Mongoose schemas (User, Stock, Alert)
│   │   ├── routes/           # Express routers
│   │   └── services/         # Finnhub WS, FCM, WebSocket server
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── mobile/                   # React Native (Expo) app
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── navigation/       # Tab + Stack navigators
│   │   ├── screens/          # Screen components
│   │   ├── services/         # API, WebSocket, FCM clients
│   │   ├── store/            # Zustand stores
│   │   └── theme/            # Colors, spacing, etc.
│   ├── App.tsx
│   ├── app.json
│   └── package.json
├── docker-compose.yml        # MongoDB service
└── README.md
```

---

## Features

### Functional Requirements
1. **User Authentication** — Register and login with JWT tokens
2. **Price Alerts** — Create alerts with target prices; auto-deactivated when triggered
3. **Stock List** — Browse popular stocks and search any stock via Finnhub
4. **Stock Charts** — Real-time price history charts per stock
5. **Push Notifications (FCM)** — Receive alerts when price exceeds target (requires physical device)

### Extra
- **Docker** — MongoDB runs in a Docker container
- **Real-time WebSocket** — Live price updates from Finnhub pushed to all connected clients

---

## Getting Started

### Prerequisites

- Node.js >= 18
- Docker Desktop (for MongoDB)
- Android Studio (for emulator / development build)
- Finnhub API key (free tier: https://finnhub.io/register)
- Firebase project with service account (for FCM — optional for testing)

---

### 1. Clone & Install Dependencies

```bash
# Backend
cd backend
cp .env.example .env   # then edit .env with your keys
npm install

# Mobile
cd ../mobile
npm install
```

### 2. Environment Variables

**`backend/.env`**

```
PORT=3000
MONGO_URI=mongodb://localhost:27017/designli
JWT_SECRET=your_jwt_secret
FINNHUB_API_KEY=your_finnhub_api_key
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
```

Example `.env` file:

### 3. Start MongoDB (Docker)

```bash
docker compose up -d
```

### 4. Run the Backend

```bash
cd backend
npm run dev
```

Server starts on `http://localhost:3000`.

### 5. Run the Mobile App

```bash
cd mobile
npx expo run:android
```

> **Note:** For the Android emulator, the app connects to `10.0.2.2:3000`.  
> For a **physical device**, change `API_URL` in `mobile/src/services/api.ts` and `ws` URL in `mobile/src/services/websocket.ts` to your PC's local IP (e.g. `192.168.x.x`).

---

## API Endpoints

All endpoints except `auth` require a `Bearer <token>` header.

### Auth
| Method | Path               | Description          |
| ------ | ------------------ | -------------------- |
| POST   | `/api/auth/register` | Register new user    |
| POST   | `/api/auth/login`    | Login                |
| POST   | `/api/auth/fcm-token` | Save FCM push token |

### Stocks (user watchlist)
| Method | Path             | Description          |
| ------ | ---------------- | -------------------- |
| GET    | `/api/stocks`    | List user's stocks   |
| POST   | `/api/stocks`    | Add stock to watchlist |
| DELETE | `/api/stocks/:id` | Remove stock         |

### Alerts
| Method | Path              | Description          |
| ------ | ----------------- | -------------------- |
| GET    | `/api/alerts`     | List user's alerts   |
| POST   | `/api/alerts`     | Create price alert   |
| DELETE | `/api/alerts/:id` | Delete alert         |

### Finnhub Proxy
| Method | Path                       | Description                    |
| ------ | -------------------------- | ------------------------------ |
| GET    | `/api/finnhub/quote/:symbol` | Get current stock quote        |
| GET    | `/api/finnhub/candles/:symbol` | Get cached price history       |
| GET    | `/api/finnhub/search/:query` | Search stocks on Finnhub       |
| GET    | `/api/finnhub/popular`       | Get popular stocks with quotes |

### WebSocket
- **Path:** `ws://<host>:3000/ws/stocks`
- Sends real-time price updates: `{ symbol, price, timestamp }`
- Client can send: `{ action: "subscribe", symbol }` or `{ action: "unsubscribe", symbol }`

---

## Architecture

### Data Flow

```
Finnhub REST  ←───  Backend  ───→  MongoDB
   │                 │   ↑
   │           HTTP REST  │
   ▼                 │   │
Finnhub WSS ───→  WebSocket Server  ───→  Mobile App
                    (ws://host:3000/ws/stocks)
```

1. **Finnhub WebSocket** — Backend connects to Finnhub's real-time trade stream, subscribes to watched symbols.
2. **Price Broadcast** — Every incoming trade is broadcast to all connected mobile clients via the internal WebSocket server.
3. **Alert Checker** — Each trade triggers a DB query for active alerts; triggered alerts fire FCM push notifications.
4. **REST Fallback** — Quote and search endpoints proxy Finnhub REST API with a 5-second timeout.

### State Management (Mobile)

- **Zustand stores:** `authStore`, `stockStore`, `alertStore`
- **WebSocket listener** updates `prices` in the stock store in real-time
- **AsyncStorage** persists auth token across sessions

---

## Building the APK

```bash
cd mobile
npx expo run:android   # Development build (debug APK)

# Or for a release build:
cd android
./gradlew assembleRelease
```

The APK is located at:
```
mobile/android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Docker

The entire stack (MongoDB + backend) can run in Docker:

```bash
# Build and start all services
docker compose up --build -d

# View logs
docker compose logs -f

# Stop
docker compose down
```

The backend is built from `backend/Dockerfile` (multi-stage, production-ready). MongoDB data persists in a named volume.

> **Note:** Firebase service account (`firebase-service-account.json`) is mounted as a read-only volume at runtime — it is not baked into the image.

---

## Notes

- **Free-tier Finnhub**: The candles REST endpoint (`/stock/candle`) returns 403 on the free plan. Price history is built from WebSocket trade data in memory.
- **FCM**: Push notifications require a **physical device** (emulators lack Google Play Services). The app handles this gracefully with a log message.
- **Market Hours**: US stock prices only update during trading hours (9:30 AM – 4:00 PM ET). Crypto symbols (e.g. `BINANCE:BTCUSDT`) trade 24/7.
