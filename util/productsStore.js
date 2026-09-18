import {
  TABLE, getItem, putItem, deleteItem, scanAll, isEmpty, batchWrite, isDbConfigured, assertUsableStore,
} from "@/util/db/dynamo";
import { PRODUCT_SEED_URL, absoluteAssetUrl } from "@/util/config";
import * as fileStore from "./productsStore.file";

/**
 * Catalogue storage.
 *
 * DynamoDB when AWS credentials are set, otherwise the JSON file store for
 * local development. On first run the products table seeds itself from the
 * hosted catalogue, so a fresh deployment comes up with a full shop rather
 * than an empty one.
 */

function useDb() {
  if (isDbConfigured()) return true;
  // Throws on a serverless host rather than limping into a file store that
  // cannot possibly work there. See assertUsableStore.
  assertUsableStore();
  return false;
}

/**
 * Categories are one row holding a list, not a row per category.
 *
 * The list is what the admin edits and reorders as a whole, and reading it back
 * as one value means a rename cannot half-apply. It lives in the settings table
 * under this key - the same key attribute every other setting uses.
 */
const CATEGORY_KEY = "categories";

async function readCategoryRow() {
  return (await getItem(TABLE.settings, CATEGORY_KEY)) || { key: CATEGORY_KEY, values: [] };
}

async function writeCategories(values) {
  await putItem(TABLE.settings, { key: CATEGORY_KEY, values, updatedAt: new Date().toISOString() });
  return values;
}

/** Everything in the catalogue, in the order the price list prints. */
async function allProducts() {
  const items = await scanAll(TABLE.products);
  // Sorted here rather than by the database: DynamoDB returns a Scan in
  // whatever order it likes, and the printed order is the point of sortOrder.
  return items.sort((a, b) => {
    const sa = a.sortOrder == null ? Number.MAX_SAFE_INTEGER : a.sortOrder;
    const sb = b.sortOrder == null ? Number.MAX_SAFE_INTEGER : b.sortOrder;
    return sa - sb || a.id - b.id;
  });
}

const strip = ({ _id, ...rest }) => rest;

function normalise(p, id) {
  const num = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);
  return {
    id: id ?? p.id,
    name: String(p.name || "").trim(),
    category: String(p.category || "Others").trim(),
    price: Math.max(0, num(p.price)),
    discount: Math.min(95, Math.max(0, num(p.discount))),
    // Position in the printed price list, so the website reads in the same
    // order as the sheet the shop hands over the counter. Items not on the
    // list sort after it.
    sortOrder: p.sortOrder == null ? null : num(p.sortOrder),
    plSection: String(p.plSection || "").trim(),
    countInStock: Math.max(0, num(p.countInStock)),
    image: Array.isArray(p.image) ? p.image.filter(Boolean) : [],
    brand: p.brand || "Maharishi Crackers",
    type: p.type || "Fireworks",
    sku: String(p.sku ?? "").trim(),
    shortDescription: String(p.shortDescription || "").trim(),
    description: String(p.description || "").trim(),
    active: p.active !== false,
  };
}

/** Populates an empty table from the hosted catalogue, once. */
async function seedIfEmpty() {
  if (!(await isEmpty(TABLE.products))) return;

  // Absolute: a site-relative asset path cannot be fetched server-side.
  const res = await fetch(absoluteAssetUrl(PRODUCT_SEED_URL), { cache: "no-store" });
  if (!res.ok) throw new Error(`catalogue seed responded ${res.status}`);
  const raw = await res.json();
  if (!Array.isArray(raw) || !raw.length) throw new Error("catalogue seed was empty");

  // NOT .map(normalise): map passes the index, which normalise would take as
  // the id and renumber the whole catalogue.
  const docs = raw.map((item) => normalise(item));
  await batchWrite(TABLE.products, docs);
  await writeCategories([...new Set(docs.map((d) => d.category))].sort());
  console.log(`catalogue seeded with ${docs.length} products`);
}

async function categoryList() {
  return (await readCategoryRow()).values || [];
}

async function addToCategories(name) {
  if (!name) return;
  const values = await categoryList();
  if (values.includes(name)) return;
  await writeCategories([...values, name].sort());
}

export async function getCatalogue() {
  if (!useDb()) return fileStore.getCatalogue();
  await seedIfEmpty();
  const [items, categories] = await Promise.all([allProducts(), categoryList()]);
  return { products: items.map(strip), categories: [...categories].sort() };
}

export async function getPublicProducts() {
  if (!useDb()) return fileStore.getPublicProducts();
  await seedIfEmpty();
  // Filtered here rather than in the Scan: at ~184 items the whole table is one
  // read either way, and a FilterExpression would not make it cheaper -
  // DynamoDB charges for what it reads, not for what survives the filter.
  return (await allProducts()).filter((p) => p.active !== false).map(strip);
}

export async function createProduct(input) {
  if (!useDb()) return fileStore.createProduct(input);
  // No auto-increment in DynamoDB, and the catalogue's ids are the ones the
  // price list prints, so the next one is found by reading the highest.
  const existing = await scanAll(TABLE.products);
  const highest = existing.reduce((a, p) => Math.max(a, Number(p.id) || 0), 0);
  const product = normalise(input, highest + 1);
  if (!product.name) throw new Error("A product name is required");
  await putItem(TABLE.products, { ...product });
  await addToCategories(product.category);
  return product;
}

export async function updateProduct(id, patch) {
  if (!useDb()) return fileStore.updateProduct(id, patch);
  const existing = await getItem(TABLE.products, Number(id));
  if (!existing) return null;
  const merged = normalise({ ...strip(existing), ...patch }, existing.id);
  await putItem(TABLE.products, { ...merged });
  await addToCategories(merged.category);
  return merged;
}

export async function deleteProduct(id) {
  if (!useDb()) return fileStore.deleteProduct(id);
  // Checked first so the caller still learns the difference between a delete
  // and a miss: DynamoDB reports deleting something absent as a success.
  const existing = await getItem(TABLE.products, Number(id));
  if (!existing) return false;
  await deleteItem(TABLE.products, Number(id));
  return true;
}

export async function addCategory(name) {
  if (!useDb()) return fileStore.addCategory(name);
  const clean = String(name || "").trim();
  if (!clean) throw new Error("A category name is required");
  await addToCategories(clean);
  return (await categoryList()).sort();
}

export async function renameCategory(from, to) {
  if (!useDb()) return fileStore.renameCategory(from, to);
  const clean = String(to || "").trim();
  if (!clean) throw new Error("A category name is required");
  // No server-side updateMany in DynamoDB: read the affected rows and rewrite
  // them in batches of 25.
  const affected = (await scanAll(TABLE.products)).filter((p) => p.category === from);
  if (affected.length) {
    await batchWrite(TABLE.products, affected.map((p) => ({ ...p, category: clean })));
  }
  const values = (await categoryList()).map((c) => (c === from ? clean : c));
  const next = [...new Set(values)].sort();
  await writeCategories(next);
  return next;
}

export async function deleteCategory(name) {
  if (!useDb()) return fileStore.deleteCategory(name);
  const inUse = (await scanAll(TABLE.products)).filter((p) => p.category === name).length;
  if (inUse) throw new Error(`${inUse} product(s) still use "${name}"`);
  const next = (await categoryList()).filter((c) => c !== name);
  await writeCategories(next);
  return [...next].sort();
}

export async function applyBulkDiscount({ discount, category, ids }) {
  if (!useDb()) return fileStore.applyBulkDiscount({ discount, category, ids });
  const pct = Math.min(95, Math.max(0, Number(discount) || 0));
  const wanted = Array.isArray(ids) && ids.length ? new Set(ids.map(Number)) : null;

  const affected = (await scanAll(TABLE.products)).filter((p) =>
    wanted ? wanted.has(Number(p.id)) : category ? p.category === category : true
  );
  // Skip rows already at this discount - a sale re-applied over the same
  // selection would otherwise rewrite the whole catalogue for nothing, and the
  // count reported back would overstate what changed.
  const changing = affected.filter((p) => Number(p.discount) !== pct);
  if (changing.length) {
    await batchWrite(TABLE.products, changing.map((p) => ({ ...p, discount: pct })));
  }
  return changing.length;
}
