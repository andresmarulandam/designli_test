import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';

export const registerFcmToken = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { fcmToken } = req.body;
    await User.findByIdAndUpdate(req.userId, { fcmToken });
    res.json({ message: 'FCM token saved' });
  } catch (error: unknown) {
    console.error('Error saving FCM token:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
