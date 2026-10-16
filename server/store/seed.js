// Datos iniciales: catálogo, cuentas de prueba y pedidos de ejemplo para que el panel tenga métricas.
import { createHash, randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { buildCatalog } from '../data/catalog.js';
import { SHIPPING_METHODS, ivaIncluded, shippingCost } from '../../shared/shop.js';

export const DEMO_ACCOUNTS = [
  { name: 'Administración Circuito Andino', email: 'admin@circuitoandino.demo', password: 'admin1234', role: 'admin' },
  { name: 'Cliente de prueba', email: 'cliente@circuitoandino.demo', password: 'cliente1234', role: 'customer' },
];

export const newId = () => randomBytes(12).toString('hex');

// IDs estables para los datos de ejemplo: no cambian entre reinicios ni entre instancias de Vercel,
// así los carritos guardados y los tokens siguen apuntando a lo mismo.
export const stableId = (key) => createHash('sha256').update(key).digest('hex').slice(0, 24);

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Cédula válida a partir de 9 dígitos (calcula el dígito verificador).
function cedulaFrom(nine) {
  let sum = 0;
  for (let i = 0; i < 9; i += 1) {
    let n = Number(nine[i]) * (i % 2 === 0 ? 2 : 1);
    if (n > 9) n -= 9;
    sum += n;
  }
  return nine + ((10 - (sum % 10)) % 10);
}

const CUSTOMERS = [
  ['María Fernanda Torres', 'Pichincha', 'Quito', 'Av. 6 de Diciembre N34-120 y Portugal', '17'],
  ['Carlos Andrade Vega', 'Guayas', 'Guayaquil', 'Av. Francisco de Orellana y Justino Cornejo', '09'],
  ['Daniela Paredes', 'Azuay', 'Cuenca', 'Calle Larga 7-45 y Borrero', '01'],
  ['Andrés Salazar', 'Tungurahua', 'Ambato', 'Av. Cevallos 12-40 y Montalvo', '18'],
  ['Gabriela Cevallos', 'Imbabura', 'Ibarra', 'Calle Bolívar 5-67 y Oviedo', '10'],
  ['Jorge Luis Benítez', 'Manabí', 'Manta', 'Av. 24 y Calle 15, barrio Córdova', '13'],
  ['Valeria Mendoza', 'Loja', 'Loja', 'Av. Universitaria 18-20 y Rocafuerte', '11'],
  ['Santiago Ríos', 'Chimborazo', 'Riobamba', 'Av. Daniel León Borja 32-18', '06'],
  ['Paola Jaramillo', 'Pichincha', 'Sangolquí', 'Av. General Enríquez 2210 y Montúfar', '17'],
  ['Esteban Villacís', 'Pichincha', 'Quito', 'Av. Eloy Alfaro N39-61 y José Puerta', '17'],
];

export async function buildSeed() {
  const random = rng(4242);
  const products = buildCatalog().map((p) => ({ ...p, id: stableId(`product:${p.sku}`), active: true }));

  const users = [];
  for (const account of DEMO_ACCOUNTS) {
    users.push({
      id: stableId(`user:${account.email}`),
      name: account.name,
      email: account.email,
      role: account.role,
      passwordHash: await bcrypt.hash(account.password, 10),
      cart: [],
      createdAt: new Date(Date.UTC(2024, 5, 1)).toISOString(),
    });
  }
  const customers = CUSTOMERS.map(([name, province, city, street, prov], i) => {
    const user = {
      id: stableId(`customer:${i}`),
      name,
      email: `${name.split(' ')[0].toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')}.${i + 1}@ejemplo.demo`,
      role: 'customer',
      passwordHash: null, // Cuentas de ejemplo sin acceso: solo aportan historial al panel.
      cart: [],
      createdAt: new Date(Date.UTC(2024, 5, 1)).toISOString(),
    };
    users.push(user);
    const nine = prov + String(Math.floor(random() * 4)) + String(Math.floor(random() * 1e6)).padStart(6, '0');
    return { user, address: { fullName: name, cedula: cedulaFrom(nine), phone: `09${String(Math.floor(random() * 1e8)).padStart(8, '0')}`, province, city, street, reference: '' } };
  });

  // Pedidos de los últimos 60 días: los antiguos ya entregados, los recientes en curso.
  const orders = [];
  const now = Date.now();
  const popular = products.filter((p) => p.featured || p.category === 'microcontroladores' || p.category === 'sensores');
  for (let i = 0; i < 64; i += 1) {
    const { user, address } = customers[Math.floor(random() * customers.length)];
    const daysAgo = Math.floor((64 - i) * 0.93 + random());
    const createdAt = new Date(now - daysAgo * 86400000 - Math.floor(random() * 36000000));
    const lines = new Map();
    const count = 1 + Math.floor(random() * 4);
    for (let j = 0; j < count; j += 1) {
      const pool = random() < 0.7 ? popular : products;
      const product = pool[Math.floor(random() * pool.length)];
      const line = lines.get(product.id) ?? { productId: product.id, sku: product.sku, slug: product.slug, name: product.name, priceCents: product.priceCents, qty: 0, art: product.art };
      line.qty += product.priceCents < 300 ? 1 + Math.floor(random() * 4) : 1;
      lines.set(product.id, line);
    }
    const items = [...lines.values()];
    for (const line of items) products.find((p) => p.id === line.productId).sold += line.qty;
    const subtotalCents = items.reduce((sum, line) => sum + line.priceCents * line.qty, 0);
    const method = SHIPPING_METHODS[random() < 0.75 ? 0 : random() < 0.6 ? 1 : 2];
    const shippingCents = shippingCost(method.id, subtotalCents);
    const totalCents = subtotalCents + shippingCents;
    let status = daysAgo > 7 ? 'entregado' : daysAgo > 4 ? 'enviado' : daysAgo > 1 ? 'preparando' : 'pagado';
    if (random() < 0.05) status = 'cancelado';
    const flow = ['pagado', 'preparando', 'enviado', 'entregado'];
    const steps = status === 'cancelado' ? ['pagado', 'cancelado'] : flow.slice(0, flow.indexOf(status) + 1);
    orders.push({
      id: stableId(`order:${i}`),
      number: `CA-${10001 + i}`,
      userId: user.id,
      customer: { name: user.name, email: user.email },
      items,
      subtotalCents,
      shippingCents,
      totalCents,
      ivaCents: ivaIncluded(totalCents),
      shipping: { method: method.id, name: method.name },
      address: method.id === 'retiro' ? { ...address, city: 'Quito', province: 'Pichincha' } : address,
      payment: { provider: 'Pasarela demo', brand: random() < 0.6 ? 'Visa' : 'Mastercard', last4: random() < 0.6 ? '4242' : '4444', authCode: `DEMO${String(Math.floor(random() * 1e6)).padStart(6, '0')}`, paidAt: createdAt.toISOString() },
      status,
      history: steps.map((s, k) => ({ status: s, at: new Date(createdAt.getTime() + k * 86400000 * 1.5).toISOString(), by: k === 0 ? 'Pasarela demo' : 'Administración' })),
      createdAt: createdAt.toISOString(),
      sample: true,
    });
  }

  return { products, users, orders, nextOrderNumber: 10001 + orders.length };
}
