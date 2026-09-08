/**
 * One-way migration: Sankamithra (source) -> Maharishi (target).
 *
 * Source is opened from .env.sankamithra.DO-NOT-USE and is NEVER written to.
 * Target is .env.local's MONGODB_URI. Deliberately NOT copied:
 *   orders   - real customer PII and another company's revenue
 *   counters - Maharishi's first bill must be number 1
 *   media    - Sankamithra's uploads
 *   settings/banner        - their marketing copy; app falls back to default
 *   settings/wholesaleSlug - the dealer secret URL; app mints a fresh one
 *
 * Pass --write to apply. Without it, this is a dry run.
 */
import { MongoClient } from "mongodb";
import fs from "fs";

const WRITE = process.argv.includes("--write");

const read = (f) => {
  const o = {};
  for (const l of fs.readFileSync(f, "utf8").split("\n")) {
    const m = l.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) o[m[1]] = m[2];
  }
  return o;
};
const srcEnv = read(".env.sankamithra.DO-NOT-USE");
const dstEnv = read(".env.local");

if (!dstEnv.MONGODB_URI) throw new Error("target MONGODB_URI is empty");
if (srcEnv.MONGODB_URI === dstEnv.MONGODB_URI) throw new Error("source and target are the same cluster — aborting");

const COPY_WHOLE = ["products", "wholesale"];

const srcC = new MongoClient(srcEnv.MONGODB_URI);
const dstC = new MongoClient(dstEnv.MONGODB_URI);
await srcC.connect();
await dstC.connect();
const src = srcC.db(srcEnv.MONGODB_DB);
const dst = dstC.db(dstEnv.MONGODB_DB);

console.log(`${WRITE ? "WRITING" : "DRY RUN"}: ${srcEnv.MONGODB_DB} -> ${dstEnv.MONGODB_DB}\n`);

let total = 0;
for (const name of COPY_WHOLE) {
  const docs = await src.collection(name).find({}).toArray();
  if (WRITE && docs.length) {
    await dst.collection(name).deleteMany({});
    await dst.collection(name).insertMany(docs, { ordered: false });
  }
  total += docs.length;
  console.log(`  ${name.padEnd(12)} ${String(docs.length).padStart(4)} docs  ${WRITE ? "written" : "would write"}`);
}

// settings: categories only
const cats = await src.collection("settings").find({
  $or: [{ key: "categories" }, { _id: "categories" }],
}).toArray();
if (WRITE && cats.length) {
  for (const d of cats) await dst.collection("settings").replaceOne({ _id: d._id }, d, { upsert: true });
}
total += cats.length;
console.log(`  settings     ${String(cats.length).padStart(4)} docs  ${WRITE ? "written" : "would write"} (categories only)`);

console.log(`\n  SKIPPED: orders, counters, media, settings/banner, settings/wholesaleSlug`);
console.log(`  total ${WRITE ? "written" : "to write"}: ${total}`);

if (WRITE) {
  console.log("\n  verify — target now holds:");
  for (const c of await dst.listCollections().toArray()) {
    console.log(`    ${c.name.padEnd(12)} ${await dst.collection(c.name).countDocuments()}`);
  }
  for (const forbidden of ["orders", "counters", "media"]) {
    const n = await dst.collection(forbidden).countDocuments();
    console.log(`    assert ${forbidden} empty: ${n === 0 ? "OK" : "FAIL (" + n + ")"}`);
  }
}
await srcC.close();
await dstC.close();
