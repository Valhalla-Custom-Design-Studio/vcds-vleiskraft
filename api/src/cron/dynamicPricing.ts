/**
 * Cron Job 4: Dynamic Pricing Engine
 * Every 6 hours — adjusts Platinum butchery product prices based on demand + stock
 */
import { pool } from '../db/pool';

interface PricingRow {
  product_id: string;
  name: string;
  current_price: number;
  stock_qty: number;
  orders_last_6h: number;
  butchery_id: string;
}

export async function runDynamicPricing(): Promise<void> {
  // Only Platinum butcheries
  const { rows } = await pool.query<PricingRow>(`
    SELECT
      mp.id AS product_id,
      mp.name,
      mp.price_per_kg AS current_price,
      mp.stock_qty,
      COUNT(oi.id)::int AS orders_last_6h,
      b.id AS butchery_id
    FROM meat_products mp
    JOIN butcheries b ON b.id = mp.supplier_id
    LEFT JOIN order_items oi ON oi.product_id = mp.id
      AND oi.created_at > NOW() - INTERVAL '6 hours'
    WHERE b.tier = 'platinum' AND mp.is_active = true
    GROUP BY mp.id, b.id
  `);

  if (!rows.length) return;

  let updated = 0;
  for (const row of rows) {
    let newPrice = row.current_price;

    // High demand + low stock → increase up to 15%
    if (row.orders_last_6h > 10 && row.stock_qty < 5) {
      newPrice = Math.min(row.current_price * 1.15, row.current_price * 1.15);
    }
    // Low demand + high stock → discount up to 10%
    else if (row.orders_last_6h === 0 && row.stock_qty > 50) {
      newPrice = Math.max(row.current_price * 0.90, row.current_price * 0.90);
    }

    if (Math.abs(newPrice - row.current_price) > 0.01) {
      await pool.query(
        'UPDATE meat_products SET price_per_kg = $1, updated_at = NOW() WHERE id = $2',
        [Math.round(newPrice * 100) / 100, row.product_id]
      );
      updated++;
    }
  }

  console.log(`[DynamicPricing] Updated ${updated} product prices`);
}
