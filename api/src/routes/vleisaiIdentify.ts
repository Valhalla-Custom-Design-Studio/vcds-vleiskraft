import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';

const router = Router();

const ABACUS_API_KEY = process.env.ABACUS_API_KEY || '';
const ABACUS_VISION_URL = 'https://api.abacus.ai/api/v0/describeImage';

/**
 * POST /api/vleisai/identify-cut
 * Identifies a meat cut from an image URL using Abacus AI vision model
 */
router.post('/identify-cut', requireAuth, async (req: Request, res: Response) => {
  try {
    const { imageUrl, imageBase64 } = req.body;
    if (!imageUrl && !imageBase64) return res.status(400).json({ error: 'imageUrl or imageBase64 required' });

    let result;

    if (ABACUS_API_KEY) {
      // Real Abacus AI vision call
      const prompt = `You are a South African master butcher. Identify the meat cut in this image.
Return JSON with: cut (English name), afrikaansName, confidence (0-1), description (2 sentences),
cookingMethods (array of 3-4 methods), priceRange (ZAR per kg range), species (beef/lamb/pork/chicken/game).
Only return valid JSON, no markdown.`;

      const body: Record<string, unknown> = {
        prompt,
        maxTokens: 300,
      };
      if (imageUrl) body.imageUrl = imageUrl;
      if (imageBase64) body.imageBase64 = imageBase64;

      const visionRes = await fetch(ABACUS_VISION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apiKey': ABACUS_API_KEY,
        },
        body: JSON.stringify(body),
      });

      if (visionRes.ok) {
        const data = await visionRes.json();
        const text = data.response || data.text || '';
        try {
          result = JSON.parse(text.replace(/```json|```/g, '').trim());
        } catch {
          result = { cut: text, confidence: 0.7, description: text };
        }
      } else {
        console.error('[CarcassAI] Vision failed:', await visionRes.text());
        return res.status(502).json({ error: 'Vision service unavailable' });
      }
    } else {
      // Dev fallback
      result = {
        cut: 'T-Bone Steak',
        afrikaansName: 'T-Been Biefstuk',
        confidence: 0.94,
        description: 'A premium cut from the short loin, featuring both the strip steak and tenderloin separated by a T-shaped bone. Known for its rich flavour and tenderness.',
        cookingMethods: ['Braai', 'Pan-fry', 'Grill', 'Oven-roast'],
        priceRange: 'R180 - R280 per kg',
        species: 'beef',
      };
    }

    res.json(result);
  } catch (e) {
    console.error('[CarcassAI] Error:', e);
    res.status(500).json({ error: String(e) });
  }
});

export default router;
