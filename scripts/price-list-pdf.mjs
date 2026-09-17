#!/usr/bin/env node
/**
 * Generates the price list PDF from the live catalogue.
 *
 *   node scripts/price-list-pdf.mjs          # writes the PDF next to the fallback
 *   node scripts/price-list-pdf.mjs --out x  # somewhere else
 *
 * Why this exists: PRICE_LIST_FALLBACK in util/config.js points at a PDF that
 * every "Download price list" link on the site redirects to when the admin has
 * not uploaded one. That file did not exist, so the link 404'd. Rather than
 * shipping a stale scan, the list is generated from the same 145 rows the shop
 * page serves, so the sheet and the site can never disagree.
 *
 * The admin upload still wins: /api/price-list serves whatever was last
 * uploaded and only falls back to this file. Re-run this after a price change
 * if you would rather not upload a list by hand.
 *
 * Rendering is done by the local Google Chrome, which every machine that runs
 * this already has - it is what prints the page to A4. No new dependency, and
 * nothing here runs in production.
 */
import fs from "fs";
import os from "os";
import path from "path";
import { execFileSync } from "child_process";

for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
}

const { TABLE, getItem, scanAll } = await import("../util/db/dynamo.js");
const { BUSINESS, formatAddress } = { // site.js carries JSX, so the few values
  BUSINESS: {                         // it would supply are restated here.
    name: "MAHARISHI CRACKERS",
    phone: "+91 75488 20326",
    email: "maharishicrackers@gmail.com",
  },
  formatAddress: () =>
    "D.No. 9/62/H, West Street, K. Meenatchipuram, Kanmaisurangudi, O. Mettupatti Post, " +
    "Sattur, Virudhunagar District, Tamil Nadu 626203",
};

const outArg = process.argv.indexOf("--out");
const OUT = outArg > -1
  ? process.argv[outArg + 1]
  : "public/database/MAHARISHI CRACKERS PRICE LIST 2026.pdf";

const CHROME = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].find((p) => fs.existsSync(p));
if (!CHROME) {
  console.error("No Google Chrome found - it is what renders the PDF. Install it, or upload a price list through the admin panel instead.");
  process.exit(1);
}

/* ---------- the catalogue, in the order the shop arranged it ---------- */

const rows = (await scanAll(TABLE.products))
  .filter((p) => p.active !== false)
  .sort((a, b) => {
    const sa = a.sortOrder == null ? Number.MAX_SAFE_INTEGER : a.sortOrder;
    const sb = b.sortOrder == null ? Number.MAX_SAFE_INTEGER : b.sortOrder;
    return sa - sb || a.id - b.id;
  });
if (!rows.length) { console.error("The catalogue is empty - nothing to print."); process.exit(1); }

const order = (await getItem(TABLE.settings, "categories"))?.values || [];
const groups = [];
for (const name of order) {
  const items = rows.filter((p) => p.category === name);
  if (items.length) groups.push({ name, items });
}
// A category the settings row has never heard of still prints, rather than its
// products silently vanishing off the sheet.
const loose = rows.filter((p) => !order.includes(p.category));
if (loose.length) groups.push({ name: "Unlisted", items: loose });

/* ---------- markup ---------- */

const price = (p) => Math.round(p.price - (p.price * (p.discount || 0)) / 100);
const inr = (n) => n.toLocaleString("en-IN");
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const count = (n) => `${n} item${n === 1 ? "" : "s"}`;
const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

const section = (g) => `
  <section class="cat">
    <h2>${esc(g.name)} <span class="n">${count(g.items.length)}</span></h2>
    <table>
      <thead><tr><th class="s">#</th><th>Item</th><th class="r">Rate</th></tr></thead>
      <tbody>
        ${g.items.map((p, i) => `<tr>
          <td class="s">${i + 1}</td>
          <td>${esc(p.name)}</td>
          <td class="r">₹${inr(price(p))}</td>
        </tr>`).join("")}
      </tbody>
    </table>
  </section>`;

const html = `<!doctype html><meta charset="utf-8">
<title>${esc(BUSINESS.name)} — Price List 2026</title>
<style>
  @page { size: A4; margin: 14mm 12mm 16mm; }
  * { box-sizing: border-box; }
  body { font: 10px/1.45 -apple-system, "Helvetica Neue", Arial, sans-serif; color: #1c2b21; margin: 0; }
  header { border-bottom: 2.5px solid #1a4d2e; padding-bottom: 9px; margin-bottom: 12px; }
  h1 { font-size: 20px; margin: 0; color: #1a4d2e; letter-spacing: .2px; }
  .sub { font-size: 9px; color: #5c6b60; margin-top: 3px; line-height: 1.6; }
  .meta { font-size: 8.5px; color: #5c6b60; margin-top: 5px; }
  .cols { column-count: 2; column-gap: 11mm; }
  .cat { break-inside: avoid; margin-bottom: 11px; }
  h2 { font-size: 10.5px; margin: 0 0 4px; color: #1a4d2e; text-transform: uppercase;
       letter-spacing: .5px; border-bottom: 1px solid #cfdcd3; padding-bottom: 2.5px; }
  h2 .n { float: right; font-weight: 400; text-transform: none; letter-spacing: 0; color: #8b9a90; }
  table { width: 100%; border-collapse: collapse; }
  th { font-size: 7.5px; text-transform: uppercase; letter-spacing: .4px; color: #8b9a90;
       text-align: left; padding: 1.5px 0; font-weight: 600; }
  td { padding: 1.7px 0; border-bottom: .5px solid #eef2ef; vertical-align: top; }
  .s { width: 15px; color: #9aa89e; }
  .r { text-align: right; white-space: nowrap; font-weight: 700; width: 48px; }
  footer { margin-top: 10px; padding-top: 7px; border-top: 1px solid #cfdcd3;
           font-size: 8px; color: #5c6b60; line-height: 1.6; }
</style>
<header>
  <h1>${esc(BUSINESS.name)}</h1>
  <div class="sub">
    Price list 2026 · ${count(rows.length)} across ${groups.length} categories<br>
    ${esc(formatAddress())}<br>
    ${esc(BUSINESS.phone)} · ${esc(BUSINESS.email)}
  </div>
  <div class="meta">Rates as on ${today}. All rates in ₹ per unit.</div>
</header>
<div class="cols">${groups.map(section).join("")}</div>
<footer>
  Rates are subject to change and to stock at the time of confirmation. Minimum ₹3,000 for orders
  placed online; no minimum over the counter. Fireworks move by approved road carrier only —
  transport is quoted on the confirmation call. Sold subject to the Explosives Act and the
  conditions of the relevant licence.
</footer>
`;

/* ---------- print ---------- */

const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "pricelist-")), "list.html");
fs.writeFileSync(tmp, html);
fs.mkdirSync(path.dirname(OUT), { recursive: true });

execFileSync(CHROME, [
  "--headless", "--disable-gpu", "--no-pdf-header-footer",
  `--print-to-pdf=${path.resolve(OUT)}`, `file://${tmp}`,
], { stdio: "ignore" });
fs.rmSync(path.dirname(tmp), { recursive: true, force: true });

const kb = (fs.statSync(OUT).size / 1024).toFixed(0);
console.log(`${OUT} — ${kb} KB, ${rows.length} items across ${groups.length} categories`);
console.log(groups.map((g) => `  ${g.name}: ${g.items.length}`).join("\n"));
