import { Request, Response } from 'express';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function carcassGrading(req: Request, res: Response) {
  const { imageUrl, species } = req.body;
  if (!imageUrl || !species) {
    return res.status(400).json({ error: 'imageUrl and species are required' });
  }
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a professional South African meat grader and butcher with 20+ years experience.
Analyse carcass images and provide grading according to SA SAMIC standards.
Respond ONLY with valid JSON in this format:
{ "grade": "A|B|C", "confidence": 0.0-1.0, "marbling": "low|medium|high|very_high", "fat_cover": "thin|medium|thick", "recommendations": ["..."], "estimated_yield": "%" }`,
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: `Grade this ${species} carcass according to SAMIC standards.` },
            { type: 'image_url', image_url: { url: imageUrl } },
          ],
        },
      ],
      max_tokens: 500,
      response_format: { type: 'json_object' },
    });
    const result = JSON.parse(completion.choices[0].message.content || '{}');
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function meatCutSuggestion(req: Request, res: Response) {
  const { budget, occasion, servings, preferences } = req.body;
  if (!budget || !servings) {
    return res.status(400).json({ error: 'budget and servings are required' });
  }
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a South African braai and butchery expert. 
Suggest meat cuts for occasions with cost optimisation for the South African market.
Respond ONLY with valid JSON:
{ "cuts": [{ "name": "...", "quantity": "...", "pricePerKg": 0, "total": 0, "preparation": "..." }], "totalCost": 0, "servings": 0, "braaiTips": ["..."] }`,
        },
        {
          role: 'user',
          content: `Budget: R${budget}, Occasion: ${occasion || 'braai'}, Servings: ${servings}, Preferences: ${preferences || 'none'}`,
        },
      ],
      max_tokens: 800,
      response_format: { type: 'json_object' },
    });
    const result = JSON.parse(completion.choices[0].message.content || '{}');
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
