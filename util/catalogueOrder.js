/**
 * The shop's arranged order, shared by the DynamoDB and file stores.
 *
 * Two decisions make up the arrangement: which category a customer meets
 * first (the saved category list) and which product leads inside it
 * (sortOrder). Products are grouped by the first, then ordered by the second,
 * so reordering categories in the admin actually moves them on the shop.
 */

const slot = (p) => (p.sortOrder == null ? Number.MAX_SAFE_INTEGER : Number(p.sortOrder));

export function bySortOrder(a, b) {
  return slot(a) - slot(b) || Number(a.id) - Number(b.id);
}

/** Products grouped by the category arrangement, then by sortOrder within it. */
export function arrangeProducts(products, categories = []) {
  const rank = new Map(categories.map((c, i) => [c, i]));
  // Categories missing from the list (a stale row, a hand edit) sort after it
  // rather than vanishing.
  const at = (p) => (rank.has(p.category) ? rank.get(p.category) : categories.length);
  return [...products].sort((a, b) => at(a) - at(b) || bySortOrder(a, b));
}

/**
 * The category order to store, given what the client sent.
 *
 * Unknown names are dropped, and anything the client did not send keeps its
 * place at the end, so a stale page cannot silently drop a category that was
 * added meanwhile.
 */
export function mergeCategoryOrder(current, values) {
  const wanted = [...new Set((values || []).filter((v) => current.includes(v)))];
  return [...wanted, ...current.filter((v) => !wanted.includes(v))];
}

/**
 * New sortOrder values for products reordered within one category.
 *
 * The slots those products already occupy are reused, so reordering inside
 * Rockets shuffles the rockets among themselves without touching anything
 * else. Returns only the products whose sortOrder actually changes.
 */
export function reassignSlots(docs) {
  const slots = docs
    .map((d) => (d.sortOrder == null ? 9999 + Number(d.id) : Number(d.sortOrder)))
    .sort((a, b) => a - b);
  return docs
    .map((d, i) => ({ ...d, sortOrder: slots[i] }))
    .filter((d, i) => docs[i].sortOrder !== d.sortOrder);
}
