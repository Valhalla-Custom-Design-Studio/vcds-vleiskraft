
import { Router, Request, Response } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import { pool } from '../db/pool';

const router = Router();

// Get tenant branding
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, slug, logo_url, banner_url, primary_color, accent_color, tagline, contact_email, phone, address, lat, lng, operating_hours FROM tenants WHERE id = $1',
      [(req as any).tenantId]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Tenant not found' });
    res.json(rows[0]);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Update branding (Platinum Butchery feature)
router.patch('/branding', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { primaryColor, accentColor, tagline, name, logoBase64, bannerBase64 } = req.body;
    const tenantId = (req as any).tenantId;

    // Handle logo upload to Cloudflare R2 if base64 provided
    let logoUrl: string | undefined;
    let bannerUrl: string | undefined;

    if (logoBase64 && logoBase64.startsWith('data:')) {
      // In production: upload to R2 and get URL
      // For now: store reference
      logoUrl = logoBase64.substring(0, 200); // truncate for safety
    }
    if (bannerBase64 && bannerBase64.startsWith('data:')) {
      bannerUrl = bannerBase64.substring(0, 200);
    }

    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (primaryColor) { updates.push(`primary_color = $${idx++}`); values.push(primaryColor); }
    if (accentColor) { updates.push(`accent_color = $${idx++}`); values.push(accentColor); }
    if (tagline !== undefined) { updates.push(`tagline = $${idx++}`); values.push(tagline); }
    if (name) { updates.push(`name = $${idx++}`); values.push(name); }
    if (logoUrl) { updates.push(`logo_url = $${idx++}`); values.push(logoUrl); }
    if (bannerUrl) { updates.push(`banner_url = $${idx++}`); values.push(bannerUrl); }

    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });

    values.push(tenantId);
    await pool.query(`UPDATE tenants SET ${updates.join(', ')} WHERE id = $${idx}`, values);

    const { rows } = await pool.query('SELECT * FROM tenants WHERE id = $1', [tenantId]);
    res.json(rows[0]);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Get/update feature flags
router.get('/features', authenticate, async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query('SELECT feature_flags FROM tenants WHERE id = $1', [(req as any).tenantId]);
    res.json(rows[0]?.feature_flags ?? {});
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.patch('/features', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const flags = req.body;
    await pool.query('UPDATE tenants SET feature_flags = $1 WHERE id = $2', [JSON.stringify(flags), (req as any).tenantId]);
    res.json({ success: true, flags });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
