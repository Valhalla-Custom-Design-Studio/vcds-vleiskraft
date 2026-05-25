import { logOrderEvent } from "../services/datamoat";
import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import { pool } from "../db/pool";

const router = Router();

router.get("/", authenticate, async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query("SELECT * FROM orders WHERE user_id=$1 ORDER BY created_at DESC", [(req as any).user.id]);
    res.json(rows);
  } catch { res.status(500).json({ error: "Failed to fetch orders" }); }
});

router.post("/", authenticate, async (req: Request, res: Response) => {
  try {
    const { items, total } = req.body;
    const { rows } = await pool.query(
      "INSERT INTO orders (user_id, items, total, status) VALUES ($1,$2,$3,'pending') RETURNING *",
      [(req as any).user.id, JSON.stringify(items), total]
    );
    res.status(201).json(rows[0]);
  } catch { res.status(500).json({ error: "Failed to create order" }); }
});

router.patch("/:id/status", authenticate, async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const { rows } = await pool.query(
      "UPDATE orders SET status=$1,updated_at=NOW() WHERE id=$2 AND user_id=$3 RETURNING *",
      [status, req.params.id, (req as any).user.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch { res.status(500).json({ error: "Failed to update order" }); }
});

export default router;
