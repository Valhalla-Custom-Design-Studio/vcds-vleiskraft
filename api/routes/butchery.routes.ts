import { Router } from 'express';
import { listOrders, createOrder, getOrderStatus } from '../controllers/orders.controller';
import { carcassGrading, meatCutSuggestion } from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireTier } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/orders', listOrders);
router.post('/orders', createOrder);
router.get('/orders/:id', getOrderStatus);

router.post('/ai/grade', requireTier('platinum'), carcassGrading);
router.post('/ai/suggest', requireTier('sa'), meatCutSuggestion);

export default router;
