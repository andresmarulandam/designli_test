import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Alert from '../models/Alert';

export const createAlert = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { symbol, targetPrice } = req.body;

    const alert = new Alert({ userId: req.userId, symbol, targetPrice });
    await alert.save();

    res.status(201).json(alert);
  } catch (error: unknown) {
    console.error('Error creating alert:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAlerts = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const alerts = await Alert.find({ userId: req.userId });
    res.json(alerts);
  } catch (error: unknown) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteAlert = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await Alert.findOneAndDelete({
      _id: id,
      userId: req.userId,
    });

    if (!deleted) {
      res.status(404).json({ error: 'Alert not found' });
      return;
    }

    res.json({ message: 'Alert removed' });
  } catch (error: unknown) {
    console.error('Error deleting alert:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
