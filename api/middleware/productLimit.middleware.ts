import { Request, Response, NextFunction } from 'express';
import pool from '../db';
import { BUTCHER_TIER_RANK } from '../../src/constants/tiers';

const PRODUCT_LIMITS: Record<string, number | null> = {
  free: 10,
  starter: 50,
  pro: null,
  business: null,
  enterprise: null,
};

export async function productLimitGuard(req: any, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const subRes = await pool.query(
      `SELECT tier FROM subscriptions WHERE user_id = $1 AND status = 'active' ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );
    const tier = subRes.rows[0]?.tier || 'free';
    const limit = PRODUCT_LIMITS[tier];
    if (limit === null) return next();

    const countRes = await pool.query(
      `SELECT COUNT(*) as count FROM products WHERE butcher_id = $1 AND is_active = true`,
      [userId]
    );
    const used = parseInt(countRes.rows[0]?.count || '0');

    if (used >= limit) {
      return res.status(403).json({
        success: false,
        code: 'PRODUCT_LIMIT_REACHED',
        message: `Your ${tier} plan allows up to ${limit} products. Upgrade to list more.`,
        tier, used, limit,
      });
    }
    next();
  } catch {
    next();
  }
}
