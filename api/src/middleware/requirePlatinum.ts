import { Request, Response, NextFunction } from 'express';

/**
 * Middleware: blocks route if butchery is not on Platinum tier
 */
export function requirePlatinum(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  if (user.tier !== 'platinum') {
    return res.status(403).json({
      error: 'Platinum subscription required',
      upgradeUrl: '/api/subscriptions/upgrade',
      features: [
        'White-label branding',
        'WooCommerce sync',
        'VleisAI™ unlimited queries',
        'BulkSMS order alerts',
        'Analytics dashboard',
      ],
    });
  }
  next();
}
