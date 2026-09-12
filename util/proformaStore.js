import { collection, isDbConfigured } from "@/util/db/mongo";

/** Public path WhatsApp/Meta will fetch the document from. */
export const proformaPath = (orderId) => `/api/orders/${orderId}/proforma`;

/**
 * Absolute URL for the proforma. Meta fetches this from its own servers, so a
 * relative path is useless and a localhost one is unreachable - which is why
 * this returns null unless NEXT_PUBLIC_SITE_URL points at a public host.
 */
export function proformaUrl(orderId) {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/+$/, "");
  if (!base || /localhost|127\.0\.0\.1/.test(base)) return null;
  return `${base}${proformaPath(orderId)}`;
}

/**
 * Keep the rendered proforma so it can be served at a URL.
 *
 * The checkout already renders it in the browser and posts it as base64 for the
 * email attachment; before this it was used once and thrown away. Stored under
 * a per-order name so a re-issue after packing replaces the old one.
 */
export async function saveProforma({ orderId, ref, base64 }) {
  if (!isDbConfigured() || !base64) return false;
  const data = Buffer.from(base64, "base64");
  // Well under MongoDB's 16 MB document ceiling, but refuse the pathological case.
  if (!data.length || data.length > 12 * 1024 * 1024) return false;

  await (await collection("media")).updateOne(
    { name: `proforma:${orderId}` },
    { $set: { name: `proforma:${orderId}`, ref, contentType: "application/pdf",
              size: data.length, data, createdAt: new Date().toISOString() } },
    { upsert: true }
  );
  return true;
}
