import crypto from "crypto";
import { collection, isDbConfigured } from "@/util/db/mongo";
import * as fileStore from "./ordersStore.file";
import { basisMrp, effDiscount, unitOf, orderBasis, inferBasis } from "@/util/pricing";
import { getCatalogue } from "@/util/productsStore";

/**
 * Order storage.
 *
 * MongoDB when MONGODB_URI is set, otherwise the original JSON file store so
 * local development works without a cluster. The database exists because a
 * serverless host has a read-only, ephemeral filesystem - writing orders to
 * disk there fails outright.
 */

const useDb = () => isDbConfigured();
const orders = () => collection("orders");
const counters = () => collection("counters");

export const STATUSES = ["new", "packing", "packed", "dispatched", "cancelled"];

export const STATUS_LABEL = {
  new: "New", packing: "Packing", packed: "Packed",
  dispatched: "Dispatched", cancelled: "Cancelled",
};

const unit = (i) => Math.round(i.price - (i.price * (i.discount || 0)) / 100);
const lineTotal = (i) =>
  Math.round((i.price - (i.price * (i.discount || 0)) / 100) * (i.count || 0));

/**
 * What a line is actually worth once the packer has been through it: a
 * substituted line is priced on the replacement, an unfillable one drops to zero.
 */
export const effectiveLineTotal = (item) => {
  if (item.substitute) {
    return Math.round((item.substitute.unitPrice || 0) * (item.substitute.count || 0));
  }
  if (item.unavailable) return 0;
  return item.total || 0;
};

function recomputeTotals(order) {
  const items = order.items || [];
  return {
    ...order,
    total: items.reduce((a, i) => a + effectiveLineTotal(i), 0),
    itemCount: items.reduce(
      (a, i) => a + (i.substitute ? i.substitute.count : i.unavailable ? 0 : i.count),
      0
    ),
    originalTotal: order.originalTotal ?? items.reduce((a, i) => a + (i.total || 0), 0),
  };
}

/**
 * Next sequential reference: MC-0001, MC-0002, ...
 *
 * A findOneAndUpdate with $inc is atomic in MongoDB, so two customers checking
 * out at the same instant cannot be handed the same number - which scanning for
 * the highest existing ref would allow.
 */
async function nextRef() {
  const res = await (await counters()).findOneAndUpdate(
    { _id: "orderRef" },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" }
  );
  const seq = res?.seq ?? res?.value?.seq ?? 1;
  return "MC-" + String(seq).padStart(4, "0");
}

/** Mongo's own _id never leaves the store. */
const strip = ({ _id, ...rest }) => rest;

export async function listOrders() {
  if (!useDb()) return fileStore.listOrders();
  const docs = await (await orders()).find({}).sort({ createdAt: -1 }).toArray();
  return docs.map(strip);
}

export async function getOrder(id) {
  if (!useDb()) return fileStore.getOrder(id);
  const doc = await (await orders()).findOne({ id });
  return doc ? strip(doc) : null;
}

/**
 * Creates an order.
 *
 * `clientRef` makes this safe to retry. Several people bill on their own
 * devices at the same counter, and a slow response invites a second tap - so
 * the same key is only ever written once, and a repeat returns the order that
 * already exists rather than a second bill with a second reference number.
 */
export async function createOrder({ billingDetails, productList, emailSent, source = "online", note = "", clientRef = "", extraDiscount = null }) {
  if (!useDb()) return fileStore.createOrder({ billingDetails, productList, emailSent, source, note, extraDiscount });

  const key = String(clientRef || "").slice(0, 80);
  if (key) {
    const existing = await (await orders()).findOne({ clientRef: key });
    if (existing) return { ...strip(existing), duplicate: true };
  }

  const items = (productList || []).map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    image: p.image?.[0] || null,
    unitPrice: unit(p),
    mrp: p.price,
    discount: p.discount || 0,
    count: p.count || 0,
    total: lineTotal(p),
    packed: false,
    unavailable: false,
    substitute: null,
  }));

  const now = new Date().toISOString();
  const order = recomputeTotals({
    id: crypto.randomUUID(),
    ref: await nextRef(),
    createdAt: now,
    updatedAt: now,
    status: "new",
    // "online" = built by the customer at checkout, "pos" = billed at the
    // counter by staff. Both run the same packing and dispatch pipeline.
    source: source === "pos" ? "pos" : "online",
    // The concession this bill was written with, so a line added to it later is
    // priced the way the rest of it was. Null on a website order, which has no
    // concession to remember. See util/pricing.js.
    extraDiscount: source === "pos" ? Math.min(95, Math.max(0, Number(extraDiscount) || 0)) : null,
    emailSent: Boolean(emailSent),
    customer: {
      name: billingDetails?.name || "",
      email: billingDetails?.email || "",
      phone: billingDetails?.phone || "",
      address: billingDetails?.address || "",
      city: billingDetails?.city || "",
      state: billingDetails?.state || "",
      zip: billingDetails?.zip || "",
    },
    items,
    mrp: items.reduce((a, i) => a + Math.round(i.mrp * i.count), 0),
    note: note || "",
    ...(key ? { clientRef: key } : {}),
    history: [{ at: now, event: source === "pos" ? "Billed at the counter" : "Order received" }],
  });

  try {
    await (await orders()).insertOne({ ...order });
  } catch (err) {
    // Two devices raced on the same key; the unique index caught the second.
    // Hand back the bill that won rather than surfacing an error to the biller.
    if (err?.code === 11000 && key) {
      const winner = await (await orders()).findOne({ clientRef: key });
      if (winner) return { ...strip(winner), duplicate: true };
    }
    throw err;
  }
  return order;
}

/**
 * Applies a patch to an order.
 *
 * Read-modify-write, guarded by a revision number. A packer ticking several
 * lines in quick succession fires overlapping requests; each used to read the
 * same document and then replaceOne() the whole thing, so the last write won
 * and the other ticks were silently lost. The write now only lands if the
 * document still carries the revision we read, and a losing writer re-reads
 * and reapplies its own change rather than clobbering someone else's.
 */
export async function updateOrder(id, patch) {
  if (!useDb()) return fileStore.updateOrder(id, patch);

  for (let attempt = 0; attempt < 6; attempt++) {
    const saved = await applyOnce(id, patch);
    if (saved !== CONFLICT) return saved;
    // Someone else wrote between our read and our write; back off a moment and
    // build the change again on top of theirs.
    await new Promise((r) => setTimeout(r, 25 * (attempt + 1)));
  }
  throw new Error("That order is being changed elsewhere - try again");
}

const CONFLICT = Symbol("conflict");

async function applyOnce(id, patch) {
  const prev = await getOrder(id);
  if (!prev) return null;

  const next = { ...prev, updatedAt: new Date().toISOString() };

  // A cancelled bill is settled. Re-open it first if it genuinely needs changing.
  if (prev.status === "cancelled" && (patch.addItem || patch.removeItem !== undefined)) {
    throw new Error("This order is cancelled - reopen it before changing the items");
  }

  if (patch.status && STATUSES.includes(patch.status) && patch.status !== prev.status) {
    next.status = patch.status;
    next.history = [...(prev.history || []), { at: next.updatedAt, event: `Marked ${STATUS_LABEL[patch.status]}` }];
    if (patch.status === "packed") {
      // Lines with nothing to pack stay unticked.
      next.items = prev.items.map((it) => ({ ...it, packed: it.unavailable && !it.substitute ? false : true }));
    }
  }

  if (typeof patch.note === "string") next.note = patch.note;
  if (typeof patch.emailSent === "boolean") next.emailSent = patch.emailSent;

  /**
   * Add a product to an existing bill.
   *
   * The price is read from the catalogue here, never taken from the request -
   * the same rule the checkout follows, so a bill can't be edited into a
   * different total than the catalogue supports. Adding a product already on
   * the order raises that line instead of creating a second one.
   */
  if (patch.addItem) {
    const wanted = String(patch.addItem.productId ?? patch.addItem.id ?? "");
    const qty = Math.max(1, Math.round(Number(patch.addItem.count) || 1));
    // The admin catalogue, not the public list: staff may legitimately add a
    // product that is hidden from the storefront.
    const { products: catalogue } = await getCatalogue();
    const product = catalogue.find((p) => String(p.id) === wanted);
    if (!product) throw new Error("That product is no longer in the catalogue");

    /**
     * Price the new line the way the rest of the bill was priced.
     *
     * A counter bill charges the MRP less the biller's ExtraDiscount, not the
     * product's own discount - so pricing this off the catalogue alone charged
     * a rate the bill had never used. Older counter bills predate the
     * concession being stored, so it is read back off their own lines.
     */
    const recorded = orderBasis(prev);
    const basis = recorded.recorded ? recorded : (inferBasis(prev) || recorded);

    const items = [...(next.items || prev.items || [])];
    const at = items.findIndex((it) => String(it.id) === wanted);

    if (at >= 0) {
      const line = items[at];
      const count = (line.count || 0) + qty;
      items[at] = {
        ...line,
        count,
        total: Math.round((line.unitPrice || 0) * count),
        // Re-adding something previously written off puts it back in play.
        unavailable: false,
        packed: false,
      };
      next.history = [...(next.history || []),
        { at: next.updatedAt, event: `${line.name} quantity raised ${line.count} -> ${count}` }];
    } else {
      const line = {
        id: product.id,
        name: product.name,
        category: product.category,
        image: product.image?.[0] || null,
        unitPrice: unitOf(product, basis),
        mrp: basisMrp(product),
        discount: effDiscount(product, basis),
        count: qty,
        total: Math.round(unitOf(product, basis) * qty),
        packed: false,
        unavailable: false,
        substitute: null,
        addedAfterBilling: true,
      };
      items.push(line);
      next.history = [...(next.history || []),
        { at: next.updatedAt, event: `${line.name} x${qty} added to the order` }];
    }
    next.items = items;
  }

  /** Take a line off the bill entirely, as opposed to writing it off as unavailable. */
  if (patch.removeItem !== undefined) {
    const target = String(patch.removeItem);
    const items = next.items || prev.items || [];
    const gone = items.find((it) => String(it.id) === target);
    if (gone) {
      next.items = items.filter((it) => String(it.id) !== target);
      next.history = [...(next.history || []),
        { at: next.updatedAt, event: `${gone.name} removed from the order` }];
    }
  }

  if (patch.itemId !== undefined) {
    const events = [];
    next.items = (next.items || prev.items).map((it) => {
      if (it.id !== patch.itemId) return it;

      if (patch.packed !== undefined) return { ...it, packed: Boolean(patch.packed) };

      if (patch.unavailable !== undefined) {
        const off = Boolean(patch.unavailable);
        events.push(off ? `${it.name} marked out of stock` : `${it.name} back in stock`);
        return off
          ? { ...it, unavailable: true, packed: false, substitute: null }
          : { ...it, unavailable: false, substitute: null };
      }

      if (patch.substitute !== undefined) {
        if (!patch.substitute) {
          events.push(`Replacement for ${it.name} removed`);
          return { ...it, substitute: null, packed: false };
        }
        const sub = {
          id: patch.substitute.id,
          name: patch.substitute.name,
          image: patch.substitute.image || null,
          unitPrice: Number(patch.substitute.unitPrice) || 0,
          mrp: Number(patch.substitute.mrp) || 0,
          count: Math.max(1, Number(patch.substitute.count) || 1),
        };
        events.push(`${it.name} replaced with ${sub.name} x${sub.count}`);
        return { ...it, unavailable: true, substitute: sub, packed: false };
      }

      if (patch.count !== undefined) {
        const n = Math.max(0, Number(patch.count) || 0);
        events.push(`${it.name} quantity changed ${it.count} -> ${n}`);
        return { ...it, count: n, total: Math.round(it.unitPrice * n), unavailable: n === 0 };
      }

      return it;
    });

    if (events.length) {
      next.history = [...(next.history || []), ...events.map((event) => ({ at: next.updatedAt, event }))];
    }
    if (next.status === "new" && next.items.some((it) => it.packed || it.unavailable)) {
      next.status = "packing";
      next.history = [...(next.history || []), { at: next.updatedAt, event: "Packing started" }];
    }
  }

  const saved = recomputeTotals(next);
  saved.rev = Number(prev.rev || 0) + 1;

  // Orders written before revisions existed have no rev field, which matches
  // null in a query - so those are accepted on their first guarded write.
  const guard = prev.rev == null ? { $in: [null, 0] } : prev.rev;
  const res = await (await orders()).replaceOne({ id, rev: guard }, { ...saved });
  return res.matchedCount === 1 ? saved : CONFLICT;
}

export async function orderStats() {
  if (!useDb()) return fileStore.orderStats();

  const all = await (await orders()).find({}, { projection: { status: 1, total: 1 } }).toArray();
  const by = Object.fromEntries(STATUSES.map((s) => [s, 0]));
  let revenue = 0;
  for (const o of all) {
    by[o.status] = (by[o.status] || 0) + 1;
    if (o.status !== "cancelled") revenue += o.total || 0;
  }
  return { total: all.length, by, revenue };
}
