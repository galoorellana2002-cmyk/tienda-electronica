import express from 'express';
import { getStore } from './store/index.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';
import adminRoutes from './routes/admin.js';

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', async (req, res) => {
  const store = await getStore();
  res.json({ ok: true, mode: store.mode });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada.' });
});

// Express 5 envía aquí los errores de las rutas async. Nunca se registra el cuerpo de la petición
// (podría traer datos de tarjeta de prueba).
app.use((error, req, res, next) => {
  const status = error.status ?? (error.type === 'entity.parse.failed' ? 400 : 500);
  if (status >= 500) console.error(`${req.method} ${req.path}:`, error.message);
  res.status(status).json({ error: status >= 500 ? 'Algo salió mal en el servidor. Inténtalo de nuevo.' : error.message, ...(error.fields && { fields: error.fields }) });
});

export default app;
