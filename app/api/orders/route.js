import { listOrdersWithStats, createOrder, updateOrder } from "@/util/ordersStore";
import { requireAdmin } from "@/util/admin/auth";
import { sendOrderMails } from "@/util/sendMail";
import { sendOrderWhatsApps } from "@/util/sendWhatsApp";
import { saveProforma, proformaUrl } from "@/util/proformaStore";
import { meetsMinimumFor, belowMinimumMessage, acceptsDeliveryTo, deliveryClosedMessage, onlineSalesOpen, SALES_CLOSED_MESSAGE } from "@/util/minimumOrder";

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
/** Rounded per unit, the same way the cart and checkout round it. */
const lineAmount = (p) => Math.round(p.price - (p.price * (p.discount || 0)) / 100) * (p.count || 0);

export const dynamic = "force-dynamic";
// Saving the order plus two emails; the default 10s can be tight on a slow
// mail server. Vercel Pro honours this, Hobby caps at 10s regardless.
export const maxDuration = 30;

/** Admin only - the order list carries customer contact details. */
export async function GET(request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  // `?since=` returns only orders changed after it - see listOrdersWithStats.
  // The cursor handed back is taken before the scan and a minute early, so a
  // write that lands while the scan runs, or on a server whose clock runs a
  // little behind, is sent again next time rather than missed. The panel
  // merges by id, so a repeat is harmless.
  const cursor = new Date(Date.now() - 60_000).toISOString();
  const raw = new URL(request.url).searchParams.get("since");
  const since = raw && !Number.isNaN(Date.parse(raw)) ? new Date(raw).toISOString() : null;

  const { orders, stats } = await listOrdersWithStats(since);
  return Response.json({ orders, stats, cursor, partial: Boolean(since) });
}

/**
 * Public: called by checkout when a customer places an order.
 *
 * Records the order first, then emails both copies - the customer's receipt and
 * the shop's packing notice. The order is saved either way: a mail outage must
 * never cost the shop an order, and both emails carry the reference (MC-0001)
 * that is only known once the order exists.
 *
 * `invoice` is base64 PDF rendered in the browser. The invoice template is a
 * "use client" component, so rendering it on the server yields a client
 * reference rather than a component (React error #130).
 */
export async function POST(request) {
  try {
    const { billingDetails, productList, invoice, source, note, clientRef, extraDiscount } = await request.json();

    // A counter sale is staff-created, so it requires an admin session. Without
    // this check anyone could post orders that look like they came from the shop.
    const isPos = source === "pos";
    if (isPos) {
      const denied = await requireAdmin();
      if (denied) return denied;
    }

    if (!billingDetails?.name || !Array.isArray(productList) || !productList.length) {
      return Response.json({ error: "Invalid order payload" }, { status: 400 });
    }

    // The website minimum, checked here as well as at checkout so it holds no
    // matter what the browser sends. Counter bills are exempt - see Pos.jsx.
    if (!isPos) {
      // Website orders are closed for the season once the cut-off passes.
      if (!onlineSalesOpen()) {
        return Response.json({ error: SALES_CLOSED_MESSAGE }, { status: 400 });
      }
      // Out-of-state website orders are closed this season.
      if (!acceptsDeliveryTo(billingDetails.state)) {
        return Response.json({ error: deliveryClosedMessage(billingDetails.state) }, { status: 400 });
      }
      const total = productList.reduce((n, p) => n + lineAmount(p), 0);
      if (!meetsMinimumFor(total, billingDetails.state)) {
        return Response.json({ error: belowMinimumMessage(billingDetails.state) }, { status: 400 });
      }
    }

    // The concession is only meaningful for a counter bill, and only staff can
    // write one. Taking it from a public caller would let an order relabel its
    // own pricing.
    const order = await createOrder({
      billingDetails, productList, emailSent: false,
      source: isPos ? "pos" : "online", note, clientRef,
      extraDiscount: isPos ? extraDiscount : null,
    });

    // A retry of a bill that already landed: return it without billing again
    // and without sending the confirmation emails a second time.
    if (order.duplicate) {
      return Response.json({ ok: true, ref: order.ref, id: order.id, duplicate: true });
    }

    // Keep the proforma so WhatsApp can fetch it from a URL. The email carries
    // it as an attachment either way, so a storage failure costs the document
    // on WhatsApp only - it must not stop the order.
    let documentUrl = null;
    try {
      if (await saveProforma({ orderId: order.id, ref: order.ref, base64: invoice })) {
        documentUrl = proformaUrl(order.id);
      }
    } catch (err) {
      console.error(`proforma store for ${order.ref} failed:`, err?.message);
    }

    let mail = { customer: false, shop: false, errors: {} };
    let whatsapp = { customer: false, shop: false, skipped: {}, errors: {} };

    // Both channels together, but independently: a WhatsApp outage must not
    // delay the confirmation email, and neither may fail the order itself -
    // the shop would far rather have the order than the notification.
    const [mailed, messaged] = await Promise.allSettled([
      sendOrderMails({ order, invoice }),
      sendOrderWhatsApps({ order, documentUrl }),
    ]);
    if (mailed.status === "fulfilled") mail = mailed.value;
    else {
      console.error("order mail failed:", mailed.reason);
      mail.errors.general = mailed.reason?.message;
    }
    if (messaged.status === "fulfilled") whatsapp = messaged.value;
    else {
      console.error("order whatsapp failed:", messaged.reason);
      whatsapp.errors.general = messaged.reason?.message;
    }

    // The panel flags orders the shop was never told about.
    if (mail.shop) await updateOrder(order.id, { emailSent: true });

    if (!mail.customer || !mail.shop) {
      console.error(`order ${order.ref} mail issues:`, mail.errors);
    }
    if (Object.keys(whatsapp.errors).length) {
      console.error(`order ${order.ref} whatsapp issues:`, whatsapp.errors);
    }

    return Response.json({ ok: true, ref: order.ref, id: order.id, mail, whatsapp });
  } catch (err) {
    // Not a fault: the shelf is short. Say which lines, so the customer (or
    // the counter) can lower the quantity and try again.
    if (err?.code === "OUT_OF_STOCK") {
      return Response.json({ error: err.message, outOfStock: err.short }, { status: 409 });
    }
    console.error("order create failed:", err);
    return Response.json({ error: "Could not save order" }, { status: 500 });
  }
}
