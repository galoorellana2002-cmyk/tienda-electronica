import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { getStore } from '../store/index.js';
import { httpError, publicUser, requireAuth, signToken } from '../auth.js';

const router = Router();
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

router.post('/register', async (req, res) => {
  const name = String(req.body?.name ?? '').trim();
  const email = String(req.body?.email ?? '').trim().toLowerCase();
  const password = String(req.body?.password ?? '');
  if (name.length < 2 || name.length > 60) throw httpError(400, 'Escribe tu nombre (2 a 60 caracteres).');
  if (!EMAIL.test(email) || email.length > 120) throw httpError(400, 'El correo no es válido.');
  if (password.length < 8 || password.length > 72) throw httpError(400, 'La contraseña debe tener entre 8 y 72 caracteres.');
  const store = await getStore();
  if (await store.findUserByEmail(email)) throw httpError(409, 'Ya existe una cuenta con ese correo. Inicia sesión.');
  let user;
  try {
    user = await store.createUser({ name, email, role: 'customer', passwordHash: await bcrypt.hash(password, 10) });
  } catch (error) {
    if (error.code === 11000) throw httpError(409, 'Ya existe una cuenta con ese correo. Inicia sesión.');
    throw error;
  }
  res.status(201).json({ token: signToken(user), user: publicUser(user) });
});

router.post('/login', async (req, res) => {
  const email = String(req.body?.email ?? '').trim().toLowerCase();
  const password = String(req.body?.password ?? '');
  const store = await getStore();
  const user = email ? await store.findUserByEmail(email) : null;
  const ok = user?.passwordHash ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!ok) throw httpError(401, 'Correo o contraseña incorrectos.');
  res.json({ token: signToken(user), user: publicUser(user), cart: user.cart ?? [] });
});

router.get('/me', requireAuth, async (req, res) => {
  const store = await getStore();
  const user = await store.getUser(req.user.id);
  res.json({ user: user ? publicUser(user) : req.user });
});

export default router;
