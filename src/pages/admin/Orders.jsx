import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { OrderAddress, OrderItems, OrderTimeline, PaymentInfo, StatusPill } from '../../components/OrderBits.jsx';
import { ErrorBox, Pagination, Spinner, formatDate } from '../../components/ui.jsx';
import { useApi } from '../../lib/useApi.js';
import { api } from '../../lib/api.js';
import { NEXT_STATUSES, ORDER_STATUSES, money, statusLabel } from '../../../shared/shop.js';

function OrderActions({ order, onUpdated }) {
  const [note, setNote] = useState('');
  const [state, setState] = useState({ busy: false, error: null });
  const next = NEXT_STATUSES[order.status] ?? [];
  async function change(status) {
    if (status === 'cancelado' && !window.confirm(`¿Cancelar el pedido ${order.number}? El stock vuelve al inventario.`)) return;
    setState({ busy: true, error: null });
    try {
      const { order: updated } = await api(`/admin/orders/${order.id}/status`, { method: 'PATCH', body: { status, note } });
      setNote('');
      setState({ busy: false, error: null });
      onUpdated(updated);
    } catch (error) {
      setState({ busy: false, error: error.message });
    }
  }
  if (!next.length) return <p className="muted small">Este pedido ya está {statusLabel(order.status).toLowerCase()}: no admite más cambios.</p>;
  return (
    <div className="order-actions">
      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Nota opcional (p. ej. guía de envío)" maxLength={200} aria-label="Nota para el cambio de estado" />
      <div className="actions">
        {next.map((s) => (
          <button key={s} type="button" className={`btn small ${s === 'cancelado' ? 'danger' : ''}`} disabled={state.busy} onClick={() => change(s)}>
            Marcar como {statusLabel(s).toLowerCase()}
          </button>
        ))}
      </div>
      {state.error && <p className="alert error">{state.error}</p>}
    </div>
  );
}

export default function AdminOrders() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const [open, setOpen] = useState(null);
  const { data, error, loading, reload, setData } = useApi(`/admin/orders?${params}`);
  const status = params.get('estado') ?? '';

  const update = (changes) =>
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      for (const [k, v] of Object.entries(changes)) (v ? next.set(k, v) : next.delete(k));
      next.delete('pagina');
      return next;
    });
  const hrefFor = (page) => {
    const next = new URLSearchParams(params);
    next.set('pagina', page);
    return `?${next}`;
  };
  const replace = (order) => setData((d) => ({ ...d, orders: d.orders.map((o) => (o.id === order.id ? order : o)) }));

  return (
    <section>
      <div className="toolbar wrap">
        <div className="segmented small scroll" role="group" aria-label="Estado">
          <button type="button" className={!status ? 'active' : ''} onClick={() => update({ estado: '' })}>Todos</button>
          {ORDER_STATUSES.map((s) => (
            <button key={s.id} type="button" className={status === s.id ? 'active' : ''} onClick={() => update({ estado: s.id })}>
              {s.label}{data?.counts ? ` · ${data.counts[s.id]}` : ''}
            </button>
          ))}
        </div>
        <form className="search inline" onSubmit={(e) => { e.preventDefault(); update({ q: q.trim() }); }}>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="N.º de pedido, cliente o ciudad" aria-label="Buscar pedidos" />
        </form>
      </div>
      <ErrorBox error={error} onRetry={reload} />
      {!data && loading && <Spinner />}
      {data && (
        <>
          <p className="muted small">{data.total} {data.total === 1 ? 'pedido' : 'pedidos'} · los marcados «ejemplo» vienen del seed</p>
          <ul className="admin-orders">
            {data.orders.map((o) => (
              <li key={o.id} className={open === o.id ? 'open' : ''}>
                <button type="button" className="admin-order-row" onClick={() => setOpen(open === o.id ? null : o.id)} aria-expanded={open === o.id}>
                  <span className="o-number"><strong>{o.number}</strong>{o.sample && <small className="tag">ejemplo</small>}</span>
                  <span className="o-date muted small">{formatDate(o.createdAt, true)}</span>
                  <span className="o-customer">{o.customer.name}<small>{o.address.city}</small></span>
                  <StatusPill status={o.status} />
                  <strong className="o-total">{money(o.totalCents)}</strong>
                  <ChevronDown size={18} className="chev" />
                </button>
                {open === o.id && (
                  <div className="admin-order-detail">
                    <OrderTimeline order={o} />
                    <OrderActions order={o} onUpdated={(updated) => { replace(updated); reload(); }} />
                    <div className="detail-grid">
                      <section className="panel"><h3>Productos</h3><OrderItems order={o} /></section>
                      <div className="stack">
                        <section className="panel"><h3>Cliente y entrega</h3><p className="small">{o.customer.email}</p><OrderAddress order={o} /></section>
                        <section className="panel"><h3>Pago</h3><PaymentInfo order={o} /></section>
                        {o.history.some((h) => h.note) && (
                          <section className="panel"><h3>Notas</h3>{o.history.filter((h) => h.note).map((h) => <p key={h.at} className="small">{statusLabel(h.status)}: {h.note} <span className="muted">· {h.by}</span></p>)}</section>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
          {data.orders.length === 0 && <p className="empty muted">No hay pedidos con esos filtros.</p>}
          <Pagination page={data.page} pages={data.pages} hrefFor={hrefFor} />
        </>
      )}
    </section>
  );
}
