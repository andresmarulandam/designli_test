import { Router } from 'express';
import { register, login } from '../controllers/auth.controller';
import { registerFcmToken } from '../controllers/fcm.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/fcm-token', authMiddleware, registerFcmToken);

export default router;
