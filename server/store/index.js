import { createMemoryStore } from './memory.js';

let storePromise;

// Con MONGODB_URI usa MongoDB (por ejemplo, Atlas M0 gratis); sin ella, modo demo en memoria con el seed.
export function getStore() {
  if (!storePromise) {
    const uri = process.env.MONGODB_URI?.trim();
    storePromise = (uri ? import('./mongo.js').then((m) => m.createMongoStore(uri)) : createMemoryStore()).catch((error) => {
      storePromise = undefined;
      throw error;
    });
  }
  return storePromise;
}
