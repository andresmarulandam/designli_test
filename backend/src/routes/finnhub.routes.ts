import { Router } from 'express';
import { getQuote, getCandles } from '../controllers/finnhub.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/quote/:symbol', getQuote);
router.get('/candles/:symbol', getCandles);

export default router;
