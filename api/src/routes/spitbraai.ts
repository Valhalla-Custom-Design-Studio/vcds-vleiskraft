import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth";
import { pool } from "../db/pool";

const router = Router();

router.get("/bookings", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    await pool.query(`CREATE TABLE IF NOT EXISTS spitbraai_bookings (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id),
      event_date DATE NOT NULL,
      guest_count INTEGER,
      meat_packages JSONB DEFAULT '[]',
      total_price DECIMAL(10,2),
      status VARCHAR(20) DEFAULT 'PENDING',
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW())`);
    const { rows } = await pool.query(
      `SELECT * FROM spitbraai_bookings WHERE user_id=$1 ORDER BY event_date DESC`, [userId]
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.post("/bookings", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { event_date, guest_count, meat_packages, notes } = req.body;
    const total_price = (guest_count || 0) * 85; // R85/person base
    const { rows } = await pool.query(
      `INSERT INTO spitbraai_bookings (user_id,event_date,guest_count,meat_packages,total_price,notes)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [userId, event_date, guest_count, JSON.stringify(meat_packages || []), total_price, notes]
    );
    res.status(201).json(rows[0]);
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

export default router;
