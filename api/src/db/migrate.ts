import { pool } from './pool';
import fs from 'fs';
import path from 'path';

export async function runMigrations() {
  const client = await pool.connect();
  try {
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await client.query(schema);

    // Seed plans
    await client.query(`
      INSERT INTO plans (name, tier_name, price_zar, description, features) VALUES
        ('Free', 'free', 0, 'Basic access', '["Browse catalogue","Basic orders","1 trace/month"]'),
        ('Pro', 'pro', 199, 'Full platform access', '["Unlimited orders","VleisGPT","Price predictions","Meal planner","Stockvel"]'),
        ('Platinum', 'platinum', 499, 'Business tier', '["Everything in Pro","Admin branding","WooCommerce sync","IoT cold chain","Priority support"]')
      ON CONFLICT (tier_name) DO NOTHING;
    `);

    console.log('✅ VleisKraft migrations complete');
  } catch (err) {
    console.error('Migration error:', err);
    throw err;
  } finally {
    client.release();
  }
}
