import { Router, Request, Response } from 'express';
import { pool } from '../db/pool';
import { requireAuth } from '../middleware/auth';

const router = Router();

/**
 * GET /api/butcheries
 * List butcheries  -  optionally filtered by province or city
 * Used during signup and profile update
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { province, city, search } = req.query as Record<string, string>;
    let query = `
      SELECT id, name, slug, province, city, address, phone, whatsapp,
             logo_url, is_verified, tier, primary_color, secondary_color
      FROM butcheries
      WHERE is_active = true
    `;
    const params: string[] = [];
    let idx = 1;

    if (province) {
      query += ` AND province ILIKE $${idx++}`;
      params.push(`%${province}%`);
    }
    if (city) {
      query += ` AND city ILIKE $${idx++}`;
      params.push(`%${city}%`);
    }
    if (search) {
      query += ` AND (name ILIKE $${idx} OR city ILIKE $${idx} OR province ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }
    query += ' ORDER BY is_verified DESC, name ASC LIMIT 100';

    const result = await pool.query(query, params);
    res.json({ success: true, butcheries: result.rows });
  } catch (err) {
    console.error('[Butcheries] List error:', err);
    res.status(500).json({ success: false, message: 'Failed to load butcheries' });
  }
});

/**
 * GET /api/butcheries/provinces
 * List all provinces that have active butcheries
 */
router.get('/provinces', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT province FROM butcheries WHERE is_active = true ORDER BY province ASC`
    );
    res.json({ success: true, provinces: result.rows.map((r: { province: string }) => r.province) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load provinces' });
  }
});

/**
 * GET /api/butcheries/:id
 * Get single butchery detail
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, name, slug, province, city, address, phone, whatsapp, email,
              logo_url, banner_url, is_verified, tier, primary_color, secondary_color
       FROM butcheries WHERE id = $1 AND is_active = true`,
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Butchery not found' });
    res.json({ success: true, butchery: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load butchery' });
  }
});

/**
 * PATCH /api/butcheries/me/assign
 * Assign or change butchery on user profile (auth required)
 * butcheryId can be null to unassign
 */
router.patch('/me/assign', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { butcheryId } = req.body;

    if (butcheryId) {
      // Verify butchery exists
      const check = await pool.query('SELECT id FROM butcheries WHERE id = $1 AND is_active = true', [butcheryId]);
      if (!check.rows.length) return res.status(404).json({ success: false, message: 'Butchery not found' });
    }

    await pool.query(
      'UPDATE users SET butchery_id = $1, updated_at = NOW() WHERE id = $2',
      [butcheryId || null, userId]
    );

    res.json({ success: true, message: butcheryId ? 'Butchery assigned' : 'Butchery removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update butchery' });
  }
});

export default router;
