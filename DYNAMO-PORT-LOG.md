# Sankamithra → Maharishi: what to port

Everything done in Sankamithra on **12 Sep 2026**, and what of it still needs doing here.
Written to be handed to Claude in this repo as a working brief.

Source repo: `/Users/abishek/Documents/Sankamithra2026`
Two commits: `39e3744` (pricelist-aware order editing) and `45ce90e` (DynamoDB + S3).
Read either with `git show <sha>` — they carry the reasoning in their messages.

> **Read [PORT-CHECKLIST.md](PORT-CHECKLIST.md) first** if the earlier order-edit port is not
> finished. This document only covers what came after it.

---

## Already here — do not redo

Committed as `93cf95b`:

- `util/pricing.js` — adapted, correctly. Sankamithra has two price lists; this app has one,
  so the rule is chosen by the order's `source` rather than a list number. **Keep that shape.**
- The mobile counter fixes: bill bar always present, stacked above the admin nav using the
  exported `BAR_H`, ExtraDiscount lifted out of the "bill has lines" branch.
- `SubstitutePicker` priced on the order's basis.
- `extraDiscount` recorded on counter bills.

Uncommitted in your tree (mixed with the WhatsApp/proforma work): the `extraDiscount`
passthrough in `app/api/orders/route.js`. Until that is committed, counter bills fall back to
having the concession **inferred** from their own lines rather than read from the order.

---

## Part 1 — Order-edit UI

### 1a. `app/admin/components/BillingBasis.jsx` — new, ~186 lines

Sankamithra's version shows a Pricelist 1/2 toggle. **This app has one price list**, so port the
structure, not the control. Two things are shown separately, which is the whole point:

| | |
|---|---|
| **Billed on** | how the bill was written. A fact, never edited. For older counter bills it is read back from their own lines and labelled *"Looks like…"* with a tooltip saying so. |
| **Charge new on** | what the next line added will cost. Follows the bill until the biller moves it. |

Here that means: **Billed on** = counter bill with N% ExtraDiscount, or website rates.
**Charge new on** = an editable ExtraDiscount field. No list toggle — there is no second list.

- Warn when the two disagree — the order would carry two different rates.
- Offer a **confirmed** "reprice the whole bill" action. Not a quiet setting: it restates what
  the customer owes for things already quoted.

### 1b. `reprice` patch — `util/ordersStore.js` **and** `util/ordersStore.file.js`

```
patch.reprice = { extraDiscount }        // Maharishi: no priceList
```

- Recompute each line **from the catalogue**, not by scaling stored figures — scaling compounds
  rounding already baked in.
- A line whose product has left the catalogue: leave untouched and name it in the history entry.
  Never guess, never silently drop.
- Write one history entry recording the new basis.

### 1c. File-store parity — `util/ordersStore.file.js` ⚠️

**`addItem` and `removeItem` are missing from the file store in this repo too** (verified: 0
occurrences). The order-edit feature therefore does nothing in local development — the patch is
accepted, the order comes back unchanged, and nothing errors. It only ever worked against a live
database.

Port `addItem`, `removeItem` and `reprice` into the file store. This is how the reprice bug was
caught in Sankamithra: it silently no-opped until the file store learned the patch.

---

## Part 2 — MongoDB → DynamoDB + S3 ✅ done

Done. Nothing imports `db/mongo` any more; the file is deleted. 184 products, 2 orders, the
categories row and the order counter were migrated and verified. What was actually found here,
against what this plan assumed:

- **`media` was empty** (0 documents), so nothing had to cross to S3 — Sankamithra's 4.33 MB
  price list is what caused the 413 there. The S3 path is still built and tested, because the
  next price-list upload or proforma goes through it.
- **No `media` table was created.** Documents go to S3, so a DynamoDB media table would be an
  empty table nothing reads. Four tables: products, orders, settings, counters.
- **`settings` did carry both conventions**, exactly as suspected: `{_id: "categories", values}`
  from productsStore and `{_id: ObjectId, key: "wholesaleSlug"}` from settingsStore. Both now land
  on one `key` attribute.
- **`wholesaleSlug` and the 91-row `wholesale` collection were NOT migrated.** Maharishi is a pure
  retailer and the feature was removed from this app, so copying them would create data no code
  reads. They are still in Mongo — the migration only reads — and the script prints them under
  "left in Mongo, not migrated" so the omission is visible rather than silent.
- **`MC-0001` has no `extraDiscount` field at all** (it predates the concession being stored), so
  the `inferBasis` fallback in `addItem` is load-bearing on real data, not just in theory.

**Why.** The Atlas alert was connection count, not data volume — every serverless instance opens
a pool and the free tier allows 500. DynamoDB is HTTPS with no persistent connection, so the
ceiling disappears rather than moving.

### 2a. `util/db/dynamo.js` — new, ~308 lines

`getItem` / `putItem` / `deleteItem` / `scanAll` / `isEmpty` / `batchWrite` / `putIfAbsent` /
`putIfRev` / `bumpCounter` / `withRetry` / `dbDiagnostics`. Mirrors the old `collection(name)`
shape so the stores read much as before.

Three things that are not optional:

- **`scanAll` must paginate.** A Scan returns at most 1 MB. Returning the first page silently
  loses the tail as the catalogue grows.
- **`batchWrite` must retry `UnprocessedItems`.** BatchWriteItem does not fail when throttled —
  it returns the writes it skipped. Dropping those loses data with no error anywhere.
- **No try/catch inside anything cached.** A failed read must escape, never be stored.

### 2b. `util/db/media.js` — new. Documents go to **S3, not DynamoDB**

A DynamoDB item stops at **400 KB**. Sankamithra's stored file was **4.33 MB** and the migration
failed with a **413** on the first run. This is not a tuning question — the data does not fit.

Check what `media` holds here before migrating. Product photos go to Cloudinary and are unaffected.

### 2c. Patterns with no DynamoDB equivalent

| MongoDB | Replacement |
|---|---|
| unique index on `clientRef` | claim a `claim#<clientRef>` row with a conditional write, evaluated atomically by the service. Give it a TTL; filter claims out of `listOrders`. |
| `findOneAndUpdate` + `$inc` | `UpdateItem … ADD`, which returns the settled value. Better than Mongo here. |
| `updateMany` | read matching rows, then `BatchWriteItem` (25/batch). |
| `bulkWrite` | same. |
| `replaceOne({id, rev})` | `PutItem` with a `ConditionExpression` on `rev` — this is the optimistic lock behind order edits. |
| `countDocuments` | a counted Scan, or a maintained counter. |
| `.sort()` | **sort in code.** A Scan returns items in no defined order, and the shop's arranged order is the point of `sortOrder`. |

Also: check whether `settings` is written under two key conventions here (`{key}` vs `{_id}`), as
it was in Sankamithra. Both must land on one attribute.

### 2d. Scripts

- `scripts/dynamo-setup.mjs` — creates tables (on-demand billing, PITR on, TTL on claim rows) and
  a **private** media bucket. Dry-run by default.
- `scripts/migrate-mongo-to-dynamo.mjs` — `--write` / `--verify`. **Reads Mongo only**, so a
  failed run costs a retry and the cluster stays a working fallback.

The verify step must also check **the order counter is not behind the highest existing
reference** — otherwise the next bill reuses a number belonging to a real order.

### 2e. Removing Mongo

Done: `util/db/mongo.js` deleted, `mongodb` moved to devDependencies (the migration script still
needs it), the stale comment in `ordersStore.file.js` corrected, `.env.example` rewritten around
AWS — which also cleared the last three Sankamithra values hiding in it (`MONGODB_DB=sankamithra`,
`thunder.sankamithra.com`, `sankamithrathunderworld@gmail.com`).

`npm run db:setup` and `npm run db:migrate` are now npm scripts, both dry-run by default.

---

## Part 3 — the bug the migration exposed

`ASSET_BASE` may be a **site-relative** path (`/database`) — which `util/config.js` recommends for
local development. But `fetch()` and `Response.redirect()` both reject a relative URL, so:

- `/api/price-list` returned **500**
- the catalogue seed threw `Invalid URL`

Fix with an `absoluteAssetUrl(url, origin)` helper resolving against the request or
`NEXT_PUBLIC_SITE_URL`. **Not present here** (0 occurrences in `util/config.js`) — this repo has
the same latent fault the moment anyone sets a relative asset base.

---

## Order of work

1. File-store parity (1c) — small, and without it nothing below can be tested locally.
2. `reprice` patch (1b), then `BillingBasis` (1a).
3. `absoluteAssetUrl` (Part 3) — one helper, independent of everything else.
4. DynamoDB (Part 2), in this order: `dynamo.js` → `media.js` → stores → scripts → migrate → verify → remove Mongo.

**Commit `app/api/orders/route.js` separately.** It carries in-progress WhatsApp and proforma work
that must not be swept into a migration commit.

---

## Verify before calling it done

Sankamithra was checked this way; do the same rather than trusting the build:

- `npm run build` and `npm run lint`.
- **Run the app and drive it.** A build proves the entrypoint resolves, nothing more. The mobile
  bill bar rendered in the DOM and was invisible behind the admin nav — only a screenshot showed it.
- Exercise the stores against **throwaway tables** (`maharishitest_` prefix), not live data. Cover
  the duplicate guard, a concurrent race, the atomic counter, reprice and bulk discount. Purge
  between runs — stale rows produced two false failures in Sankamithra.
  *Done: 55 assertions against `maharishitest_`, purged before and after, then the tables dropped.
  Included a 5-device race on one `clientRef` (one order written, no strays), 8 simultaneous bills
  (8 distinct references), two overlapping packing ticks (both survived, rev reached 2), and the
  S3 document round trip. Three initial failures were my test's arithmetic, not the stores: the
  POS applies the concession client-side and posts already-priced lines (`Pos.jsx:165`), so the
  store is handed `discount: effDiscount(...)` rather than a raw catalogue row.*
- Check **every** product image resolves, not a sample.
- Migrate with `--verify` and read the counter line.

## Known limitations carried over

- **Order references can skip numbers** under concurrent retries: a losing writer has already
  consumed one. No duplicates. MongoDB behaved identically.
- **`listOrders` and `orderStats` scan the whole table**, and the admin polls every 20s per open
  tab. Fine in the tens of orders; revisit in the thousands.
- **No server-side caching.** Client-side caching would need a hard refresh after an admin edit —
  `revalidateTag` would not, since it invalidates the moment a save lands. Worth revisiting now
  that reads are billed per request.
