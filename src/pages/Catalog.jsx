import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '../components/ProductCard.jsx';
import { ErrorBox, Pagination, Spinner } from '../components/ui.jsx';
import { useApi } from '../lib/useApi.js';
import { CATEGORIES, FACETS, SORTS, categoryName, money } from '../../shared/shop.js';

const FILTER_KEYS = ['marca', 'min', 'max', 'disponible', ...FACETS.map((f) => f.key)];

function FacetGroup({ title, values, selected, onToggle }) {
  const [open, setOpen] = useState(false);
  const shown = open ? values : values.slice(0, 7);
  return (
    <fieldset className="facet">
      <legend>{title}</legend>
      {shown.map(({ value, count }) => (
        <label key={value} className="check">
          <input type="checkbox" checked={selected.includes(value)} onChange={() => onToggle(value)} />
          <span>{value}</span>
          <small>{count}</small>
        </label>
      ))}
      {values.length > 7 && (
        <button type="button" className="link-btn" onClick={() => setOpen((o) => !o)}>
          {open ? 'Ver menos' : `Ver ${values.length - 7} más`}
        </button>
      )}
    </fieldset>
  );
}

function PriceFilter({ params, update }) {
  const [min, setMin] = useState(params.get('min') ?? '');
  const [max, setMax] = useState(params.get('max') ?? '');
  useEffect(() => {
    setMin(params.get('min') ?? '');
    setMax(params.get('max') ?? '');
  }, [params]);
  return (
    <form
      className="facet price-filter"
      onSubmit={(e) => {
        e.preventDefault();
        update({ min: min || null, max: max || null });
      }}
    >
      <p className="legend">Precio (USD)</p>
      <div className="price-inputs">
        <input type="number" min="0" step="0.01" inputMode="decimal" placeholder="Mín." value={min} onChange={(e) => setMin(e.target.value)} aria-label="Precio mínimo" />
        <span>–</span>
        <input type="number" min="0" step="0.01" inputMode="decimal" placeholder="Máx." value={max} onChange={(e) => setMax(e.target.value)} aria-label="Precio máximo" />
        <button type="submit" className="btn small secondary">Aplicar</button>
      </div>
    </form>
  );
}

export default function Catalog() {
  const { categoria } = useParams();
  const [params, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const category = CATEGORIES.find((c) => c.slug === categoria);

  const query = useMemo(() => {
    const p = new URLSearchParams(params);
    if (categoria) p.set('categoria', categoria);
    return `/products?${p}`;
  }, [params, categoria]);
  const { data, error, loading, reload } = useApi(query);

  useEffect(() => {
    document.body.classList.toggle('no-scroll', filtersOpen);
    return () => document.body.classList.remove('no-scroll');
  }, [filtersOpen]);

  // React Router no encola cambios de la URL: se parte del último cambio pendiente
  // para que dos clics seguidos no se pisen.
  const pending = useRef(null);
  useEffect(() => {
    pending.current = null;
  }, [params]);
  const edit = (apply) => {
    const next = new URLSearchParams(pending.current ?? params);
    apply(next);
    next.delete('pagina');
    pending.current = next;
    setParams(next);
  };
  const write = (next, key, value) => {
    if (value === null || value === '' || (Array.isArray(value) && !value.length)) next.delete(key);
    else next.set(key, Array.isArray(value) ? value.join(',') : value);
  };
  const update = (changes) => edit((next) => Object.entries(changes).forEach(([key, value]) => write(next, key, value)));
  const selected = (key) => (params.get(key) ?? '').split(',').filter(Boolean);
  const toggle = (key, value) =>
    edit((next) => {
      const current = (next.get(key) ?? '').split(',').filter(Boolean);
      write(next, key, current.includes(value) ? current.filter((v) => v !== value) : [...current, value]);
    });

  const chips = [];
  for (const key of ['marca', ...FACETS.map((f) => f.key)]) for (const v of selected(key)) chips.push({ key, value: v, label: v });
  if (params.get('min') || params.get('max')) chips.push({ key: 'precio', label: `${params.get('min') ? money(params.get('min') * 100) : '$0'} – ${params.get('max') ? money(params.get('max') * 100) : 'más'}` });
  if (params.get('disponible') === '1') chips.push({ key: 'disponible', label: 'Solo disponibles' });
  const removeChip = (chip) => {
    if (chip.key === 'precio') update({ min: null, max: null });
    else if (chip.key === 'disponible') update({ disponible: null });
    else toggle(chip.key, chip.value);
  };
  const clearAll = () => edit((next) => FILTER_KEYS.forEach((key) => next.delete(key)));

  const q = params.get('q');
  const title = q ? `Resultados para «${q}»` : category ? category.name : 'Todo el catálogo';
  const hrefFor = (page) => {
    const next = new URLSearchParams(params);
    next.set('pagina', page);
    return `?${next}`;
  };

  const filters = data && (
    <>
      <div className="facet">
        <p className="legend">Categoría</p>
        <nav className="category-links">
          <Link to={{ pathname: '/catalogo', search: q ? `?q=${encodeURIComponent(q)}` : '' }} className={!categoria ? 'active' : ''}>Todas</Link>
          {CATEGORIES.map((c) => (
            <Link key={c.slug} to={{ pathname: `/catalogo/${c.slug}`, search: q ? `?q=${encodeURIComponent(q)}` : '' }} className={categoria === c.slug ? 'active' : ''}>
              {c.name}
            </Link>
          ))}
        </nav>
      </div>
      <label className="switch-row">
        <input type="checkbox" checked={params.get('disponible') === '1'} onChange={(e) => update({ disponible: e.target.checked ? '1' : null })} />
        <span>Solo disponibles</span>
        <small>{data.facets.disponibles}</small>
      </label>
      <PriceFilter params={params} update={update} />
      {data.facets.marca.length > 1 && <FacetGroup title="Marca" values={data.facets.marca} selected={selected('marca')} onToggle={(v) => toggle('marca', v)} />}
      {data.facets.specs.map((f) => (
        <FacetGroup key={f.key} title={f.label} values={f.values} selected={selected(f.key)} onToggle={(v) => toggle(f.key, v)} />
      ))}
    </>
  );

  return (
    <div className="page catalog">
      <nav className="breadcrumb" aria-label="Ruta">
        <Link to="/">Inicio</Link> <span>›</span> {category ? <><Link to="/catalogo">Catálogo</Link> <span>›</span> {category.name}</> : 'Catálogo'}
      </nav>
      <div className="catalog-head">
        <div>
          <h1>{title}</h1>
          <p className="muted">
            {data ? `${data.total} ${data.total === 1 ? 'producto' : 'productos'}` : 'Buscando…'}
            {category && !q && ` · ${category.blurb}`}
          </p>
        </div>
        <div className="catalog-tools">
          <button type="button" className="btn secondary small filters-toggle" onClick={() => setFiltersOpen(true)}>
            <SlidersHorizontal size={16} /> Filtros{chips.length ? ` (${chips.length})` : ''}
          </button>
          <label className="sort">
            <span>Ordenar por</span>
            <select value={params.get('orden') ?? 'relevancia'} onChange={(e) => update({ orden: e.target.value === 'relevancia' ? null : e.target.value })}>
              {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </label>
        </div>
      </div>

      {chips.length > 0 && (
        <div className="chips">
          {chips.map((chip) => (
            <button key={`${chip.key}-${chip.label}`} type="button" className="chip" onClick={() => removeChip(chip)} aria-label={`Quitar filtro ${chip.label}`}>
              {chip.label} <X size={14} />
            </button>
          ))}
          <button type="button" className="link-btn" onClick={clearAll}>Limpiar filtros</button>
        </div>
      )}

      <div className="catalog-body">
        <aside className="filters desktop-only" aria-label="Filtros">{filters}</aside>
        <section className={`results ${loading ? 'is-loading' : ''}`} aria-live="polite">
          <ErrorBox error={error} onRetry={reload} />
          {!data && loading && <Spinner />}
          {data && data.items.length === 0 && (
            <div className="empty">
              <h2>No encontramos productos</h2>
              <p className="muted">Prueba con otra búsqueda o quita algunos filtros.</p>
              {(chips.length > 0 || q) && <Link to={category ? `/catalogo/${category.slug}` : '/catalogo'} className="btn secondary">Ver todo {category ? `en ${categoryName(category.slug)}` : 'el catálogo'}</Link>}
            </div>
          )}
          {data && data.items.length > 0 && (
            <>
              <div className="product-grid">{data.items.map((p) => <ProductCard key={p.id} product={p} />)}</div>
              <Pagination page={data.page} pages={data.pages} hrefFor={hrefFor} />
            </>
          )}
        </section>
      </div>

      {filtersOpen && (
        <div className="drawer-backdrop" onClick={() => setFiltersOpen(false)}>
          <aside className="drawer right" onClick={(e) => e.stopPropagation()} aria-label="Filtros">
            <div className="drawer-head">
              <strong>Filtros</strong>
              <button type="button" className="icon-btn ghost" onClick={() => setFiltersOpen(false)} aria-label="Cerrar filtros"><X size={20} /></button>
            </div>
            <div className="filters">{filters}</div>
            <div className="drawer-foot">
              <button type="button" className="btn secondary" onClick={clearAll}>Limpiar</button>
              <button type="button" className="btn" onClick={() => setFiltersOpen(false)}>Ver {data?.total ?? ''} productos</button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
