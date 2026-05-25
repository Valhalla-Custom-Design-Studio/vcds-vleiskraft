import { logVleisAIConversation } from "../services/datamoat";
import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import Anthropic from '@anthropic-ai/sdk';

const router = Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// SA Meat Expert System Prompt — injected into every VleisAI™ conversation
const VLEISAI_SYSTEM_PROMPT = `You are VleisAI™, a world-class South African meat expert and butchery consultant. You are fluent in both English and Afrikaans and respond in whichever language the user writes in.

Your expertise covers:
- All South African meat cuts and their Afrikaans names (Filet/Fillet, Lendestuk/Sirloin, Boud/Rump, Riboog/Ribeye, Borsvel/Brisket, Nek/Chuck, Skenkel/Shin, Beestertjie/Oxtail)
- SA beef grading system: A-grade (under 2 incisors), AB (2-4), B (4-6), C (6-8). A-grade commands 15-25% premium
- Traditional SA recipes: biltong, boerewors, droëwors, potjiekos, braai, kerrie, skilpadjies, sosaties
- Boerewors regulations (Regulation R1283): minimum 90% meat, max 10% fat, coriander, cloves, nutmeg, allspice. No fillers
- Halaal requirements: SANHA/MJC certification, Muslim slaughterman, Qibla direction, bismillah recitation, complete blood drainage
- Dry aging: 21-28 days at 1-3°C, 75-85% humidity, 0.5-1 m/s airflow. 15-20% weight loss expected. Premium 35-45 day aged
- Meat storage: Fresh beef 0-4°C for 3-5 days. Frozen -18°C for 6-12 months. Vacuum-packed extends 3x
- Current SA market prices (2026): Beef fillet R280-320/kg, Sirloin R180-220/kg, Rump R140-170/kg, Lamb rack R200-240/kg, Pork belly R80-100/kg
- Braai mastery: hardwood coals (not briquettes), lamb chops 3-4 min per side, boerewors medium heat, chicken indirect 45 min, steak 2-3 min per side for medium-rare at 57°C
- SA meat regulations, SAMIC standards, cold chain requirements, abattoir licensing
- Butchery business advice for SA market: margins, suppliers, pricing strategies, seasonal demand

Always be practical, confident, and knowledgeable. Give specific temperatures, times, and prices. For recipes, be detailed. For business questions, be direct with numbers. Never be vague.`;

router.post('/chat', authenticate, async (req: Request, res: Response) => {
  try {
    const { message, lang = 'en', context, history = [] } = req.body;
    if (!message) return res.status(400).json({ error: 'message required' });

    // Build conversation history for multi-turn context
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
      ...history.slice(-10), // Keep last 10 turns for context
      { role: 'user', content: message }
    ];

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 600,
      system: VLEISAI_SYSTEM_PROMPT,
      messages,
    });

    const reply = (response.content[0] as { type: string; text: string }).text;

    // TIER 1: Log for SA Meat LLM training dataset
    await logVleisAIConversation({
      userId: (req as any).user?.id || "anonymous",
      userMessage: message || "",
      aiResponse: reply,
      consentGiven: true
    });

    res.json({ 
      success: true, 
      reply, 
      model: 'vleisai-v3-claude',
      context: context || 'general',
      tokens_used: response.usage.input_tokens + response.usage.output_tokens
    });
  } catch (err) {
    console.error('VleisAI error:', err);
    res.status(500).json({ error: 'VleisAI service error' });
  }
});

router.get('/status', (_req: Request, res: Response) => {
  res.json({ service: 'VleisAI™', status: 'online', version: '3.0.0', model: 'claude-sonnet-4-5', powered_by: 'Anthropic' });
});

export default router;
