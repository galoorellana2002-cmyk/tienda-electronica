// Filtros, orden, paginación y conteo de facetas del catálogo.
// La base (categoría + búsqueda) la resuelve cada almacén; lo demás se calcula aquí igual para ambos modos.
import { FACETS, PAGE_SIZE, normalize } from '../shared/shop.js';

export const searchTokens = (q) => normalize(q).split(/\s+/).filter(Boolean).slice(0, 8);

export function matchesSearch(product, q) {
  const tokens = searchTokens(q);
  return tokens.every((token) => product.searchText.includes(token));
}

const list = (value) =>
  (Array.isArray(value) ? value : String(value ?? '').split(','))
    .map((v) => v.trim())
    .filter(Boolean);

export function parseCatalogParams(query) {
  const specs = {};
  for (const { key } of FACETS) {
    const values = list(query[key]);
    if (values.length) specs[key] = values;
  }
  const cents = (value) => (value === undefined || value === '' || Number.isNaN(Number(value)) ? null : Math.round(Number(value) * 100));
  return {
    q: String(query.q ?? '').slice(0, 100),
    category: query.categoria ? String(query.categoria) : undefined,
    brands: list(query.marca),
    specs,
    minCents: cents(query.min),
    maxCents: cents(query.max),
    inStock: query.disponible === '1',
    sort: String(query.orden ?? 'relevancia'),
    page: Math.max(1, Number.parseInt(query.pagina, 10) || 1),
    pageSize: Math.min(60, Math.max(1, Number.parseInt(query.porPagina, 10) || PAGE_SIZE)),
  };
}

// Los agotados van al final del orden por relevancia.
function relevance(product, tokens, phrase) {
  const available = product.stock > 0 ? 10000 : 0;
  if (!tokens.length) return available + (product.featured ? 1000 : 0) + product.sold;
  const name = normalize(product.name);
  let score = 0;
  if (normalize(product.sku) === phrase) score += 100;
  if (name.includes(phrase)) score += 20;
  for (const token of tokens) if (name.includes(token)) score += 5;
  return available + score + product.sold / 100;
}

const SORTERS = {
  vendidos: (a, b) => b.sold - a.sold,
  'precio-asc': (a, b) => a.priceCents - b.priceCents,
  'precio-desc': (a, b) => b.priceCents - a.priceCents,
  nombre: (a, b) => a.name.localeCompare(b.name, 'es'),
  nuevos: (a, b) => b.createdAt.localeCompare(a.createdAt),
};

export function queryCatalog(baseDocs, params) {
  const groups = {
    marca: (p) => !params.brands.length || params.brands.includes(p.brand),
    precio: (p) => (params.minCents === null || p.priceCents >= params.minCents) && (params.maxCents === null || p.priceCents <= params.maxCents),
    disponible: (p) => !params.inStock || p.stock > 0,
  };
  for (const [key, values] of Object.entries(params.specs)) {
    groups[key] = (p) => (p.facets?.[key] ?? []).some((v) => values.includes(v));
  }
  const passes = (p, except) => Object.entries(groups).every(([name, test]) => name === except || test(p));

  const results = baseDocs.filter((p) => passes(p));

  // Cada grupo de facetas cuenta sin su propio filtro, para que puedas sumar opciones.
  const count = (except, valuesOf) => {
    const counts = new Map();
    for (const p of baseDocs) {
      if (!passes(p, except)) continue;
      for (const value of valuesOf(p)) counts.set(value, (counts.get(value) ?? 0) + 1);
    }
    return [...counts].map(([value, n]) => ({ value, count: n })).sort((a, b) => b.count - a.count || a.value.localeCompare(b.value, 'es', { numeric: true }));
  };
  const facets = {
    marca: count('marca', (p) => [p.brand]),
    specs: FACETS.map((f) => ({ ...f, values: count(f.key, (p) => p.facets?.[f.key] ?? []) })).filter((f) => f.values.length > 1 || params.specs[f.key]),
    disponibles: baseDocs.filter((p) => passes(p, 'disponible') && p.stock > 0).length,
    precio: baseDocs.length
      ? { min: Math.min(...baseDocs.map((p) => p.priceCents)), max: Math.max(...baseDocs.map((p) => p.priceCents)) }
      : { min: 0, max: 0 },
  };

  const tokens = searchTokens(params.q);
  const phrase = tokens.join(' ');
  const sorter = SORTERS[params.sort] ?? ((a, b) => relevance(b, tokens, phrase) - relevance(a, tokens, phrase));
  results.sort((a, b) => sorter(a, b) || a.sku.localeCompare(b.sku));

  const total = results.length;
  const pages = Math.max(1, Math.ceil(total / params.pageSize));
  const page = Math.min(params.page, pages);
  const items = results.slice((page - 1) * params.pageSize, page * params.pageSize);
  return { items, total, page, pages, facets };
}

// Relacionados: misma categoría, priorizando los que comparten especificaciones o marca.
export function relatedProducts(product, candidates, limit = 8) {
  const shared = (p) => {
    let score = p.brand === product.brand ? 2 : 0;
    for (const [key, values] of Object.entries(product.facets ?? {})) {
      for (const v of values) if (p.facets?.[key]?.includes(v)) score += key === 'interfaz' ? 2 : 1;
    }
    return score + (p.stock > 0 ? 1 : 0) + p.sold / 1000;
  };
  return candidates
    .filter((p) => p.id !== product.id)
    .sort((a, b) => shared(b) - shared(a))
    .slice(0, limit);
}
