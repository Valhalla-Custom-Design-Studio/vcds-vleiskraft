
import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

const KNOWLEDGE_BASE: Record<string, string> = {
  'ribeye': 'Ribeye (Riboog) is cut from the rib section, well-marbled, best grilled medium-rare at 57°C. Price: R180-220/kg. Afrikaans: Riboog-steak.',
  'biltong': 'Biltong is made from silverside or topside. Cure with salt, vinegar, coriander for 24h, dry for 5-7 days at 25°C with airflow. Moisture content should be 25-35% for wet biltong.',
  'braai': 'For the perfect braai: use hardwood coals (not briquettes). Lamb chops: 3-4 min per side. Boerewors: medium heat, turn often. Chicken: indirect heat 45 min. Steak: 2-3 min per side for medium-rare.',
  'boerewors': 'Traditional boerewors: 90% beef/pork/lamb, max 10% fat, coriander, cloves, nutmeg, allspice. No fillers allowed by SA law (Regulation R1283). Minimum 90% meat content.',
  'halaal': 'Halaal slaughter requires: Muslim slaughterman, animal facing Qibla, sharp knife, bismillah recitation, complete blood drainage. SANHA or MJC certification required for commercial.',
  'grades': 'SA beef grades: A (under 2 permanent incisors, best quality), AB (2-4 incisors), B (4-6 incisors), C (6-8 incisors). A-grade commands 15-25% premium.',
  'storage': 'Meat storage: Fresh beef 0-4°C for 3-5 days. Frozen beef -18°C for 6-12 months. Never refreeze thawed meat. Vacuum-packed extends shelf life 3x.',
  'cuts': 'SA popular cuts: Fillet (Filet), Sirloin (Lendestuk), Rump (Boud), Ribeye (Riboog), T-bone, Brisket (Borsvel), Chuck (Nek), Shin (Skenkel), Oxtail (Beestertjie).',
  'price': 'Current SA market prices (May 2026): Beef fillet R280-320/kg, Sirloin R180-220/kg, Rump R140-170/kg, Lamb rack R200-240/kg, Pork belly R80-100/kg.',
  'dry age': 'Dry aging: 21-28 days at 1-3°C, 75-85% humidity, 0.5-1 m/s airflow. Develops complex flavour, tenderises. Expect 15-20% weight loss. Premium: 35-45 day aged.',
};

router.post('/chat', authenticate, async (req: Request, res: Response) => {
  try {
    const { message, lang = 'en', context } = req.body;
    if (!message) return res.status(400).json({ error: 'message required' });

    const lower = message.toLowerCase();
    let reply = '';

    // Knowledge base lookup
    for (const [key, value] of Object.entries(KNOWLEDGE_BASE)) {
      if (lower.includes(key)) { reply = value; break; }
    }

    if (!reply) {
      // Contextual responses
      if (lower.includes('price') || lower.includes('prys')) {
        reply = lang === 'af' 
          ? 'Huidige SA vleispryse (Mei 2026): Beesvleis filet R280-320/kg, Lendestuk R180-220/kg, Lamtjops R160-200/kg. Pryse wissel per streek en graad.'
          : 'Current SA meat prices (May 2026): Beef fillet R280-320/kg, Sirloin R180-220/kg, Lamb chops R160-200/kg. Prices vary by region and grade.';
      } else if (lower.includes('recipe') || lower.includes('resep')) {
        reply = lang === 'af'
          ? "Watter vleis soek jy 'n resep vir? Ek het resepte vir biltong, boerewors, potjie, braai, kerrie en meer."
          : 'Which meat are you looking for a recipe for? I have recipes for biltong, boerewors, potjie, braai, curry and more.';
      } else {
        reply = lang === 'af'
          ? `Ek het jou vraag oor "${message}" ontvang. Vra my oor: vleissnitte, pryse, resepte, biltong, braai, halaal, gradering, berging of SA vleisregulasies.`
          : `I received your question about "${message}". Ask me about: meat cuts, prices, recipes, biltong, braai, halaal, grading, storage or SA meat regulations.`;
      }
    }

    res.json({ success: true, reply, model: 'vleisai-v2', context: context || 'general' });
  } catch { res.status(500).json({ error: 'VleisAI service error' }); }
});

router.get('/status', (_req: Request, res: Response) => {
  res.json({ service: 'VleisAI™', status: 'online', version: '2.0.0', knowledge_base_size: Object.keys(KNOWLEDGE_BASE).length });
});

export default router;
