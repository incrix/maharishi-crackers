/**
 * Bill pricing, shared.
 *
 * There is one price list, shared with the website. A counter bill charges the
 * MRP less the biller's ExtraDiscount; a website order charges the MRP less the
 * product's own discount. Which rule applies is decided by the order's source,
 * which every order already records.
 *
 * These lived inside Pos.jsx, private to the counter screen, so everywhere else
 * that had to price a product against an existing bill - adding a line to an
 * order, choosing a replacement - reached for `unitPrice()` from util/cart
 * instead. That applies the product's discount and knows nothing about
 * ExtraDiscount, so a counter bill gained lines at neither the rate it was
 * written at nor any rate the shop had agreed. One definition, so those callers
 * cannot drift again.
 */

const clamp = (n) => Math.min(95, Math.max(0, Number(n) || 0));

/** The single price list. */
export const basisMrp = (p) => Number(p?.price) || 0;

/**
 * The discount that applies to a line, given the bill it is going on.
 *
 * Counter: the biller's ExtraDiscount, and nothing else - a product carries no
 * discount of its own at the counter. Website: the product's own discount.
 */
export const effDiscount = (p, { pos, extra }) =>
  pos ? clamp(extra) : clamp(p?.discount);

/** Unit price, rounded the same way the server rounds it. */
export const unitOf = (p, basis) => {
  const m = basisMrp(p);
  return Math.round(m - (m * effDiscount(p, basis)) / 100);
};

/**
 * The pricing basis a bill was written on.
 *
 * `source` has always been stored, so the rule is never in doubt. What older
 * counter bills lack is the ExtraDiscount that was keyed in, which is why
 * `recorded` is about that figure alone - a website order has nothing further
 * to remember and is always fully recorded.
 */
export function orderBasis(order) {
  const pos = order?.source === "pos";
  const has = order?.extraDiscount != null;
  return {
    pos,
    extra: clamp(order?.extraDiscount),
    recorded: !pos || has,
  };
}

/** How the basis reads on screen. */
export function basisLabel({ pos, extra, recorded, inferred }) {
  if (!pos) return "Website rates";
  if (!recorded && !inferred) return "Counter bill · concession not recorded";
  return `Counter bill${extra > 0 ? ` · ${extra}% ExtraDiscount` : " · no concession"}`;
}

/**
 * Recovers the ExtraDiscount from an older counter bill.
 *
 * At the counter the stored line discount IS the ExtraDiscount - nothing else
 * contributes to it - so this reads the figure back rather than deducing it.
 * The commonest value across the lines wins, so one line edited after the fact
 * cannot misreport the bill.
 *
 * Returns null when there is nothing to read, leaving the biller to say.
 */
export function inferBasis(order) {
  if (order?.source !== "pos") return null;
  const items = order?.items || [];
  if (!items.length) return null;

  const counts = new Map();
  for (const line of items) {
    const d = clamp(line.discount);
    counts.set(d, (counts.get(d) || 0) + 1);
  }
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  if (!ranked.length) return null;

  const [extra, agreed] = ranked[0];
  return { pos: true, extra, recorded: false, inferred: true, confidence: agreed / items.length };
}
