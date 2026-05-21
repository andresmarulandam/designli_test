import { Router } from 'express';
import { createAlert, getAlerts, deleteAlert } from '../controllers/alert.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.post('/', createAlert);
router.get('/', getAlerts);
router.delete('/:id', deleteAlert);

export default router;
