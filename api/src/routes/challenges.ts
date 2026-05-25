import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth";
import { pool } from "../db/pool";

const router = Router();

// Ensure table exists
async function ensureChallengesTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS challenges (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title VARCHAR(200) NOT NULL,
      description TEXT,
      prize VARCHAR(200),
      ends_at TIMESTAMP,
      category VARCHAR(50) DEFAULT 'braai',
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  // Seed initial challenges if empty
  const check = await pool.query("SELECT COUNT(*) FROM challenges");
  if (parseInt(check.rows[0].count) === 0) {
    await pool.query(`INSERT INTO challenges (title, description, prize, ends_at, category) VALUES
      ('Beste Braai Foto™', 'Deel jou beste braai foto en wen!', 'R500 VleisKraft™ voucher', NOW() + INTERVAL '30 days', 'braai'),
      ('Boerewors Meester', 'Maak die beste tuisgemaakte boerewors.', 'Gratis vleis vir 1 maand', NOW() + INTERVAL '45 days', 'boerewors'),
      ('Braai Meester', 'Wys jou braai vaardighede!', 'Platinum VleisKraft™ lid vir 6 maande', NOW() + INTERVAL '60 days', 'braai')
    `);
  }
}

// GET /api/challenges
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    await ensureChallengesTable();
    const { rows } = await pool.query(
      "SELECT * FROM challenges WHERE is_active=true AND ends_at > NOW() ORDER BY ends_at ASC"
    );
    res.json({ success: true, challenges: rows });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch challenges", details: error.message });
  }
});

// POST /api/challenges/:id/enter
router.post("/:id/enter", requireAuth, async (req: Request, res: Response) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS challenge_entries (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        challenge_id UUID REFERENCES challenges(id),
        user_id UUID,
        entry_data JSONB,
        entered_at TIMESTAMP DEFAULT NOW()
      )
    `);
    const userId = (req as any).user.id;
    await pool.query(
      "INSERT INTO challenge_entries (challenge_id, user_id, entry_data) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING",
      [req.params.id, userId, req.body]
    );
    res.json({ success: true, message: "Challenge entry submitted!" });
  } catch (error: any) {
    res.status(500).json({ error: "Entry failed", details: error.message });
  }
});

export default router;
