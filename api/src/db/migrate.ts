import { pool } from './pool';
import fs from 'fs';
import path from 'path';

export async function runMigrations() {
  const client = await pool.connect();
  try {
    // 1. Apply schema (idempotent CREATE TABLE IF NOT EXISTS)
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await client.query(schema);

    // 2. Apply bilingual seed (ON CONFLICT DO UPDATE — always up to date)
    const seed = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
    await client.query(seed);
} catch (err) {
    console.error('Migration error:', err);
    throw err;
  } finally {
    client.release();
  }
}
