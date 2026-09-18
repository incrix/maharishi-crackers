import { unstable_cache } from "next/cache";
import { TABLE, getItem, putItem, isDbConfigured, assertUsableStore } from "@/util/db/dynamo";
import { DEFAULT_BANNER } from "@/util/config";

/**
 * A tiny key/value store for site settings the admin can change - the price
 * list PDF and the announcement strip.
 *
 * Deliberately not the filesystem: on Vercel that is read-only, so a setting
 * written at runtime would vanish. Without a database configured the getters
 * return null and callers fall back to their compiled-in default.
 */

export async function getSetting(key) {
  if (!isDbConfigured()) {
    // Returning null here is how a missing price list quietly became a
    // redirect to a file that was not there, with nothing in the logs.
    assertUsableStore();
    return null;
  }
  const doc = await getItem(TABLE.settings, key);
  return doc?.value ?? null;
}

/** Swallows a read failure. Use only where a missing value is survivable. */
export async function getSettingSafe(key) {
  try {
    return await getSetting(key);
  } catch (err) {
    console.error("getSetting failed:", err);
    return null;
  }
}

export async function setSetting(key, value) {
  if (!isDbConfigured()) throw new Error("No database configured");
  // A whole-item write, not a field patch: these rows are one value each, so
  // there is nothing beside it that a replace could clobber.
  await putItem(TABLE.settings, { key, value, updatedAt: new Date().toISOString() });
  return value;
}

export const BANNER_KEY = "banner";
export const BANNER_TAG = "site-banner";

/**
 * The top announcement strip, read by the root layout.
 *
 * Cached and tagged rather than read directly: an uncached database call in the
 * root layout would opt every page out of static rendering. The admin's save
 * calls revalidateTag(BANNER_TAG), so an edit still appears immediately.
 */
const readBanner = unstable_cache(
  async () => (await getSetting(BANNER_KEY)) || DEFAULT_BANNER,
  ["site-banner"],
  { tags: [BANNER_TAG], revalidate: 3600 }
);

/**
 * A failed read must not be cached.
 *
 * Were the error caught inside the cached function, one momentary blip would be
 * stored as though it were the truth and the site would advertise the built-in
 * default for the next hour. The error escapes the cache and is handled out
 * here instead, where falling back costs nothing beyond this one request.
 */
export async function getBanner() {
  try {
    return await readBanner();
  } catch (err) {
    console.error("banner unavailable, using the default:", err.message);
    return DEFAULT_BANNER;
  }
}
