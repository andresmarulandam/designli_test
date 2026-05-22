export interface User {
  id: string;
  email: string;
}

export interface Stock {
  _id: string;
  userId: string;
  symbol: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockPrice {
  symbol: string;
  price: number;
  timestamp: string;
}

export interface StockQuote {
  c: number;
  d: number;
  dp: number;
  h: number;
  l: number;
  o: number;
  pc: number;
  t: number;
}

export interface Alert {
  _id: string;
  userId: string;
  symbol: string;
  targetPrice: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
