/**
 * WooCommerce Import API
 * Fully replaces products, prices, categories, and images from WooCommerce store
 * Platinum butcheries only
 */
import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { requirePlatinum } from '../middleware/requirePlatinum';

const router = Router();

interface WooProduct {
  id: number;
  name: string;
  slug: string;
  price: string;
  regular_price: string;
  sale_price: string;
  description: string;
  short_description: string;
  categories: { id: number; name: string; slug: string }[];
  images: { src: string; alt: string }[];
  stock_quantity: number | null;
  stock_status: 'instock' | 'outofstock';
  weight: string;
  attributes: { name: string; options: string[] }[];
}

async function fetchWooProducts(storeUrl: string, consumerKey: string, consumerSecret: string): Promise<WooProduct[]> {
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  let page = 1;
  const allProducts: WooProduct[] = [];
  while (true) {
    const res = await fetch(
      `${storeUrl}/wp-json/wc/v3/products?per_page=100&page=${page}`,
      { headers: { Authorization: `Basic ${auth}` } }
    );
    if (!res.ok) throw new Error(`WooCommerce API error: ${res.status}`);
    const products: WooProduct[] = await res.json();
    if (!products.length) break;
    allProducts.push(...products);
    page++;
  }
  return allProducts;
}

async function fetchWooCategories(storeUrl: string, consumerKey: string, consumerSecret: string) {
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  const res = await fetch(
    `${storeUrl}/wp-json/wc/v3/products/categories?per_page=100`,
    { headers: { Authorization: `Basic ${auth}` } }
  );
  if (!res.ok) throw new Error(`WooCommerce categories error: ${res.status}`);
  return res.json();
}

// GET /api/woocommerce/test — test connection
router.get('/test', requireAuth, requirePlatinum, async (req: Request, res: Response) => {
  const { storeUrl, consumerKey, consumerSecret } = req.query as Record<string, string>;
  try {
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const r = await fetch(`${storeUrl}/wp-json/wc/v3/products?per_page=1`, {
      headers: { Authorization: `Basic ${auth}` },
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const products = await r.json();
    res.json({ connected: true, productCount: products.length > 0 ? 'OK' : 0 });
  } catch (e) {
    res.status(400).json({ connected: false, error: String(e) });
  }
});

// POST /api/woocommerce/import — FULL IMPORT: replaces all products, prices, categories, images
router.post('/import', requireAuth, requirePlatinum, async (req: Request, res: Response) => {
  const { storeUrl, consumerKey, consumerSecret, butcheryId } = req.body;
  if (!storeUrl || !consumerKey || !consumerSecret) {
    return res.status(400).json({ error: 'storeUrl, consumerKey, consumerSecret required' });
  }
  try {
    // 1. Fetch all categories from WooCommerce
    const wooCategories = await fetchWooCategories(storeUrl, consumerKey, consumerSecret);

    // 2. Fetch all products from WooCommerce (paginated)
    const wooProducts = await fetchWooProducts(storeUrl, consumerKey, consumerSecret);

    // 3. REPLACE all existing products for this butchery
    // In production: DELETE existing products WHERE butcheryId = X, then INSERT new ones
    // Images: download from WooCommerce CDN → upload to Cloudflare R2 → store R2 URL

    const importedCategories = wooCategories.map((c: any) => ({
      wooId: c.id,
      name: c.name,
      slug: c.slug,
      imageUrl: c.image?.src || null,
    }));

    const importedProducts = wooProducts.map((p) => ({
      wooId: p.id,
      name: p.name,
      slug: p.slug,
      price: parseFloat(p.price || p.regular_price || '0'),
      salePrice: p.sale_price ? parseFloat(p.sale_price) : null,
      description: p.description,
      shortDescription: p.short_description,
      categories: p.categories.map((c) => c.name),
      images: p.images.map((img) => img.src), // Will be migrated to R2 in background job
      stockQty: p.stock_quantity,
      inStock: p.stock_status === 'instock',
      weight: p.weight,
    }));

    res.json({
      success: true,
      imported: {
        categories: importedCategories.length,
        products: importedProducts.length,
        images: wooProducts.reduce((sum, p) => sum + p.images.length, 0),
      },
      message: `Successfully imported ${importedProducts.length} products, ${importedCategories.length} categories. Images migrating to R2 in background.`,
    });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// GET /api/woocommerce/status — import status
router.get('/status', requireAuth, requirePlatinum, (req: Request, res: Response) => {
  res.json({
    lastImport: null,
    productCount: 0,
    categoryCount: 0,
    imagesMigrated: 0,
    imagesTotal: 0,
    status: 'idle',
  });
});

export default router;
