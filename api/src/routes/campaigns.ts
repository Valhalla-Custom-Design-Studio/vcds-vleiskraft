import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth";
import { pool } from "../db/pool";

const router = Router();

// GET /api/campaigns — active campaigns for user's butchery
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const butcheryId = (req as any).user.butchery_id;
    let q = `SELECT * FROM campaigns WHERE is_active=true AND (ends_at IS NULL OR ends_at > NOW())`;
    const params: any[] = [];
    if (butcheryId) { q += ` AND butchery_id=$1`; params.push(butcheryId); }
    q += ` ORDER BY starts_at DESC LIMIT 50`;
    const { rows } = await pool.query(q, params);
    res.json({ success: true, campaigns: rows });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// POST /api/campaigns — create campaign (butchery admin)
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const butcheryId = (req as any).user.butchery_id;
    if (!butcheryId) return res.status(403).json({ error: "Butchery account required" });
    const { title, title_af, description, discount_pct, discount_amount_zar, applies_to, starts_at, ends_at } = req.body;
    if (!title) return res.status(400).json({ error: "title required" });
    const { rows } = await pool.query(
      `INSERT INTO campaigns (butchery_id,title,title_af,description,discount_pct,discount_amount_zar,applies_to,starts_at,ends_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [butcheryId, title, title_af, description, discount_pct || 0, discount_amount_zar || 0,
       JSON.stringify(applies_to || []), starts_at, ends_at]
    );
    res.status(201).json({ success: true, campaign: rows[0] });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// PATCH /api/campaigns/:id — update
router.patch("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const butcheryId = (req as any).user.butchery_id;
    const { title, title_af, description, discount_pct, discount_amount_zar, is_active, ends_at } = req.body;
    const { rows } = await pool.query(
      `UPDATE campaigns SET title=COALESCE($1,title), title_af=COALESCE($2,title_af),
        description=COALESCE($3,description), discount_pct=COALESCE($4,discount_pct),
        discount_amount_zar=COALESCE($5,discount_amount_zar),
        is_active=COALESCE($6,is_active), ends_at=COALESCE($7,ends_at)
       WHERE id=$8 AND butchery_id=$9 RETURNING *`,
      [title, title_af, description, discount_pct, discount_amount_zar, is_active, ends_at, req.params.id, butcheryId]
    );
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json({ success: true, campaign: rows[0] });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/campaigns/:id
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const butcheryId = (req as any).user.butchery_id;
    await pool.query(`UPDATE campaigns SET is_active=false WHERE id=$1 AND butchery_id=$2`, [req.params.id, butcheryId]);
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
