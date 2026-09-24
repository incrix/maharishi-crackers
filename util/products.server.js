import { getPublicProducts } from "@/util/productsStore";

/**
 * Server-side product access, for metadata, structured data and sitemaps.
 *
 * The catalogue is fetched in the browser for the interactive shop, but search
 * engines need it rendered into the HTML - so pages read it here at request
 * time instead, straight from the same store the admin edits.
 */

export async function getProducts() {
  try {
    return await getPublicProducts();
  } catch (err) {
    /**
     * A misconfigured deployment must not render as an empty shop.
     *
     * Swallowing every failure here is how a total storage outage came out as
     * a tidy page reading "Every cracker we stock - 0 products - there are no
     * products in All right now". Nothing looked broken, so nobody knew: a
     * customer reads that as a shop with nothing in it, and a crawler indexes
     * an empty ItemList for the storefront.
     *
     * A configuration error is not transient and will not fix itself, so it
     * escapes and the page fails visibly. Anything else - a throttle, a
     * momentary network fault - still degrades quietly, which is the case this
     * catch was written for.
     */
    if (err.code === "DB_NOT_CONFIGURED") throw err;
    console.error("product data unavailable:", err.message);
    return [];
  }
}

export async function getProduct(id) {
  return (await getProducts()).find((p) => String(p.id) === String(id)) || null;
}

/** Categories in the shop's arranged order - products arrive grouped by it. */
export async function getCategories() {
  const counts = new Map();
  (await getProducts()).forEach((p) => counts.set(p.category, (counts.get(p.category) || 0) + 1));
  return [...counts.entries()].map(([name, count]) => ({ name, count }));
}
