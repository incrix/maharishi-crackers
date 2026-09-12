/**
 * WhatsApp notifications via WATI.
 *
 * Mirrors util/sendMail.js deliberately: same call shape, same fail-soft
 * contract. A WhatsApp failure must never fail an order - the shop would far
 * rather have the order and no message than neither.
 *
 * WATI, not Meta's Cloud API. Three differences drive this file:
 *
 *  1. The endpoint is tenant-specific - https://live-mt-server.wati.io/<id> -
 *     so the base URL is configuration, not a constant. There is no
 *     PHONE_NUMBER_ID; the sending number is fixed to the account.
 *  2. Template parameters are NAMED, not positional. Meta fills {{1}}, {{2}};
 *     WATI matches on {{name}}, so the names here must match the placeholders
 *     in the approved templates exactly.
 *  3. WATI answers HTTP 200 with `{"result": false}` when a send is rejected.
 *     Checking the status alone would report failures as successes.
 *
 * The 24-hour rule still applies - it is WhatsApp's, not the provider's. Order
 * notices sit outside that window, so they go as approved templates. Free-form
 * is opt-in and only works if the customer messaged you within the last day.
 *
 * Nothing here throws when unconfigured; it reports `skipped` instead.
 */

const TIMEOUT_MS = 10000;
const env = (k, fallback = "") => (process.env[k] || fallback).trim();

/** Tenant base, e.g. https://live-mt-server.wati.io/349022 (no trailing slash). */
const baseUrl = () => env("WHATSAPP_API_URL").replace(/\/+$/, "");

const TEMPLATES = {
  confirm: () => env("WHATSAPP_TEMPLATE_CONFIRM", "order_confirmation"),
  packed: () => env("WHATSAPP_TEMPLATE_PACKED", "order_packed"),
  dispatch: () => env("WHATSAPP_TEMPLATE_DISPATCH", "order_dispatched"),
  cancelled: () => env("WHATSAPP_TEMPLATE_CANCELLED", "order_cancelled"),
  shop: () => env("WHATSAPP_TEMPLATE_SHOP", "new_order_alert"),
};

export function isWhatsAppConfigured() {
  return Boolean(env("WHATSAPP_TOKEN") && baseUrl());
}

/**
 * Normalise an Indian mobile to the digits-only form WATI expects.
 *
 * Customers type these however they like: "98765 43210", "+91 98765 43210",
 * "091-98765-43210", "0091...". Returns null when it cannot produce a
 * plausible number, so a bad value is skipped rather than sent somewhere
 * arbitrary.
 */
export function toE164(raw, defaultCc = "91") {
  let d = String(raw || "").replace(/\D/g, "");
  if (!d) return null;
  d = d.replace(/^0+/, "");
  if (d.startsWith("91") && d.length === 12) return d;
  if (d.length === 10) return defaultCc + d;
  if (d.length >= 11 && d.length <= 15) return d;
  return null;
}

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

async function call(path, { method = "GET", body } = {}) {
  const token = env("WHATSAPP_TOKEN");
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${baseUrl()}${path}`, {
      method,
      headers: {
        // WATI tokens are already prefixed in some dashboards; don't double it.
        Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: ctl.signal,
    });

    const text = await res.text();
    let data = {};
    try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text.slice(0, 300) }; }

    // WATI reports problems in three different shapes depending on endpoint:
    //   { info: "..." }                              - most failures
    //   { items: [{ code, description }] }           - validation errors
    //   { result: false }                            - rejected, sometimes on a 200
    // Reading only the status, or only `info`, loses the reason.
    const reason =
      data?.info ||
      data?.message ||
      (Array.isArray(data?.items) && data.items.length
        ? data.items.map((i) => i.description || i.code).filter(Boolean).join("; ")
        : null) ||
      data?.raw;

    if (!res.ok) throw new Error(reason || `HTTP ${res.status}`);
    if (data?.result === false || data?.ok === false || (Array.isArray(data?.items) && reason)) {
      throw new Error(reason || "WATI rejected the message");
    }
    return data;
  } finally {
    clearTimeout(timer);
  }
}

/** WATI matches on parameter NAME, so these must match the template text. */
const vars = {
  confirm: (o) => [
    { name: "name", value: o.customer?.name || "there" },
    { name: "ref", value: o.ref },
    { name: "total", value: inr(o.total) },
  ],
  packed: (o) => [
    { name: "name", value: o.customer?.name || "there" },
    { name: "ref", value: o.ref },
  ],
  dispatch: (o) => [
    { name: "name", value: o.customer?.name || "there" },
    { name: "ref", value: o.ref },
  ],
  cancelled: (o) => [
    { name: "name", value: o.customer?.name || "there" },
    { name: "ref", value: o.ref },
  ],
  shop: (o) => [
    { name: "ref", value: o.ref },
    { name: "customer", value: o.customer?.name || "counter" },
    { name: "phone", value: o.customer?.phone || "-" },
    { name: "total", value: inr(o.total) },
    { name: "items", value: String(o.itemCount ?? "") },
  ],
};

/** Wording used only when free-form is enabled; templates carry the real copy. */
const plain = {
  confirm: (o) => `Hi ${o.customer?.name || "there"}, we have your order ${o.ref} for ${inr(o.total)}. We will call to confirm before dispatch.`,
  packed: (o) => `Hi ${o.customer?.name || "there"}, your order ${o.ref} is packed and ready to go.`,
  dispatch: (o) => `Hi ${o.customer?.name || "there"}, your order ${o.ref} has been dispatched.`,
  cancelled: (o) => `Hi ${o.customer?.name || "there"}, your order ${o.ref} has been cancelled. Call us if that is unexpected.`,
  shop: (o) => `New order ${o.ref} from ${o.customer?.name || "counter"} (${o.customer?.phone || "-"}) - ${inr(o.total)}, ${o.itemCount} items.`,
};

const FREEFORM = () => env("WHATSAPP_ALLOW_FREEFORM") === "true";

/**
 * A template send, optionally carrying a document header.
 *
 * A template whose header is a Document needs the file supplied per message -
 * the URL entered when the template was created is only a sample for Meta's
 * approval. WhatsApp fetches `documentUrl` from Meta's servers, so it must be
 * publicly reachable; a localhost address will silently fail there.
 */
async function sendTemplate(to, templateName, parameters, media) {
  const body = {
    template_name: templateName,
    // WATI requires a broadcast name; it is only a label in their reports.
    broadcast_name: `${templateName}_${new Date().toISOString().slice(0, 10)}`,
    parameters,
  };
  if (media?.url) {
    body.media = { url: media.url, fileName: media.fileName || "document.pdf" };
  }
  return call(`/api/v1/sendTemplateMessage?whatsappNumber=${encodeURIComponent(to)}`, {
    method: "POST",
    body,
  });
}

async function sendSession(to, text) {
  return call(
    `/api/v1/sendSessionMessage/${encodeURIComponent(to)}?messageText=${encodeURIComponent(text)}`,
    { method: "POST" }
  );
}

async function deliver(to, kind, order, media) {
  return FREEFORM()
    ? sendSession(to, plain[kind](order))
    : sendTemplate(to, TEMPLATES[kind](), vars[kind](order), media);
}

export async function sendCustomerWhatsApp({ order, kind = "confirm", documentUrl }) {
  if (!isWhatsAppConfigured()) return { skipped: "WhatsApp is not configured" };
  const to = toE164(order?.customer?.phone);
  if (!to) return { skipped: "no usable customer phone number" };
  if (!vars[kind]) return { skipped: `no WhatsApp message defined for "${kind}"` };

  // Only the confirmation carries the proforma; the later notices are text.
  const media = kind === "confirm" && documentUrl
    ? { url: documentUrl, fileName: `Proforma-${order.ref}.pdf` }
    : null;
  return deliver(to, kind, order, media);
}

export async function sendShopWhatsApp({ order }) {
  if (!isWhatsAppConfigured()) return { skipped: "WhatsApp is not configured" };
  const to = toE164(env("WHATSAPP_SHOP_NUMBER"));
  if (!to) return { skipped: "WHATSAPP_SHOP_NUMBER is not set" };
  return deliver(to, "shop", order);
}

/**
 * Both sides of a new order. Settled, not raced: the shop must still be told
 * even if the customer's number is unreachable, and vice versa.
 */
export async function sendOrderWhatsApps({ order, documentUrl }) {
  const results = { customer: false, shop: false, skipped: {}, errors: {} };
  const [customer, shop] = await Promise.allSettled([
    sendCustomerWhatsApp({ order, kind: "confirm", documentUrl }),
    sendShopWhatsApp({ order }),
  ]);
  for (const [key, r] of [["customer", customer], ["shop", shop]]) {
    if (r.status === "rejected") results.errors[key] = r.reason?.message;
    else if (r.value?.skipped) results.skipped[key] = r.value.skipped;
    else results[key] = true;
  }
  return results;
}

/**
 * The templates WATI actually holds, so the names and placeholders configured
 * here can be checked against the account rather than assumed.
 */
export async function listWatiTemplates() {
  if (!isWhatsAppConfigured()) return { skipped: "WhatsApp is not configured" };
  const data = await call("/api/v1/getMessageTemplates");
  const list = data?.messageTemplates || data?.result || data || [];
  return Array.isArray(list)
    ? list.map((t) => ({
        name: t.elementName || t.name,
        status: t.status,
        // Placeholder names are what our `vars` must match.
        params: (t.customParams || t.parameters || []).map((p) => p.paramName || p.name),
      }))
    : { raw: data };
}

/** Configuration report for the admin health check. Sends nothing. */
export function whatsAppDiagnostics() {
  return {
    provider: "wati",
    configured: isWhatsAppConfigured(),
    apiUrl: baseUrl() || "missing (WHATSAPP_API_URL)",
    token: env("WHATSAPP_TOKEN") ? "set" : "missing",
    shopNumber: toE164(env("WHATSAPP_SHOP_NUMBER")) || "missing or unparseable",
    mode: FREEFORM() ? "session messages (24h window only)" : "approved templates",
    templates: Object.fromEntries(Object.entries(TEMPLATES).map(([k, v]) => [k, v()])),
  };
}
