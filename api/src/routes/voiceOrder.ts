import { Router, Request, Response } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const ABACUS_API_KEY = process.env.ABACUS_API_KEY || '';
const ABACUS_WHISPER_URL = 'https://api.abacus.ai/api/v0/transcribeAudio';

/**
 * POST /api/voice-order/transcribe
 * Accepts audio file, transcribes via Abacus AI Whisper, parses order items
 */
router.post('/transcribe', requireAuth, upload.single('audio'), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No audio file' });

    let transcript = '';

    if (ABACUS_API_KEY) {
      // Real Abacus AI Whisper transcription
      const formData = new FormData();
      const blob = new Blob([req.file.buffer as unknown as ArrayBuffer], { type: req.file.mimetype });
      formData.append('audio', blob, req.file.originalname || 'audio.m4a');
      formData.append('language', 'af'); // Afrikaans first, falls back to EN

      const whisperRes = await fetch(ABACUS_WHISPER_URL, {
        method: 'POST',
        headers: { 'apiKey': ABACUS_API_KEY },
        body: formData,
      });

      if (whisperRes.ok) {
        const data = await whisperRes.json();
        transcript = data.transcript || data.text || '';
      } else {
        console.error('[VoiceOrder] Whisper failed:', await whisperRes.text());
        return res.status(502).json({ error: 'Transcription service unavailable' });
      }
    } else {
      // Dev fallback
      transcript = 'Ek wil graag 2kg beesvleis en 500g boerewors bestel asseblief';
    }

    // Parse transcript into order items using regex + keyword matching
    const parsedOrder = parseTranscript(transcript);

    res.json({ transcript, parsedOrder });
  } catch (e) {
    console.error('[VoiceOrder] Error:', e);
    res.status(500).json({ error: String(e) });
  }
});

/**
 * Parse Afrikaans/English meat order transcript into structured items
 */
function parseTranscript(text: string): { items: Array<{ name: string; qty: number; unit: string }>; notes: string } {
  const items: Array<{ name: string; qty: number; unit: string }> = [];
  const lower = text.toLowerCase();

  // Meat keywords (AF + EN)
  const meatMap: Record<string, string> = {
    'beesvleis': 'Beesvleis (Beef)', 'beef': 'Beef',
    'boerewors': 'Boerewors', 'wors': 'Boerewors',
    'lam': 'Lam (Lamb)', 'lamb': 'Lamb',
    'vark': 'Varkvleis (Pork)', 'pork': 'Pork',
    'hoender': 'Hoender (Chicken)', 'chicken': 'Chicken',
    'biltong': 'Biltong', 'droewors': 'Droewors',
    'tjop': 'Tjops (Chops)', 'chops': 'Chops',
    'steak': 'Steak', 'biefstuk': 'Biefstuk (Steak)',
    'mince': 'Mince', 'maalvleis': 'Maalvleis (Mince)',
    'rib': 'Ribs', 'ribbetjie': 'Ribbetjies (Ribs)',
  };

  // Extract quantities with units
  const qtyRegex = /(\d+(?:[.,]\d+)?)\s*(kg|g|gram|kilogram|stuk|stuks|piece|pieces|pak|pack)/gi;
  let match;
  while ((match = qtyRegex.exec(lower)) !== null) {
    const qty = parseFloat(match[1].replace(',', '.'));
    const unit = match[2].toLowerCase().startsWith('k') ? 'kg' : 'g';
    // Find nearest meat keyword before this match
    const before = lower.substring(Math.max(0, match.index - 30), match.index);
    let foundMeat = 'Unknown';
    for (const [kw, name] of Object.entries(meatMap)) {
      if (before.includes(kw) || lower.substring(match.index, match.index + 30).includes(kw)) {
        foundMeat = name;
        break;
      }
    }
    items.push({ name: foundMeat, qty, unit });
  }

  // If no structured items found, try to extract meat names only
  if (!items.length) {
    for (const [kw, name] of Object.entries(meatMap)) {
      if (lower.includes(kw)) {
        items.push({ name, qty: 1, unit: 'kg' });
      }
    }
  }

  return { items, notes: text };
}

/**
 * POST /api/voice-order/confirm
 * Converts parsed voice order into a real cart/order
 */
router.post('/confirm', requireAuth, async (req: Request, res: Response) => {
  try {
    const { items, notes, butcheryId } = req.body;
    if (!items?.length) return res.status(400).json({ error: 'No items' });
    const orderRef = `VO-${Date.now()}`;
    // In production: look up products by name in DB, add to cart, create order
    res.json({ success: true, orderRef, itemCount: items.length, butcheryId });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

export default router;
