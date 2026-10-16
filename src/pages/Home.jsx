import { Link } from 'react-router-dom';
import { ChevronRight, CreditCard, ShieldCheck, Truck } from 'lucide-react';
import ProductCard from '../components/ProductCard.jsx';
import ProductArt from '../components/ProductArt.jsx';
import { ErrorBox, Spinner } from '../components/ui.jsx';
import { useApi } from '../lib/useApi.js';
import { FREE_SHIPPING_FROM, money } from '../../shared/shop.js';

const CATEGORY_ART = {
  microcontroladores: { kind: 'board', color: '#00878f', label: 'ESP32' }, sensores: { kind: 'sensor', variant: 'distancia' },
  modulos: { kind: 'module', color: '#1565c0', variant: 'relé' }, pantallas: { kind: 'display', color: '#0d47a1', variant: 'oled' },
  resistencias: { kind: 'resistor', ohms: 4700, kit: true }, capacitores: { kind: 'capacitor', variant: 'electrolytic', label: '470µF' },
  semiconductores: { kind: 'chip', variant: 'dip', pins: 8, label: 'NE555' }, leds: { kind: 'led', color: 'rgb' },
  'cables-conectores': { kind: 'cable' }, motores: { kind: 'motor', variant: 'servo' }, fuentes: { kind: 'battery' }, herramientas: { kind: 'tool', variant: 'meter' },
};

export default function Home() {
  const { data, error, loading, reload } = useApi('/products/home');
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Componentes electrónicos · Ecuador</p>
          <h1>Todo para tu próximo circuito.</h1>
          <p className="hero-sub">
            {data ? `${data.total} productos` : 'Más de 300 productos'} con especificaciones técnicas completas: placas, sensores, módulos y todo lo que va en el protoboard.
          </p>
          <div className="hero-actions">
            <Link to="/catalogo" className="btn">Ver el catálogo</Link>
            <Link to="/catalogo/microcontroladores" className="btn-link light">Placas de desarrollo <ChevronRight size={16} /></Link>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <ProductArt art={{ kind: 'board', color: '#00878f', label: 'ESP32-S3' }} />
          <ProductArt art={{ kind: 'sensor', variant: 'distancia' }} />
          <ProductArt art={{ kind: 'led', color: 'rgb' }} />
        </div>
      </section>

      <section className="perks" aria-label="Beneficios">
        <div><Truck size={20} /><p><strong>Envío a todo el país</strong>Gratis desde {money(FREE_SHIPPING_FROM)} con envío estándar.</p></div>
        <div><ShieldCheck size={20} /><p><strong>Fichas técnicas</strong>Voltaje, interfaz y encapsulado en cada producto.</p></div>
        <div><CreditCard size={20} /><p><strong>Pago con tarjeta</strong>Pasarela de demostración con tarjetas de prueba.</p></div>
      </section>

      {loading && !data && <Spinner />}
      <ErrorBox error={error} onRetry={reload} />

      {data && (
        <>
          <section className="section">
            <div className="section-head">
              <h2>Explora por categoría</h2>
              <Link to="/catalogo" className="btn-link">Todo el catálogo <ChevronRight size={16} /></Link>
            </div>
            <div className="category-grid">
              {data.categories.map((c) => (
                <Link key={c.slug} to={`/catalogo/${c.slug}`} className="category-tile">
                  <ProductArt art={CATEGORY_ART[c.slug]} />
                  <span>
                    <strong>{c.name}</strong>
                    <small>{c.count} productos</small>
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section className="section">
            <div className="section-head">
              <h2>Destacados</h2>
              <Link to="/catalogo?orden=relevancia" className="btn-link">Ver más <ChevronRight size={16} /></Link>
            </div>
            <div className="product-grid">{data.featured.map((p) => <ProductCard key={p.id} product={p} />)}</div>
          </section>

          <section className="section">
            <div className="section-head">
              <h2>Lo más vendido</h2>
              <Link to="/catalogo?orden=vendidos" className="btn-link">Ver ranking <ChevronRight size={16} /></Link>
            </div>
            <div className="product-grid">{data.bestSellers.map((p) => <ProductCard key={p.id} product={p} />)}</div>
          </section>
        </>
      )}
    </>
  );
}
