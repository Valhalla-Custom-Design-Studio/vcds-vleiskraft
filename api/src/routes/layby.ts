import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth";
import { pool } from "../db/pool";

const router = Router();

router.get("/my", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    await pool.query(`CREATE TABLE IF NOT EXISTS layby_plans (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id),
      product_name VARCHAR(200),
      total_price DECIMAL(10,2),
      amount_paid DECIMAL(10,2) DEFAULT 0,
      installments INTEGER DEFAULT 3,
      next_due TIMESTAMPTZ,
      status VARCHAR(20) DEFAULT 'active',
      created_at TIMESTAMPTZ DEFAULT NOW())`);
    const { rows } = await pool.query(
      `SELECT * FROM layby_plans WHERE user_id=$1 ORDER BY created_at DESC`, [userId]
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { product_name, total_price, installments } = req.body;
    const next_due = new Date(); next_due.setMonth(next_due.getMonth() + 1);
    const { rows } = await pool.query(
      `INSERT INTO layby_plans (user_id,product_name,total_price,installments,next_due)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [userId, product_name, total_price, installments || 3, next_due]
    );
    res.status(201).json(rows[0]);
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.post("/:id/pay", requireAuth, async (req: Request, res: Response) => {
  try {
    const { amount } = req.body;
    const { rows } = await pool.query(
      `UPDATE layby_plans SET amount_paid = amount_paid + $1,
        next_due = next_due + INTERVAL '1 month',
        status = CASE WHEN amount_paid + $1 >= total_price THEN 'completed' ELSE status END
       WHERE id=$2 AND user_id=$3 RETURNING *`,
      [amount, req.params.id, (req as any).user.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

export default router;
