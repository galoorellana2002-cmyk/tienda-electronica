import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../lib/auth.jsx';

const DEMO = [
  { label: 'Cliente de prueba', email: 'cliente@circuitoandino.demo', password: 'cliente1234' },
  { label: 'Administración', email: 'admin@circuitoandino.demo', password: 'admin1234' },
];

// Solo se permite volver a rutas internas.
const safeReturn = (value) => (value && value.startsWith('/') && !value.startsWith('//') ? value : null);

export function Login() {
  const { user, login } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [state, setState] = useState({ busy: false, error: null });
  const back = safeReturn(params.get('volver'));
  if (user && !state.busy) return <Navigate to={back ?? '/'} replace />;

  async function submit(e) {
    e.preventDefault();
    setState({ busy: true, error: null });
    try {
      const { user: logged } = await login(form.email, form.password);
      navigate(back ?? (logged.role === 'admin' ? '/admin' : '/'), { replace: true });
    } catch (error) {
      setState({ busy: false, error: error.message });
    }
  }

  return (
    <div className="page auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h1>Inicia sesión</h1>
        <p className="muted">Para comprar y ver tus pedidos.</p>
        <label className="field">
          <span className="field-label">Correo</span>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" required />
        </label>
        <label className="field">
          <span className="field-label">Contraseña</span>
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="current-password" required />
        </label>
        {state.error && <p className="alert error" role="alert">{state.error}</p>}
        <button type="submit" className="btn block" disabled={state.busy}>{state.busy ? 'Ingresando…' : 'Ingresar'}</button>
        <div className="demo-accounts">
          <p className="small muted">Cuentas de prueba (completa los campos):</p>
          {DEMO.map((d) => (
            <button key={d.email} type="button" className="btn secondary small" onClick={() => setForm({ email: d.email, password: d.password })}>
              {d.label}
            </button>
          ))}
        </div>
        <p className="center small">¿No tienes cuenta? <Link to={`/registro${back ? `?volver=${encodeURIComponent(back)}` : ''}`}>Crea una</Link></p>
      </form>
    </div>
  );
}

export function Register() {
  const { user, register } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [state, setState] = useState({ busy: false, error: null });
  const back = safeReturn(params.get('volver'));
  if (user && !state.busy) return <Navigate to={back ?? '/'} replace />;

  async function submit(e) {
    e.preventDefault();
    if (form.password.length < 8) {
      setState({ busy: false, error: 'La contraseña debe tener al menos 8 caracteres.' });
      return;
    }
    setState({ busy: true, error: null });
    try {
      await register(form.name, form.email, form.password);
      navigate(back ?? '/', { replace: true });
    } catch (error) {
      setState({ busy: false, error: error.message });
    }
  }

  return (
    <div className="page auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h1>Crea tu cuenta</h1>
        <p className="muted">Tu contraseña se guarda cifrada con bcrypt.</p>
        <label className="field">
          <span className="field-label">Nombre</span>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" required minLength={2} />
        </label>
        <label className="field">
          <span className="field-label">Correo</span>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" required />
        </label>
        <label className="field">
          <span className="field-label">Contraseña</span>
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="new-password" required minLength={8} />
          <span className="field-hint">Mínimo 8 caracteres.</span>
        </label>
        {state.error && <p className="alert error" role="alert">{state.error}</p>}
        <button type="submit" className="btn block" disabled={state.busy}>{state.busy ? 'Creando cuenta…' : 'Crear cuenta'}</button>
        <p className="center small">¿Ya tienes cuenta? <Link to={`/ingresar${back ? `?volver=${encodeURIComponent(back)}` : ''}`}>Inicia sesión</Link></p>
      </form>
    </div>
  );
}
