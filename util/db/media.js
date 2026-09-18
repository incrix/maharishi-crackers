import {
  S3Client, GetObjectCommand, PutObjectCommand, HeadObjectCommand, DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { awsCredentials } from "./dynamo";

/**
 * Stored documents: the price list PDF, the per-order proformas, and the
 * images an admin uploads against a product.
 *
 * These do NOT live in DynamoDB. An item there is capped at 400 KB and the
 * price list alone is allowed up to 14 MB, so the whole class of data is
 * disqualified rather than merely awkward: it would work on a small file and
 * fail on a real one, which is the worst way for a limit to be found.
 *
 * They lived in MongoDB, whose 16 MB document ceiling accommodated them. S3 is
 * the like-for-like replacement now the rest of the app is on AWS.
 *
 * Product photographs from the catalogue do not come through here - they go to
 * Cloudinary, which is configured and handles its own delivery and resizing.
 */

const REGION = process.env.AWS_REGION || "ap-south-1";
const BUCKET = process.env.S3_MEDIA_BUCKET || "";
/** Everything this app owns lives under one prefix, so the bucket can be shared. */
const PREFIX = process.env.S3_MEDIA_PREFIX || "media/";

export const isMediaConfigured = () => Boolean(BUCKET && awsCredentials());

function client() {
  if (globalThis.__maharishiS3) return globalThis.__maharishiS3;
  globalThis.__maharishiS3 = new S3Client({
    region: REGION,
    // Credentials come from the environment - Vercel's project env vars in
    // production, .env.local locally. Never checked in. Shared with dynamo.js
    // so a mispasted key is cleaned the same way in both places.
    ...(awsCredentials() ? { credentials: awsCredentials() } : {}),
    maxAttempts: 3,
  });
  return globalThis.__maharishiS3;
}

/**
 * Document name -> object key.
 *
 * The names carried over from MongoDB include "proforma:<orderId>". A colon is
 * legal in a key but is the sort of character that gets escaped differently by
 * each tool that touches it, so it becomes a path separator instead: the
 * proformas end up in their own folder and the bucket is legible in the console.
 */
const keyFor = (name) => `${PREFIX}${String(name).replace(/:/g, "/")}`;

/** Stores a document under a fixed name, replacing whatever was there. */
export async function putMedia({ name, contentType, bytes, meta }) {
  if (!isMediaConfigured()) throw new Error("S3_MEDIA_BUCKET is not set");
  await client().send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: keyFor(name),
    Body: bytes,
    ContentType: contentType || "application/octet-stream",
    // Both the price list and the proformas are meant to open in a tab rather
    // than land in the downloads folder unasked.
    ...(contentType === "application/pdf" ? { ContentDisposition: "inline" } : {}),
    // Anything the app wants back that is not the bytes - an order's reference
    // on a proforma, say. S3 metadata keys are returned lowercased.
    ...(meta ? { Metadata: Object.fromEntries(
      Object.entries(meta).filter(([, v]) => v != null).map(([k, v]) => [k, String(v)])
    ) } : {}),
  }));
  return { name, contentType, size: bytes.length, createdAt: new Date().toISOString() };
}

/**
 * Reads a document back.
 *
 * Returns null rather than throwing when it is simply not there - a missing
 * price list is a 404 the caller renders, or a redirect to the copy that
 * shipped with the site, not a server error.
 */
export async function getMedia(name) {
  if (!isMediaConfigured()) return null;
  try {
    const res = await client().send(new GetObjectCommand({ Bucket: BUCKET, Key: keyFor(name) }));
    return {
      name,
      contentType: res.ContentType,
      size: Number(res.ContentLength) || 0,
      data: Buffer.from(await res.Body.transformToByteArray()),
      meta: res.Metadata || {},
      createdAt: res.LastModified?.toISOString(),
    };
  } catch (err) {
    if (isMissing(err)) return null;
    throw err;
  }
}

/** Size and type without pulling the bytes down - for the admin's status card. */
export async function statMedia(name) {
  if (!isMediaConfigured()) return null;
  try {
    const res = await client().send(new HeadObjectCommand({ Bucket: BUCKET, Key: keyFor(name) }));
    return {
      name,
      contentType: res.ContentType,
      size: Number(res.ContentLength) || 0,
      meta: res.Metadata || {},
      createdAt: res.LastModified?.toISOString(),
    };
  } catch (err) {
    if (isMissing(err)) return null;
    throw err;
  }
}

/** Removes a document. Deleting something absent is not an error in S3. */
export async function deleteMedia(name) {
  if (!isMediaConfigured()) return;
  await client().send(new DeleteObjectCommand({ Bucket: BUCKET, Key: keyFor(name) }));
}

/**
 * S3 reports a missing object two ways depending on the verb: GetObject raises
 * NoSuchKey, HeadObject raises a bare NotFound with no message worth reading.
 */
function isMissing(err) {
  return err?.name === "NoSuchKey" || err?.name === "NotFound"
    || err?.$metadata?.httpStatusCode === 404;
}

/** One-line health report for the admin's diagnostics page. */
export async function mediaDiagnostics() {
  if (!isMediaConfigured()) {
    return { ok: false, configured: false, error: "S3_MEDIA_BUCKET is not set" };
  }
  try {
    // Statting an object that may not exist still proves the bucket answers us.
    await statMedia("price-list.pdf");
    return { ok: true, configured: true, bucket: BUCKET, region: REGION, prefix: PREFIX };
  } catch (err) {
    return { ok: false, configured: true, bucket: BUCKET, error: err.message };
  }
}
