import { putMedia, isMediaConfigured } from "@/util/db/media";

/** Public path WhatsApp will fetch the document from. */
export const proformaPath = (orderId) => `/api/orders/${orderId}/proforma`;

/**
 * Absolute URL for the proforma. WATI fetches this from its own servers, so a
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
 *
 * S3 rather than the database: a DynamoDB item stops at 400 KB, which a
 * proforma of any length would eventually exceed.
 */
export async function saveProforma({ orderId, ref, base64 }) {
  if (!isMediaConfigured() || !base64) return false;
  const data = Buffer.from(base64, "base64");
  // Refuse the pathological case rather than paying to store it.
  if (!data.length || data.length > 12 * 1024 * 1024) return false;

  await putMedia({
    name: `proforma:${orderId}`,
    contentType: "application/pdf",
    bytes: data,
    // The order's reference, so the served file can be named after the bill
    // rather than the UUID in its URL.
    meta: { ref },
  });
  return true;
}
