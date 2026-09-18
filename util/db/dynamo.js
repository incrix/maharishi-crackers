import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, DeleteCommand,
  ScanCommand, BatchWriteCommand,
} from "@aws-sdk/lib-dynamodb";

/**
 * DynamoDB access.
 *
 * Replaces MongoDB because the Atlas cluster kept hitting its connection
 * ceiling: every serverless instance opens its own pool and the free tier
 * allows 500 connections in total, so the limit was reached by request volume
 * rather than by data - the whole catalogue is 184 products. DynamoDB is reached
 * over HTTPS with no persistent connection to run out of, so the ceiling
 * disappears instead of moving.
 *
 * The shape of this module deliberately mirrors the old `collection(name)`
 * helper, so the stores that use it read much as they did.
 *
 * On scale: the catalogue is ~184 items and orders are in the tens, so several
 * access patterns here are table Scans. That is a deliberate choice at this
 * size - scanning 200 KB costs a handful of RCU and one round trip, where the
 * index that would avoid it costs a write on every update and one more thing to
 * keep correct. Revisit if the catalogue reaches a few thousand items.
 */

const REGION = process.env.AWS_REGION || "ap-south-1";
// Maharishi's own tables. The same AWS account also holds a sankamithra_*
// set for the sister shop; the prefix is the only thing keeping the two
// businesses' orders apart, so it is never defaulted to the other name.
const PREFIX = process.env.DYNAMO_TABLE_PREFIX || "maharishi_";

/**
 * Logical name -> physical table. Keeps the prefix in exactly one place.
 *
 * There is no media table: documents are too large for a DynamoDB item and go
 * to S3 instead. See util/db/media.js.
 */
export const TABLE = {
  products: `${PREFIX}products`,
  orders: `${PREFIX}orders`,
  settings: `${PREFIX}settings`,
  counters: `${PREFIX}counters`,
};

/** The partition key each table is addressed by. */
export const KEY = {
  [TABLE.products]: "id",
  [TABLE.orders]: "id",
  [TABLE.settings]: "key",
  [TABLE.counters]: "name",
};

export const isDbConfigured = () =>
  Boolean(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);

/** A host with no writable filesystem, so the JSON file store cannot stand in. */
const isServerless = () =>
  Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY);

/**
 * Refuses to fall back to the file store where the file store cannot work.
 *
 * The stores drop to JSON on disk when no database is configured, which is
 * right on a developer's machine and impossible on a serverless host: the
 * filesystem is read-only, so the fallback fails somewhere deep - fetching a
 * seed, then reading a local copy that the deploy does not even contain - and
 * surfaces as a 500 with a stack trace about a missing file. The cause is not
 * in that trace, so it cost a live storefront to work out.
 *
 * Said plainly and early instead. The error names the variables to set,
 * because that is the entire fix.
 */
export function assertUsableStore() {
  if (isDbConfigured() || !isServerless()) return;
  const err = new Error(
    "No database configured. This host has no writable filesystem, so the JSON file store cannot stand in. " +
    "Set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, DYNAMO_TABLE_PREFIX and S3_MEDIA_BUCKET " +
    "in the project's environment variables, then redeploy - environment changes do not reach a build that has already run."
  );
  err.code = "DB_NOT_CONFIGURED";
  throw err;
}

/**
 * One client per process, cached on globalThis.
 *
 * Not for connection reuse - there are no connections to reuse - but because
 * constructing a client resolves credentials and region, which is wasted work
 * on every request in a warm container.
 */
function client() {
  if (globalThis.__maharishiDynamo) return globalThis.__maharishiDynamo;

  const base = new DynamoDBClient({
    region: REGION,
    // Credentials come from the environment: Vercel's project env vars in
    // production, .env.local locally. Never checked in.
    ...(process.env.AWS_ACCESS_KEY_ID
      ? {
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          },
        }
      : {}),
    maxAttempts: 3,
  });

  const doc = DynamoDBDocumentClient.from(base, {
    marshallOptions: {
      // The catalogue carries empty strings for unset descriptions and nulls
      // for absent figures; both are meaningful and must survive a round trip.
      removeUndefinedValues: true,
      convertEmptyValues: false,
    },
  });

  globalThis.__maharishiDynamo = doc;
  return doc;
}

/* ------------------------------------------------------------------ *
 * Single-item access
 * ------------------------------------------------------------------ */

export async function getItem(table, key) {
  const res = await client().send(new GetCommand({ TableName: table, Key: keyOf(table, key) }));
  return res.Item ?? null;
}

export async function putItem(table, item) {
  await client().send(new PutCommand({ TableName: table, Item: item }));
  return item;
}

export async function deleteItem(table, key) {
  await client().send(new DeleteCommand({ TableName: table, Key: keyOf(table, key) }));
}

/**
 * Writes only if nothing holds this key yet.
 *
 * Returns false instead of throwing when the key is taken. This is what
 * replaces MongoDB's unique index: the condition is evaluated inside the write
 * by the service, so two devices racing on the same key cannot both succeed.
 */
export async function putIfAbsent(table, item) {
  const pk = KEY[table];
  try {
    await client().send(new PutCommand({
      TableName: table,
      Item: item,
      ConditionExpression: "attribute_not_exists(#pk)",
      ExpressionAttributeNames: { "#pk": pk },
    }));
    return true;
  } catch (err) {
    if (err?.name === "ConditionalCheckFailedException") return false;
    throw err;
  }
}

/**
 * Writes only if the stored revision is still the one we read.
 *
 * This is the optimistic lock behind order edits. A packer ticking several
 * lines fires overlapping requests; without the condition the last write wins
 * and the other changes vanish with no error. Returns false on a losing write
 * so the caller can re-read and reapply its own change on top.
 *
 * `expected == null` covers orders written before revisions existed: they carry
 * no rev at all, so the condition accepts either absent or zero.
 */
export async function putIfRev(table, item, expected) {
  const pk = KEY[table];
  const fresh = expected == null;
  try {
    await client().send(new PutCommand({
      TableName: table,
      Item: item,
      ConditionExpression: fresh
        ? "attribute_exists(#pk) AND (attribute_not_exists(#rev) OR #rev = :zero)"
        : "attribute_exists(#pk) AND #rev = :expected",
      ExpressionAttributeNames: { "#pk": pk, "#rev": "rev" },
      ExpressionAttributeValues: fresh ? { ":zero": 0 } : { ":expected": expected },
    }));
    return true;
  } catch (err) {
    if (err?.name === "ConditionalCheckFailedException") return false;
    throw err;
  }
}

/* ------------------------------------------------------------------ *
 * Whole-table reads
 * ------------------------------------------------------------------ */

/**
 * Every item in a table, following pagination.
 *
 * A Scan returns at most 1 MB per call. These tables are far below that, but
 * the loop is not optional - silently returning the first megabyte is how a
 * catalogue quietly loses its tail as it grows.
 */
export async function scanAll(table, { filter, names, values } = {}) {
  const out = [];
  let ExclusiveStartKey;
  do {
    const res = await client().send(new ScanCommand({
      TableName: table,
      ExclusiveStartKey,
      ...(filter ? { FilterExpression: filter } : {}),
      ...(names ? { ExpressionAttributeNames: names } : {}),
      ...(values ? { ExpressionAttributeValues: values } : {}),
    }));
    if (res.Items?.length) out.push(...res.Items);
    ExclusiveStartKey = res.LastEvaluatedKey;
  } while (ExclusiveStartKey);
  return out;
}

/** True if the table holds at least one item. Cheaper than counting them. */
export async function isEmpty(table) {
  const res = await client().send(new ScanCommand({ TableName: table, Limit: 1, Select: "COUNT" }));
  return (res.Count ?? 0) === 0;
}

/* ------------------------------------------------------------------ *
 * Bulk writes
 * ------------------------------------------------------------------ */

/**
 * Writes many items, 25 at a time, retrying whatever the service declines.
 *
 * BatchWriteItem does not fail when it is busy - it returns the writes it did
 * not perform in UnprocessedItems, and dropping those on the floor loses data
 * with no error anywhere. They are retried here with a widening delay.
 */
export async function batchWrite(table, items, { mode = "put" } = {}) {
  const pk = KEY[table];
  const requests = items.map((it) =>
    mode === "delete"
      ? { DeleteRequest: { Key: { [pk]: typeof it === "object" ? it[pk] : it } } }
      : { PutRequest: { Item: it } }
  );

  let written = 0;
  for (let i = 0; i < requests.length; i += 25) {
    let batch = requests.slice(i, i + 25);
    for (let attempt = 0; batch.length; attempt++) {
      const res = await client().send(new BatchWriteCommand({ RequestItems: { [table]: batch } }));
      written += batch.length;
      const left = res.UnprocessedItems?.[table] ?? [];
      written -= left.length;
      batch = left;
      if (batch.length) {
        if (attempt >= 5) throw new Error(`${batch.length} writes to ${table} kept being throttled`);
        await new Promise((r) => setTimeout(r, 100 * 2 ** attempt));
      }
    }
  }
  return written;
}

/* ------------------------------------------------------------------ *
 * Counters
 * ------------------------------------------------------------------ */

/**
 * Atomically increments a counter and returns the new value.
 *
 * This is what guarantees two tills billing at the same instant are not handed
 * the same order reference. ADD is applied by the service itself, so there is
 * no read-then-write for a second request to slip between.
 */
export async function bumpCounter(name, by = 1) {
  const res = await client().send(new UpdateCommand({
    TableName: TABLE.counters,
    Key: { name },
    UpdateExpression: "ADD seq :by",
    ExpressionAttributeValues: { ":by": by },
    ReturnValues: "UPDATED_NEW",
  }));
  return Number(res.Attributes?.seq ?? by);
}

/** Reads a counter without moving it. Used by the migration's verify step. */
export async function readCounter(name) {
  const item = await getItem(TABLE.counters, name);
  return item ? Number(item.seq ?? 0) : null;
}

/* ------------------------------------------------------------------ *
 * Internals
 * ------------------------------------------------------------------ */

/** Accepts a bare key value or an object, and returns the Key shape. */
function keyOf(table, key) {
  const pk = KEY[table];
  if (!pk) throw new Error(`no key registered for table ${table}`);
  return key !== null && typeof key === "object" ? { [pk]: key[pk] } : { [pk]: key };
}

/** One-line health report, mirroring the old dbDiagnostics(). */
export async function dbDiagnostics() {
  if (!isDbConfigured()) return { ok: false, configured: false, error: "AWS credentials are not set" };
  try {
    const [products, orders] = await Promise.all([
      scanAll(TABLE.products), scanAll(TABLE.orders),
    ]);
    return {
      ok: true, configured: true, region: REGION, prefix: PREFIX,
      // Orders includes the claim rows the duplicate guard writes; this is a
      // health check, not the figure the admin's dashboard reports.
      counts: { products: products.length, orders: orders.length },
    };
  } catch (err) {
    return { ok: false, configured: true, error: err.message };
  }
}

/**
 * Retries an operation the service itself called temporary.
 *
 * The SDK already retries throttling internally (maxAttempts above), so this is
 * the outer net for the cases that escape it - a burst that outlasts the SDK's
 * own backoff, or a transient 5xx. Anything not on this list is thrown straight
 * through: a genuine bug must not be masked by being tried again.
 */
const TRANSIENT = [
  "ProvisionedThroughputExceededException",
  "ThrottlingException",
  "RequestLimitExceeded",
  "InternalServerError",
  "ServiceUnavailable",
  "TimeoutError",
];

export async function withRetry(fn, attempts = 2) {
  for (let i = 0; ; i++) {
    try {
      return await fn();
    } catch (err) {
      const transient = TRANSIENT.includes(err?.name) || err?.$retryable?.throttling;
      if (!transient || i >= attempts - 1) throw err;
      await new Promise((r) => setTimeout(r, 200 * (i + 1)));
    }
  }
}
