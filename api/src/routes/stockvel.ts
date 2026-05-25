import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth";
import { pool } from "../db/pool";

const router = Router();

router.get("/groups", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { rows } = await pool.query(
      `SELECT sg.*, COUNT(sm.user_id)::int as member_count,
        COALESCE(SUM(sc.amount),0)::float as total_saved
       FROM stockvel_groups sg
       LEFT JOIN stockvel_members sm ON sm.group_id = sg.id
       LEFT JOIN stockvel_contributions sc ON sc.group_id = sg.id
       WHERE sg.id IN (SELECT group_id FROM stockvel_members WHERE user_id=$1)
       GROUP BY sg.id ORDER BY sg.created_at DESC`,
      [userId]
    );
    res.json(rows);
  } catch { res.status(500).json({ error: "Failed to fetch stockvel groups" }); }
});

router.post("/groups", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { name, target_amount, monthly_contribution, payout_month } = req.body;
    await pool.query(
      `CREATE TABLE IF NOT EXISTS stockvel_groups (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(100) NOT NULL, created_by UUID REFERENCES users(id),
        target_amount DECIMAL(10,2), monthly_contribution DECIMAL(10,2),
        payout_month INTEGER, status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT NOW())`,
    );
    await pool.query(
      `CREATE TABLE IF NOT EXISTS stockvel_members (
        group_id UUID REFERENCES stockvel_groups(id),
        user_id UUID REFERENCES users(id),
        joined_at TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY(group_id,user_id))`,
    );
    await pool.query(
      `CREATE TABLE IF NOT EXISTS stockvel_contributions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        group_id UUID REFERENCES stockvel_groups(id),
        user_id UUID REFERENCES users(id),
        amount DECIMAL(10,2), paid_at TIMESTAMPTZ DEFAULT NOW())`,
    );
    const { rows } = await pool.query(
      `INSERT INTO stockvel_groups (name,created_by,target_amount,monthly_contribution,payout_month)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [name, userId, target_amount, monthly_contribution, payout_month]
    );
    await pool.query(
      `INSERT INTO stockvel_members (group_id,user_id) VALUES ($1,$2)`,
      [rows[0].id, userId]
    );
    res.status(201).json(rows[0]);
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.post("/groups/:id/contribute", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { amount } = req.body;
    await pool.query(
      `INSERT INTO stockvel_contributions (group_id,user_id,amount) VALUES ($1,$2,$3)`,
      [req.params.id, userId, amount]
    );
    res.json({ success: true });
  } catch { res.status(500).json({ error: "Contribution failed" }); }
});

export default router;
