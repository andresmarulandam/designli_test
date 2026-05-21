import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Stock from '../models/Stock';

export const addStock = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { symbol } = req.body;

    const existing = await Stock.findOne({ userId: req.userId, symbol });
    if (existing) {
      res.status(400).json({ error: 'Stock already in your list' });
      return;
    }

    const stock = new Stock({ userId: req.userId, symbol });
    await stock.save();

    res.status(201).json(stock);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getStocks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const stocks = await Stock.find({ userId: req.userId });
    res.json(stocks);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const removeStock = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await Stock.findOneAndDelete({ _id: id, userId: req.userId });

    if (!deleted) {
      res.status(404).json({ error: 'Stock not found' });
      return;
    }

    res.json({ message: 'Stock removed' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
