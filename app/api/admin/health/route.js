import { requireAdmin } from "@/util/admin/auth";
import { dbDiagnostics } from "@/util/db/dynamo";
import { mediaDiagnostics } from "@/util/db/media";
import { mailDiagnostics } from "@/util/sendMail";
import { whatsAppDiagnostics } from "@/util/sendWhatsApp";
import { PRODUCT_SEED_URL, ASSET_BASE } from "@/util/config";

export const dynamic = "force-dynamic";

/** One call that says whether a deployment is actually wired up correctly. */
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const [db, media, mail, assets] = await Promise.all([
    dbDiagnostics(),
    mediaDiagnostics(),
    mailDiagnostics(),
    fetch(PRODUCT_SEED_URL, { method: "HEAD", cache: "no-store" })
      .then((r) => ({ ok: r.ok, status: r.status, base: ASSET_BASE }))
      .catch((e) => ({ ok: false, error: e.message, base: ASSET_BASE })),
  ]);

  return Response.json({
    ok: db.ok && mail.ok && assets.ok,
    // Storage is the one that decides whether a serverless deploy can work at all.
    storage: db.configured ? "dynamodb" : "filesystem (will fail on serverless)",
    db,
    // Documents - the price list and the proformas - live in S3, not the
    // database, so a working table says nothing about whether they are reachable.
    media,
    mail: { ok: mail.ok, stage: mail.stage, host: mail.config?.host, user: mail.config?.user, error: mail.error },
    // Not folded into `ok`: WhatsApp is optional, and a shop without it is a
    // working shop. It reports itself so the state is never a guess.
    whatsapp: whatsAppDiagnostics(),
    assets,
    site: process.env.NEXT_PUBLIC_SITE_URL || "(NEXT_PUBLIC_SITE_URL not set — canonicals fall back to localhost)",
  });
}
