import { Request, Response, NextFunction } from 'express';

/**
 * Tier hierarchy: consumer < starter < pro < business < enterprise
 * Bilingual EN/AF tier names supported.
 */
const TIER_RANK: Record<string, number> = {
  consumer: 0,
  starter: 1,
  beginner: 1,   // AF alias
  pro: 2,
  groei: 2,      // AF alias
  business: 3,
  besigheid: 3,  // AF alias
  enterprise: 4,
  onderneming: 4, // AF alias
};

export function requireTier(minTier: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const userRank = TIER_RANK[user.tier?.toLowerCase()] ?? -1;
    const requiredRank = TIER_RANK[minTier.toLowerCase()] ?? 999;

    if (userRank < requiredRank) {
      return res.status(403).json({
        error: `This feature requires the ${minTier} plan or higher.`,
        // Bilingual message
        fout: `Hierdie funksie vereis die ${minTier}-plan of hoër.`,
        upgradeUrl: '/api/subscriptions/plans',
        yourTier: user.tier,
        requiredTier: minTier,
      });
    }
    next();
  };
}

/**
 * Legacy alias — keeps old routes working without changes
 */
export const requirePlatinum = requireTier('enterprise');
