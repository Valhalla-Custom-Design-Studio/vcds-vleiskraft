import { Request, Response, NextFunction } from 'express';

/**
 * Tier hierarchy: consumer < starter < pro < business < enterprise
 * Bilingual EN/AF tier names supported.
 *
 * RULE: consumer accounts have full access to all features — no gating applies.
 */
const TIER_RANK: Record<string, number> = {
  consumer: 0,
  starter: 1,
  beginner: 1,
  pro: 2,
  groei: 2,
  business: 3,
  besigheid: 3,
  enterprise: 4,
  onderneming: 4,
};

export function requireTier(minTier: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const userTier = user.tier?.toLowerCase() ?? '';

    // Consumers always pass — no feature gating for consumer accounts
    if (userTier === 'consumer') return next();

    const userRank = TIER_RANK[userTier] ?? -1;
    const requiredRank = TIER_RANK[minTier.toLowerCase()] ?? 999;

    if (userRank < requiredRank) {
      return res.status(403).json({
        error: 'This feature requires the ' + minTier + ' plan or higher.',
        fout: 'Hierdie funksie vereis die ' + minTier + '-plan of hoer.',
        upgradeUrl: '/api/subscriptions/plans',
        yourTier: user.tier,
        requiredTier: minTier,
      });
    }
    next();
  };
}

/** Legacy alias */
export const requirePlatinum = requireTier('enterprise');
