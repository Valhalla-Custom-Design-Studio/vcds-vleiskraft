import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth";
import Anthropic from "@anthropic-ai/sdk";

const router = Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

router.post("/generate", requireAuth, async (req: Request, res: Response) => {
  try {
    const { people, budget, preferences } = req.body;
    if (!people || !budget) return res.status(400).json({ error: "people and budget required" });

    const prompt = `You are a South African meal planner. Create a 7-day meat-focused meal plan for ${people} people with a R${budget} weekly meat budget.
${preferences ? `Preferences: ${preferences}` : ""}

Return JSON array with 7 objects:
[{
  "day": "Monday",
  "meal": "Braai Lamb Chops",
  "description": "...",
  "ingredients": [{"name":"Lamb Chops","qty":"1kg","unit":"kg","price":149.99,"productId":null}],
  "prepTime": "15 min",
  "cookTime": "20 min",
  "servings": ${people}
}]

Use SA meat cuts and Afrikaans names where appropriate. Stay within budget. Focus on value.`;

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = (response.content[0] as { text: string }).text;
    const match = raw.match(/\[([\s\S]*)\]/);
    if (!match) return res.status(500).json({ error: "Failed to parse meal plan" });
    const plan = JSON.parse(`[${match[1]}]`);
    res.json({ plan, budget, people });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

export default router;
