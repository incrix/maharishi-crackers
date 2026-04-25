/**
 * Standalone test for WhatsApp Cloud API send.
 *
 * Run from project root:
 *   node --env-file=.env.local scripts/test-whatsapp.mjs            # text only
 *   node --env-file=.env.local scripts/test-whatsapp.mjs ./test.pdf # text + PDF attachment
 *
 * Requires Node 18+. No build step. No SDK. Native fetch + FormData.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { sendOrderToWhatsApp } from "../src/utils/sendWhatsApp.js";

// Sanity check env
const REQUIRED = ["WHATSAPP_TOKEN", "WHATSAPP_PHONE_NUMBER_ID", "WHATSAPP_TO"];
const missing = REQUIRED.filter((k) => !process.env[k]);
if (missing.length) {
  console.error("Missing env vars:", missing.join(", "));
  console.error("Run with:  node --env-file=.env.local scripts/test-whatsapp.mjs");
  process.exit(1);
}

// Sample order
const sampleOrder = {
  id: `TEST-${Date.now()}`,
  customer: {
    name: "Test Customer",
    email: "test@example.com",
    phone: "9999999999",
    address: "12 MG Road, Bangalore 560001",
  },
  items: [
    { id: 1, name: "3 1/2\" Laxmi", count: 5, price: 60, discount: 80 },
    { id: 2, name: "4\" Antman", count: 2, price: 150, discount: 80 },
  ],
  total: 120,
  paymentStatus: "Pay on delivery",
};

// Optional PDF path from CLI
const pdfPath = process.argv[2];

async function main() {
  let opts = {};
  if (pdfPath) {
    const abs = path.resolve(pdfPath);
    console.log(`Reading PDF from ${abs}...`);
    const buffer = await readFile(abs);
    opts = { pdfBuffer: buffer, pdfName: path.basename(abs) };
  }

  console.log(`Sending test order to WhatsApp ${process.env.WHATSAPP_TO}...`);
  try {
    const result = await sendOrderToWhatsApp(sampleOrder, opts);
    console.log("✅ Success:", result);
  } catch (err) {
    console.error("❌ Failed:", err.message);
    if (err.response) console.error("API response:", JSON.stringify(err.response, null, 2));
    process.exit(1);
  }
}

main();
