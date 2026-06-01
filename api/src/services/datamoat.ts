import { pool } from "../db/pool";

/**
 * TIER 1 DATA MOAT: Log every butchery order for demand prediction
 * Aggregated -> SA meat demand oracle (SAFEX-level intelligence)
 */
export async function logOrderEvent(data: {
  butcheryId: string;
  productId: string;
  productName: string;
  quantity: number;
  priceZar: number;
  city?: string;
  dayOfWeek: number;
  hour: number;
}) {
  try {
    await pool.query(
      `INSERT INTO demand_events
        (butchery_id, product_id, product_name, quantity, price_zar, city, day_of_week, hour, logged_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())`,
      [data.butcheryId, data.productId, data.productName, data.quantity,
       data.priceZar, data.city ?? null, data.dayOfWeek, data.hour]
    );
  } catch (_) { console.error("[VleisKraft]", _); }
}

/**
 * TIER 1 DATA MOAT: Log dynamic price changes
 * Aggregated -> SA meat price elasticity model
 */
export async function logPriceChange(butcheryId: string, productId: string, oldPrice: number, newPrice: number, reason: string) {
  try {
    await pool.query(
      `INSERT INTO price_history (butchery_id, product_id, old_price, new_price, reason, changed_at)
       VALUES ($1,$2,$3,$4,$5,NOW())`,
      [butcheryId, productId, oldPrice, newPrice, reason]
    );
  } catch (_) { console.error("[VleisKraft]", _); }
}

/**
 * TIER 1 DATA MOAT: Log every VleisAI conversation
 * Becomes training data for SA Meat LLM fine-tune (no GPU needed now)
 */
export async function logVleisAIConversation(data: {
  userId: string;
  userMessage: string;
  aiResponse: string;
  consentGiven: boolean;
}) {
  if (!data.consentGiven) return;
  try {
    await pool.query(
      `INSERT INTO vleisai_conversations (user_id, user_message, ai_response, logged_at)
       VALUES ($1,$2,$3,NOW())`,
      [data.userId, data.userMessage, data.aiResponse]
    );
  } catch (_) { console.error("[VleisKraft]", _); }
}
