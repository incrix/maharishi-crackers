# Sankamithra → Maharishi port checklist

Porting the functional changes from Sankamithra commits `49b8f0e`, `3fee03c`, `c5a586f`, `635d004`
into this repo. **Wholesale is deliberately excluded** (see [Not porting](#not-porting)).

Source repo: `/Users/abishek/Documents/Sankamithra2026`
Pre-change baseline: `6295cf7` — useful for `git show 6295cf7:<path>` to see what a file looked like
before the changes, which is what this repo's copy still matches.

> **Why file-level, not cherry-pick:** the two repos share no git history, so `git cherry-pick`
> and `git format-patch` cannot be used. Every step below is a manual/file edit.

---

## Branding cheat-sheet

The shared files here differ from Sankamithra **only by branding**. When copying code across,
translate these every time:

| Sankamithra | Maharishi |
|---|---|
| `"Sankamithra Thunder World"` | `BUSINESS.name` → `"Maharishi Crackers"` |
| `STW-0001` ref prefix | `MC-0001` |
| `#ff4800` / `#e34100` (orange) | `#1a4d2e` / `#123520` (green) |
| `#ffd0bd`, `#ffd9c9`, `#ffe2d5` | `#9dbfa6`, `#cfe0c8` |
| `#fff1ea`, `#fff7f3` | `#e8f0e4`, `#f2f6f0` |
| `#f6f6f6`, `#f0f0f0` | `#f4f0e6`, `#eee9dd` |
| `+91 94892 39970` | `BUSINESS.phone[0]` |

`AddItemPicker.jsx` uses only CSS variables (`var(--primary-color)` etc.), so it copies **verbatim**
with no colour translation needed.

---

## Step 0 — Commit what is already here ⚠️ do this first

The entire Sankamithra-derived rewrite in this folder is **uncommitted**. `HEAD` is still the old
`src/`-based app. A stray `git checkout .`, `git stash` or `git clean -fd` erases all of it.

- [ ] Confirm secrets stay out: `git check-ignore -v .env.local` → must print a match
- [ ] Confirm PII stays out: `git check-ignore -q data public/uploads database` → all ignored
- [ ] `git add -A` then review with `git status`  (~248 files: deletes the old `src/`, adds `app/`, `util/`, `context/`, `middleware.js`)
- [ ] Commit as its own commit, nothing else mixed in
- [ ] Optional cleanup first: `.env.example` still carries Sankamithra defaults
      (`MONGODB_DB=sankamithra`, `MAIL_NAME=Sankamithra Thunder World`, `thunder.sankamithra.com`)

**Environment is already set up — nothing to install.** `.env.local` has all 16 keys,
`node_modules` has Next 14.2.35 matching `package.json`, and `public/` has the new structure.

---

## Step 1 — Order editing  (from `635d004`) ← the main one

Lets the shop change an existing bill: adjust quantities, remove lines, add products.
Distinct from "unavailable/substitute", which records what the shop *couldn't* fill.

**Divergence check: 4–8 lines per file, all branding.** This port is mechanical and low-risk.

### 1a. New file — `app/admin/components/AddItemPicker.jsx`
- [ ] Copy verbatim from `Sankamithra2026/app/admin/components/AddItemPicker.jsx` (138 lines)
- [ ] No changes needed — all four imports already exist here:
      `@/context/ProductContext`, `@/util/config`, `@/util/cart`, `@/app/components/commerce/QtyStepper`

### 1b. `util/ordersStore.js` — the data layer
Anchor: `async function applyOnce(id, patch)` at **line 184**; insert *between*
`patch.emailSent` (line 200) and `if (patch.itemId !== undefined)` (line 202).

- [ ] Add the `if (patch.addItem) { ... }` block
  - Existing line → top up its `count` + recalc `total`, clear `unavailable`
  - New line → push full item (`unitPrice` computed as `mrp - mrp*discount/100`)
  - Both append to `next.history` so the change is never silent
- [ ] Add the `if (patch.removeItem !== undefined) { ... }` block, with its history entry
- [ ] **No branding change needed in the new code** — the `STW-`/`MC-` prefix lives in
      `nextRef()` (line 55/68), which this patch does not touch

### 1c. `app/admin/components/PackingList.jsx` — the row UI
- [ ] Line 19 — extend the signature with `onCount, onRemove, editing`
- [ ] Add imports: `IconButton` (to the `@mui/material` list), `DeleteOutlineRoundedIcon`,
      and `QtyStepper` from `@/app/components/commerce/QtyStepper`
- [ ] Line 85 — wrap the `<Checkbox>` as `{editing ? null : <Checkbox ... />}`
- [ ] Line 111 — the `× {count}` `<Chip>` becomes a ternary: when `editing`, render
      `<QtyStepper>` + a delete `<IconButton>`; otherwise the existing Chip unchanged
- [ ] Leave the substitute Chip at line 136 alone

### 1d. `app/admin/components/OrderDetail.jsx` — the edit-mode toggle
- [ ] Add imports: `EditRoundedIcon`, `CheckRoundedIcon`, `AddRoundedIcon`, and `AddItemPicker`
- [ ] Near line 28 (beside `const [swapFor, setSwapFor]`) add
      `const [editing, setEditing] = useState(false)` and `const [addOpen, setAddOpen] = useState(false)`
- [ ] After the `<Divider />` at line 144, add the toggle row:
      "Edit items" / "Done editing" button, plus an "Add product" button and a
      dispatched-order warning, both shown only while `editing`
- [ ] **Branding:** that button uses `backgroundColor: "#e34100"` on hover → change to `#123520`
- [ ] Pass `editing`, `onCount`, `onRemove` into `<PackingList>` (line 146)
- [ ] Render `<AddItemPicker>` between `<PackingList>` and `<SubstitutePicker>` (line 156)
- [ ] Disable the toggle when `busy || order.status === "cancelled"`

### 1e. `util/sendMail.js` — stop mailing walk-ins who gave no address
Anchor: `export async function sendOrderMails` at **line 232**.

- [ ] Add the `skipCustomer` guard: `order.source === "pos" && !String(order.customer?.email || "").trim()`
- [ ] Make the customer send conditional; set `results.customerSkipped`
- [ ] Fix `results.customer` (line 240) to `!skipCustomer && customer.status === "fulfilled"`
- [ ] Website orders are untouched — they always carry an email
- [ ] ⚠️ Note: `sendCustomerMail` has a **duplicate `bcc:` key** where the second silently wins.
      Sankamithra documented it rather than fixed it. It exists here too — leave as-is unless
      you want the shop to stop being copied on confirmations.

### 1f. `app/admin/components/Pos.jsx` — label only
- [ ] Line **356**: `label="Email (for the proforma)"` → `label="Email (optional)"`

### 1g. ⚠️ Pricelist-aware editing — **fix this before shipping "Add product"**

**This is a live bug in Sankamithra too, already pushed.** Not a porting artefact — fix it in both repos.

POS bills on one of two lists: **PL1** (`price` MRP × product `discount`) or **PL2** (`mrp2`, no product
discount, biller gives margin via a compounded **ExtraDiscount %**). But `Pos.jsx` *flattens* that choice
into per-line `price`/`discount` before POSTing, and `createOrder` stores only the flattened result.
Nothing records `priceList` or `extraDiscount` — once saved, the basis is unrecoverable.

Consequence in the edit feature:

| Action | Status |
|---|---|
| Change quantity | ✅ safe — recomputes from the stored `unitPrice` |
| Remove a line | ✅ safe — no pricing involved |
| **Add a product** | ❌ **mis-prices** — always PL1 catalogue values, ExtraDiscount ignored |

A bill written on PL2 with 10% ExtraDiscount gets the new line at full PL1 MRP — silently overcharging.
`SubstitutePicker` has the **same flaw** (it prices with `unitPrice(p)`); that one predates these commits.

- [ ] **Extract shared helpers** — move `basisMrp`, `effDiscount`, `unitOf` out of `Pos.jsx`
      (they are file-private there, which is why the pickers drifted) into `util/pricing.js`
- [ ] **Record the basis** — `Pos.jsx` sends `priceList: list2 ? 2 : 1` and `extraDiscount: Number(extra) || 0`;
      `createOrder` persists both. Website orders default to `priceList: 1, extraDiscount: 0`
- [ ] **Show it** — chip in `OrderDetail` beside the Edit toggle: `Pricelist 2 · 10% extra`
- [ ] **Price additions on the order's basis** — `AddItemPicker` receives `priceList`/`extraDiscount`
      from the order and displays `unitOf(p, list2, extra)`; `onAdd` sends
      `price: basisMrp(...)`, `discount: effDiscount(...)` instead of raw `p.price` / `p.discount`
- [ ] **Fix `SubstitutePicker` the same way** (lines 40, 52, 61–62)
- [ ] **Legacy orders** (no field recorded): show `Pricelist not recorded` and make the admin pick the
      list before adding. Preferred over inferring from stored `mrp` vs `price`/`mrp2` — that is
      ambiguous whenever a product's `mrp2` equals its `price`
- [ ] Removal needs no pricing change — leave it alone

### Verify step 1
- [ ] Write a bill on **Pricelist 2 with an ExtraDiscount**, then add a product to it via edit —
      the new line must match the rate of every other line on that bill
- [ ] Repeat on a **Pricelist 1** bill — new line carries the product discount, no extra
- [ ] Open an order billed *before* this change — basis shows as not recorded, admin is asked to pick
- [ ] Open an order → **Edit items** → checkboxes become steppers
- [ ] Change a quantity → line total and order total update; check the history entry appears
- [ ] Remove a line → history records `Removed <name>`
- [ ] **Add product** → pick something already on the bill → quantity tops up, no duplicate row
- [ ] Write a counter bill with a blank email → no customer mail attempted, no error
- [ ] Confirm the ref still reads `MC-0001`, not `STW-0001`

---

## Step 2 — Stock never blocks an order  (from `c5a586f`)

Products stay orderable even at zero stock; the shop confirms availability by phone.

- [ ] `app/components/commerce/GapFillers.jsx` — drop `&& p.countInStock > 0` from the filter
- [ ] `app/components/shop/ProductClient.jsx` — `const out = product.countInStock <= 0` → `const out = false`;
      remove `disabled={out}` and the "Out of stock" button label;
      Availability meta becomes the literal `"Available to order"`
- [ ] `app/product/[slug]/page.js` — schema `availability` always `https://schema.org/InStock`;
      rewrite the "Is X available online?" FAQ answer (**swap the phone number to Maharishi's**)
- [ ] `app/components/commerce/ProductCard.jsx` — ⚠️ **diverges ~110 lines here, apply by hand:**
      set `out = false`, delete the `opacity: out ? 0.55 : 1` style, and collapse the
      `out ? ... : added ? ...` ternary so the "Out of stock" branch is gone

### Verify step 2
- [ ] A zero-stock product is not greyed out and can be added to the cart
- [ ] Its detail page shows "Available to order" and an enabled Add to cart

---

## Step 3 — Arrange, safe settings reads, render perf  (from `3fee03c`)

Three independent threads. **Do 3b and 3c first — they are small and low-risk.**

### 3a. Arrange feature (drag-and-drop ordering) — *new build, not a port*
Nothing to port onto: no dnd-kit, no `Arrange.jsx`, no `SortableRow.jsx`, no `/admin/arrange` route here.

- [ ] `npm i @dnd-kit/core@^6.3.1 @dnd-kit/sortable@^8.0.0 @dnd-kit/utilities@^3.2.2`
- [ ] Copy `app/admin/components/Arrange.jsx` (240 lines) and `SortableRow.jsx` (50 lines)
- [ ] Copy `app/admin/arrange/page.js` — verify `useAdmin()` here exposes
      `catalogue, catLoading, loadCatalogue, notify` (it does — `app/admin/AdminContext.jsx` exists)
- [ ] `app/admin/components/AdminShell.jsx` — add `SwapVertRoundedIcon` import and the
      `/admin/arrange` entry to `NAV`, between Products and Price lists
- [ ] `util/productsStore.js` — add `reorderCategories(values)` and `reorderProducts(ids)`
- [ ] `util/productsStore.js` **line 87** — `categories: [...categories].sort()` → `categories`
      (alphabetising on every read threw away the arranged order)
- [ ] `app/api/categories/route.js` — handle `body.action === "reorder"` before the rename path
- [ ] `app/api/products/route.js` — handle `body.action === "reorder"` before `bulkDiscount`
- [ ] **Branding:** check `Arrange.jsx` for hardcoded orange hexes and translate

### 3b. Don't cache a failed settings read
A DB blip got cached as truth, so the site served last year's banner for an hour.

- [ ] `util/settingsStore.js` — make `getSetting` throw again (remove its try/catch);
      add `getSettingSafe` that swallows; rename the cached fn to `readBanner` and wrap it in a
      new `getBanner` that catches outside the cache and falls back to `DEFAULT_BANNER`
- [ ] `getWholesaleSlug` uses `getSettingSafe` — **this repo has no wholesale**; if that function
      is absent here, skip this line
- [ ] `app/api/banner/route.js` (lines 3, 20) — `getSetting` → `getSettingSafe`
- [ ] `app/api/price-list/route.js` (lines 2, 26) — `getSetting` → `getSettingSafe`

### 3c. Render-perf `useMemo` wraps
A new array every render invalidated every downstream `useMemo` — recomputing a
180-product catalogue on each keystroke. All three still have the raw assignment here:

- [ ] `app/admin/components/Products.jsx` **line 24** → `useMemo(() => catalogue?.products || [], [catalogue])`
- [ ] `app/admin/components/Pricing.jsx` **line 46** → same
- [ ] `app/admin/components/Pos.jsx` **line 66** → `useMemo(() => catalogue?.products?.filter((p) => p.active !== false) || [], [catalogue])`
- [ ] Check `useMemo` is imported in each file

### 3d. `/shop2` redirect — decide, don't copy
Sankamithra changed `redirect("/shop")` → `redirect("/")` because their shop became the front page.
- [ ] Only apply if Maharishi's shop is also at `/`. Otherwise leave it.

---

## Not porting

| Item | Why |
|---|---|
| **Wholesale rework** (`49b8f0e`) | Excluded by request. Also nothing to port onto — no `wholesaleStore.js`, `Wholesale.jsx`, `WholesalePhoto.jsx`, `/admin/wholesale` route or API here. Would be a from-scratch build. |
| **`ShopClient.jsx`** (part of `3fee03c`) | This repo's ShopClient is an independent rewrite — 418 lines vs Sankamithra's 299 (left category rail, skeletons, search in context). The 109-line patch will not apply. Port individual behaviours by hand if wanted. |
| **"90% off" → "80% off"** (part of `3fee03c`) | Sankamithra's own marketing claim, across `about`, `footer`, `Hero`, `CatalogueIndex`, `factory`, `page.js`, `config.js`, `site.js`. Maharishi's discount figure is its own — do not copy blindly. |

---

## Final checks

- [ ] `npm run build` passes
- [ ] `npm run lint` clean
- [ ] `grep -rni "sankamithra\|STW-\|94892 39970" app/ util/` returns nothing unintended
- [ ] `grep -rn "#ff4800\|#e34100\|#ffd9c9\|#ffd0bd" app/` — no orange leaked in
- [ ] Commit each step separately so a bad port can be reverted on its own
