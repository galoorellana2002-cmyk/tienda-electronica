import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { CircleCheck } from 'lucide-react';
import { OrderAddress, OrderItems, OrderTimeline, PaymentInfo, StatusPill } from '../components/OrderBits.jsx';
import { ErrorBox, Spinner, formatDate } from '../components/ui.jsx';
import { useApi } from '../lib/useApi.js';
import { useAuth } from '../lib/auth.jsx';

export default function OrderDetail() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { user } = useAuth();
  const { data, error, loading, reload } = useApi(user ? `/orders/${id}` : null);
  if (!user) return <Navigate to={`/ingresar?volver=/cuenta/pedidos/${id}`} replace />;
  if (loading && !data) return <div className="page narrow"><Spinner /></div>;
  if (error) return <div className="page narrow"><ErrorBox error={error} onRetry={error.status === 404 ? undefined : reload} /><Link to="/cuenta/pedidos" className="btn secondary">Ver mis pedidos</Link></div>;
  const { order } = data;
  return (
    <div className="page narrow order-detail">
      {params.get('nuevo') && (
        <div className="success-banner">
          <CircleCheck size={28} />
          <div>
            <h1>¡Gracias por tu compra!</h1>
            <p>El pago de prueba fue aprobado y tu pedido <strong>{order.number}</strong> quedó registrado. Te avisaremos cuando salga a despacho.</p>
          </div>
        </div>
      )}
      <nav className="breadcrumb" aria-label="Ruta"><Link to="/cuenta/pedidos">Mis pedidos</Link> <span>›</span> {order.number}</nav>
      <div className="order-head">
        <div>
          <h2>Pedido {order.number}</h2>
          <p className="muted">Realizado el {formatDate(order.createdAt, true)}</p>
        </div>
        <StatusPill status={order.status} />
      </div>
      <OrderTimeline order={order} />
      <div className="detail-grid">
        <section className="panel"><h3>Productos</h3><OrderItems order={order} /></section>
        <div className="stack">
          <section className="panel"><h3>Entrega</h3><OrderAddress order={order} /></section>
          <section className="panel"><h3>Pago</h3><PaymentInfo order={order} /></section>
        </div>
      </div>
      <Link to="/catalogo" className="btn secondary">Seguir comprando</Link>
    </div>
  );
}
