// Modo demo: todo vive en la memoria del proceso y se reinicia con cada arranque.
import { buildSeed, newId, stableId } from './seed.js';
import { matchesSearch } from '../catalogQuery.js';

const clone = (value) => structuredClone(value);

export async function createMemoryStore() {
  const seed = await buildSeed();
  const products = seed.products;
  const users = seed.users;
  const orders = seed.orders;
  let orderNumber = seed.nextOrderNumber;

  return {
    mode: 'memoria',

    async findProducts({ category, q, includeInactive = false } = {}) {
      return clone(products.filter((p) => (includeInactive || p.active) && (!category || p.category === category) && matchesSearch(p, q)));
    },
    async getProduct({ id, slug }) {
      const product = products.find((p) => (id ? p.id === id : p.slug === slug));
      return product ? clone(product) : null;
    },
    async getProductsByIds(ids) {
      return clone(products.filter((p) => ids.includes(p.id)));
    },
    async skuExists(sku, exceptId) {
      return products.some((p) => p.sku === sku && p.id !== exceptId);
    },
    async createProduct(data) {
      const product = { ...data, id: newId(), sold: 0, createdAt: new Date().toISOString() };
      products.push(product);
      return clone(product);
    },
    async updateProduct(id, data) {
      const product = products.find((p) => p.id === id);
      if (!product) return null;
      Object.assign(product, data);
      return clone(product);
    },
    async deleteProduct(id) {
      const index = products.findIndex((p) => p.id === id);
      if (index === -1) return false;
      products.splice(index, 1);
      return true;
    },
    // Descuenta stock solo si alcanza para todas las líneas (todo o nada).
    async reserveStock(items) {
      const rows = items.map((item) => ({ item, product: products.find((p) => p.id === item.productId && p.active) }));
      if (rows.some(({ item, product }) => !product || product.stock < item.qty)) return false;
      for (const { item, product } of rows) {
        product.stock -= item.qty;
        product.sold += item.qty;
      }
      return true;
    },
    async releaseStock(items) {
      for (const item of items) {
        const product = products.find((p) => p.id === item.productId);
        if (product) {
          product.stock += item.qty;
          product.sold = Math.max(0, product.sold - item.qty);
        }
      }
    },

    async findUserByEmail(email) {
      const user = users.find((u) => u.email === email);
      return user ? clone(user) : null;
    },
    async getUser(id) {
      const user = users.find((u) => u.id === id);
      return user ? clone(user) : null;
    },
    async createUser(data) {
      // Mismo id para el mismo correo en cualquier instancia: los pedidos siguen asociados a la cuenta.
      const user = { ...data, id: stableId(`user:${data.email}`), cart: [], createdAt: new Date().toISOString() };
      users.push(user);
      return clone(user);
    },
    async setCart(userId, cart) {
      const user = users.find((u) => u.id === userId);
      if (user) user.cart = clone(cart);
      return Boolean(user);
    },

    async createOrder(data) {
      const order = { ...data, id: newId(), number: `CA-${orderNumber++}`, createdAt: new Date().toISOString() };
      orders.push(order);
      return clone(order);
    },
    async listOrders({ userId } = {}) {
      return clone(orders.filter((o) => !userId || o.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    },
    async getOrder(id) {
      const order = orders.find((o) => o.id === id || o.number === id);
      return order ? clone(order) : null;
    },
    async updateOrderStatus(id, status, entry) {
      const order = orders.find((o) => o.id === id);
      if (!order) return null;
      order.status = status;
      order.history.push(entry);
      return clone(order);
    },
  };
}
