import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Check, Store, Truck } from 'lucide-react';
import ProductArt from '../components/ProductArt.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { ErrorBox, Price, QtyStepper, Spinner, StockBadge } from '../components/ui.jsx';
import { useApi } from '../lib/useApi.js';
import { useCart } from '../lib/cart.jsx';
import { FREE_SHIPPING_FROM, categoryName, ivaIncluded, money } from '../../shared/shop.js';

export default function Product() {
  const { slug } = useParams();
  const { data, error, loading, reload } = useApi(`/products/${slug}`);
  const cart = useCart();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  useEffect(() => setQty(1), [slug]);
  useEffect(() => {
    if (data?.product) document.title = `${data.product.name} · Circuito Andino`;
    return () => { document.title = 'Circuito Andino · Componentes electrónicos'; };
  }, [data]);

  if (loading && !data) return <div className="page"><Spinner /></div>;
  if (error) {
    return (
      <div className="page">
        <ErrorBox error={error} onRetry={error.status === 404 ? undefined : reload} />
        <Link to="/catalogo" className="btn secondary">Volver al catálogo</Link>
      </div>
    );
  }
  const { product, related } = data;
  const inCart = cart.items.find((i) => i.productId === product.id)?.qty ?? 0;
  const max = Math.max(0, Math.min(99, product.stock) - inCart);
  const soldOut = product.stock <= 0;

  return (
    <div className="page product-page">
      <nav className="breadcrumb" aria-label="Ruta">
        <Link to="/">Inicio</Link> <span>›</span> <Link to={`/catalogo/${product.category}`}>{categoryName(product.category)}</Link> <span>›</span> <span className="crumb-current">{product.name}</span>
      </nav>
      <div className="product-main">
        <div className="product-visual">
          <ProductArt art={product.art} title={product.name} />
        </div>
        <div className="product-info">
          <p className="eyebrow">{product.brand}</p>
          <h1>{product.name}</h1>
          <p className="muted sku">SKU {product.sku}</p>
          <div className="buy-box">
            <Price cents={product.priceCents} className="big" />
            <p className="muted small">IVA incluido ({money(ivaIncluded(product.priceCents))})</p>
            <StockBadge stock={product.stock} />
            {!soldOut && (
              <div className="buy-row">
                {max > 0 && <QtyStepper value={Math.min(qty, max)} max={max} onChange={setQty} />}
                <button type="button" className="btn" disabled={max === 0} onClick={() => cart.add(product, Math.min(qty, max))}>
                  {max === 0 ? 'Ya tienes todo el stock en el carrito' : 'Agregar al carrito'}
                </button>
                {max > 0 && (
                  <button type="button" className="btn secondary" onClick={() => { cart.add(product, Math.min(qty, max)); navigate('/carrito'); }}>
                    Comprar ahora
                  </button>
                )}
              </div>
            )}
            {inCart > 0 && <p className="in-cart-note"><Check size={16} /> Tienes {inCart} en el <Link to="/carrito">carrito</Link>.</p>}
            <ul className="ship-notes">
              <li><Truck size={16} /> Envío estándar a todo Ecuador: gratis desde {money(FREE_SHIPPING_FROM)}.</li>
              <li><Store size={16} /> Retiro gratis en Quito (Av. Amazonas y Naciones Unidas).</li>
            </ul>
          </div>
          <p className="description">{product.description}</p>
        </div>
      </div>

      <section className="section specs-section">
        <h2>Especificaciones técnicas</h2>
        <table className="specs-table">
          <tbody>
            <tr><th scope="row">SKU</th><td>{product.sku}</td></tr>
            <tr><th scope="row">Marca</th><td>{product.brand}</td></tr>
            <tr><th scope="row">Categoría</th><td>{categoryName(product.category)}</td></tr>
            {product.specs.map((s) => (
              <tr key={s.label}><th scope="row">{s.label}</th><td>{s.value}</td></tr>
            ))}
          </tbody>
        </table>
      </section>

      {related.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2>Productos relacionados</h2>
            <Link to={`/catalogo/${product.category}`} className="btn-link">Ver {categoryName(product.category).toLowerCase()} ›</Link>
          </div>
          <div className="product-grid scroller">{related.map((p) => <ProductCard key={p.id} product={p} />)}</div>
        </section>
      )}
    </div>
  );
}
