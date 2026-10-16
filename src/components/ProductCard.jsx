import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import ProductArt from './ProductArt.jsx';
import { Price, StockBadge } from './ui.jsx';
import { useCart } from '../lib/cart.jsx';

export default function ProductCard({ product }) {
  const cart = useCart();
  const inCart = cart.items.find((i) => i.productId === product.id)?.qty ?? 0;
  const soldOut = product.stock <= 0;
  return (
    <article className="product-card">
      <Link to={`/producto/${product.slug}`} className="card-link" aria-label={product.name}>
        <ProductArt art={product.art} title={product.name} />
      </Link>
      <div className="card-body">
        <p className="card-meta">{product.brand} · {product.sku}</p>
        <h3 className="card-title">
          <Link to={`/producto/${product.slug}`}>{product.name}</Link>
        </h3>
        {product.highlights?.length > 0 && (
          <p className="card-specs">{product.highlights.map((s) => `${s.label}: ${s.value}`).join(' · ')}</p>
        )}
        <div className="card-foot">
          <div>
            <Price cents={product.priceCents} />
            <StockBadge stock={product.stock} short />
          </div>
          <button
            type="button"
            className="icon-btn add"
            disabled={soldOut || inCart >= Math.min(99, product.stock)}
            onClick={() => cart.add(product, 1)}
            aria-label={soldOut ? 'Producto agotado' : `Agregar ${product.name} al carrito`}
            title={soldOut ? 'Agotado' : 'Agregar al carrito'}
          >
            <ShoppingBag size={18} />
            {inCart > 0 && <span className="in-cart">{inCart}</span>}
          </button>
        </div>
      </div>
    </article>
  );
}
