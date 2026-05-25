import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth";
import { pool } from "../db/pool";

const router = Router();

// GET /api/challenges
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      `SELECT c.*, COUNT(ce.id)::int as entry_count
       FROM challenges c
       LEFT JOIN challenge_entries ce ON ce.challenge_id = c.id
       WHERE c.is_active=true AND (c.ends_at IS NULL OR c.ends_at > NOW())
       GROUP BY c.id ORDER BY c.ends_at ASC`
    );
    res.json({ success: true, challenges: rows });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// POST /api/challenges/:id/enter
router.post("/:id/enter", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { entry_data, photo_url } = req.body;
    // Check challenge exists and is active
    const { rows: ch } = await pool.query(
      `SELECT id FROM challenges WHERE id=$1 AND is_active=true AND (ends_at IS NULL OR ends_at > NOW())`,
      [req.params.id]
    );
    if (!ch.length) return res.status(404).json({ error: "Challenge not found or expired" });
    const { rows } = await pool.query(
      `INSERT INTO challenge_entries (challenge_id,user_id,entry_data,photo_url)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT DO NOTHING RETURNING *`,
      [req.params.id, userId, JSON.stringify(entry_data || {}), photo_url]
    );
    res.status(201).json({ success: true, entry: rows[0] || { message: "Already entered" } });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// GET /api/challenges/:id/entries — leaderboard
router.get("/:id/entries", requireAuth, async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      `SELECT ce.*, u.first_name, u.last_name FROM challenge_entries ce
       LEFT JOIN users u ON u.id = ce.user_id
       WHERE ce.challenge_id=$1 ORDER BY ce.votes DESC, ce.entered_at ASC LIMIT 50`,
      [req.params.id]
    );
    res.json({ success: true, entries: rows });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
