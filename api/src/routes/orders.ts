
import { Router, Request, Response } from 'express';
import { pool } from '../db/pool';
import { authenticate } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const uid = (req as any).user.id;
    const result = await pool.query(`
      SELECT o.*, 
        json_agg(json_build_object('product_id',oi.product_id,'quantity',oi.quantity,'unit_price',oi.unit_price,'total_price',oi.total_price,'name',mp.name)) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id=oi.order_id
      LEFT JOIN meat_products mp ON oi.product_id=mp.id
      WHERE o.buyer_id=$1
      GROUP BY o.id ORDER BY o.created_at DESC
    `, [uid]);
    res.json({ success: true, orders: result.rows });
  } catch { res.status(500).json({ error: 'Failed' }); }
});

router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const uid = (req as any).user.id;
    const { items, delivery_address, delivery_date, notes } = req.body;
    if (!items?.length) return res.status(400).json({ error: 'items required' });

    let total = 0;
    const orderId = uuidv4();

    // Calculate total
    for (const item of items) {
      const product = await pool.query('SELECT price_per_kg, price_unit FROM meat_products WHERE id=$1', [item.product_id]);
      if (!product.rows.length) return res.status(404).json({ error: `Product ${item.product_id} not found` });
      const price = product.rows[0].price_unit || (product.rows[0].price_per_kg * item.quantity);
      total += price * (product.rows[0].price_unit ? item.quantity : 1);
    }

    const order = await pool.query(
      `INSERT INTO orders (id,buyer_id,total_zar,delivery_address,delivery_date,notes) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [orderId, uid, total, delivery_address, delivery_date, notes]
    );

    for (const item of items) {
      const product = await pool.query('SELECT price_per_kg, price_unit FROM meat_products WHERE id=$1', [item.product_id]);
      const unitPrice = product.rows[0].price_unit || product.rows[0].price_per_kg;
      const itemTotal = unitPrice * item.quantity;
      await pool.query(
        `INSERT INTO order_items (id,order_id,product_id,quantity,unit_price,total_price) VALUES ($1,$2,$3,$4,$5,$6)`,
        [uuidv4(), orderId, item.product_id, item.quantity, unitPrice, itemTotal]
      );
    }

    res.status(201).json({ success: true, order: order.rows[0] });
  } catch { res.status(500).json({ error: 'Order creation failed' }); }
});

router.put('/:id/status', authenticate, async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const result = await pool.query('UPDATE orders SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *', [status, req.params.id]);
    res.json({ success: true, order: result.rows[0] });
  } catch { res.status(500).json({ error: 'Failed' }); }
});

export default router;
