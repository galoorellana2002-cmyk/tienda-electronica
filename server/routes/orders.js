import { Router } from 'express';
import { getStore } from '../store/index.js';
import { httpError, requireAuth } from '../auth.js';
import { authorizeDemoPayment } from '../payments.js';
import { cleanCart } from './cart.js';
import { SHIPPING_METHODS, ivaIncluded, shippingCost, validateAddress } from '../../shared/shop.js';

const router = Router();
router.use(requireAuth);

function cleanAddress(raw = {}, pickup) {
  const address = {
    fullName: String(raw.fullName ?? '').trim().slice(0, 80),
    cedula: String(raw.cedula ?? '').trim(),
    phone: String(raw.phone ?? '').replace(/\s/g, ''),
    province: pickup ? 'Pichincha' : String(raw.province ?? ''),
    city: pickup ? 'Quito' : String(raw.city ?? '').trim().slice(0, 60),
    street: pickup ? 'Retiro en tienda: Av. Amazonas y Naciones Unidas' : String(raw.street ?? '').trim().slice(0, 160),
    reference: String(raw.reference ?? '').trim().slice(0, 160),
  };
  const errors = validateAddress(address);
  if (Object.keys(errors).length) throw Object.assign(httpError(400, Object.values(errors)[0]), { fields: errors });
  return address;
}

// Checkout en un solo paso: valida carrito, dirección y tarjeta de prueba, descuenta stock y crea el pedido pagado.
router.post('/', async (req, res) => {
  const store = await getStore();
  const lines = cleanCart(req.body?.items);
  if (!lines.length) throw httpError(400, 'Tu carrito está vacío.');
  const method = SHIPPING_METHODS.find((m) => m.id === req.body?.shippingMethod);
  if (!method) throw httpError(400, 'Elige un método de envío.');
  const address = cleanAddress(req.body?.address, method.id === 'retiro');

  const products = await store.getProductsByIds(lines.map((l) => l.productId));
  const items = lines.map((line) => {
    const product = products.find((p) => p.id === line.productId && p.active);
    if (!product) throw httpError(409, 'Un producto de tu carrito ya no está disponible. Revisa el carrito.');
    if (product.stock < line.qty) throw httpError(409, `Solo quedan ${product.stock} unidades de «${product.name}». Ajusta la cantidad.`);
    return { productId: product.id, sku: product.sku, slug: product.slug, name: product.name, priceCents: product.priceCents, qty: line.qty, art: product.art };
  });
  const subtotalCents = items.reduce((sum, i) => sum + i.priceCents * i.qty, 0);
  const shippingCents = shippingCost(method.id, subtotalCents);
  const totalCents = subtotalCents + shippingCents;

  const payment = authorizeDemoPayment(req.body?.card);
  if (!(await store.reserveStock(items))) {
    throw httpError(409, 'Otro cliente compró las últimas unidades de un producto. No se hizo ningún cobro; revisa tu carrito.');
  }
  const order = await store.createOrder({
    userId: req.user.id,
    customer: { name: req.user.name, email: req.user.email },
    items,
    subtotalCents,
    shippingCents,
    totalCents,
    ivaCents: ivaIncluded(totalCents),
    shipping: { method: method.id, name: method.name },
    address,
    payment,
    status: 'pagado',
    history: [{ status: 'pagado', at: payment.paidAt, by: 'Pasarela demo' }],
  });
  await store.setCart(req.user.id, []);
  res.status(201).json({ order });
});

router.get('/', async (req, res) => {
  const store = await getStore();
  res.json({ orders: await store.listOrders({ userId: req.user.id }) });
});

router.get('/:id', async (req, res) => {
  const store = await getStore();
  const order = await store.getOrder(req.params.id);
  if (!order || (order.userId !== req.user.id && req.user.role !== 'admin')) throw httpError(404, 'No encontramos ese pedido.');
  res.json({ order });
});

export default router;
