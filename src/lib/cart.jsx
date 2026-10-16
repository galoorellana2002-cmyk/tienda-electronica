import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api } from './api.js';
import { readJSON, writeJSON } from './storage.js';
import { useAuth } from './auth.jsx';

const CART_KEY = 'ca-cart';
const CartContext = createContext(null);

// Carrito persistente: se guarda en el navegador y, con sesión iniciada, también en la cuenta.
// Cada línea guarda una copia del producto (nombre, precio, stock) que se refresca con la API.
export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState(() => readJSON(CART_KEY, []));
  const [lastAdded, setLastAdded] = useState(null);
  const syncedUser = useRef(null);

  useEffect(() => writeJSON(CART_KEY, items), [items]);

  const refresh = useCallback(async (list) => {
    const ids = (list ?? items).map((i) => i.productId);
    if (!ids.length) return;
    const { items: products } = await api(`/products/by-ids?ids=${ids.join(',')}`);
    setItems((current) =>
      current.map((line) => {
        const product = products.find((p) => p.id === line.productId);
        return product ? { ...line, product, unavailable: false } : { ...line, unavailable: true };
      }),
    );
  }, [items]);

  // Al iniciar sesión, une el carrito del navegador con el guardado en la cuenta.
  useEffect(() => {
    if (!user || syncedUser.current === user.id) return;
    syncedUser.current = user.id;
    api('/cart')
      .then(async ({ items: saved }) => {
        const merged = new Map(items.map((i) => [i.productId, i]));
        for (const s of saved) if (!merged.has(s.productId)) merged.set(s.productId, { productId: s.productId, qty: s.qty });
        const list = [...merged.values()];
        setItems(list);
        await refresh(list);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (!user) syncedUser.current = null;
  }, [user]);

  // Guarda el carrito en la cuenta con un pequeño retraso para agrupar cambios.
  useEffect(() => {
    if (!user || syncedUser.current !== user.id) return undefined;
    const timer = setTimeout(() => {
      api('/cart', { method: 'PUT', body: { items: items.filter((i) => !i.unavailable).map(({ productId, qty }) => ({ productId, qty })) } }).catch(() => {});
    }, 600);
    return () => clearTimeout(timer);
  }, [items, user]);

  const value = useMemo(() => {
    const valid = items.filter((i) => i.product && !i.unavailable);
    return {
      items,
      count: items.reduce((sum, i) => sum + i.qty, 0),
      subtotalCents: valid.reduce((sum, i) => sum + i.product.priceCents * i.qty, 0),
      lastAdded,
      dismissAdded: () => setLastAdded(null),
      refresh,
      add(product, qty = 1) {
        setItems((current) => {
          const existing = current.find((i) => i.productId === product.id);
          const max = Math.min(99, product.stock);
          if (existing) return current.map((i) => (i.productId === product.id ? { ...i, product: { ...i.product, ...product }, qty: Math.min(max, i.qty + qty) } : i));
          return [...current, { productId: product.id, qty: Math.min(max, qty), product }];
        });
        setLastAdded({ product, qty, at: Date.now() });
      },
      setQty(productId, qty) {
        setItems((current) => current.map((i) => (i.productId === productId ? { ...i, qty: Math.max(1, Math.min(99, i.product?.stock ?? 99, qty)) } : i)));
      },
      remove(productId) {
        setItems((current) => current.filter((i) => i.productId !== productId));
      },
      clear() {
        setItems([]);
      },
    };
  }, [items, lastAdded, refresh]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
