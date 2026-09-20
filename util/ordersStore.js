import crypto from "crypto";
import {
  TABLE, getItem, putItem, putIfAbsent, putIfRev, scanAll, bumpCounter, isDbConfigured, assertUsableStore,
} from "@/util/db/dynamo";
import * as fileStore from "./ordersStore.file";
import { basisMrp, effDiscount, unitOf, orderBasis, inferBasis } from "@/util/pricing";
import { getCatalogue } from "@/util/productsStore";

/**
 * Order storage.
 *
 * DynamoDB when AWS credentials are set, otherwise the original JSON file store
 * so local development works without a cluster. The database exists because a
 * serverless host has a read-only, ephemeral filesystem - writing orders to
 * disk there fails outright.
 */

function useDb() {
  if (isDbConfigured()) return true;
  // Throws on a serverless host rather than limping into a file store that
  // cannot possibly work there. See assertUsableStore.
  assertUsableStore();
  return false;
}

/**
 * Duplicate-guard rows share the orders table under a reserved id.
 *
 * DynamoDB has no unique secondary index, so the till's clientRef cannot simply
 * be declared unique the way it was in MongoDB. Instead the first writer claims
 * `claim#<clientRef>` with a conditional write, which the service evaluates
 * atomically - a second device racing on the same bill loses the claim rather
 * than writing a second order. They expire, because they only matter for as
 * long as a till might retry.
 */
const claimId = (key) => `claim#${key}`;
const isClaim = (row) => String(row?.id || "").startsWith("claim#");
const CLAIM_TTL_DAYS = 7;

/** Every real order. Claim rows are an implementation detail and never leak. */
async function allOrders() {
  return (await scanAll(TABLE.orders)).filter((o) => !isClaim(o));
}

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
 * ADD is applied by DynamoDB itself and returns the value it settled on, so two
 * customers checking out at the same instant cannot be handed the same number -
 * which scanning for the highest existing ref would allow.
 */
async function nextRef() {
  const seq = await bumpCounter("orderRef", 1);
  return "MC-" + String(seq).padStart(4, "0");
}

/** Left from the MongoDB era, where the store's own _id never left the store. */
const strip = ({ _id, ...rest }) => rest;

export async function listOrders() {
  if (!useDb()) return fileStore.listOrders();
  // Sorted here: a Scan comes back in no particular order.
  const docs = (await allOrders()).sort((a, b) =>
    String(b.createdAt).localeCompare(String(a.createdAt)));
  return docs.map(strip);
}

export async function getOrder(id) {
  if (!useDb()) return fileStore.getOrder(id);
  const doc = await getItem(TABLE.orders, id);
  // A claim row is not an order and must never be served as one, however it
  // was asked for.
  if (!doc || isClaim(doc)) return null;
  return strip(doc);
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
    const claimed = await getItem(TABLE.orders, claimId(key));
    if (claimed?.orderId) {
      const existing = await getItem(TABLE.orders, claimed.orderId);
      if (existing) return { ...strip(existing), duplicate: true };
    }
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

  // Claim the bill BEFORE writing it. Losing the claim means another device
  // already wrote this same bill, so hand back theirs rather than surfacing an
  // error to the biller - or writing a second order with a second reference.
  if (key) {
    const won = await putIfAbsent(TABLE.orders, {
      id: claimId(key),
      orderId: order.id,
      createdAt: now,
      // Read by the table's TTL setting, in whole seconds since the epoch.
      expiresAt: Math.floor(Date.now() / 1000) + CLAIM_TTL_DAYS * 86400,
    });
    if (!won) {
      const claimed = await getItem(TABLE.orders, claimId(key));
      const winner = claimed?.orderId ? await getItem(TABLE.orders, claimed.orderId) : null;
      if (winner) return { ...strip(winner), duplicate: true };
      // The claim exists but its order does not - the winner died between the
      // two writes. Take it over rather than leaving the till unable to bill.
    }
  }

  await putItem(TABLE.orders, { ...order });
  return order;
}

/**
 * Applies a patch to an order.
 *
 * Read-modify-write, guarded by a revision number. A packer ticking several
 * lines in quick succession fires overlapping requests; each used to read the
 * same document and then write the whole thing back, so the last write won and
 * the other ticks were silently lost. The write now only lands if the stored
 * order still carries the revision we read, and a losing writer re-reads and
 * reapplies its own change rather than clobbering someone else's.
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
   * Correct the customer's own details on a raised bill.
   *
   * Phone numbers get taken down wrong over a counter and addresses change
   * between the order and the dispatch, and until now the only way to fix
   * either was to cancel the bill and write it again - which loses the
   * reference the customer was already given.
   *
   * Only the fields sent are touched, so a panel that knows about six fields
   * cannot blank a seventh it has never heard of. The name is the one field
   * that cannot be emptied: it is what the bill, the challan and every
   * notification address.
   *
   * The change is recorded in the history, and the phone and email record what
   * they were as well as what they became - those two decide where the order's
   * notifications go, so "who changed this, and from what" is a question worth
   * being able to answer.
   */
  if (patch.customer && typeof patch.customer === "object") {
    const FIELDS = ["name", "email", "phone", "address", "city", "state", "zip"];
    const clean = (v) => String(v ?? "").trim().slice(0, 200);
    const prevCustomer = prev.customer || {};
    const merged = { ...prevCustomer };
    const changes = [];

    for (const field of FIELDS) {
      if (!(field in patch.customer)) continue;
      const value = clean(patch.customer[field]);
      if (value === clean(prevCustomer[field])) continue;
      if (field === "name" && !value) {
        throw new Error("The customer's name cannot be empty");
      }
      // Recording the old value for the two fields that decide where a
      // notification is delivered; the rest are named but not quoted, to keep
      // the history readable.
      changes.push(
        field === "phone" || field === "email"
          ? `${field} ${clean(prevCustomer[field]) || "(blank)"} -> ${value || "(blank)"}`
          : field
      );
      merged[field] = value;
    }

    if (changes.length) {
      next.customer = merged;
      next.history = [...(next.history || prev.history || []), {
        at: next.updatedAt,
        event: `Customer details updated: ${changes.join(", ")}`,
      }];
    }
  }

  /**
   * Restate the whole bill on a new concession.
   *
   * There is one price list, so the only thing that can move is the counter's
   * ExtraDiscount - hence `{ extraDiscount }` and no list to choose.
   *
   * Every line is recomputed from the catalogue rather than scaled from its
   * stored figures. Scaling would compound the rounding already baked into
   * them, and after two changes of mind the bill no longer matches any rate the
   * shop actually charges.
   *
   * A line whose product has left the catalogue is left exactly as it is and
   * named in the history entry. Guessing at a price for it would misstate what
   * the customer owes, and dropping it silently would be worse.
   */
  if (patch.reprice) {
    // A concession is a counter thing. Repricing a website order would price it
    // pos-style while `source` still said otherwise, so orderBasis would report
    // one rule and the lines would show another - and the next line added would
    // silently disagree with the rest of the bill.
    if (prev.source !== "pos") {
      throw new Error("Only a counter bill carries a concession - a website order is charged at website rates");
    }
    const extra = Math.min(95, Math.max(0, Number(patch.reprice.extraDiscount) || 0));
    const basis = { pos: true, extra };
    const { products: catalogue } = await getCatalogue();
    const byId = new Map(catalogue.map((p) => [String(p.id), p]));

    const missing = [];
    next.items = (next.items || prev.items || []).map((line) => {
      const product = byId.get(String(line.id));
      if (!product) { missing.push(line.name); return line; }
      const unitPrice = unitOf(product, basis);
      return {
        ...line,
        mrp: basisMrp(product),
        discount: effDiscount(product, basis),
        unitPrice,
        total: Math.round(unitPrice * (line.count || 0)),
      };
    });

    next.extraDiscount = extra;
    next.history = [...(next.history || []), {
      at: next.updatedAt,
      event: `Repriced as a counter bill${extra > 0 ? ` with ${extra}% ExtraDiscount` : " with no concession"}`
        + (missing.length ? ` (left unchanged, no longer stocked: ${missing.join(", ")})` : ""),
    }];
  }

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

  // Orders written before revisions existed carry no rev at all; passing null
  // tells the guard to accept either an absent revision or zero.
  const won = await putIfRev(TABLE.orders, { ...saved }, prev.rev == null ? null : prev.rev);
  return won ? saved : CONFLICT;
}

export async function orderStats() {
  if (!useDb()) return fileStore.orderStats();

  // No projection: DynamoDB charges for the item it reads, not the fields
  // returned, so asking for two attributes would cost exactly the same.
  const all = await allOrders();
  const by = Object.fromEntries(STATUSES.map((s) => [s, 0]));
  let revenue = 0;
  for (const o of all) {
    by[o.status] = (by[o.status] || 0) + 1;
    if (o.status !== "cancelled") revenue += o.total || 0;
  }
  return { total: all.length, by, revenue };
}
