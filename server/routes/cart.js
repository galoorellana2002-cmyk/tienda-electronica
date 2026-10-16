import { Router } from 'express';
import { getStore } from '../store/index.js';
import { httpError, requireAuth } from '../auth.js';

const router = Router();
router.use(requireAuth);

export function cleanCart(items) {
  if (!Array.isArray(items) || items.length > 60) throw httpError(400, 'El carrito no es válido.');
  const merged = new Map();
  for (const item of items) {
    const productId = String(item?.productId ?? '');
    const qty = Number(item?.qty);
    if (!/^[a-f0-9]{24}$/.test(productId) || !Number.isInteger(qty) || qty < 1 || qty > 99) throw httpError(400, 'El carrito no es válido.');
    merged.set(productId, Math.min(99, (merged.get(productId) ?? 0) + qty));
  }
  return [...merged].map(([productId, qty]) => ({ productId, qty }));
}

// El carrito vive en el navegador y, con sesión iniciada, también en tu cuenta.
router.get('/', async (req, res) => {
  const store = await getStore();
  const user = await store.getUser(req.user.id);
  res.json({ items: user?.cart ?? [] });
});

router.put('/', async (req, res) => {
  const items = cleanCart(req.body?.items);
  const store = await getStore();
  await store.setCart(req.user.id, items);
  res.json({ items });
});

export default router;
