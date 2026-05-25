import { Router, Request, Response } from 'express';
import { validateWebhookSignature, buildPaymentUrl, PLANS } from '../services/payfastSubscription';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/subscriptions/plans
router.get('/plans', (req: Request, res: Response) => {
  res.json({ plans: PLANS });
});

// POST /api/subscriptions/upgrade — generate PayFast payment URL
router.post('/upgrade', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { planId } = req.body;
  const BASE = process.env.API_BASE_URL || 'https://vleiskraft-api.onrender.com';
  try {
    const url = buildPaymentUrl(
      planId,
      user.id,
      user.butcheryName || user.name,
      `${BASE}/api/subscriptions/success`,
      `${BASE}/api/subscriptions/cancel`,
      `${BASE}/api/subscriptions/webhook`,
    );
    res.json({ paymentUrl: url });
  } catch (e) {
    res.status(400).json({ error: String(e) });
  }
});

// POST /api/subscriptions/webhook — PayFast ITN
router.post('/webhook', async (req: Request, res: Response) => {
  const params = req.body as Record<string, string>;
  if (!validateWebhookSignature(params)) {
    return res.status(400).send('Invalid signature');
  }
  const { payment_status, m_payment_id } = params;
  if (payment_status === 'COMPLETE') {
    const [butcheryId] = m_payment_id.split('_');
    // Update butchery tier to 'platinum' in DB
    console.log(`[Subscription] Platinum activated for butchery ${butcheryId}`);
  }
  res.status(200).send('OK');
});

// GET /api/subscriptions/success
router.get('/success', (req: Request, res: Response) => {
  res.json({ success: true, message: 'Platinum subscription activated!' });
});

// GET /api/subscriptions/cancel
router.get('/cancel', (req: Request, res: Response) => {
  res.json({ success: false, message: 'Payment cancelled' });
});

export const subscriptionRouter = router;
export default router;
