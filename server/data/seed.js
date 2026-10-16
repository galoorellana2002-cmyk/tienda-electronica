// npm run seed → con MONGODB_URI borra y recarga los datos de ejemplo en MongoDB.
// Sin MONGODB_URI solo muestra lo que se carga en memoria al arrancar.
import { existsSync } from 'node:fs';
import { DEMO_ACCOUNTS, buildSeed } from '../store/seed.js';

if (existsSync('.env')) process.loadEnvFile('.env');
const uri = process.env.MONGODB_URI?.trim();

const seed = uri ? await (await import('../store/mongo.js')).resetDatabase(uri) : await buildSeed();
console.log(uri ? 'Base de datos MongoDB reiniciada con los datos de ejemplo.' : 'Sin MONGODB_URI: estos datos se cargan en memoria al arrancar el servidor.');
console.log(`· ${seed.products.length} productos · ${seed.users.length} usuarios · ${seed.orders.length} pedidos de ejemplo`);
for (const a of DEMO_ACCOUNTS) console.log(`· ${a.role === 'admin' ? 'Admin  ' : 'Cliente'} ${a.email} / ${a.password}`);
