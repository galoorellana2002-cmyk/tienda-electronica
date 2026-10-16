import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import ProductArt from '../components/ProductArt.jsx';
import { Price, QtyStepper, StockBadge } from '../components/ui.jsx';
import { useCart } from '../lib/cart.jsx';
import { useAuth } from '../lib/auth.jsx';
import { FREE_SHIPPING_FROM, ivaIncluded, money } from '../../shared/shop.js';

export default function Cart() {
  const cart = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    cart.refresh().catch(() => {});
    // Solo al abrir el carrito: trae precios y stock actualizados.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!cart.items.length) {
    return (
      <div className="page narrow empty">
        <h1>Tu carrito está vacío</h1>
        <p className="muted">Agrega placas, sensores o componentes y aparecerán aquí. El carrito se guarda aunque cierres el navegador.</p>
        <Link to="/catalogo" className="btn">Ir al catálogo</Link>
      </div>
    );
  }

  const problems = cart.items.filter((i) => i.unavailable || (i.product && i.qty > i.product.stock));
  const missing = FREE_SHIPPING_FROM - cart.subtotalCents;

  return (
    <div className="page cart-page">
      <h1>Carrito</h1>
      <div className="two-col">
        <section aria-label="Productos en el carrito">
          <ul className="cart-lines">
            {cart.items.map((line) => {
              const p = line.product;
              return (
                <li key={line.productId} className={`cart-line ${line.unavailable ? 'unavailable' : ''}`}>
                  {p ? (
                    <>
                      <Link to={`/producto/${p.slug}`} className="line-art"><ProductArt art={p.art} title={p.name} /></Link>
                      <div className="line-info">
                        <Link to={`/producto/${p.slug}`} className="line-name">{p.name}</Link>
                        <p className="muted small">{p.sku} · <Price cents={p.priceCents} /> c/u</p>
                        {line.unavailable ? <span className="stock out">Ya no está disponible</span> : <StockBadge stock={p.stock} short />}
                        {!line.unavailable && line.qty > p.stock && p.stock > 0 && <p className="warn small">Solo quedan {p.stock}. Ajusta la cantidad.</p>}
                      </div>
                      <div className="line-actions">
                        {!line.unavailable && p.stock > 0 && <QtyStepper value={line.qty} max={Math.min(99, Math.max(p.stock, 1))} onChange={(q) => cart.setQty(line.productId, q)} size="small" />}
                        <Price cents={p.priceCents * line.qty} className="line-total" />
                        <button type="button" className="icon-btn ghost" onClick={() => cart.remove(line.productId)} aria-label={`Quitar ${p.name}`}><Trash2 size={18} /></button>
                      </div>
                    </>
                  ) : (
                    <div className="line-info">Cargando producto…</div>
                  )}
                </li>
              );
            })}
          </ul>
          <button type="button" className="link-btn" onClick={cart.clear}>Vaciar carrito</button>
        </section>

        <aside className="summary">
          <h2>Resumen</h2>
          {missing > 0 ? (
            <div className="free-ship">
              <p>Te faltan <strong>{money(missing)}</strong> para el envío estándar gratis.</p>
              <div className="bar"><span style={{ width: `${Math.min(100, (cart.subtotalCents / FREE_SHIPPING_FROM) * 100)}%` }} /></div>
            </div>
          ) : (
            <p className="free-ship ok">Tu pedido tiene envío estándar gratis.</p>
          )}
          <dl>
            <div><dt>Subtotal ({cart.count} {cart.count === 1 ? 'artículo' : 'artículos'})</dt><dd>{money(cart.subtotalCents)}</dd></div>
            <div><dt>Envío</dt><dd className="muted">Se calcula al pagar</dd></div>
            <div className="small muted"><dt>IVA incluido (15 %)</dt><dd>{money(ivaIncluded(cart.subtotalCents))}</dd></div>
          </dl>
          {problems.length > 0 && <p className="warn small">Revisa los productos marcados antes de continuar.</p>}
          <button
            type="button"
            className="btn block"
            disabled={problems.length > 0}
            onClick={() => navigate(user ? '/checkout' : '/ingresar?volver=/checkout')}
          >
            {user ? 'Continuar con la compra' : 'Inicia sesión para comprar'}
          </button>
          <Link to="/catalogo" className="btn-link center">Seguir comprando</Link>
        </aside>
      </div>
    </div>
  );
}
