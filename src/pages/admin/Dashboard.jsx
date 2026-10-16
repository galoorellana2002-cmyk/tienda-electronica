import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { TriangleAlert } from 'lucide-react';
import ProductArt from '../../components/ProductArt.jsx';
import { ErrorBox, Spinner } from '../../components/ui.jsx';
import { useApi } from '../../lib/useApi.js';
import { api } from '../../lib/api.js';
import { money, statusLabel } from '../../../shared/shop.js';

function Delta({ now, before }) {
  if (!before) return <span className="delta muted">sin datos previos</span>;
  const pct = Math.round(((now - before) / before) * 100);
  if (pct === 0) return <span className="delta muted">igual que el periodo anterior</span>;
  return <span className={`delta ${pct >= 0 ? 'up' : 'down'}`}>{pct >= 0 ? '▲' : '▼'} {Math.abs(pct)} % vs. periodo anterior</span>;
}

// El SVG se dibuja al ancho real del contenedor para que el texto no se encoja en celular.
function useWidth(fallback) {
  const ref = useRef(null);
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    if (!ref.current) return undefined;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width) || fallback));
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [fallback]);
  return [ref, width];
}

function SalesChart({ daily }) {
  const [hover, setHover] = useState(null);
  const [ref, W] = useWidth(720);
  const H = W < 500 ? 200 : 240;
  const pad = { l: 44, r: 8, t: 12, b: 26 };
  const max = Math.max(1, ...daily.map((d) => d.cents));
  const step = Math.pow(10, Math.floor(Math.log10(max / 100))) * 100;
  const top = Math.ceil(max / step) * step;
  const slot = (W - pad.l - pad.r) / daily.length;
  const barW = Math.max(2, Math.min(18, slot - 2));
  const y = (c) => pad.t + (H - pad.t - pad.b) * (1 - c / top);
  const ticks = [0, 0.5, 1].map((f) => Math.round(top * f));
  const labelEvery = Math.ceil(daily.length / Math.max(3, Math.floor(W / 90)));
  const day = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString('es-EC', { day: 'numeric', month: 'short' });
  return (
    <div className="chart" ref={ref}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Ventas diarias del periodo">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} className="grid" />
            <text x={pad.l - 6} y={y(t) + 4} textAnchor="end" className="axis">{t >= 100000 ? `$${Math.round(t / 100000)}k` : `$${Math.round(t / 100)}`}</text>
          </g>
        ))}
        {daily.map((d, i) => {
          const x = pad.l + i * slot + (slot - barW) / 2;
          const h = Math.max(d.cents ? 2 : 0, H - pad.b - y(d.cents));
          return (
            <g key={d.date} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} tabIndex={0}>
              <rect x={pad.l + i * slot} y={pad.t} width={slot} height={H - pad.t - pad.b} fill="transparent" />
              {h > 0 && <path d={`M${x} ${H - pad.b} v${-(h - Math.min(4, h))} q0 -${Math.min(4, h)} ${Math.min(4, barW / 2)} -${Math.min(4, h)} h${barW - 2 * Math.min(4, barW / 2)} q${Math.min(4, barW / 2)} 0 ${Math.min(4, barW / 2)} ${Math.min(4, h)} V${H - pad.b} z`} className={`bar ${hover === i ? 'active' : ''}`} />}
              {i % labelEvery === 0 && <text x={x + barW / 2} y={H - 8} textAnchor="middle" className="axis">{day(d.date)}</text>}
            </g>
          );
        })}
      </svg>
      {hover !== null && (
        <div className="chart-tip" style={{ left: `${((pad.l + hover * slot + slot / 2) / W) * 100}%` }}>
          <strong>{day(daily[hover].date)}</strong>
          <span>{money(daily[hover].cents)} · {daily[hover].orders} {daily[hover].orders === 1 ? 'pedido' : 'pedidos'}</span>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [days, setDays] = useState(30);
  const { data, error, loading, reload } = useApi(`/admin/stats?dias=${days}`);
  const [busy, setBusy] = useState(null);

  async function restock(id) {
    setBusy(id);
    try {
      await api(`/admin/products/${id}/stock`, { method: 'PATCH', body: { delta: 20 } });
      reload();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="dashboard">
      <div className="toolbar">
        <div className="segmented small" role="group" aria-label="Periodo">
          {[7, 30, 90].map((d) => (
            <button key={d} type="button" className={days === d ? 'active' : ''} onClick={() => setDays(d)}>{d} días</button>
          ))}
        </div>
        {data && <span className="muted small">{data.catalogCount} productos en catálogo · {data.pending} pedidos por despachar</span>}
      </div>
      <ErrorBox error={error} onRetry={reload} />
      {!data && loading && <Spinner />}
      {data && (
        <>
          <div className="kpis">
            <div className="kpi"><span>Ventas</span><strong>{money(data.revenueCents)}</strong><Delta now={data.revenueCents} before={data.previousRevenueCents} /></div>
            <div className="kpi"><span>Pedidos</span><strong>{data.orders}</strong><Delta now={data.orders} before={data.previousOrders} /></div>
            <div className="kpi"><span>Ticket promedio</span><strong>{money(data.avgTicketCents)}</strong><span className="delta muted">por pedido</span></div>
            <div className="kpi"><span>Unidades vendidas</span><strong>{data.unitsSold}</strong><span className="delta muted">sin pedidos cancelados</span></div>
          </div>

          <section className="panel">
            <div className="panel-head"><h2>Ventas diarias</h2><span className="muted small">Últimos {data.days} días · USD con IVA</span></div>
            <SalesChart daily={data.daily} />
          </section>

          <div className="detail-grid">
            <section className="panel">
              <div className="panel-head"><h2>Productos más vendidos</h2><span className="muted small">Unidades en {data.days} días</span></div>
              {data.topProducts.length === 0 ? <p className="muted">Sin ventas en este periodo.</p> : (
                <ol className="rank">
                  {data.topProducts.map((p) => (
                    <li key={p.productId}>
                      <ProductArt art={p.art} />
                      <div>
                        <span className="rank-name">{p.name}</span>
                        <span className="rank-bar"><span style={{ width: `${(p.qty / data.topProducts[0].qty) * 100}%` }} /></span>
                      </div>
                      <span className="rank-value"><strong>{p.qty}</strong><small>{money(p.cents)}</small></span>
                    </li>
                  ))}
                </ol>
              )}
            </section>
            <section className="panel">
              <div className="panel-head">
                <h2><TriangleAlert size={18} className="warn-icon" /> Stock bajo</h2>
                <Link to="/admin/productos?stock=bajo" className="btn-link small">Ver {data.lowStockCount} ›</Link>
              </div>
              {data.lowStock.length === 0 ? <p className="muted">Todo el catálogo tiene stock suficiente.</p> : (
                <ul className="low-stock">
                  {data.lowStock.map((p) => (
                    <li key={p.id}>
                      <ProductArt art={p.art} />
                      <span className="rank-name"><Link to={`/admin/productos/${p.id}`}>{p.name}</Link><small>{p.sku}</small></span>
                      <span className={`stock ${p.stock === 0 ? 'out' : 'low'}`}>{p.stock === 0 ? 'Agotado' : `${p.stock} u.`}</span>
                      <button type="button" className="btn small secondary" disabled={busy === p.id} onClick={() => restock(p.id)}>+20</button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <section className="panel">
            <div className="panel-head"><h2>Pedidos por estado</h2><Link to="/admin/pedidos" className="btn-link small">Gestionar pedidos ›</Link></div>
            <div className="status-counts">
              {Object.entries(data.byStatus).map(([s, n]) => (
                <Link key={s} to={`/admin/pedidos?estado=${s}`} className={`status-count status-${s}`}><strong>{n}</strong><span>{statusLabel(s)}</span></Link>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
