import { Router, Request, Response } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

/**
 * POST /api/voice-order/transcribe
 * Accepts audio file, transcribes via Abacus AI Whisper, parses order items
 */
router.post('/transcribe', requireAuth, upload.single('audio'), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No audio file' });

    // In production: send to Abacus AI Whisper endpoint for transcription
    // Then parse transcript with VleisAI™ LLM to extract order items
    const mockTranscript = 'Ek wil graag 2kg beesvleis en 500g boerewors bestel asseblief';
    const mockParsed = {
      items: [
        { name: 'Beesvleis', qty: 2, unit: 'kg' },
        { name: 'Boerewors', qty: 500, unit: 'g' },
      ],
      notes: '',
    };

    res.json({ transcript: mockTranscript, parsedOrder: mockParsed });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

/**
 * POST /api/voice-order/confirm
 * Converts parsed voice order into a real cart/order
 */
router.post('/confirm', requireAuth, async (req: Request, res: Response) => {
  try {
    const { items, notes } = req.body;
    if (!items?.length) return res.status(400).json({ error: 'No items' });
    // In production: look up products by name, add to cart, create order
    const orderRef = `VO-${Date.now()}`;
    res.json({ success: true, orderRef, itemCount: items.length });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

export default router;
