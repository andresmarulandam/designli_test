import { Router } from 'express';
import { addStock, getStocks, removeStock } from '../controllers/stock.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.post('/', addStock);
router.get('/', getStocks);
router.delete('/:id', removeStock);

export default router;
