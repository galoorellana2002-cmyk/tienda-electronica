import { existsSync } from 'node:fs';
import path from 'node:path';
import express from 'express';

if (existsSync('.env')) process.loadEnvFile('.env');

const { default: app } = await import('./app.js');
const { getStore } = await import('./store/index.js');

// En producción local (npm start) sirve también el frontend compilado.
const dist = path.resolve('dist');
if (existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^(?!\/api).*/, (req, res) => res.sendFile(path.join(dist, 'index.html')));
}

const port = Number(process.env.PORT) || 3011;
const store = await getStore();
app.listen(port, () => {
  console.log(`API de Circuito Andino en http://localhost:${port} · datos: ${store.mode}`);
});
