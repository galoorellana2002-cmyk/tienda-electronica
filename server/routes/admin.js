import { Router } from 'express';
import { getStore } from '../store/index.js';
import { httpError, requireAdmin } from '../auth.js';
import { publicProduct } from './products.js';
import { CATEGORIES, LOW_STOCK, NEXT_STATUSES, buildSearchText, deriveFacets, normalize } from '../../shared/shop.js';

const router = Router();
router.use(requireAdmin);

const DEFAULT_ART = {
  microcontroladores: { kind: 'board', color: '#1565c0' }, sensores: { kind: 'sensor' }, modulos: { kind: 'module', color: '#1565c0' },
  pantallas: { kind: 'display', color: '#0d47a1', variant: 'oled' }, resistencias: { kind: 'resistor', ohms: 1000 },
  capacitores: { kind: 'capacitor', variant: 'electrolytic' }, semiconductores: { kind: 'chip', variant: 'dip', pins: 8 },
  leds: { kind: 'led', color: '#ff3b30' }, 'cables-conectores': { kind: 'cable' }, motores: { kind: 'motor', variant: 'servo' },
  fuentes: { kind: 'power' }, herramientas: { kind: 'tool', variant: 'meter' },
};

function parseOhms(specs) {
  const value = specs.find((s) => normalize(s.label) === 'resistencia')?.value ?? '';
  const match = value.replace(',', '.').match(/([\d.]+)\s*([kM]?)Ω/);
  if (!match) return null;
  return Math.round(Number(match[1]) * (match[2] === 'k' ? 1e3 : match[2] === 'M' ? 1e6 : 1));
}

function cleanProduct(body = {}, existing) {
  const text = (value, max) => String(value ?? '').trim().slice(0, max);
  const name = text(body.name, 140);
  const sku = text(body.sku, 20).toUpperCase();
  const category = String(body.category ?? '');
  const price = Number(body.price);
  const stock = Number(body.stock);
  if (name.length < 3) throw httpError(400, 'El nombre debe tener al menos 3 caracteres.');
  if (!/^[A-Z0-9-]{3,20}$/.test(sku)) throw httpError(400, 'El SKU usa de 3 a 20 letras mayúsculas, números o guiones.');
  if (!CATEGORIES.some((c) => c.slug === category)) throw httpError(400, 'Elige una categoría.');
  if (!Number.isFinite(price) || price < 0.01 || price > 100000) throw httpError(400, 'El precio debe estar entre $0.01 y $100 000.');
  if (!Number.isInteger(stock) || stock < 0 || stock > 1000000) throw httpError(400, 'El stock debe ser un número entero mayor o igual a 0.');
  const specs = (Array.isArray(body.specs) ? body.specs : [])
    .map((s) => ({ label: text(s?.label, 40), value: text(s?.value, 80) }))
    .filter((s) => s.label && s.value)
    .slice(0, 24);
  const product = {
    name,
    sku,
    category,
    brand: text(body.brand, 40) || 'Genérico',
    description: text(body.description, 1200),
    priceCents: Math.round(price * 100),
    stock,
    specs,
    tags: (Array.isArray(body.tags) ? body.tags : String(body.tags ?? '').split(',')).map((t) => text(t, 30)).filter(Boolean).slice(0, 12),
    featured: Boolean(body.featured),
    active: body.active === undefined ? true : Boolean(body.active),
  };
  product.slug = `${normalize(name).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${sku.toLowerCase()}`;
  product.art = existing && existing.category === category ? existing.art : { ...DEFAULT_ART[category] };
  if (product.art.kind === 'resistor') product.art = { ...product.art, ohms: parseOhms(specs) ?? product.art.ohms };
  product.facets = deriveFacets(specs);
  product.searchText = buildSearchText(product);
  return product;
}

// ───────── Métricas ─────────
router.get('/stats', async (req, res) => {
  const days = [7, 30, 90].includes(Number(req.query.dias)) ? Number(req.query.dias) : 30;
  const store = await getStore();
  const [orders, products] = await Promise.all([store.listOrders(), store.findProducts({ includeInactive: true })]);
  const now = Date.now();
  const start = now - days * 86400000;
  const valid = orders.filter((o) => o.status !== 'cancelado');
  const inRange = (o, from, to) => {
    const t = new Date(o.createdAt).getTime();
    return t >= from && t < to;
  };
  const current = valid.filter((o) => inRange(o, start, now + 1));
  const previous = valid.filter((o) => inRange(o, start - days * 86400000, start));
  const sum = (list) => list.reduce((s, o) => s + o.totalCents, 0);

  const daily = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const day = new Date(now - i * 86400000);
    const key = day.toLocaleDateString('en-CA', { timeZone: 'America/Guayaquil' });
    daily.push({ date: key, cents: 0, orders: 0 });
  }
  for (const o of current) {
    const key = new Date(o.createdAt).toLocaleDateString('en-CA', { timeZone: 'America/Guayaquil' });
    const entry = daily.find((d) => d.date === key);
    if (entry) {
      entry.cents += o.totalCents;
      entry.orders += 1;
    }
  }

  const units = new Map();
  for (const o of current) {
    for (const item of o.items) {
      const row = units.get(item.productId) ?? { productId: item.productId, sku: item.sku, name: item.name, art: item.art, qty: 0, cents: 0 };
      row.qty += item.qty;
      row.cents += item.qty * item.priceCents;
      units.set(item.productId, row);
    }
  }

  res.json({
    days,
    revenueCents: sum(current),
    previousRevenueCents: sum(previous),
    orders: current.length,
    previousOrders: previous.length,
    avgTicketCents: current.length ? Math.round(sum(current) / current.length) : 0,
    unitsSold: [...units.values()].reduce((s, r) => s + r.qty, 0),
    daily,
    topProducts: [...units.values()].sort((a, b) => b.qty - a.qty || b.cents - a.cents).slice(0, 6),
    lowStock: products
      .filter((p) => p.active && p.stock <= LOW_STOCK)
      .sort((a, b) => a.stock - b.stock || b.sold - a.sold)
      .slice(0, 12)
      .map((p) => ({ id: p.id, sku: p.sku, name: p.name, stock: p.stock, art: p.art, category: p.category })),
    lowStockCount: products.filter((p) => p.active && p.stock <= LOW_STOCK).length,
    catalogCount: products.length,
    pending: orders.filter((o) => o.status === 'pagado' || o.status === 'preparando').length,
    byStatus: Object.fromEntries(Object.keys(NEXT_STATUSES).map((s) => [s, orders.filter((o) => o.status === s).length])),
  });
});

// ───────── Productos ─────────
router.get('/products', async (req, res) => {
  const store = await getStore();
  let items = await store.findProducts({ includeInactive: true, q: String(req.query.q ?? '').slice(0, 100), category: req.query.categoria || undefined });
  if (req.query.stock === 'bajo') items = items.filter((p) => p.stock > 0 && p.stock <= LOW_STOCK);
  if (req.query.stock === 'agotado') items = items.filter((p) => p.stock === 0);
  if (req.query.stock === 'ocultos') items = items.filter((p) => !p.active);
  const sorters = {
    sku: (a, b) => a.sku.localeCompare(b.sku),
    stock: (a, b) => a.stock - b.stock || a.sku.localeCompare(b.sku),
    vendidos: (a, b) => b.sold - a.sold,
    precio: (a, b) => b.priceCents - a.priceCents,
    nuevos: (a, b) => String(b.createdAt).localeCompare(String(a.createdAt)),
  };
  items.sort(sorters[req.query.orden] ?? sorters.sku);
  const pageSize = 25;
  const pages = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(pages, Math.max(1, Number.parseInt(req.query.pagina, 10) || 1));
  res.json({
    total: items.length,
    page,
    pages,
    items: items.slice((page - 1) * pageSize, page * pageSize).map(({ searchText, specs, description, facets, tags, ...p }) => p),
  });
});

router.get('/products/:id', async (req, res) => {
  const store = await getStore();
  const product = await store.getProduct({ id: req.params.id });
  if (!product) throw httpError(404, 'No encontramos ese producto.');
  res.json({ product: { ...publicProduct(product), active: product.active } });
});

router.post('/products', async (req, res) => {
  const store = await getStore();
  const data = cleanProduct(req.body);
  if (await store.skuExists(data.sku)) throw httpError(409, `Ya existe un producto con el SKU ${data.sku}.`);
  res.status(201).json({ product: await store.createProduct(data) });
});

router.put('/products/:id', async (req, res) => {
  const store = await getStore();
  const existing = await store.getProduct({ id: req.params.id });
  if (!existing) throw httpError(404, 'No encontramos ese producto.');
  const data = cleanProduct(req.body, existing);
  if (await store.skuExists(data.sku, existing.id)) throw httpError(409, `Ya existe un producto con el SKU ${data.sku}.`);
  res.json({ product: await store.updateProduct(existing.id, data) });
});

// Control rápido de stock: fija un valor o suma/resta unidades.
router.patch('/products/:id/stock', async (req, res) => {
  const store = await getStore();
  const product = await store.getProduct({ id: req.params.id });
  if (!product) throw httpError(404, 'No encontramos ese producto.');
  const next = req.body?.stock !== undefined ? Number(req.body.stock) : product.stock + Number(req.body?.delta ?? 0);
  if (!Number.isInteger(next) || next < 0 || next > 1000000) throw httpError(400, 'El stock debe ser un número entero mayor o igual a 0.');
  const updated = await store.updateProduct(product.id, { stock: next });
  res.json({ product: { id: updated.id, stock: updated.stock } });
});

router.patch('/products/:id/visibility', async (req, res) => {
  const store = await getStore();
  const updated = await store.updateProduct(req.params.id, { active: Boolean(req.body?.active) });
  if (!updated) throw httpError(404, 'No encontramos ese producto.');
  res.json({ product: { id: updated.id, active: updated.active } });
});

router.delete('/products/:id', async (req, res) => {
  const store = await getStore();
  if (!(await store.deleteProduct(req.params.id))) throw httpError(404, 'No encontramos ese producto.');
  res.status(204).end();
});

// ───────── Pedidos ─────────
router.get('/orders', async (req, res) => {
  const store = await getStore();
  let orders = await store.listOrders();
  const counts = Object.fromEntries(Object.keys(NEXT_STATUSES).map((s) => [s, orders.filter((o) => o.status === s).length]));
  if (req.query.estado && NEXT_STATUSES[req.query.estado]) orders = orders.filter((o) => o.status === req.query.estado);
  const q = normalize(String(req.query.q ?? '').trim());
  if (q) orders = orders.filter((o) => normalize(`${o.number} ${o.customer.name} ${o.customer.email} ${o.address.city}`).includes(q));
  const pageSize = 20;
  const pages = Math.max(1, Math.ceil(orders.length / pageSize));
  const page = Math.min(pages, Math.max(1, Number.parseInt(req.query.pagina, 10) || 1));
  res.json({ total: orders.length, page, pages, counts, orders: orders.slice((page - 1) * pageSize, page * pageSize) });
});

router.patch('/orders/:id/status', async (req, res) => {
  const store = await getStore();
  const order = await store.getOrder(req.params.id);
  if (!order) throw httpError(404, 'No encontramos ese pedido.');
  const status = String(req.body?.status ?? '');
  if (!NEXT_STATUSES[order.status]?.includes(status)) throw httpError(400, `Un pedido «${order.status}» no puede pasar a «${status}».`);
  const note = String(req.body?.note ?? '').trim().slice(0, 200);
  const updated = await store.updateOrderStatus(order.id, status, { status, at: new Date().toISOString(), by: req.user.name, ...(note && { note }) });
  // Al cancelar se devuelve el stock reservado.
  if (status === 'cancelado') await store.releaseStock(order.items);
  res.json({ order: updated });
});

export default router;
