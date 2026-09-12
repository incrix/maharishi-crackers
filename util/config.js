/**
 * Where product media lives.
 *
 * Assets (images, the price list PDF and the catalogue seed) are served from
 * a static asset host rather than the application deployment, which keeps tens
 * of megabytes of artwork out of the build.
 *
 * TODO(abishek): point NEXT_PUBLIC_ASSET_BASE at Maharishi's own asset host.
 * Until then this falls back to a local /database folder — it must NOT fall
 * back to any inherited domain.
 *
 * Override per environment with NEXT_PUBLIC_ASSET_BASE (no trailing slash).
 * Point it at "/database" to serve from a local public/database folder instead.
 */
export const ASSET_BASE = (
  process.env.NEXT_PUBLIC_ASSET_BASE || "/database"
).replace(/\/$/, "");

/**
 * Makes an asset URL absolute.
 *
 * ASSET_BASE is allowed to be site-relative ("/database") - the comment above
 * recommends it for local development - but `fetch()` and `Response.redirect()`
 * both reject a relative URL. Without this the catalogue seed threw
 * "Failed to parse URL" and /api/price-list answered 500.
 *
 * `origin` should be the incoming `request.url` where there is one, so the
 * resolved host matches whatever the caller reached; NEXT_PUBLIC_SITE_URL is the
 * fallback for code with no request in scope. Throws rather than guessing: a
 * silently wrong host is harder to spot than a failed read.
 */
export function absoluteAssetUrl(url, origin) {
  if (/^https?:\/\//.test(url)) return url;
  const base = origin || process.env.NEXT_PUBLIC_SITE_URL || "";
  if (!base) {
    throw new Error(`cannot resolve "${url}" without an origin - set NEXT_PUBLIC_SITE_URL`);
  }
  return new URL(url, base).href;
}

/** The catalogue seed, read once by the product store to populate itself. */
export const PRODUCT_SEED_URL = `${ASSET_BASE}/SortedJSON/productData.json`;

/** Live catalogue for the storefront: the editable store, not the seed file. */
export const PRODUCT_DATA_URL = "/api/products";

/** Used until the admin uploads one - the copy that shipped with the site. */
// TODO(abishek): replace with Maharishi's own price list PDF once you send it.
export const PRICE_LIST_FALLBACK = `${ASSET_BASE}/${encodeURIComponent(
  "MAHARISHI CRACKERS PRICE LIST 2026.pdf"
)}`;

/**
 * Every "Download price list" link points here. The route redirects to
 * whichever PDF the admin last uploaded, so the links never need updating.
 */
export const PRICE_LIST_URL = "/api/price-list";

/**
 * Resolves a stored image path to a URL.
 *
 * Handles three shapes: images added through the admin (public/uploads),
 * absolute URLs, and catalogue paths — some of which carry a leading slash
 * ("/specials/luckymoney/1.png") that would otherwise produce a
 * double slash. Path segments are encoded so apostrophes and spaces survive.
 */
export function assetUrl(path) {
  if (!path) return "";
  const clean = String(path).replace(/^\/+/, "");
  // Images the admin uploaded: from the database, or from public/uploads when
  // running without one.
  if (clean.startsWith("media/")) return `/api/${clean}`;
  if (clean.startsWith("uploads/")) return `/${clean}`;
  if (/^https?:\/\//.test(clean)) return clean;
  const encoded = clean.split("/").map(encodeURIComponent).join("/");
  return `${ASSET_BASE}/${encoded}`;
}

/**
 * A delivery-optimised URL for a product photo.
 *
 * The catalogue images are raw PNGs on Cloudinary - the one measured was 399 KB
 * for a tile rendered about 265px wide. Asking Cloudinary to resize and pick a
 * modern format on delivery takes the same image to roughly 33 KB, a ~92%
 * saving, without re-uploading anything:
 *
 *   f_auto  negotiate AVIF/WebP from the browser's Accept header
 *   q_auto  quality chosen per image rather than a fixed number
 *   w_<n>   resize to the width actually rendered
 *
 * Anything that is not a Cloudinary upload URL is returned untouched, so admin
 * uploads and local paths keep working.
 */
export function productImage(url, width) {
  const src = assetUrl(url);
  if (!src || !src.includes("/image/upload/")) return src;
  // Do not stack transforms if one is already present.
  if (/\/image\/upload\/[^/]*(f_auto|q_auto|w_\d)/.test(src)) return src;
  const t = ["f_auto", "q_auto", width ? `w_${width}` : null].filter(Boolean).join(",");
  return src.replace("/image/upload/", `/image/upload/${t}/`);
}

/** Shown in the top strip until the admin edits it. */
export const DEFAULT_BANNER = {
  text: "Diwali 2026 — order early for guaranteed dispatch",
  href: "",
  enabled: true,
};
