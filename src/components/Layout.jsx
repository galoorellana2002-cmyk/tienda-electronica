import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { CircuitBoard, LayoutDashboard, Menu, Package, Search, ShoppingBag, User, X } from 'lucide-react';
import { CATEGORIES, STORE_NAME, money } from '../../shared/shop.js';
import { useAuth } from '../lib/auth.jsx';
import { useCart } from '../lib/cart.jsx';
import ProductArt, { ArtDefs } from './ProductArt.jsx';

function SearchBox({ onDone }) {
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [q, setQ] = useState(location.pathname.startsWith('/catalogo') ? (params.get('q') ?? '') : '');
  useEffect(() => {
    if (location.pathname.startsWith('/catalogo')) setQ(params.get('q') ?? '');
  }, [params, location.pathname]);
  return (
    <form
      className="search"
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        navigate(q.trim() ? `/catalogo?q=${encodeURIComponent(q.trim())}` : '/catalogo');
        onDone?.();
      }}
    >
      <Search size={17} aria-hidden="true" />
      <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar ESP32, 10k, sensor I2C…" aria-label="Buscar productos" />
    </form>
  );
}

function AddedToast() {
  const { lastAdded, dismissAdded, count, subtotalCents } = useCart();
  useEffect(() => {
    if (!lastAdded) return undefined;
    const timer = setTimeout(dismissAdded, 4000);
    return () => clearTimeout(timer);
  }, [lastAdded, dismissAdded]);
  if (!lastAdded) return null;
  return (
    <div className="toast" role="status">
      <ProductArt art={lastAdded.product.art} className="toast-art" />
      <div>
        <strong>Agregado al carrito</strong>
        <p>{lastAdded.product.name}</p>
        <p className="muted">{count} {count === 1 ? 'artículo' : 'artículos'} · {money(subtotalCents)}</p>
      </div>
      <Link to="/carrito" className="btn small" onClick={dismissAdded}>Ver carrito</Link>
      <button type="button" className="icon-btn ghost" onClick={dismissAdded} aria-label="Cerrar aviso"><X size={16} /></button>
    </div>
  );
}

export default function Layout() {
  const { user, isAdmin, logout } = useAuth();
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setMenuOpen(false);
    setAccountOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    document.body.classList.toggle('no-scroll', menuOpen);
  }, [menuOpen]);

  return (
    <>
      <ArtDefs />
      <div className="demo-bar">
        Tienda de demostración: los pagos son simulados y no se cobra nada. <Link to="/demo">Cuentas y tarjetas de prueba ›</Link>
      </div>
      <header className="site-header">
        <div className="header-inner">
          <button type="button" className="icon-btn ghost menu-toggle" onClick={() => setMenuOpen(true)} aria-label="Abrir menú" aria-expanded={menuOpen}>
            <Menu size={22} />
          </button>
          <Link to="/" className="brand" aria-label={`${STORE_NAME}, inicio`}>
            <span className="brand-mark"><CircuitBoard size={18} /></span>
            <span className="brand-name">{STORE_NAME}</span>
          </Link>
          <nav className="main-nav" aria-label="Principal">
            <NavLink to="/catalogo" end>Catálogo</NavLink>
            <NavLink to="/catalogo/microcontroladores">Placas</NavLink>
            <NavLink to="/catalogo/sensores">Sensores</NavLink>
            <NavLink to="/catalogo/modulos">Módulos</NavLink>
            {isAdmin && <NavLink to="/admin">Administración</NavLink>}
          </nav>
          <div className="header-search"><SearchBox /></div>
          <div className="header-actions">
            {user ? (
              <div className="account">
                <button type="button" className="icon-btn ghost" onClick={() => setAccountOpen((o) => !o)} aria-expanded={accountOpen} aria-label="Tu cuenta">
                  <User size={20} />
                </button>
                {accountOpen && (
                  <div className="account-menu" role="menu">
                    <p className="account-name">{user.name}<span>{user.email}</span></p>
                    <Link to="/cuenta/pedidos" role="menuitem"><Package size={16} /> Mis pedidos</Link>
                    {isAdmin && <Link to="/admin" role="menuitem"><LayoutDashboard size={16} /> Panel de administración</Link>}
                    <button type="button" role="menuitem" onClick={() => { navigate('/'); logout(); }}>Cerrar sesión</button>
                  </div>
                )}
              </div>
            ) : (
              <Link to={['/ingresar', '/registro'].includes(location.pathname) ? '/ingresar' : `/ingresar?volver=${encodeURIComponent(location.pathname + location.search)}`} className="header-login">Ingresar</Link>
            )}
            <Link to="/carrito" className="icon-btn ghost cart-btn" aria-label={`Carrito, ${count} artículos`}>
              <ShoppingBag size={20} />
              {count > 0 && <span className="badge">{count > 99 ? '99+' : count}</span>}
            </Link>
          </div>
        </div>
        <div className="mobile-search"><SearchBox /></div>
      </header>

      {menuOpen && (
        <div className="drawer-backdrop" onClick={() => setMenuOpen(false)}>
          <aside className="drawer" onClick={(e) => e.stopPropagation()} aria-label="Menú">
            <div className="drawer-head">
              <strong>Categorías</strong>
              <button type="button" className="icon-btn ghost" onClick={() => setMenuOpen(false)} aria-label="Cerrar menú"><X size={20} /></button>
            </div>
            <nav className="drawer-nav">
              <Link to="/catalogo">Todo el catálogo</Link>
              {CATEGORIES.map((c) => <Link key={c.slug} to={`/catalogo/${c.slug}`}>{c.name}</Link>)}
              <hr />
              {user ? (
                <>
                  <Link to="/cuenta/pedidos">Mis pedidos</Link>
                  {isAdmin && <Link to="/admin">Panel de administración</Link>}
                  <button type="button" onClick={() => { setMenuOpen(false); navigate('/'); logout(); }}>Cerrar sesión</button>
                </>
              ) : (
                <>
                  <Link to="/ingresar">Ingresar</Link>
                  <Link to="/registro">Crear cuenta</Link>
                </>
              )}
              <Link to="/demo">Sobre esta demo</Link>
            </nav>
          </aside>
        </div>
      )}

      <main className="site-main">
        <Outlet />
      </main>
      <AddedToast />

      <footer className="site-footer">
        <div className="footer-inner">
          <div>
            <p className="footer-brand"><CircuitBoard size={16} /> {STORE_NAME}</p>
            <p className="muted">Componentes electrónicos para makers, estudiantes y talleres en todo Ecuador. Precios en USD con IVA incluido.</p>
          </div>
          <div>
            <p className="footer-title">Tienda</p>
            <Link to="/catalogo">Catálogo</Link>
            <Link to="/carrito">Carrito</Link>
            <Link to="/cuenta/pedidos">Mis pedidos</Link>
          </div>
          <div>
            <p className="footer-title">Demo</p>
            <Link to="/demo">Cuentas y tarjetas de prueba</Link>
            <a href="https://github.com/galoorellana2002-cmyk/tienda-electronica" target="_blank" rel="noreferrer">Código en GitHub</a>
          </div>
        </div>
        <p className="footer-note">
          Proyecto de portafolio de Galo Alejandro Orellana. Tienda ficticia: no vende productos reales, la pasarela de pagos es simulada y las marcas pertenecen a sus dueños.
        </p>
      </footer>
    </>
  );
}
