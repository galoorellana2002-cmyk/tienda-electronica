import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import ProductArt from '../../components/ProductArt.jsx';
import { ErrorBox, Spinner } from '../../components/ui.jsx';
import { useApi } from '../../lib/useApi.js';
import { api } from '../../lib/api.js';
import { CATEGORIES, FACETS } from '../../../shared/shop.js';

const EMPTY = { name: '', sku: '', brand: '', category: 'sensores', description: '', price: '', stock: '0', specs: [{ label: 'Voltaje', value: '' }, { label: 'Interfaz', value: '' }], tags: '', featured: false, active: true };

export default function ProductForm() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const { data, error, loading } = useApi(isNew ? null : `/admin/products/${id}`);
  const [form, setForm] = useState(EMPTY);
  const [state, setState] = useState({ busy: false, error: null });

  useEffect(() => {
    if (!data?.product) return;
    const p = data.product;
    setForm({ name: p.name, sku: p.sku, brand: p.brand, category: p.category, description: p.description ?? '', price: (p.priceCents / 100).toFixed(2), stock: String(p.stock), specs: p.specs.length ? p.specs : EMPTY.specs, tags: (p.tags ?? []).join(', '), featured: Boolean(p.featured), active: p.active !== false });
  }, [data]);

  if (!isNew && loading) return <Spinner />;
  if (!isNew && error) return <ErrorBox error={error} />;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const setSpec = (i, key, value) => setForm((f) => ({ ...f, specs: f.specs.map((s, j) => (j === i ? { ...s, [key]: value } : s)) }));

  async function submit(e) {
    e.preventDefault();
    setState({ busy: true, error: null });
    try {
      const body = { ...form, price: Number(form.price), stock: Number(form.stock), specs: form.specs.filter((s) => s.label.trim() && s.value.trim()) };
      await api(isNew ? '/admin/products' : `/admin/products/${id}`, { method: isNew ? 'POST' : 'PUT', body });
      navigate('/admin/productos', { replace: true });
    } catch (err) {
      setState({ busy: false, error: err.message });
    }
  }

  return (
    <form className="product-form" onSubmit={submit}>
      <div className="form-head">
        <Link to="/admin/productos" className="btn-link">‹ Productos</Link>
        <h2>{isNew ? 'Nuevo producto' : `Editar ${data?.product?.sku ?? ''}`}</h2>
      </div>
      <div className="two-col">
        <div className="stack">
          <section className="panel form-grid">
            <label className="field span-2"><span className="field-label">Nombre</span><input value={form.name} onChange={set('name')} required minLength={3} maxLength={140} /></label>
            <label className="field"><span className="field-label">SKU</span><input value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value.toUpperCase() }))} required pattern="[A-Za-z0-9\-]{3,20}" placeholder="SEN-100" /></label>
            <label className="field"><span className="field-label">Marca</span><input value={form.brand} onChange={set('brand')} placeholder="Genérico" maxLength={40} /></label>
            <label className="field"><span className="field-label">Categoría</span>
              <select value={form.category} onChange={set('category')}>{CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select>
            </label>
            <label className="field"><span className="field-label">Precio (USD, IVA incluido)</span><input type="number" min="0.01" step="0.01" value={form.price} onChange={set('price')} required /></label>
            <label className="field"><span className="field-label">Stock</span><input type="number" min="0" step="1" value={form.stock} onChange={set('stock')} required /></label>
            <label className="field"><span className="field-label">Etiquetas de búsqueda</span><input value={form.tags} onChange={set('tags')} placeholder="sensor, temperatura" /></label>
            <label className="field span-2"><span className="field-label">Descripción</span><textarea rows={4} value={form.description} onChange={set('description')} maxLength={1200} /></label>
            <label className="check span-2"><input type="checkbox" checked={form.active} onChange={set('active')} /> <span>Visible en la tienda</span></label>
            <label className="check span-2"><input type="checkbox" checked={form.featured} onChange={set('featured')} /> <span>Destacado en la portada</span></label>
          </section>

          <section className="panel">
            <h3>Especificaciones técnicas</h3>
            <p className="muted small">Las especificaciones llamadas {FACETS.map((f) => `«${f.label}»`).join(', ')} se usan como filtros del catálogo. Separa varios valores con « / », por ejemplo «I2C / SPI».</p>
            <div className="spec-rows">
              {form.specs.map((s, i) => (
                <div key={i} className="spec-row">
                  <input value={s.label} onChange={(e) => setSpec(i, 'label', e.target.value)} placeholder="Nombre (p. ej. Voltaje)" aria-label={`Nombre de la especificación ${i + 1}`} list="spec-labels" />
                  <input value={s.value} onChange={(e) => setSpec(i, 'value', e.target.value)} placeholder="Valor (p. ej. 3.3 V / 5 V)" aria-label={`Valor de la especificación ${i + 1}`} />
                  <button type="button" className="icon-btn ghost" onClick={() => setForm((f) => ({ ...f, specs: f.specs.filter((_, j) => j !== i) }))} aria-label={`Quitar especificación ${i + 1}`}><X size={16} /></button>
                </div>
              ))}
              <datalist id="spec-labels">{[...FACETS.map((f) => f.label), 'Corriente', 'Rango', 'Precisión', 'Resistencia', 'Capacitancia', 'Unidades'].map((l) => <option key={l} value={l} />)}</datalist>
            </div>
            <button type="button" className="btn small secondary" onClick={() => setForm((f) => ({ ...f, specs: [...f.specs, { label: '', value: '' }] }))} disabled={form.specs.length >= 24}>
              <Plus size={16} /> Añadir especificación
            </button>
          </section>
        </div>
        <aside className="summary">
          <ProductArt art={data?.product && data.product.category === form.category ? data.product.art : { kind: { microcontroladores: 'board', sensores: 'sensor', modulos: 'module', pantallas: 'display', resistencias: 'resistor', capacitores: 'capacitor', semiconductores: 'chip', leds: 'led', 'cables-conectores': 'cable', motores: 'motor', fuentes: 'power', herramientas: 'tool' }[form.category] }} />
          <p className="muted small">La ilustración se genera según la categoría.</p>
          {state.error && <p className="alert error" role="alert">{state.error}</p>}
          <button type="submit" className="btn block" disabled={state.busy}>{state.busy ? 'Guardando…' : isNew ? 'Crear producto' : 'Guardar cambios'}</button>
          <Link to="/admin/productos" className="btn secondary block">Cancelar</Link>
        </aside>
      </div>
    </form>
  );
}
