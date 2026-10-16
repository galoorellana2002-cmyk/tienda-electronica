import { Link } from 'react-router-dom';
import { Minus, Plus } from 'lucide-react';
import { LOW_STOCK, money } from '../../shared/shop.js';

export const Price = ({ cents, className = '' }) => <span className={`price ${className}`}>{money(cents)}</span>;

export function StockBadge({ stock, short = false }) {
  if (stock <= 0) return <span className="stock out">Agotado</span>;
  if (stock <= LOW_STOCK) return <span className="stock low">{short ? `Quedan ${stock}` : `Últimas ${stock} unidades`}</span>;
  return <span className="stock ok">{short ? 'En stock' : `En stock (${stock} disponibles)`}</span>;
}

export function QtyStepper({ value, max = 99, onChange, label = 'Cantidad', size = '' }) {
  return (
    <div className={`stepper ${size}`} role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Quitar una unidad">
        <Minus size={16} />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        max={max}
        value={value}
        aria-label={label}
        onChange={(e) => {
          const n = Number.parseInt(e.target.value, 10);
          if (Number.isInteger(n)) onChange(Math.max(1, Math.min(max, n)));
        }}
      />
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Añadir una unidad">
        <Plus size={16} />
      </button>
    </div>
  );
}

export function Pagination({ page, pages, hrefFor }) {
  if (pages <= 1) return null;
  const numbers = [];
  for (let n = 1; n <= pages; n += 1) {
    if (n === 1 || n === pages || Math.abs(n - page) <= 1) numbers.push(n);
    else if (numbers[numbers.length - 1] !== '…') numbers.push('…');
  }
  return (
    <nav className="pagination" aria-label="Paginación">
      {page > 1 ? <Link to={hrefFor(page - 1)} className="page-btn">‹ Anterior</Link> : <span className="page-btn disabled">‹ Anterior</span>}
      <span className="page-numbers">
        {numbers.map((n, i) =>
          n === '…' ? <span key={`e${i}`} className="page-gap">…</span> : (
            <Link key={n} to={hrefFor(n)} className={`page-num ${n === page ? 'current' : ''}`} aria-current={n === page ? 'page' : undefined}>
              {n}
            </Link>
          ),
        )}
      </span>
      {page < pages ? <Link to={hrefFor(page + 1)} className="page-btn">Siguiente ›</Link> : <span className="page-btn disabled">Siguiente ›</span>}
    </nav>
  );
}

export const Spinner = ({ label = 'Cargando…' }) => (
  <div className="spinner" role="status">
    <span className="spinner-dot" />
    {label}
  </div>
);

export function ErrorBox({ error, onRetry }) {
  if (!error) return null;
  return (
    <div className="alert error" role="alert">
      <span>{error.message}</span>
      {onRetry && <button type="button" className="link-btn" onClick={onRetry}>Reintentar</button>}
    </div>
  );
}

export const formatDate = (iso, withTime = false) =>
  new Date(iso).toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'America/Guayaquil', ...(withTime && { hour: '2-digit', minute: '2-digit' }) });
