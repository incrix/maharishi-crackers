import { getMedia, isMediaConfigured } from "@/util/db/media";

export const dynamic = "force-dynamic";

/**
 * The proforma PDF for one order, as a public URL.
 *
 * It has to be public and unauthenticated because WhatsApp fetches it from
 * WATI's servers to attach to a template message - a session cookie is not
 * available there.
 *
 * The protection is the URL itself: the id is a random UUID, so the address is
 * unguessable, and nothing here enumerates orders. That is the same trade a
 * payment receipt link makes. It is worth knowing rather than assuming: anyone
 * holding the link can read that one proforma, which carries the customer's
 * name, phone and address.
 */
export async function GET(_request, { params }) {
  if (!isMediaConfigured()) {
    return Response.json({ error: "Storage is not configured" }, { status: 503 });
  }

  const doc = await getMedia(`proforma:${params.id}`);
  if (!doc) return Response.json({ error: "Not found" }, { status: 404 });

  return new Response(doc.data, {
    headers: {
      "Content-Type": "application/pdf",
      // S3 lowercases metadata keys on the way back out.
      "Content-Disposition": `inline; filename="Proforma-${doc.meta?.ref || params.id}.pdf"`,
      // A proforma is re-issued when packing changes the order, so revalidate
      // rather than letting WATI or a browser hold a stale copy.
      "Cache-Control": "public, max-age=0, must-revalidate",
      ETag: `"${doc.createdAt}"`,
    },
  });
}
