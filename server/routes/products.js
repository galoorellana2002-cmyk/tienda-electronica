import { Router } from 'express';
import { getStore } from '../store/index.js';
import { httpError } from '../auth.js';
import { parseCatalogParams, queryCatalog, relatedProducts } from '../catalogQuery.js';
import { CATEGORIES } from '../../shared/shop.js';

const router = Router();

export const publicProduct = ({ searchText, active, ...p }) => p;
const card = ({ id, sku, slug, name, brand, category, priceCents, stock, sold, art, featured, specs }) => ({
  id, sku, slug, name, brand, category, priceCents, stock, sold, art, featured, highlights: specs.slice(0, 2),
});

router.get('/', async (req, res) => {
  const params = parseCatalogParams(req.query);
  if (params.category && !CATEGORIES.some((c) => c.slug === params.category)) throw httpError(404, 'Esa categoría no existe.');
  const store = await getStore();
  const base = await store.findProducts({ category: params.category, q: params.q });
  const result = queryCatalog(base, params);
  res.json({ ...result, items: result.items.map(card) });
});

router.get('/home', async (req, res) => {
  const store = await getStore();
  const all = await store.findProducts();
  const counts = Object.fromEntries(CATEGORIES.map((c) => [c.slug, 0]));
  for (const p of all) counts[p.category] += 1;
  const inStock = all.filter((p) => p.stock > 0);
  res.json({
    total: all.length,
    categories: CATEGORIES.map((c) => ({ ...c, count: counts[c.slug] })),
    featured: inStock.filter((p) => p.featured).sort((a, b) => b.sold - a.sold).slice(0, 8).map(card),
    bestSellers: [...inStock].sort((a, b) => b.sold - a.sold).slice(0, 8).map(card),
  });
});

router.get('/by-ids', async (req, res) => {
  const ids = String(req.query.ids ?? '').split(',').filter(Boolean).slice(0, 60);
  const store = await getStore();
  const items = ids.length ? await store.getProductsByIds(ids) : [];
  res.json({ items: items.filter((p) => p.active).map(card) });
});

router.get('/:slug', async (req, res) => {
  const store = await getStore();
  const product = await store.getProduct({ slug: req.params.slug });
  if (!product || !product.active) throw httpError(404, 'No encontramos ese producto.');
  const sameCategory = await store.findProducts({ category: product.category });
  res.json({ product: publicProduct(product), related: relatedProducts(product, sameCategory).map(card) });
});

export default router;
