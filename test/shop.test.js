import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deriveFacets, isValidCedula, luhn, shippingCost } from '../shared/shop.js';
import { buildCatalog } from '../server/data/catalog.js';
import { authorizeDemoPayment } from '../server/payments.js';
import { parseCatalogParams, queryCatalog } from '../server/catalogQuery.js';

test('el catálogo tiene más de 300 productos con SKU y slug únicos', () => {
  const catalog = buildCatalog();
  assert.ok(catalog.length > 300);
  assert.equal(new Set(catalog.map((p) => p.sku)).size, catalog.length);
  assert.equal(new Set(catalog.map((p) => p.slug)).size, catalog.length);
  assert.ok(catalog.every((p) => p.priceCents > 0 && p.specs.length > 0));
});

test('las especificaciones se convierten en filtros', () => {
  const facets = deriveFacets([{ label: 'Interfaz', value: 'I2C / SPI' }, { label: 'Voltaje', value: '3.3 V' }, { label: 'Rango', value: '0–5 V' }]);
  assert.deepEqual(facets.interfaz, ['I2C', 'SPI']);
  assert.deepEqual(facets.voltaje, ['3.3 V']);
});

test('valida cédulas ecuatorianas y números de tarjeta', () => {
  assert.equal(isValidCedula('1712345675'), true);
  assert.equal(isValidCedula('1712345670'), false);
  assert.equal(isValidCedula('9912345675'), false);
  assert.equal(luhn('4242424242424242'), true);
  assert.equal(luhn('4242424242424241'), false);
});

test('envío estándar gratis desde $60', () => {
  assert.equal(shippingCost('estandar', 5999), 450);
  assert.equal(shippingCost('estandar', 6000), 0);
  assert.equal(shippingCost('retiro', 100), 0);
});

test('la pasarela demo solo acepta tarjetas de prueba y no devuelve el número completo', () => {
  const card = { name: 'Prueba', exp: '12/40', cvc: '123' };
  const ok = authorizeDemoPayment({ ...card, number: '4242 4242 4242 4242' });
  assert.equal(ok.last4, '4242');
  assert.ok(!JSON.stringify(ok).includes('4242424242424242'));
  assert.throws(() => authorizeDemoPayment({ ...card, number: '4111111111111111' }), { status: 402 });
  assert.throws(() => authorizeDemoPayment({ ...card, number: '4000000000000002' }), { status: 402 });
  assert.throws(() => authorizeDemoPayment({ ...card, number: '4242424242424242', exp: '01/20' }), { status: 400 });
});

test('filtra, ordena y pagina el catálogo', () => {
  const catalog = buildCatalog();
  const result = queryCatalog(catalog.filter((p) => p.category === 'sensores'), parseCatalogParams({ interfaz: 'I2C', orden: 'precio-asc', porPagina: '5' }));
  assert.ok(result.total > 5);
  assert.equal(result.items.length, 5);
  assert.ok(result.items.every((p) => p.facets.interfaz.includes('I2C')));
  assert.ok(result.items.every((p, i, a) => i === 0 || a[i - 1].priceCents <= p.priceCents));
});
