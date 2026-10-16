import { Check } from 'lucide-react';
import ProductArt from './ProductArt.jsx';
import { formatDate } from './ui.jsx';
import { money, statusLabel } from '../../shared/shop.js';

export const StatusPill = ({ status }) => <span className={`pill status-${status}`}>{statusLabel(status)}</span>;

const FLOW = ['pagado', 'preparando', 'enviado', 'entregado'];

export function OrderTimeline({ order }) {
  if (order.status === 'cancelado') {
    const at = order.history.find((h) => h.status === 'cancelado')?.at;
    return <p className="alert error">Pedido cancelado{at ? ` el ${formatDate(at, true)}` : ''}. El stock se devolvió al inventario.</p>;
  }
  const reached = FLOW.indexOf(order.status);
  return (
    <ol className="timeline">
      {FLOW.map((step, i) => {
        const entry = order.history.find((h) => h.status === step);
        return (
          <li key={step} className={i <= reached ? 'done' : ''}>
            <span className="dot">{i <= reached && <Check size={12} />}</span>
            <strong>{statusLabel(step)}</strong>
            <small>{entry ? formatDate(entry.at, true) : '—'}</small>
          </li>
        );
      })}
    </ol>
  );
}

export function OrderItems({ order }) {
  return (
    <>
      <ul className="mini-lines">
        {order.items.map((item) => (
          <li key={item.productId}>
            <ProductArt art={item.art} />
            <span>{item.name}<small>{item.sku} · {item.qty} × {money(item.priceCents)}</small></span>
            <strong>{money(item.priceCents * item.qty)}</strong>
          </li>
        ))}
      </ul>
      <dl className="totals">
        <div><dt>Subtotal</dt><dd>{money(order.subtotalCents)}</dd></div>
        <div><dt>{order.shipping.name}</dt><dd>{order.shippingCents === 0 ? 'Gratis' : money(order.shippingCents)}</dd></div>
        <div className="total"><dt>Total</dt><dd>{money(order.totalCents)}</dd></div>
        <div className="small muted"><dt>IVA incluido (15 %)</dt><dd>{money(order.ivaCents)}</dd></div>
      </dl>
    </>
  );
}

export function OrderAddress({ order }) {
  const a = order.address;
  return (
    <div className="address">
      <p><strong>{a.fullName}</strong></p>
      <p>{order.shipping.method === 'retiro' ? 'Retiro en tienda · Av. Amazonas y Naciones Unidas, Quito' : `${a.street}${a.reference ? ` (${a.reference})` : ''}`}</p>
      {order.shipping.method !== 'retiro' && <p>{a.city}, {a.province}</p>}
      <p className="muted small">Cédula {a.cedula} · Cel. {a.phone}</p>
    </div>
  );
}

export function PaymentInfo({ order }) {
  const p = order.payment;
  return (
    <div className="address">
      <p><strong>{p.brand} •••• {p.last4}</strong></p>
      <p className="muted small">Autorización {p.authCode} · {formatDate(p.paidAt, true)}</p>
      <p className="muted small">{p.provider}: pago simulado, no se realizó ningún cobro.</p>
    </div>
  );
}
