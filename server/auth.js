import jwt from 'jsonwebtoken';

const DEV_SECRET = 'circuito-andino-demo-secret-cambia-esto';

function secret() {
  const value = process.env.JWT_SECRET?.trim();
  if (value) return value;
  if (process.env.NODE_ENV === 'production' && process.env.MONGODB_URI) {
    // Con datos reales no se permite el secreto de ejemplo.
    throw Object.assign(new Error('Falta JWT_SECRET en el servidor.'), { status: 500 });
  }
  return DEV_SECRET;
}

export function signToken(user) {
  return jwt.sign({ sub: user.id, name: user.name, email: user.email, role: user.role }, secret(), { expiresIn: '7d' });
}

export const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role });

// Lee "Authorization: Bearer ..." y deja el usuario en req.user. El token basta para identificarlo,
// así la sesión sigue valiendo aunque Vercel atienda la petición en otra instancia.
export function requireAuth(req, res, next) {
  const header = req.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Inicia sesión para continuar.' });
  try {
    const payload = jwt.verify(token, secret());
    req.user = { id: payload.sub, name: payload.name, email: payload.email, role: payload.role };
    next();
  } catch {
    res.status(401).json({ error: 'Tu sesión expiró. Vuelve a iniciar sesión.' });
  }
}

export function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Solo la administración puede entrar aquí.' });
    next();
  });
}

export const httpError = (status, message) => Object.assign(new Error(message), { status });
