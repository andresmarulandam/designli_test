import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getStockQuote, getStockCandles } from '../services/finnhub.service';

export const getQuote = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { symbol } = req.params;
    const quote = await getStockQuote(symbol.toUpperCase());
    res.json(quote);
  } catch (error: unknown) {
    console.error('Error fetching quote:', error);
    res.status(500).json({ error: 'Failed to fetch quote' });
  }
};

export const getCandles = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { symbol } = req.params;
    const candles = getStockCandles(symbol);
    res.json(candles);
  } catch (error) {
    console.error('Candles error:', error);
    res.status(500).json({ error: 'Failed to fetch candles' });
  }
};
