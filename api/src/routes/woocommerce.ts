
import { Router, Request, Response } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import { pool } from '../db/pool';
import axios from 'axios';

const router = Router();

// Save WooCommerce credentials
router.post('/credentials', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { url, consumerKey, consumerSecret } = req.body;
    if (!url || !consumerKey || !consumerSecret) return res.status(400).json({ error: 'All fields required' });

    // Test connection first
    const testUrl = `${url.replace(/\/$/, '')}/wp-json/wc/v3/products?per_page=1`;
    await axios.get(testUrl, { auth: { username: consumerKey, password: consumerSecret } });

    // Save to tenant
    await pool.query(
      'UPDATE tenants SET woocommerce_url = $1, woo_key = $2, woo_secret = $3 WHERE id = $4',
      [url, consumerKey, consumerSecret, (req as any).tenantId]
    );

    res.json({ success: true, message: 'WooCommerce connected' });
  } catch (e: any) {
    res.status(400).json({ error: 'Connection failed: ' + (e.message ?? 'Invalid credentials') });
  }
});

// Get connection status
router.get('/status', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query('SELECT woocommerce_url, woo_key, woo_secret FROM tenants WHERE id = $1', [(req as any).tenantId]);
    const tenant = rows[0];
    if (!tenant?.woocommerce_url || !tenant?.woo_key) return res.json({ connected: false });

    const baseUrl = tenant.woocommerce_url.replace(/\/$/, '');
    const auth = { username: tenant.woo_key, password: tenant.woo_secret };

    const [products, customers, orders] = await Promise.allSettled([
      axios.get(`${baseUrl}/wp-json/wc/v3/products/count`, { auth }),
      axios.get(`${baseUrl}/wp-json/wc/v3/customers/count`, { auth }),
      axios.get(`${baseUrl}/wp-json/wc/v3/orders/count`, { auth }),
    ]);

    res.json({
      connected: true,
      url: tenant.woocommerce_url,
      productCount: products.status === 'fulfilled' ? products.value.data : 0,
      customerCount: customers.status === 'fulfilled' ? customers.value.data : 0,
      orderCount: orders.status === 'fulfilled' ? orders.value.data : 0,
    });
  } catch {
    res.json({ connected: false });
  }
});

// Import products — REPLACES existing products, prices, categories, images
router.post('/import/products', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query('SELECT woocommerce_url, woo_key, woo_secret FROM tenants WHERE id = $1', [(req as any).tenantId]);
    const tenant = rows[0];
    if (!tenant?.woocommerce_url) return res.status(400).json({ error: 'WooCommerce not connected' });

    const baseUrl = tenant.woocommerce_url.replace(/\/$/, '');
    const auth = { username: tenant.woo_key, password: tenant.woo_secret };
    const tenantId = (req as any).tenantId;

    let page = 1;
    let imported = 0;
    let skipped = 0;
    const categoryMap: Record<number, string> = {};

    // Import categories first
    const catRes = await axios.get(`${baseUrl}/wp-json/wc/v3/products/categories?per_page=100`, { auth });
    for (const cat of catRes.data) {
      const existing = await pool.query('SELECT id FROM categories WHERE tenant_id = $1 AND slug = $2', [tenantId, cat.slug]);
      if (existing.rows.length > 0) {
        await pool.query('UPDATE categories SET name_en = $1, name_af = $2 WHERE id = $3', [cat.name, cat.name, existing.rows[0].id]);
        categoryMap[cat.id] = existing.rows[0].id;
      } else {
        const ins = await pool.query(
          'INSERT INTO categories (tenant_id, name_en, name_af, slug, sort_order) VALUES ($1,$2,$3,$4,$5) RETURNING id',
          [tenantId, cat.name, cat.name, cat.slug, cat.menu_order]
        );
        categoryMap[cat.id] = ins.rows[0].id;
      }
    }

    // Import products page by page
    while (true) {
      const res2 = await axios.get(`${baseUrl}/wp-json/wc/v3/products?per_page=100&page=${page}&status=publish`, { auth });
      if (!res2.data.length) break;

      for (const p of res2.data) {
        try {
          const catId = p.categories?.[0]?.id ? categoryMap[p.categories[0].id] : null;
          const imageUrl = p.images?.[0]?.src ?? null;
          const price = parseFloat(p.price || p.regular_price || '0');
          const salePrice = p.sale_price ? parseFloat(p.sale_price) : null;

          const existing = await pool.query('SELECT id FROM products WHERE tenant_id = $1 AND (name_en = $2 OR id::text = $3)', [tenantId, p.name, p.id?.toString()]);
          if (existing.rows.length > 0) {
            await pool.query(
              'UPDATE products SET name_en=$1, name_af=$2, price=$3, special_price=$4, image_url=$5, category_id=$6, in_stock=$7, description_en=$8, description_af=$9 WHERE id=$10',
              [p.name, p.name, price, salePrice, imageUrl, catId, p.stock_status === 'instock', p.short_description ?? p.description ?? '', p.short_description ?? p.description ?? '', existing.rows[0].id]
            );
          } else {
            await pool.query(
              'INSERT INTO products (tenant_id, category_id, name_en, name_af, price, special_price, image_url, in_stock, description_en, description_af, unit) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',
              [tenantId, catId, p.name, p.name, price, salePrice, imageUrl, p.stock_status === 'instock', p.short_description ?? '', p.short_description ?? '', 'kg']
            );
          }
          imported++;
        } catch { skipped++; }
      }
      page++;
    }

    res.json({ success: true, imported, skipped, message: `${imported} products imported. Products, prices, categories and images replaced.` });
  } catch (e: any) {
    res.status(500).json({ error: e.message ?? 'Import failed' });
  }
});

// Import customers
router.post('/import/customers', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query('SELECT woocommerce_url, woo_key, woo_secret FROM tenants WHERE id = $1', [(req as any).tenantId]);
    const tenant = rows[0];
    if (!tenant?.woocommerce_url) return res.status(400).json({ error: 'WooCommerce not connected' });

    const baseUrl = tenant.woocommerce_url.replace(/\/$/, '');
    const auth = { username: tenant.woo_key, password: tenant.woo_secret };
    const tenantId = (req as any).tenantId;

    let page = 1, imported = 0, skipped = 0;
    while (true) {
      const r = await axios.get(`${baseUrl}/wp-json/wc/v3/customers?per_page=100&page=${page}`, { auth });
      if (!r.data.length) break;
      for (const c of r.data) {
        try {
          const existing = await pool.query('SELECT id FROM users WHERE email = $1', [c.email]);
          if (!existing.rows.length) {
            await pool.query(
              'INSERT INTO users (tenant_id, first_name, last_name, email, phone, role, language) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (email) DO NOTHING',
              [tenantId, c.first_name || 'Customer', c.last_name || '', c.email, c.billing?.phone ?? '', 'CUSTOMER', 'en']
            );
            imported++;
          } else { skipped++; }
        } catch { skipped++; }
      }
      page++;
    }
    res.json({ success: true, imported, skipped });
  } catch (e: any) {
    res.status(500).json({ error: e.message ?? 'Import failed' });
  }
});

// Import orders
router.post('/import/orders', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query('SELECT woocommerce_url, woo_key, woo_secret FROM tenants WHERE id = $1', [(req as any).tenantId]);
    const tenant = rows[0];
    if (!tenant?.woocommerce_url) return res.status(400).json({ error: 'WooCommerce not connected' });

    const baseUrl = tenant.woocommerce_url.replace(/\/$/, '');
    const auth = { username: tenant.woo_key, password: tenant.woo_secret };
    const tenantId = (req as any).tenantId;

    let page = 1, imported = 0, skipped = 0;
    while (true) {
      const r = await axios.get(`${baseUrl}/wp-json/wc/v3/orders?per_page=100&page=${page}`, { auth });
      if (!r.data.length) break;
      for (const o of r.data) {
        try {
          const userRes = await pool.query('SELECT id FROM users WHERE email = $1', [o.billing?.email]);
          const userId = userRes.rows[0]?.id;
          if (!userId) { skipped++; continue; }
          await pool.query(
            'INSERT INTO orders (tenant_id, user_id, status, total_amount, delivery_type, delivery_address, payment_status, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT DO NOTHING',
            [tenantId, userId, 'DELIVERED', parseFloat(o.total), o.shipping_lines?.length ? 'DELIVERY' : 'COLLECTION', o.shipping?.address_1 ?? '', 'PAID', o.date_created]
          );
          imported++;
        } catch { skipped++; }
      }
      page++;
    }
    res.json({ success: true, imported, skipped });
  } catch (e: any) {
    res.status(500).json({ error: e.message ?? 'Import failed' });
  }
});

export default router;
