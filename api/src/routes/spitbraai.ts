import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth";
import { pool } from "../db/pool";

const router = Router();

// GET /api/spitbraai/bookings
router.get("/bookings", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { rows } = await pool.query(
      `SELECT sb.*, b.name as butchery_name FROM spitbraai_bookings sb
       LEFT JOIN butcheries b ON b.id = sb.butchery_id
       WHERE sb.user_id=$1 ORDER BY sb.event_date DESC`,
      [userId]
    );
    res.json({ success: true, bookings: rows });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// POST /api/spitbraai/bookings
router.post("/bookings", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { event_date, guest_count, meat_packages, notes, butchery_id } = req.body;
    if (!event_date || !guest_count) return res.status(400).json({ error: "event_date and guest_count required" });
    const total_price = (guest_count || 0) * 85; // R85/person base
    const { rows } = await pool.query(
      `INSERT INTO spitbraai_bookings (user_id,butchery_id,event_date,guest_count,meat_packages,total_price,notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [userId, butchery_id, event_date, guest_count, JSON.stringify(meat_packages || []), total_price, notes]
    );
    res.status(201).json({ success: true, booking: rows[0] });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// PATCH /api/spitbraai/bookings/:id — update status
router.patch("/bookings/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { status, notes } = req.body;
    const { rows } = await pool.query(
      `UPDATE spitbraai_bookings SET status=COALESCE($1,status), notes=COALESCE($2,notes), updated_at=NOW()
       WHERE id=$3 AND user_id=$4 RETURNING *`,
      [status, notes, req.params.id, userId]
    );
    if (!rows.length) return res.status(404).json({ error: "Booking not found" });
    res.json({ success: true, booking: rows[0] });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
