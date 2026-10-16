// Reglas de la tienda que usan por igual el servidor y el navegador.

export const STORE_NAME = 'Circuito Andino';

export const CATEGORIES = [
  { slug: 'microcontroladores', name: 'Microcontroladores', blurb: 'Arduino, ESP32, Raspberry Pi Pico y STM32.' },
  { slug: 'sensores', name: 'Sensores', blurb: 'Temperatura, distancia, movimiento, gas y más.' },
  { slug: 'modulos', name: 'Módulos', blurb: 'Relés, drivers de motor, comunicación y energía.' },
  { slug: 'pantallas', name: 'Pantallas', blurb: 'OLED, LCD, TFT y displays de 7 segmentos.' },
  { slug: 'resistencias', name: 'Resistencias', blurb: 'Serie E12 de 1/4 W y 1/2 W, potenciómetros.' },
  { slug: 'capacitores', name: 'Capacitores', blurb: 'Cerámicos, electrolíticos y de tantalio.' },
  { slug: 'semiconductores', name: 'Semiconductores', blurb: 'Diodos, transistores, reguladores y circuitos integrados.' },
  { slug: 'leds', name: 'LEDs e iluminación', blurb: 'LEDs de 3 y 5 mm, RGB y tiras direccionables.' },
  { slug: 'cables-conectores', name: 'Cables y conectores', blurb: 'Jumpers, protoboards, headers y borneras.' },
  { slug: 'motores', name: 'Motores y actuadores', blurb: 'Servos, paso a paso, motores DC y bombas.' },
  { slug: 'fuentes', name: 'Fuentes y baterías', blurb: 'Adaptadores, fuentes conmutadas y celdas 18650.' },
  { slug: 'herramientas', name: 'Herramientas', blurb: 'Cautines, multímetros, pinzas y soldadura.' },
];

export const categoryName = (slug) => CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;

// Especificaciones que se convierten en filtros. Varios valores se separan con " / ".
export const FACETS = [
  { key: 'voltaje', label: 'Voltaje' },
  { key: 'interfaz', label: 'Interfaz' },
  { key: 'encapsulado', label: 'Encapsulado' },
  { key: 'potencia', label: 'Potencia' },
  { key: 'color', label: 'Color' },
  { key: 'longitud', label: 'Longitud' },
];

export const normalize = (text) =>
  String(text ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

export function deriveFacets(specs = []) {
  const facets = {};
  for (const { key } of FACETS) facets[key] = [];
  for (const spec of specs) {
    const facet = FACETS.find((f) => normalize(f.label) === normalize(spec.label));
    if (!facet) continue;
    for (const value of String(spec.value).split(' / ')) {
      const clean = value.trim();
      if (clean && clean !== '—' && !facets[facet.key].includes(clean)) facets[facet.key].push(clean);
    }
  }
  return facets;
}

export function buildSearchText(product) {
  return normalize(
    [product.name, product.sku, product.brand, categoryName(product.category), ...(product.tags ?? []), ...(product.specs ?? []).map((s) => s.value)].join(' '),
  );
}

export const money = (cents) =>
  new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format((cents ?? 0) / 100);

// Precios con IVA incluido (15 % en Ecuador desde abril de 2024).
export const IVA_RATE = 0.15;
export const ivaIncluded = (totalCents) => Math.round(totalCents - totalCents / (1 + IVA_RATE));

export const LOW_STOCK = 5;
export const FREE_SHIPPING_FROM = 6000;

export const SHIPPING_METHODS = [
  { id: 'estandar', name: 'Envío estándar', detail: '2 a 4 días hábiles', cents: 450 },
  { id: 'express', name: 'Envío express', detail: '24 h en Quito y Guayaquil, 48 h resto del país', cents: 850 },
  { id: 'retiro', name: 'Retiro en tienda', detail: 'Av. Amazonas y Naciones Unidas, Quito', cents: 0 },
];

export function shippingCost(methodId, subtotalCents) {
  const method = SHIPPING_METHODS.find((m) => m.id === methodId);
  if (!method) return null;
  if (method.id === 'estandar' && subtotalCents >= FREE_SHIPPING_FROM) return 0;
  return method.cents;
}

export const PROVINCES = [
  'Azuay', 'Bolívar', 'Cañar', 'Carchi', 'Chimborazo', 'Cotopaxi', 'El Oro', 'Esmeraldas', 'Galápagos', 'Guayas',
  'Imbabura', 'Loja', 'Los Ríos', 'Manabí', 'Morona Santiago', 'Napo', 'Orellana', 'Pastaza', 'Pichincha',
  'Santa Elena', 'Santo Domingo de los Tsáchilas', 'Sucumbíos', 'Tungurahua', 'Zamora Chinchipe',
];

// Cédula ecuatoriana: provincia 01–24 (o 30), tercer dígito < 6 y dígito verificador módulo 10.
export function isValidCedula(value) {
  const id = String(value ?? '').trim();
  if (!/^\d{10}$/.test(id)) return false;
  const province = Number(id.slice(0, 2));
  if (!((province >= 1 && province <= 24) || province === 30)) return false;
  if (Number(id[2]) >= 6) return false;
  let sum = 0;
  for (let i = 0; i < 9; i += 1) {
    let n = Number(id[i]) * (i % 2 === 0 ? 2 : 1);
    if (n > 9) n -= 9;
    sum += n;
  }
  return (10 - (sum % 10)) % 10 === Number(id[9]);
}

export const isValidPhone = (value) => /^09\d{8}$/.test(String(value ?? '').replace(/\s/g, ''));

export function validateAddress(a = {}) {
  const errors = {};
  if (!a.fullName?.trim() || a.fullName.trim().length < 3) errors.fullName = 'Escribe nombre y apellido.';
  if (!isValidCedula(a.cedula)) errors.cedula = 'La cédula no es válida (10 dígitos).';
  if (!isValidPhone(a.phone)) errors.phone = 'Usa un celular de 10 dígitos que empiece con 09.';
  if (!PROVINCES.includes(a.province)) errors.province = 'Elige una provincia.';
  if (!a.city?.trim()) errors.city = 'Escribe la ciudad o cantón.';
  if (!a.street?.trim() || a.street.trim().length < 5) errors.street = 'Escribe calle principal, número y secundaria.';
  return errors;
}

// Pasarela de pagos simulada: solo se aceptan estas tarjetas de prueba.
export const TEST_CARDS = [
  { number: '4242424242424242', brand: 'Visa', result: 'approved', label: 'Pago aprobado' },
  { number: '5555555555554444', brand: 'Mastercard', result: 'approved', label: 'Pago aprobado' },
  { number: '4000000000000002', brand: 'Visa', result: 'declined', label: 'Rechazada: fondos insuficientes' },
  { number: '4000000000000069', brand: 'Visa', result: 'expired', label: 'Rechazada: tarjeta vencida' },
];

export const cleanCardNumber = (value) => String(value ?? '').replace(/[\s-]/g, '');

export function luhn(number) {
  let sum = 0;
  let double = false;
  for (let i = number.length - 1; i >= 0; i -= 1) {
    let n = Number(number[i]);
    if (double) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    double = !double;
  }
  return number.length >= 12 && sum % 10 === 0;
}

export const ORDER_STATUSES = [
  { id: 'pagado', label: 'Pagado' },
  { id: 'preparando', label: 'Preparando' },
  { id: 'enviado', label: 'Enviado' },
  { id: 'entregado', label: 'Entregado' },
  { id: 'cancelado', label: 'Cancelado' },
];

export const statusLabel = (id) => ORDER_STATUSES.find((s) => s.id === id)?.label ?? id;

// Cambios de estado permitidos desde el panel de administración.
export const NEXT_STATUSES = {
  pagado: ['preparando', 'enviado', 'cancelado'],
  preparando: ['enviado', 'cancelado'],
  enviado: ['entregado'],
  entregado: [],
  cancelado: [],
};

export const SORTS = [
  { id: 'relevancia', label: 'Relevancia' },
  { id: 'vendidos', label: 'Más vendidos' },
  { id: 'precio-asc', label: 'Precio: menor a mayor' },
  { id: 'precio-desc', label: 'Precio: mayor a menor' },
  { id: 'nombre', label: 'Nombre (A–Z)' },
  { id: 'nuevos', label: 'Novedades' },
];

export const PAGE_SIZE = 24;
