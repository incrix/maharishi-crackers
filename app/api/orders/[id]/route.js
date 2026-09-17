import { updateOrder, getOrder } from "@/util/ordersStore";
import { requireAdmin } from "@/util/admin/auth";
import { withRetry } from "@/util/db/dynamo";
import { sendCustomerMail } from "@/util/sendMail";
import { sendCustomerWhatsApp } from "@/util/sendWhatsApp";

export const dynamic = "force-dynamic";

/**
 * Status changes the customer should hear about, and the template each uses.
 * "packing" is left out on purpose: starting to pack is an internal step, and
 * mailing about it is noise.
 */
const NOTIFY_ON = { packed: "packed", dispatched: "dispatch", cancelled: "cancelled" };

export async function GET(_request, { params }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const order = await getOrder(params.id);
  if (!order) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ order });
}

export async function PATCH(request, { params }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const patch = await request.json().catch(() => ({}));

  // Retried: a packer ticking through a list should not lose a change because
  // the cluster shed load for a moment.
  const before = await withRetry(() => getOrder(params.id));

  // Rejections from the store are the caller's fault, not the server's - an
  // unknown product, or an edit to a cancelled bill. Surface the reason rather
  // than a bare 500 the panel cannot explain.
  let order;
  try {
    order = await withRetry(() => updateOrder(params.id, patch));
  } catch (err) {
    return Response.json({ error: err.message || "Could not update the order" }, { status: 400 });
  }
  if (!order) return Response.json({ error: "Not found" }, { status: 404 });

  // Tell the customer when the status genuinely moved, so the shop never has to
  // remember to. A mail failure must not fail the status change itself.
  let mail = null;
  let whatsapp = null;
  const kind = NOTIFY_ON[order.status];
  const changed = before && before.status !== order.status;
  const notify = changed && kind && patch.notify !== false;

  if (notify && order.customer?.email) {
    try {
      // `invoice` is the re-issued proforma from the panel, reflecting any
      // substitutions made while packing.
      await sendCustomerMail({ order, kind, invoice: patch.invoice });
      mail = { sent: true, kind };
    } catch (err) {
      console.error(`status mail for ${order.ref} failed:`, err.message);
      mail = { sent: false, kind, error: err.message };
    }
  }

  // Separate condition, not an else: plenty of counter customers give a phone
  // and no email, and they are exactly the ones a WhatsApp update serves.
  if (notify && order.customer?.phone) {
    try {
      const res = await sendCustomerWhatsApp({ order, kind });
      whatsapp = res?.skipped ? { sent: false, kind, skipped: res.skipped } : { sent: true, kind };
    } catch (err) {
      console.error(`status whatsapp for ${order.ref} failed:`, err.message);
      whatsapp = { sent: false, kind, error: err.message };
    }
  }

  return Response.json({ order, mail, whatsapp });
}
