import { collection, isDbConfigured } from "@/util/db/mongo";

export const dynamic = "force-dynamic";

/**
 * The proforma PDF for one order, as a public URL.
 *
 * It has to be public and unauthenticated because WhatsApp fetches it from
 * Meta's servers to attach to a template message - a session cookie is not
 * available there.
 *
 * The protection is the URL itself: the id is a random UUID, so the address is
 * unguessable, and nothing here enumerates orders. That is the same trade a
 * payment receipt link makes. It is worth knowing rather than assuming: anyone
 * holding the link can read that one proforma, which carries the customer's
 * name, phone and address.
 */
export async function GET(_request, { params }) {
  if (!isDbConfigured()) {
    return Response.json({ error: "Storage is not configured" }, { status: 503 });
  }

  const name = `proforma:${params.id}`;
  const doc = await (await collection("media")).findOne({ name });
  if (!doc) return Response.json({ error: "Not found" }, { status: 404 });

  return new Response(doc.data.buffer ?? doc.data, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="Proforma-${doc.ref || params.id}.pdf"`,
      // A proforma is re-issued when packing changes the order, so revalidate
      // rather than letting Meta or a browser hold a stale copy.
      "Cache-Control": "public, max-age=0, must-revalidate",
      ETag: `"${doc.createdAt}"`,
    },
  });
}
