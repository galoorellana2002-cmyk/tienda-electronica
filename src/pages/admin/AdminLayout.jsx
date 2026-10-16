import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import { ClipboardList, LayoutDashboard, Package } from 'lucide-react';
import { useAuth } from '../../lib/auth.jsx';

export default function AdminLayout() {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to={`/ingresar?volver=${encodeURIComponent(location.pathname)}`} replace />;
  if (!isAdmin) {
    return (
      <div className="page narrow empty">
        <h1>Solo para administración</h1>
        <p className="muted">Entra con la cuenta de administración de prueba (admin@circuitoandino.demo) para ver el panel.</p>
      </div>
    );
  }
  return (
    <div className="page admin">
      <div className="admin-head">
        <h1>Panel de administración</h1>
        <nav className="segmented" aria-label="Secciones del panel">
          <NavLink to="/admin" end><LayoutDashboard size={16} /> Resumen</NavLink>
          <NavLink to="/admin/productos"><Package size={16} /> Productos</NavLink>
          <NavLink to="/admin/pedidos"><ClipboardList size={16} /> Pedidos</NavLink>
        </nav>
      </div>
      <Outlet />
    </div>
  );
}
