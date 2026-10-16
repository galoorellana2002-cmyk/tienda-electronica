// Modo MongoDB (por ejemplo, MongoDB Atlas M0 gratis) con Mongoose.
import mongoose from 'mongoose';
import { buildSeed } from './seed.js';
import { searchTokens } from '../catalogQuery.js';

const { Schema, Types } = mongoose;

const specSchema = new Schema({ label: String, value: String }, { _id: false });
const productSchema = new Schema(
  {
    sku: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    brand: String,
    category: { type: String, index: true },
    description: String,
    priceCents: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    sold: { type: Number, default: 0 },
    specs: [specSchema],
    facets: { type: Schema.Types.Mixed, default: {} },
    tags: [String],
    art: { type: Schema.Types.Mixed, default: {} },
    featured: Boolean,
    active: { type: Boolean, default: true },
    searchText: String,
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

const userSchema = new Schema(
  {
    name: String,
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    passwordHash: String,
    cart: [{ _id: false, productId: String, qty: Number }],
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

const orderSchema = new Schema(
  {
    number: { type: String, unique: true },
    userId: { type: Schema.Types.ObjectId, index: true },
    customer: { name: String, email: String },
    items: [{ _id: false, productId: Schema.Types.ObjectId, sku: String, slug: String, name: String, priceCents: Number, qty: Number, art: Schema.Types.Mixed }],
    subtotalCents: Number,
    shippingCents: Number,
    totalCents: Number,
    ivaCents: Number,
    shipping: { method: String, name: String },
    address: { fullName: String, cedula: String, phone: String, province: String, city: String, street: String, reference: String },
    payment: { provider: String, brand: String, last4: String, authCode: String, paidAt: Date },
    status: { type: String, index: true },
    history: [{ _id: false, status: String, at: Date, by: String, note: String }],
    sample: Boolean,
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

const counterSchema = new Schema({ _id: String, value: Number }, { versionKey: false });

// Documento de Mongo → objeto plano con `id` como texto, igual que el modo memoria.
function plain(doc) {
  if (!doc) return null;
  const { _id, ...rest } = JSON.parse(JSON.stringify(doc));
  return { id: _id, ...rest };
}

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const isId = (id) => Types.ObjectId.isValid(id) && String(new Types.ObjectId(id)) === id;

export async function createMongoStore(uri) {
  const connection = await mongoose.createConnection(uri, { serverSelectionTimeoutMS: 8000 }).asPromise();
  const Product = connection.model('Product', productSchema);
  const User = connection.model('User', userSchema);
  const Order = connection.model('Order', orderSchema);
  const Counter = connection.model('Counter', counterSchema);

  if ((await Product.estimatedDocumentCount()) === 0) await seedDatabase({ Product, User, Order, Counter });

  return {
    mode: 'mongodb',

    async findProducts({ category, q, includeInactive = false } = {}) {
      const filter = {};
      if (!includeInactive) filter.active = true;
      if (category) filter.category = category;
      const tokens = searchTokens(q);
      if (tokens.length) filter.$and = tokens.map((t) => ({ searchText: { $regex: escapeRegex(t) } }));
      return (await Product.find(filter).lean()).map(plain);
    },
    async getProduct({ id, slug }) {
      if (id && !isId(id)) return null;
      return plain(await Product.findOne(id ? { _id: id } : { slug }).lean());
    },
    async getProductsByIds(ids) {
      return (await Product.find({ _id: { $in: ids.filter(isId) } }).lean()).map(plain);
    },
    async skuExists(sku, exceptId) {
      return Boolean(await Product.exists(exceptId ? { sku, _id: { $ne: exceptId } } : { sku }));
    },
    async createProduct(data) {
      return plain((await Product.create({ ...data, sold: 0 })).toObject());
    },
    async updateProduct(id, data) {
      if (!isId(id)) return null;
      return plain(await Product.findByIdAndUpdate(id, { $set: data }, { returnDocument: 'after', runValidators: true }).lean());
    },
    async deleteProduct(id) {
      if (!isId(id)) return false;
      return (await Product.deleteOne({ _id: id })).deletedCount === 1;
    },
    // Descuento atómico por línea; si una falla, se devuelve lo ya descontado.
    async reserveStock(items) {
      const done = [];
      for (const item of items) {
        const result = await Product.updateOne({ _id: item.productId, active: true, stock: { $gte: item.qty } }, { $inc: { stock: -item.qty, sold: item.qty } });
        if (result.modifiedCount !== 1) {
          await this.releaseStock(done);
          return false;
        }
        done.push(item);
      }
      return true;
    },
    async releaseStock(items) {
      for (const item of items) await Product.updateOne({ _id: item.productId }, { $inc: { stock: item.qty, sold: -item.qty } });
    },

    async findUserByEmail(email) {
      return plain(await User.findOne({ email }).lean());
    },
    async getUser(id) {
      return isId(id) ? plain(await User.findById(id).lean()) : null;
    },
    async createUser(data) {
      return plain((await User.create(data)).toObject());
    },
    async setCart(userId, cart) {
      if (!isId(userId)) return false;
      return (await User.updateOne({ _id: userId }, { $set: { cart } })).matchedCount === 1;
    },

    async createOrder(data) {
      const counter = await Counter.findOneAndUpdate({ _id: 'order' }, { $inc: { value: 1 } }, { returnDocument: 'after', upsert: true }).lean();
      return plain((await Order.create({ ...data, number: `CA-${counter.value}` })).toObject());
    },
    async listOrders({ userId } = {}) {
      if (userId && !isId(userId)) return [];
      return (await Order.find(userId ? { userId } : {}).sort({ createdAt: -1 }).lean()).map(plain);
    },
    async getOrder(id) {
      return plain(await Order.findOne(isId(id) ? { _id: id } : { number: id }).lean());
    },
    async updateOrderStatus(id, status, entry) {
      if (!isId(id)) return null;
      return plain(await Order.findByIdAndUpdate(id, { $set: { status }, $push: { history: entry } }, { returnDocument: 'after' }).lean());
    },
  };
}

export async function seedDatabase({ Product, User, Order, Counter }) {
  const seed = await buildSeed();
  const withId = ({ id, ...rest }) => ({ _id: new Types.ObjectId(id), ...rest });
  await Product.insertMany(seed.products.map(withId));
  await User.insertMany(seed.users.map(withId));
  await Order.insertMany(seed.orders.map(withId));
  await Counter.updateOne({ _id: 'order' }, { $set: { value: seed.nextOrderNumber - 1 } }, { upsert: true });
  return seed;
}

// Para `npm run seed`: borra y vuelve a cargar los datos de ejemplo.
export async function resetDatabase(uri) {
  const connection = await mongoose.createConnection(uri, { serverSelectionTimeoutMS: 8000 }).asPromise();
  const models = {
    Product: connection.model('Product', productSchema),
    User: connection.model('User', userSchema),
    Order: connection.model('Order', orderSchema),
    Counter: connection.model('Counter', counterSchema),
  };
  await Promise.all(Object.values(models).map((m) => m.deleteMany({})));
  const seed = await seedDatabase(models);
  await connection.close();
  return seed;
}
