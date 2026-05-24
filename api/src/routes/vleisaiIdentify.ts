import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';

const router = Router();

/**
 * POST /api/vleisai/identify-cut
 * Identifies a meat cut from an image URL using VleisAI™ vision model
 */
router.post('/identify-cut', requireAuth, async (req: Request, res: Response) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) return res.status(400).json({ error: 'imageUrl required' });

    // In production: call Abacus AI vision model with imageUrl
    // Returns cut identification with confidence score
    const mockResult = {
      cut: 'T-Bone Steak',
      afrikaansName: 'T-Been Biefstuk',
      confidence: 0.94,
      description: 'A premium cut from the short loin, featuring both the strip steak and tenderloin separated by a T-shaped bone. Known for its rich flavour and tenderness.',
      cookingMethods: ['Braai', 'Pan-fry', 'Grill', 'Oven-roast'],
      priceRange: 'R180 - R280 per kg',
    };

    res.json(mockResult);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

export default router;
