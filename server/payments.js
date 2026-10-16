// Pasarela de pagos SIMULADA. No se conecta con ningún banco ni proveedor.
// Solo acepta las tarjetas de prueba documentadas y nunca guarda el número completo, la fecha ni el CVC.
import { randomInt } from 'node:crypto';
import { TEST_CARDS, cleanCardNumber, luhn } from '../shared/shop.js';
import { httpError } from './auth.js';

export function authorizeDemoPayment(card = {}) {
  const number = cleanCardNumber(card.number);
  const name = String(card.name ?? '').trim();
  const [mm, yy] = String(card.exp ?? '').split('/').map((v) => Number.parseInt(v, 10));
  const cvc = String(card.cvc ?? '');

  if (!/^\d{13,19}$/.test(number) || !luhn(number)) throw httpError(400, 'El número de tarjeta no es válido.');
  if (name.length < 3) throw httpError(400, 'Escribe el nombre como aparece en la tarjeta.');
  const now = new Date();
  const expiry = new Date(2000 + yy, mm, 1); // primer día del mes siguiente
  if (!(mm >= 1 && mm <= 12) || !(yy >= 0 && yy <= 99) || expiry <= now) throw httpError(400, 'La fecha de vencimiento no es válida.');
  if (!/^\d{3,4}$/.test(cvc)) throw httpError(400, 'El código de seguridad (CVC) debe tener 3 o 4 dígitos.');

  const test = TEST_CARDS.find((c) => c.number === number);
  if (!test) {
    throw httpError(402, 'Esta pasarela es solo una demostración: usa una de las tarjetas de prueba. No ingreses tarjetas reales.');
  }
  if (test.result !== 'approved') throw httpError(402, `Pago rechazado por la pasarela de prueba: ${test.label.replace('Rechazada: ', '')}.`);

  return {
    provider: 'Pasarela demo',
    brand: test.brand,
    last4: number.slice(-4),
    authCode: `DEMO${String(randomInt(0, 1e6)).padStart(6, '0')}`,
    paidAt: new Date().toISOString(),
  };
}
