import { Router } from 'express';
import { getQuote, getCandles, search, popular } from '../controllers/finnhub.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/quote/:symbol', getQuote);
router.get('/candles/:symbol', getCandles);
router.get('/search/:query', search);
router.get('/popular', popular);

export default router;
