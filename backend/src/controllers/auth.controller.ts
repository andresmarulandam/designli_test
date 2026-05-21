import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    const user = new User({ email, password });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
      expiresIn: '7d',
    });

    res.status(201).json({ token, user: { id: user._id, email: user.email } });
  } catch (error: unknown) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ error: 'Invalid credentials' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(400).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
      expiresIn: '7d',
    });

    res.json({ token, user: { id: user._id, email: user.email } });
  } catch (error: unknown) {
    console.error('Error logging in user:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
