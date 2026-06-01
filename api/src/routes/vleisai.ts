import { logVleisAIConversation } from "../services/datamoat";
import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import Anthropic from '@anthropic-ai/sdk';
import { pool } from '../db/pool';

const router = Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── VleisAI(TM) System Prompt ───────────────────────────────────────────────────
// RULES: Afrikaans-only, no external links, structured JSON response, real product IDs only
// Migrated from nodejs_space/src/vleisai/vleisai.controller.ts (NestJS → Express)
// WAVE 2: Migrate to NestJS + Prisma  -  tracked in KAN backlog
const buildSystemPrompt = (catalogue: string) => `Jy is VleisAI(TM), 'n vriendelike Afrikaanse slaghuisassistent. Jy help kliënte met vleiskeuses, braai-wenke, resepte en bestellings.

REËLS (MOET VOLG):
1. Antwoord ALTYD in SUIWER AFRIKAANS  -  geen Engels gemeng nie.
2. Moenie eksterne webskakels, URL's of webadresse gee nie  -  dit werk nie in die app nie.
3. As jy produkte aanbeveel, gebruik SLEGS produkte uit die katalogus hieronder.
4. Wees vriendelik, prakties en bondig.
5. Vir braai-aanbevelings: gee kooktye, temperature en wenke  -  geen skakels nie.

SUID-AFRIKAANSE VLEISKENNIS:
- Vleissnitte: Filet, Lendestuk (Sirloin), Boud (Rump), Riboog (Ribeye), Borsvel (Brisket), Nek (Chuck), Skenkel (Shin), Beestertjie (Oxtail)
- SA Beesgradering: A-graad (<2 snijtande), AB (2-4), B (4-6), C (6-8). A-graad 15-25% premie
- Tradisionele resepte: biltong, boerewors, droëwors, potjiekos, braai, kerrie, skilpadjies, sosaties
- Boerewors (Reg R1283): min 90% vleis, maks 10% vet, koljander, naeltjies, neutmuskaat, piment. Geen vulstowwe
- Braai: hardehout kole, lamskotelette 3-4 min per kant, boerewors medium hitte, hoender indirek 45 min, steak 2-3 min per kant vir medium-skaars by 57°C
- Vleisberging: Vars bees 0-4°C vir 3-5 dae. Gevries -18°C vir 6-12 maande
- Huidige SA pryse (2026): Filet R280-320/kg, Sirloin R180-220/kg, Boud R140-170/kg, Lamrak R200-240/kg, Varkpens R80-100/kg

HUIDIGE KATALOGUS:
${catalogue || 'Geen produkte beskikbaar nie.'}

Antwoord ALTYD met hierdie JSON formaat:
{"reply": "jou Afrikaanse antwoord hier", "suggestedProducts": [{"id": "produk-id", "nameAf": "Afrikaanse naam", "nameEn": "English name", "price": 0}]}

As geen produkte relevant is nie, gebruik 'n leë array: "suggestedProducts": []';

// ─── POST /chat ───────────────────────────────────────────────────────────────
router.post('/chat', authenticate, async (req: Request, res: Response) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) return res.status(400).json({ error: 'message required' });

    const userId = (req as any).user?.id || 'anonymous';
    const butcheryId = (req as any).user?.butchery_id || null;

    // Fetch live product catalogue for this butchery (if linked)
    let catalogue = '';
    try {
      const whereClause = butcheryId
        ? 'WHERE is_active = true AND butchery_id = $1'
        : 'WHERE is_active = true';
      const params = butcheryId ? [butcheryId] : [];
      const products = await pool.query(
        `SELECT id, name_en, name_af, price_zar, unit FROM products ${whereClause} LIMIT 60`,
        params
      );
      catalogue = products.rows
        .map((p: any) => `- ${p.name_af ?? p.name_en} (${p.name_en}) - R${p.price_zar}/${p.unit ?? 'kg'}`)
        .join('\n');
    } catch {
      // Non-fatal  -  continue without catalogue
    }

    // Build conversation history (last 10 turns)
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
      ...history.slice(-10),
      { role: 'user', content: message },
    ];

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 800,
      system: buildSystemPrompt(catalogue),
      messages,
    });

    const rawText = (response.content[0] as { type: string; text: string }).text;

    // Parse structured JSON response
    let reply = rawText;
    let suggestedProducts: any[] = [];
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        reply = parsed.reply ?? rawText;
        suggestedProducts = parsed.suggestedProducts ?? [];
      }
    } catch {
      // Fallback to raw text if JSON parse fails
    }

    // Persist chat history to DB
    try {
      await pool.query(
        `INSERT INTO chat_messages (user_id, butchery_id, role, content, channel) VALUES ($1,$2,$3,$4,'vleisai')`,
        [userId, butcheryId, 'user', message]
      );
      await pool.query(
        `INSERT INTO chat_messages (user_id, butchery_id, role, content, channel) VALUES ($1,$2,$3,$4,'vleisai')`,
        [userId, butcheryId, 'assistant', reply]
      );
    } catch {
      // Non-fatal  -  chat history is best-effort
    }

    // Datamoat: log for SA Meat LLM training dataset
    await logVleisAIConversation({
      userId,
      userMessage: message,
      aiResponse: reply,
      consentGiven: true,
    });

    res.json({
      success: true,
      reply,
      suggestedProducts,
      model: 'vleisai-v4-claude-af',
      tokens_used: response.usage.input_tokens + response.usage.output_tokens,
    });
  } catch (err) {
    console.error('[VleisAI] Chat error:', err);
    res.status(500).json({ error: 'VleisAI service error' });
  }
});

// ─── GET /history ─────────────────────────────────────────────────────────────
router.get('/history', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const channel = (req.query.channel as string) || 'vleisai';
    const result = await pool.query(
      `SELECT id, role, content, created_at FROM chat_messages
       WHERE user_id = $1 AND channel = $2
       ORDER BY created_at DESC LIMIT 50`,
      [userId, channel]
    );
    res.json(result.rows.reverse());
  } catch (err) {
    console.error('[VleisAI] History error:', err);
    res.status(500).json({ error: 'Could not fetch history' });
  }
});

// ─── GET /status ──────────────────────────────────────────────────────────────
router.get('/status', (_req: Request, res: Response) => {
  res.json({
    service: 'VleisAI(TM)',
    status: 'online',
    version: '4.0.0',
    model: 'claude-sonnet-4-5',
    language: 'Afrikaans',
    powered_by: 'Anthropic',
  });
});

export default router;
