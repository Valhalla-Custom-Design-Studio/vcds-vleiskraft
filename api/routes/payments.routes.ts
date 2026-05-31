import { Router } from 'express';
import pool from '../db';
import crypto from 'crypto';

const router = Router();

// POST /api/payments/notify — PayFast ITN webhook
router.post('/notify', async (req, res) => {
  try {
    const data = req.body;
    const { payment_status, custom_str1: userId, custom_str2: tier, amount_gross } = data;

    // Verify PayFast signature
    const passphrase = process.env.PAYFAST_PASSPHRASE || '';
    const paramString = Object.keys(data)
      .filter(k => k !== 'signature')
      .sort()
      .map(k => `${k}=${encodeURIComponent(data[k]).replace(/%20/g, '+')}`)
      .join('&');
    const signature = crypto.createHash('md5').update(paramString + (passphrase ? `&passphrase=${passphrase}` : '')).digest('hex');

    if (signature !== data.signature) {
      return res.status(400).send('Invalid signature');
    }

    if (payment_status === 'COMPLETE') {
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      await pool.query(
        `INSERT INTO subscriptions (user_id, tier, status, amount, expires_at, created_at)
         VALUES ($1, $2, 'active', $3, $4, NOW())
         ON CONFLICT (user_id) DO UPDATE
         SET tier = $2, status = 'active', amount = $3, expires_at = $4, updated_at = NOW()`,
        [userId, tier, parseFloat(amount_gross), expiresAt]
      );
    } else if (payment_status === 'CANCELLED') {
      await pool.query(
        `UPDATE subscriptions SET status = 'cancelled', updated_at = NOW() WHERE user_id = $1`,
        [userId]
      );
    }

    res.status(200).send('OK');
  } catch (err) {
    console.error('PayFast webhook error:', err);
    res.status(500).send('Error');
  }
});

export default router;
