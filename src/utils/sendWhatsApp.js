/**
 * Send order summary + PDF invoice to merchant via Meta WhatsApp Cloud API.
 * Native fetch only (Node 18+). No SDKs.
 *
 * Required env vars:
 *   WHATSAPP_TOKEN          — Permanent access token from Meta Business
 *   WHATSAPP_PHONE_NUMBER_ID — The sender phone number ID from WhatsApp Business API
 *   WHATSAPP_TO             — Merchant's WhatsApp number (with country code, no + or spaces)
 *   WHATSAPP_API_VERSION    — Optional, defaults to v22.0
 */

const GRAPH_BASE = "https://graph.facebook.com";

function buildOrderText(order) {
  const apiVersion = ""; // not used here, just a marker
  const itemLines = (order.items || [])
    .map((it) => {
      const unit = Math.round(it.price - (it.price * (it.discount || 0)) / 100);
      const lineTotal = unit * (it.count || it.qty || 1);
      const qty = it.count || it.qty || 1;
      return `• ${it.name} (×${qty}) - ₹${lineTotal}`;
    })
    .join("\n");

  return (
    `🎉 New Order Received!\n\n` +
    `Order #${order.id || order.order_number || "—"}\n` +
    `Customer: ${order.customer?.name || "—"}\n` +
    `Phone: ${order.customer?.phone || "—"}\n` +
    `Email: ${order.customer?.email || "—"}\n` +
    `Total: ₹${order.total}\n\n` +
    `Items:\n${itemLines}\n\n` +
    `Shipping: ${order.shippingAddress || order.customer?.address || "Not provided"}\n` +
    `Payment: ${order.paymentStatus || "Pay on delivery / to be confirmed"}`
  );
}

async function postMessage({ phoneNumberId, token, body, apiVersion }) {
  const url = `${GRAPH_BASE}/${apiVersion}/${phoneNumberId}/messages`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(`WhatsApp send failed: ${res.status} ${JSON.stringify(data)}`);
    err.response = data;
    err.status = res.status;
    throw err;
  }
  return data;
}

/**
 * Upload PDF buffer to Meta Cloud API media endpoint.
 * Returns the media id you can use in subsequent message calls.
 */
async function uploadMedia({ phoneNumberId, token, apiVersion, fileBuffer, filename = "invoice.pdf", mimeType = "application/pdf" }) {
  const url = `${GRAPH_BASE}/${apiVersion}/${phoneNumberId}/media`;
  const form = new FormData();
  // Meta requires "file" field, plus messaging_product + type
  const blob = new Blob([fileBuffer], { type: mimeType });
  form.append("file", blob, filename);
  form.append("messaging_product", "whatsapp");
  form.append("type", mimeType);

  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.id) {
    const err = new Error(`WhatsApp media upload failed: ${res.status} ${JSON.stringify(data)}`);
    err.response = data;
    err.status = res.status;
    throw err;
  }
  return data.id;
}

/**
 * Public entrypoint.
 *
 * @param {object} order        — same order object the email flow uses
 * @param {object} [options]
 * @param {Buffer|Uint8Array} [options.pdfBuffer] — PDF bytes to attach (optional)
 * @param {string}            [options.pdfUrl]    — Public URL to PDF (alternative to buffer)
 * @param {string}            [options.pdfName]   — Filename shown in WhatsApp (default: invoice.pdf)
 *
 * @returns {Promise<{textMessageId?: string, documentMessageId?: string}>}
 */
export async function sendOrderToWhatsApp(order, options = {}) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const to = process.env.WHATSAPP_TO;
  const apiVersion = process.env.WHATSAPP_API_VERSION || "v22.0";

  if (!token || !phoneNumberId || !to) {
    throw new Error("WhatsApp env vars missing: WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_TO");
  }

  const orderNumber = order.id || order.order_number || "—";
  const result = {};

  // 1) Send the text summary
  const textBody = {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { preview_url: false, body: buildOrderText(order) },
  };
  const textRes = await postMessage({ phoneNumberId, token, body: textBody, apiVersion });
  result.textMessageId = textRes?.messages?.[0]?.id;

  // 2) Attach PDF if provided (URL preferred, else upload buffer)
  if (options.pdfUrl || options.pdfBuffer) {
    let documentBody;

    if (options.pdfUrl) {
      documentBody = {
        messaging_product: "whatsapp",
        to,
        type: "document",
        document: {
          link: options.pdfUrl,
          filename: options.pdfName || `invoice-${orderNumber}.pdf`,
          caption: `Invoice for Order #${orderNumber}`,
        },
      };
    } else {
      const mediaId = await uploadMedia({
        phoneNumberId,
        token,
        apiVersion,
        fileBuffer: options.pdfBuffer,
        filename: options.pdfName || `invoice-${orderNumber}.pdf`,
      });
      documentBody = {
        messaging_product: "whatsapp",
        to,
        type: "document",
        document: {
          id: mediaId,
          filename: options.pdfName || `invoice-${orderNumber}.pdf`,
          caption: `Invoice for Order #${orderNumber}`,
        },
      };
    }

    const docRes = await postMessage({ phoneNumberId, token, body: documentBody, apiVersion });
    result.documentMessageId = docRes?.messages?.[0]?.id;
  }

  console.log(`[whatsapp-invoice] sent for order #${orderNumber}`);
  return result;
}
