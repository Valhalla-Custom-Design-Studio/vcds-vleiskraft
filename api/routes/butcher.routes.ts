import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import pool from '../db';

const router = Router();

// GET /api/butcher/subscription
router.get('/', authMiddleware, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const subRes = await pool.query(
      `SELECT tier, status, expires_at, product_count FROM subscriptions
       LEFT JOIN butcher_profiles bp ON bp.user_id = $1
       WHERE subscriptions.user_id = $1 AND status = 'active'
       ORDER BY subscriptions.created_at DESC LIMIT 1`,
      [userId]
    );
    const tier = subRes.rows[0]?.tier || 'free';
    const productCount = subRes.rows[0]?.product_count || 0;
    res.json({ success: true, tier, product_count: productCount });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/butcher/subscribe — initiate PayFast subscription
router.post('/subscribe', authMiddleware, async (req: any, res) => {
  try {
    const { tier } = req.body;
    const userId = req.user.id;
    const TIER_PRICES: Record<string, number> = {
      starter: 3500, pro: 7500, business: 10000, enterprise: 15000,
    };
    const price = TIER_PRICES[tier];
    if (!price) return res.status(400).json({ success: false, message: 'Invalid tier' });

    const MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID || '11910323';
    const MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY || 'f61uspt7vtdta';
    const returnUrl = process.env.PAYFAST_RETURN_URL || 'https://vcds-vleiskraft.onrender.com/payment/success';
    const cancelUrl = process.env.PAYFAST_CANCEL_URL || 'https://vcds-vleiskraft.onrender.com/payment/cancel';
    const notifyUrl = process.env.PAYFAST_NOTIFY_URL || 'https://vcds-vleiskraft.onrender.com/api/payments/notify';

    const params = new URLSearchParams({
      merchant_id: MERCHANT_ID,
      merchant_key: MERCHANT_KEY,
      return_url: returnUrl,
      cancel_url: cancelUrl,
      notify_url: notifyUrl,
      amount: price.toFixed(2),
      item_name: `VleisKraft ${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan`,
      custom_str1: userId.toString(),
      custom_str2: tier,
      subscription_type: '1',
      billing_date: new Date().toISOString().split('T')[0],
      recurring_amount: price.toFixed(2),
      frequency: '3', // monthly
      cycles: '0', // indefinite
    });

    const payment_url = `https://www.payfast.co.za/eng/process?${params.toString()}`;
    res.json({ success: true, payment_url });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
