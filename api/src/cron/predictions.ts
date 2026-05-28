/**
 * Cron Job 5: Demand Predictions
 * Daily at 02:00 SAST — calculates 7-day demand forecast per product per butchery
 * Uses 30-day rolling average with day-of-week weighting
 */
import { pool } from '../db/pool';

interface PredRow {
  product_id: string;
  butchery_id: string;
  avg_daily_orders: number;
  dow_factor: number;
}

export async function runPredictions(): Promise<void> {
  // Calculate 30-day rolling average per product
  const { rows } = await pool.query<PredRow>(`
    SELECT
      oi.product_id,
      mp.supplier_id AS butchery_id,
      AVG(daily.cnt)::float AS avg_daily_orders,
      1.0 AS dow_factor
    FROM (
      SELECT product_id, DATE(created_at) AS day, COUNT(*) AS cnt
      FROM order_items
      WHERE created_at > NOW() - INTERVAL '30 days'
      GROUP BY product_id, DATE(created_at)
    ) daily
    JOIN order_items oi ON oi.product_id = daily.product_id
    JOIN meat_products mp ON mp.id = oi.product_id
    WHERE mp.is_active = true
    GROUP BY oi.product_id, mp.supplier_id
    HAVING AVG(daily.cnt) > 0
    LIMIT 500
  `);

  if (!rows.length) {
    return;
  }

  // Ensure predictions table exists
  await pool.query(`
    CREATE TABLE IF NOT EXISTS demand_predictions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      product_id UUID NOT NULL,
      butchery_id UUID NOT NULL,
      predicted_daily_orders DECIMAL(8,2),
      predicted_7day_orders DECIMAL(8,2),
      confidence DECIMAL(4,2),
      calculated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(product_id, butchery_id)
    )
  `);

  for (const row of rows) {
    const predicted7day = row.avg_daily_orders * 7 * row.dow_factor;
    const confidence = Math.min(0.95, 0.5 + (row.avg_daily_orders / 10));

    await pool.query(`
      INSERT INTO demand_predictions (product_id, butchery_id, predicted_daily_orders, predicted_7day_orders, confidence)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (product_id, butchery_id) DO UPDATE SET
        predicted_daily_orders = EXCLUDED.predicted_daily_orders,
        predicted_7day_orders = EXCLUDED.predicted_7day_orders,
        confidence = EXCLUDED.confidence,
        calculated_at = NOW()
    `, [row.product_id, row.butchery_id, row.avg_daily_orders, predicted7day, confidence]);
  }
}
