import { Request, Response, NextFunction } from 'express';

/**
 * requirePlatinum middleware — VleisKraft™ B2B tier gate.
 * Platinum tier: R15,000/month — full API access, white-label, priority support.
 * Delegates to requireTier('platinum') for consistency.
 */
export function requirePlatinum(req: Request, res: Response, next: NextFunction): void {
  const user = (req as any).user;

  if (!user) {
    res.status(401).json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' });
    return;
  }

  const allowedTiers = ['platinum'];
  if (!allowedTiers.includes(user.subscriptionTier)) {
    res.status(403).json({
      error: 'Platinum subscription required',
      code: 'TIER_INSUFFICIENT',
      currentTier: user.subscriptionTier,
      requiredTier: 'platinum',
      upgradeUrl: 'https://vleiskraft.co.za/upgrade',
      message: user.locale === 'af'
        ? "Hierdie funksie vereis 'n Platinum-intekening (R15,000/maand)."
        : 'This feature requires a Platinum subscription (R15,000/month).',
    });
    return;
  }

  next();
}

// Re-export for backward compatibility
export { requirePlatinum as default };
