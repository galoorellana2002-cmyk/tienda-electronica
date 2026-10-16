import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="page narrow empty">
      <h1>Página no encontrada</h1>
      <p className="muted">El enlace puede estar roto o la página ya no existe.</p>
      <Link to="/" className="btn">Ir al inicio</Link>
    </div>
  );
}
