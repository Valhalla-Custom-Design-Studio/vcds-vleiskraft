/**
 * Stockvel Finance Layer — Tier 5 Fintech Moat
 * VCDS™ IP Asset | Underbanked SA communities
 * Stockvel groups save, earn interest, bulk order automatically on payout
 * Partner: Peach Payments / Lula
 * VCDS™ earns % on every transaction + bulk order commission
 */
import { pool } from "../db/pool";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface StockvelGroup {
  id: string;
  name: string;
  members: number;
  total_saved: number;
  monthly_contribution: number;
  payout_date: string;
  auto_bulk_order: boolean;
}

export interface StockvelPayout {
  group_id: string;
  payout_amount: number;
  member_share: number;
  bulk_order_value: number;
  savings_interest_earned: number;
  payout_date: string;
}

/**
 * Calculate stockvel payout with auto bulk order
 */
export async function calculateStockvelPayout(groupId: string): Promise<StockvelPayout> {
  const group = await pool.query(`
    SELECT sg.*, 
      COUNT(sm.user_id) as member_count,
      COALESCE(SUM(sc.amount), 0) as total_saved
    FROM stockvel_groups sg
    LEFT JOIN stockvel_members sm ON sg.id = sm.group_id
    LEFT JOIN stockvel_contributions sc ON sg.id = sc.group_id
    WHERE sg.id = $1
    GROUP BY sg.id
  `, [groupId]);

  if (!group.rows.length) throw new Error("Stockvel group not found");
  const g = group.rows[0];

  const totalSaved = parseFloat(g.total_saved) || 0;
  const memberCount = parseInt(g.member_count) || 1;
  const interestRate = 0.02; // 2% monthly (partner bank rate)
  const interestEarned = totalSaved * interestRate;
  const totalWithInterest = totalSaved + interestEarned;
  const memberShare = totalWithInterest / memberCount;

  // If auto bulk order enabled, 80% goes to VleisKraft™ bulk order
  const bulkOrderValue = g.auto_bulk_order ? totalWithInterest * 0.8 : 0;
  const cashPayout = totalWithInterest - bulkOrderValue;

  return {
    group_id: groupId,
    payout_amount: parseFloat(cashPayout.toFixed(2)),
    member_share: parseFloat((memberShare * (g.auto_bulk_order ? 0.2 : 1)).toFixed(2)),
    bulk_order_value: parseFloat(bulkOrderValue.toFixed(2)),
    savings_interest_earned: parseFloat(interestEarned.toFixed(2)),
    payout_date: new Date().toISOString().split("T")[0],
  };
}

/**
 * Generate AI stockvel savings advice
 */
export async function getStockvelAdvice(groupId: string): Promise<string> {
  const payout = await calculateStockvelPayout(groupId).catch(() => null);
  if (!payout) return "Laai jou groep tans op vir persoonlike raad.";

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 300,
    messages: [{
      role: "user",
      content: `SA stockvel group has saved R${payout.payout_amount + payout.bulk_order_value}. 
      Auto bulk order value: R${payout.bulk_order_value}. Earned R${payout.savings_interest_earned} interest.
      Give practical advice in Afrikaans and English for maximising their meat buying power. Under 150 words.`
    }]
  });

  return (response.content[0] as any).text;
}
