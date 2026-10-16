import { Link, Navigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import ProductArt from '../components/ProductArt.jsx';
import { StatusPill } from '../components/OrderBits.jsx';
import { ErrorBox, Spinner, formatDate } from '../components/ui.jsx';
import { useApi } from '../lib/useApi.js';
import { useAuth } from '../lib/auth.jsx';
import { money } from '../../shared/shop.js';

export default function Orders() {
  const { user } = useAuth();
  const { data, error, loading, reload } = useApi(user ? '/orders' : null);
  if (!user) return <Navigate to="/ingresar?volver=/cuenta/pedidos" replace />;
  return (
    <div className="page narrow">
      <h1>Mis pedidos</h1>
      <p className="muted">Hola, {user.name}. Aquí ves el estado de tus compras.</p>
      <ErrorBox error={error} onRetry={reload} />
      {loading && !data && <Spinner />}
      {data && data.orders.length === 0 && (
        <div className="empty">
          <h2>Aún no tienes pedidos</h2>
          <Link to="/catalogo" className="btn">Explorar el catálogo</Link>
        </div>
      )}
      {data && data.orders.length > 0 && (
        <ul className="order-list">
          {data.orders.map((o) => (
            <li key={o.id}>
              <Link to={`/cuenta/pedidos/${o.id}`} className="order-row">
                <div className="order-arts">{o.items.slice(0, 3).map((i) => <ProductArt key={i.productId} art={i.art} />)}</div>
                <div className="order-main">
                  <strong>Pedido {o.number}</strong>
                  <span className="muted small">{formatDate(o.createdAt)} · {o.items.reduce((s, i) => s + i.qty, 0)} artículos</span>
                </div>
                <StatusPill status={o.status} />
                <strong className="order-total">{money(o.totalCents)}</strong>
                <ChevronRight size={18} className="muted" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
