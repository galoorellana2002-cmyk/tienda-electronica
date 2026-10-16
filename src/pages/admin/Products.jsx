import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Pencil, Plus, Trash2 } from 'lucide-react';
import ProductArt from '../../components/ProductArt.jsx';
import { ErrorBox, Pagination, Spinner } from '../../components/ui.jsx';
import { useApi } from '../../lib/useApi.js';
import { api } from '../../lib/api.js';
import { CATEGORIES, LOW_STOCK, categoryName, money } from '../../../shared/shop.js';

function StockCell({ product, onSaved }) {
  const [value, setValue] = useState(String(product.stock));
  const [state, setState] = useState('');
  useEffect(() => setValue(String(product.stock)), [product.stock]);
  async function save(body) {
    setState('saving');
    try {
      const { product: updated } = await api(`/admin/products/${product.id}/stock`, { method: 'PATCH', body });
      onSaved(updated.stock);
      setState('saved');
      setTimeout(() => setState(''), 1200);
    } catch (error) {
      setState(error.message);
      setValue(String(product.stock));
    }
  }
  return (
    <div className={`stock-cell ${product.stock === 0 ? 'out' : product.stock <= LOW_STOCK ? 'low' : ''}`}>
      <button type="button" className="icon-btn tiny" onClick={() => save({ delta: -1 })} disabled={product.stock === 0 || state === 'saving'} aria-label={`Restar 1 al stock de ${product.sku}`}>−</button>
      <input
        type="number"
        min="0"
        value={value}
        aria-label={`Stock de ${product.sku}`}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => Number(value) !== product.stock && save({ stock: Number(value) })}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
      />
      <button type="button" className="icon-btn tiny" onClick={() => save({ delta: 1 })} disabled={state === 'saving'} aria-label={`Sumar 1 al stock de ${product.sku}`}>+</button>
      {state === 'saved' && <span className="saved">✓</span>}
      {state && !['saving', 'saved'].includes(state) && <span className="field-error">{state}</span>}
    </div>
  );
}

export default function AdminProducts() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const { data, error, loading, reload, setData } = useApi(`/admin/products?${params}`);
  const [notice, setNotice] = useState(null);

  const update = (changes) =>
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      for (const [k, v] of Object.entries(changes)) (v ? next.set(k, v) : next.delete(k));
      next.delete('pagina');
      return next;
    });
  const patchItem = (id, changes) => setData((d) => ({ ...d, items: d.items.map((p) => (p.id === id ? { ...p, ...changes } : p)) }));

  async function toggleVisible(p) {
    const { product } = await api(`/admin/products/${p.id}/visibility`, { method: 'PATCH', body: { active: !p.active } });
    patchItem(p.id, { active: product.active });
  }
  async function remove(p) {
    if (!window.confirm(`¿Eliminar «${p.name}» (${p.sku})? Los pedidos anteriores conservan su copia del producto.`)) return;
    try {
      await api(`/admin/products/${p.id}`, { method: 'DELETE' });
      setNotice(`Se eliminó ${p.sku}.`);
      reload();
    } catch (err) {
      setNotice(err.message);
    }
  }

  const hrefFor = (page) => {
    const next = new URLSearchParams(params);
    next.set('pagina', page);
    return `?${next}`;
  };

  return (
    <section>
      <div className="toolbar wrap">
        <form className="search inline" onSubmit={(e) => { e.preventDefault(); update({ q: q.trim() }); }}>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre, SKU o marca" aria-label="Buscar productos" />
        </form>
        <select value={params.get('categoria') ?? ''} onChange={(e) => update({ categoria: e.target.value })} aria-label="Categoría">
          <option value="">Todas las categorías</option>
          {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
        <select value={params.get('stock') ?? ''} onChange={(e) => update({ stock: e.target.value })} aria-label="Filtro de stock">
          <option value="">Todo el stock</option>
          <option value="bajo">Stock bajo (1–{LOW_STOCK})</option>
          <option value="agotado">Agotados</option>
          <option value="ocultos">Ocultos en la tienda</option>
        </select>
        <select value={params.get('orden') ?? 'sku'} onChange={(e) => update({ orden: e.target.value === 'sku' ? '' : e.target.value })} aria-label="Ordenar">
          <option value="sku">Ordenar por SKU</option>
          <option value="stock">Menor stock primero</option>
          <option value="vendidos">Más vendidos</option>
          <option value="precio">Mayor precio</option>
          <option value="nuevos">Más recientes</option>
        </select>
        <Link to="/admin/productos/nuevo" className="btn small"><Plus size={16} /> Nuevo producto</Link>
      </div>
      {notice && <p className="alert info" role="status">{notice}</p>}
      <ErrorBox error={error} onRetry={reload} />
      {!data && loading && <Spinner />}
      {data && (
        <>
          <p className="muted small">{data.total} {data.total === 1 ? 'producto' : 'productos'}</p>
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>Producto</th><th>Categoría</th><th className="num">Precio</th><th>Stock</th><th className="num">Vendidos</th><th><span className="sr-only">Acciones</span></th></tr>
              </thead>
              <tbody>
                {data.items.map((p) => (
                  <tr key={p.id} className={p.active ? '' : 'muted-row'}>
                    <td data-label="Producto">
                      <div className="product-cell">
                        <ProductArt art={p.art} />
                        <span><Link to={`/admin/productos/${p.id}`}>{p.name}</Link><small>{p.sku} · {p.brand}{!p.active && ' · Oculto'}</small></span>
                      </div>
                    </td>
                    <td data-label="Categoría">{categoryName(p.category)}</td>
                    <td data-label="Precio" className="num">{money(p.priceCents)}</td>
                    <td data-label="Stock"><StockCell product={p} onSaved={(stock) => patchItem(p.id, { stock })} /></td>
                    <td data-label="Vendidos" className="num">{p.sold}</td>
                    <td className="row-actions">
                      <button type="button" className="icon-btn ghost" onClick={() => toggleVisible(p)} aria-label={p.active ? `Ocultar ${p.sku} de la tienda` : `Mostrar ${p.sku} en la tienda`} title={p.active ? 'Ocultar de la tienda' : 'Mostrar en la tienda'}>
                        {p.active ? <Eye size={17} /> : <EyeOff size={17} />}
                      </button>
                      <Link to={`/admin/productos/${p.id}`} className="icon-btn ghost" aria-label={`Editar ${p.sku}`} title="Editar"><Pencil size={17} /></Link>
                      <button type="button" className="icon-btn ghost danger" onClick={() => remove(p)} aria-label={`Eliminar ${p.sku}`} title="Eliminar"><Trash2 size={17} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.items.length === 0 && <p className="empty muted">No hay productos con esos filtros.</p>}
          <Pagination page={data.page} pages={data.pages} hrefFor={hrefFor} />
        </>
      )}
    </section>
  );
}
