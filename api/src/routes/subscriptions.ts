import { Router, Request, Response } from 'express';
import { validateWebhookSignature, buildPaymentUrl, PLANS } from '../services/payfastSubscription';
import { requireAuth } from '../middleware/auth';
import { pool } from '../db/pool';

const router = Router();

// GET /api/subscriptions/plans  -  returns bilingual plan list
router.get('/plans', (req: Request, res: Response) => {
  const lang = (req.query.lang as string) || 'en';
  const plans = PLANS.map((p) => ({
    id: p.id,
    tier: p.tier,
    name:     lang === 'af' ? p.name_af     : p.name_en,
    amount:   p.amount,
    trial_days: p.trial_days,
    max_branches: p.max_branches,
    features: lang === 'af' ? p.features_af : p.features_en,
  }));
  res.json({ plans });
});

// POST /api/subscriptions/upgrade  -  generate PayFast payment URL
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

// GET /api/subscriptions/success
router.get('/success', (_req: Request, res: Response) => {
  res.json({ message: 'Betaling suksesvol! / Payment successful!', status: 'success' });
});

// GET /api/subscriptions/cancel
router.get('/cancel', (_req: Request, res: Response) => {
  res.json({ message: 'Betaling gekanselleer / Payment cancelled', status: 'cancelled' });
});

// POST /api/subscriptions/webhook  -  PayFast ITN
router.post('/webhook', async (req: Request, res: Response) => {
  const params = req.body as Record<string, string>;
  if (!validateWebhookSignature(params)) {
    return res.status(400).send('Invalid signature');
  }

  const { payment_status, m_payment_id, amount_gross } = params;

  if (payment_status === 'COMPLETE') {
    // m_payment_id format: {userId}_{planId}_{timestamp}
    const parts = m_payment_id.split('_');
    const butcheryId = parts[0];
    const planId     = parts[1];

    const plan = PLANS.find((p) => p.id === planId);
    if (!plan) {
      console.error(`[Webhook] Unknown planId: ${planId}`);
      return res.status(400).send('Unknown plan');
    }

    const isTrial = parseFloat(amount_gross) === 0 && plan.trial_days > 0;
    const trialEndsAt = isTrial
      ? new Date(Date.now() + plan.trial_days * 86400000).toISOString()
      : null;

    try {
      await pool.query(
        `UPDATE butcheries
         SET tier = $1, trial_ends_at = $2, updated_at = NOW()
         WHERE id = $3`,
        [plan.tier, trialEndsAt, butcheryId]
      );
    } catch (err) {
      console.error('[Subscription] DB update failed:', err);
      return res.status(500).send('DB error');
    }
  }

  res.status(200).send('OK');
});

export default router;
