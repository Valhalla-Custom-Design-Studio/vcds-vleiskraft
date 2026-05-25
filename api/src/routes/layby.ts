import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth";
import { pool } from "../db/pool";

const router = Router();

// GET /api/layby/my
router.get("/my", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { rows } = await pool.query(
      `SELECT lp.*, b.name as butchery_name FROM layby_plans lp
       LEFT JOIN butcheries b ON b.id = lp.butchery_id
       WHERE lp.user_id=$1 ORDER BY lp.created_at DESC`,
      [userId]
    );
    res.json({ success: true, plans: rows });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// POST /api/layby — create plan
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { product_name, product_id, total_price, installments, butchery_id } = req.body;
    if (!product_name || !total_price) return res.status(400).json({ error: "product_name and total_price required" });
    const next_due = new Date();
    next_due.setMonth(next_due.getMonth() + 1);
    const { rows } = await pool.query(
      `INSERT INTO layby_plans (user_id,butchery_id,product_name,product_id,total_price,installments,next_due)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [userId, butchery_id, product_name, product_id, total_price, installments || 3, next_due]
    );
    res.status(201).json({ success: true, plan: rows[0] });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// POST /api/layby/:id/pay
router.post("/:id/pay", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { amount, payment_method, payfast_token } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: "amount required" });

    // Log payment
    await pool.query(
      `INSERT INTO layby_payments (layby_plan_id,user_id,amount,payment_method,payfast_token)
       VALUES ($1,$2,$3,$4,$5)`,
      [req.params.id, userId, amount, payment_method || "payfast", payfast_token]
    );

    // Update plan
    const { rows } = await pool.query(
      `UPDATE layby_plans
       SET amount_paid = amount_paid + $1,
           next_due = next_due + INTERVAL '1 month',
           status = CASE WHEN amount_paid + $1 >= total_price THEN 'completed' ELSE status END,
           updated_at = NOW()
       WHERE id=$2 AND user_id=$3 RETURNING *`,
      [amount, req.params.id, userId]
    );
    if (!rows.length) return res.status(404).json({ error: "Plan not found" });
    res.json({ success: true, plan: rows[0] });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// GET /api/layby/:id/payments
router.get("/:id/payments", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { rows } = await pool.query(
      `SELECT lp.* FROM layby_payments lp
       JOIN layby_plans plan ON plan.id = lp.layby_plan_id
       WHERE lp.layby_plan_id=$1 AND plan.user_id=$2
       ORDER BY lp.paid_at DESC`,
      [req.params.id, userId]
    );
    res.json({ success: true, payments: rows });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
