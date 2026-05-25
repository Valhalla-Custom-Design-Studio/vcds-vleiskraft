import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth";
import { pool } from "../db/pool";

const router = Router();

// GET /api/stockvel/groups — my groups
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
    res.json({ success: true, groups: rows });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// POST /api/stockvel/groups — create group
router.post("/groups", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { name, target_amount, monthly_contribution, payout_month } = req.body;
    if (!name) return res.status(400).json({ error: "name required" });
    const { rows } = await pool.query(
      `INSERT INTO stockvel_groups (name,created_by,target_amount,monthly_contribution,payout_month)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [name, userId, target_amount, monthly_contribution, payout_month]
    );
    await pool.query(`INSERT INTO stockvel_members (group_id,user_id) VALUES ($1,$2)`, [rows[0].id, userId]);
    res.status(201).json({ success: true, group: rows[0] });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// POST /api/stockvel/groups/:id/join
router.post("/groups/:id/join", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    await pool.query(
      `INSERT INTO stockvel_members (group_id,user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
      [req.params.id, userId]
    );
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// POST /api/stockvel/groups/:id/contribute
router.post("/groups/:id/contribute", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { amount, payment_method, payfast_token } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: "amount required" });
    const { rows } = await pool.query(
      `INSERT INTO stockvel_contributions (group_id,user_id,amount,payment_method,payfast_token)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [req.params.id, userId, amount, payment_method || "payfast", payfast_token]
    );
    res.status(201).json({ success: true, contribution: rows[0] });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// GET /api/stockvel/groups/:id/contributions
router.get("/groups/:id/contributions", requireAuth, async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      `SELECT sc.*, u.first_name, u.last_name FROM stockvel_contributions sc
       LEFT JOIN users u ON u.id = sc.user_id
       WHERE sc.group_id=$1 ORDER BY sc.paid_at DESC`,
      [req.params.id]
    );
    res.json({ success: true, contributions: rows });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
