/**
 * VleisKraft™ WhatsApp Commerce — Tier 4+5 Market Moat
 * Every butchery gets AI-powered WhatsApp ordering
 * "Ek wil 2kg rump bestel" → AI processes → PayFast link → Pargo pickup booked
 * Zero app install. Wins townships and rural markets.
 * VCDS™ IP Asset
 */
import Anthropic from "@anthropic-ai/sdk";
import { pool } from "../db/pool";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface ParsedOrder {
  items: { product: string; quantity: number; unit: string; estimated_price: number }[];
  total_estimated: number;
  language: "af" | "en" | "zu";
  confidence: number;
}

export async function parseWhatsAppOrder(message: string, butcheryId: string): Promise<ParsedOrder> {
  // Fetch butchery catalogue
  const catalogue = await pool.query(
    "SELECT name, price_per_kg, price_per_unit FROM meat_products WHERE butchery_id=$1 AND is_available=true LIMIT 20",
    [butcheryId]
  ).catch(() => ({ rows: [] }));

  const catalogueText = (catalogue as any).rows
    .map((p: any) => `${p.name}: R${p.price_per_kg || p.price_per_unit}/kg`)
    .join(", ");

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 500,
    system: `You are a SA butchery order parser. Extract meat orders from Afrikaans/English/Zulu messages.
Butchery catalogue: ${catalogueText || "Standard SA cuts: Rump R189/kg, Mince R89/kg, Boerewors R129/kg, Braai chops R149/kg"}
Return ONLY JSON: { items: [{product, quantity, unit, estimated_price}], total_estimated, language, confidence }`,
    messages: [{ role: "user", content: message }]
  });

  const text = (response.content[0] as any).text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Could not parse order");
  return JSON.parse(jsonMatch[0]);
}

export async function formatOrderConfirmation(order: ParsedOrder, butcheryName: string, lang: "af" | "en" | "zu"): Promise<string> {
  const itemsList = order.items.map(i => `• ${i.quantity}${i.unit} ${i.product}: R${i.estimated_price.toFixed(2)}`).join("\n");

  if (lang === "af") {
    return `🥩 *${butcheryName} via VleisKraft™*\n\n*Jou bestelling:*\n${itemsList}\n\n*Totaal: ~R${order.total_estimated.toFixed(2)}*\n\nTik *BEVESTIG* om te betaal of *KANSELLEER* om te stop.\n_Betaal via PayFast. Pargo afhaalpunt beskikbaar._`;
  }
  return `🥩 *${butcheryName} via VleisKraft™*\n\n*Your order:*\n${itemsList}\n\n*Total: ~R${order.total_estimated.toFixed(2)}*\n\nReply *CONFIRM* to pay or *CANCEL* to stop.\n_Pay via PayFast. Pargo pickup available._`;
}
