import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { CreditCard, Lock, TriangleAlert } from 'lucide-react';
import ProductArt from '../components/ProductArt.jsx';
import { useCart } from '../lib/cart.jsx';
import { useAuth } from '../lib/auth.jsx';
import { api } from '../lib/api.js';
import { readJSON, writeJSON } from '../lib/storage.js';
import { PROVINCES, SHIPPING_METHODS, TEST_CARDS, cleanCardNumber, ivaIncluded, luhn, money, shippingCost, validateAddress } from '../../shared/shop.js';

const emptyAddress = { fullName: '', cedula: '', phone: '', province: 'Pichincha', city: 'Quito', street: '', reference: '' };

const formatCard = (value) => cleanCardNumber(value).replace(/\D/g, '').slice(0, 19).replace(/(\d{4})(?=\d)/g, '$1 ');
const formatExp = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
};
const brandOf = (number) => (/^4/.test(number) ? 'Visa' : /^5[1-5]/.test(number) ? 'Mastercard' : /^3[47]/.test(number) ? 'American Express' : '');

function Field({ label, error, children, hint, className = '' }) {
  return (
    <label className={`field ${error ? 'has-error' : ''} ${className}`}>
      <span className="field-label">{label}</span>
      {children}
      {error ? <span className="field-error">{error}</span> : hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}

export default function Checkout() {
  const { user } = useAuth();
  const cart = useCart();
  const navigate = useNavigate();
  const [method, setMethod] = useState('estandar');
  // La última dirección usada se recuerda en este navegador, por cuenta (nunca la tarjeta).
  const addressKey = `ca-address-${user?.id}`;
  const [address, setAddress] = useState(() => ({ ...emptyAddress, fullName: user?.name ?? '', ...readJSON(addressKey, {}) }));
  const [card, setCard] = useState({ number: '', name: '', exp: '', cvc: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ busy: false, error: null });

  useEffect(() => {
    cart.refresh().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lines = cart.items.filter((i) => i.product && !i.unavailable);
  const shippingCents = shippingCost(method, cart.subtotalCents);
  const totalCents = cart.subtotalCents + shippingCents;
  const pickup = method === 'retiro';
  const cardNumber = cleanCardNumber(card.number);
  const brand = brandOf(cardNumber);
  const testCard = useMemo(() => TEST_CARDS.find((c) => c.number === cardNumber), [cardNumber]);

  if (!user) return <Navigate to="/ingresar?volver=/checkout" replace />;
  if (!cart.items.length && !status.busy) return <Navigate to="/carrito" replace />;

  const setA = (key) => (e) => setAddress((a) => ({ ...a, [key]: e.target.value }));
  const setC = (key, format) => (e) => setCard((c) => ({ ...c, [key]: format ? format(e.target.value) : e.target.value }));

  function validate() {
    const next = validateAddress(pickup ? { ...address, province: 'Pichincha', city: 'Quito', street: 'Retiro en tienda' } : address);
    if (!luhn(cardNumber)) next.number = 'Revisa el número de tarjeta.';
    else if (!testCard) next.number = 'Esta demo solo acepta las tarjetas de prueba de la lista.';
    if (card.name.trim().length < 3) next.name = 'Escribe el nombre como aparece en la tarjeta.';
    const [mm, yy] = card.exp.split('/').map(Number);
    if (!(mm >= 1 && mm <= 12) || !(yy >= 0) || new Date(2000 + yy, mm, 1) <= new Date()) next.exp = 'Usa una fecha futura (MM/AA).';
    if (!/^\d{3,4}$/.test(card.cvc)) next.cvc = '3 o 4 dígitos.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function pay(e) {
    e.preventDefault();
    setStatus({ busy: false, error: null });
    if (!validate()) {
      setStatus({ busy: false, error: 'Revisa los campos marcados.' });
      return;
    }
    setStatus({ busy: true, error: null });
    writeJSON(addressKey, address);
    try {
      const { order } = await api('/orders', {
        method: 'POST',
        body: { items: lines.map(({ productId, qty }) => ({ productId, qty })), shippingMethod: method, address, card },
      });
      setCard({ number: '', name: '', exp: '', cvc: '' });
      cart.clear();
      navigate(`/cuenta/pedidos/${order.id}?nuevo=1`, { replace: true });
    } catch (error) {
      if (error.fields) setErrors(error.fields);
      if (error.status === 409) cart.refresh().catch(() => {});
      setStatus({ busy: false, error: error.message });
    }
  }

  return (
    <div className="page checkout-page">
      <nav className="breadcrumb" aria-label="Ruta"><Link to="/carrito">Carrito</Link> <span>›</span> Pago</nav>
      <h1>Finalizar compra</h1>
      <form className="two-col" onSubmit={pay} noValidate>
        <div className="checkout-steps">
          <section className="panel">
            <h2><span className="step">1</span> Entrega</h2>
            <div className="options">
              {SHIPPING_METHODS.map((m) => {
                const cost = shippingCost(m.id, cart.subtotalCents);
                return (
                  <label key={m.id} className={`option ${method === m.id ? 'selected' : ''}`}>
                    <input type="radio" name="shipping" value={m.id} checked={method === m.id} onChange={() => setMethod(m.id)} />
                    <span><strong>{m.name}</strong><small>{m.detail}</small></span>
                    <span className="option-price">{cost === 0 ? 'Gratis' : money(cost)}</span>
                  </label>
                );
              })}
            </div>
          </section>

          <section className="panel">
            <h2><span className="step">2</span> {pickup ? 'Datos de quien retira' : 'Dirección de envío'}</h2>
            <div className="form-grid">
              <Field label="Nombre y apellido" error={errors.fullName} className="span-2">
                <input value={address.fullName} onChange={setA('fullName')} autoComplete="name" required />
              </Field>
              <Field label="Cédula" error={errors.cedula} hint="10 dígitos, para la factura.">
                <input value={address.cedula} onChange={setA('cedula')} inputMode="numeric" maxLength={10} required />
              </Field>
              <Field label="Celular" error={errors.phone} hint="Ej.: 0991234567">
                <input value={address.phone} onChange={setA('phone')} inputMode="tel" autoComplete="tel" maxLength={12} required />
              </Field>
              {!pickup && (
                <>
                  <Field label="Provincia" error={errors.province}>
                    <select value={address.province} onChange={setA('province')}>
                      {PROVINCES.map((p) => <option key={p}>{p}</option>)}
                    </select>
                  </Field>
                  <Field label="Ciudad o cantón" error={errors.city}>
                    <input value={address.city} onChange={setA('city')} autoComplete="address-level2" required />
                  </Field>
                  <Field label="Dirección" error={errors.street} hint="Calle principal, número y calle secundaria." className="span-2">
                    <input value={address.street} onChange={setA('street')} autoComplete="street-address" placeholder="Av. Amazonas N24-03 y Colón" required />
                  </Field>
                  <Field label="Referencia (opcional)" className="span-2">
                    <input value={address.reference} onChange={setA('reference')} placeholder="Edificio, piso, color de la casa…" />
                  </Field>
                </>
              )}
            </div>
          </section>

          <section className="panel">
            <h2><span className="step">3</span> Pago con tarjeta</h2>
            <div className="demo-gateway" role="note">
              <TriangleAlert size={18} aria-hidden="true" />
              <div>
                <strong>Pasarela de pagos de demostración.</strong> No se conecta con ningún banco y no guarda tu tarjeta. No ingreses datos reales: usa una tarjeta de prueba, cualquier nombre, una fecha futura y cualquier CVC.
                <ul className="test-cards">
                  {TEST_CARDS.map((c) => (
                    <li key={c.number}>
                      <code>{formatCard(c.number)}</code>
                      <span className={c.result === 'approved' ? 'ok' : 'bad'}>{c.label}</span>
                      <button type="button" className="link-btn" aria-label={`Usar la tarjeta ${formatCard(c.number)}`} onClick={() => { setCard((s) => ({ ...s, number: formatCard(c.number), name: s.name || 'CLIENTE PRUEBA', exp: s.exp || '12/30', cvc: s.cvc || '123' })); setErrors((er) => ({ ...er, number: undefined, name: undefined, exp: undefined, cvc: undefined })); }}>
                        Usar
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="form-grid card-form">
              <Field label="Número de tarjeta" error={errors.number} className="span-2">
                <div className="input-icon">
                  <CreditCard size={18} aria-hidden="true" />
                  <input value={card.number} onChange={setC('number', formatCard)} inputMode="numeric" autoComplete="off" placeholder="4242 4242 4242 4242" />
                  {brand && <span className="card-brand">{brand}</span>}
                </div>
              </Field>
              <Field label="Nombre en la tarjeta" error={errors.name} className="span-2">
                <input value={card.name} onChange={setC('name')} autoComplete="off" />
              </Field>
              <Field label="Vencimiento" error={errors.exp}>
                <input value={card.exp} onChange={setC('exp', formatExp)} inputMode="numeric" placeholder="MM/AA" autoComplete="off" />
              </Field>
              <Field label="CVC" error={errors.cvc}>
                <input value={card.cvc} onChange={setC('cvc', (v) => v.replace(/\D/g, '').slice(0, 4))} inputMode="numeric" placeholder="123" autoComplete="off" />
              </Field>
            </div>
          </section>
        </div>

        <aside className="summary">
          <h2>Tu pedido</h2>
          <ul className="mini-lines">
            {lines.map((l) => (
              <li key={l.productId}>
                <ProductArt art={l.product.art} />
                <span>{l.product.name}<small>{l.qty} × {money(l.product.priceCents)}</small></span>
                <strong>{money(l.product.priceCents * l.qty)}</strong>
              </li>
            ))}
          </ul>
          <dl>
            <div><dt>Subtotal</dt><dd>{money(cart.subtotalCents)}</dd></div>
            <div><dt>Envío</dt><dd>{shippingCents === 0 ? 'Gratis' : money(shippingCents)}</dd></div>
            <div className="total"><dt>Total</dt><dd>{money(totalCents)}</dd></div>
            <div className="small muted"><dt>IVA incluido (15 %)</dt><dd>{money(ivaIncluded(totalCents))}</dd></div>
          </dl>
          {status.error && <p className="alert error" role="alert">{status.error}</p>}
          <button type="submit" className="btn block" disabled={status.busy || !lines.length}>
            <Lock size={16} /> {status.busy ? 'Procesando pago…' : `Pagar ${money(totalCents)}`}
          </button>
          <p className="muted small center">Pago simulado: no se realiza ningún cobro.</p>
        </aside>
      </form>
    </div>
  );
}
