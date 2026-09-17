import { Suspense } from "react";
import { Stack, Skeleton, Box } from "@mui/material";
import ShopClient from "@/app/components/shop/ShopClient";
import CatalogueIndex from "@/app/components/shop/CatalogueIndex";
import ShopHero from "@/app/components/home/ShopHero";
import HowItWorks from "@/app/components/home/HowItWorks";
import {
  SITE_URL, BUSINESS, KEYWORDS, JsonLd, productSlug, priceOf, imageUrl, formatAddress,
  organizationSchema, localBusinessSchema, websiteSchema, faqSchema,
  searchActionSchema, merchantPolicySchema,
} from "@/util/site";
import { MIN_ORDER } from "@/util/commerce";
import { getProducts, getCategories } from "@/util/products.server";

/**
 * The shop is the front page.
 *
 * A server component so the title, description and structured data are in the
 * served HTML - the interactive catalogue below is a client component, and its
 * contents are fetched in the browser, which a crawler may never execute. The
 * ItemList schema here is what actually tells an engine what we sell.
 */

export const metadata = {
  title: "Maharishi Crackers | Sivakasi Fireworks Online",
  description:
    "Maharishi Crackers sells Sivakasi fireworks online and over the counter. Browse the Diwali range — sparklers, chakkars, flower pots, aerial shots and gift boxes — with dispatch across India.",
  keywords: KEYWORDS,
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: BUSINESS.name,
    title: "Maharishi Crackers | Sivakasi Fireworks Online",
    description:
      "Diwali crackers direct from our Sivakasi-region shop, from ₹7 to ₹1,500. Flower pots, ground chakkars, rockets, aerial shots, sparklers and gift boxes.",
    images: [{ url: `${SITE_URL}/images/logo.png`, width: 512, height: 512, alt: BUSINESS.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Maharishi Crackers | Sivakasi Fireworks Online",
    description: "Buy Diwali crackers online, direct from our Sivakasi-region shop. 145 items across 13 categories.",
  },
};

const ALL_FAQS = [
  {
    q: "Who is Maharishi Crackers?",
    a: "Maharishi Crackers is a fireworks retailer in Sattur, Virudhunagar district — the Sivakasi belt, which produces most of what India sets off each Diwali. We buy from licensed units nearby and sell to households, shops and event buyers, both over our counter and through this site.",
  },
  {
    q: "Where is the Maharishi Crackers shop?",
    a: `The shop's registered address is ${formatAddress()}. That is in Sattur taluk of Virudhunagar district, about 20km from Sivakasi town itself - Sivakasi is the fireworks region, and the address above is where the business actually sits. Reach us on ${BUSINESS.phone[0]}, on WhatsApp at the same number, or by email at ${BUSINESS.email}.`,
  },
  {
    q: "Can I order Sivakasi fireworks online?",
    a: "You can build an order here, but it completes over the phone. The Supreme Court's 2018 ruling does not allow firecrackers to be sold outright online, so what you submit reaches us as an enquiry. Someone rings or messages you within a day to confirm the items and the total before anything leaves the shop.",
  },
  {
    q: "What do the fireworks cost?",
    a: `Individual items run from about ₹7 for a single-sound cracker to ₹1,500 for the largest fancy items, and every price shown on this site is the price you pay - the figure beside each product is what it is billed at. The full list is on the price list, which you can download from any page.`,
  },
  {
    q: "Is there a minimum order?",
    a: `Yes - ₹${MIN_ORDER.toLocaleString("en-IN")} for an order placed through this site. Transport is arranged by approved road carrier and a smaller consignment costs more to move than it is worth. There is no minimum over the counter.`,
  },
  {
    q: "What kinds of fireworks do you stock?",
    a: "The list covers flower pots, ground chakkars, single-sound crackers, bijili and atom bombs, rockets, repeating and aerial fancy shots, sparklers, twinkling stars, pencils, fountains and assorted gift boxes, grouped across thirteen categories.",
  },
  {
    q: "Do you deliver outside Tamil Nadu?",
    a: "Yes, through licensed road transport. Fireworks are barred from ordinary courier and air freight, so everything moves by approved carriers. What it costs and how long it takes depends on where you are, and both are agreed on the confirmation call rather than guessed at checkout.",
  },
  {
    q: "Are the fireworks certified?",
    a: "What we stock is green crackers — the lower-emission formulations Indian manufacturers moved to after the 2018 ruling. The certification itself belongs to the unit that makes an item, not to the shop that sells it on: the registrations and the explosives licences sit with the licensed units we buy from. We do not quote a certificate number of our own, because as a retailer we do not hold one. If you need the paperwork for a particular item, ask on the confirmation call and we will get it from the unit.",
  },
  {
    q: "How do I check on an order I have placed?",
    a: "Each order picks up a reference in the form MC-0001 as soon as it is submitted, and that reference goes out to you by email. Quote it when you get in touch and we can tell you where the order has got to.",
  },
];

/** Unanswered entries are held back rather than shown as "TODO" to a customer. */
const FAQS = ALL_FAQS.filter((f) => !f.a.startsWith("TODO"));

export default async function HomeShop() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  // Only a slice goes into the ItemList; the sitemap carries all 145 URLs.
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Maharishi Crackers fireworks",
    numberOfItems: products.length,
    itemListElement: products.slice(0, 40).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/product/${productSlug(p)}`,
      name: p.name,
    })),
  };

  const store = {
    ...localBusinessSchema(),
    makesOffer: categories.map((c) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Product", name: `${c.name} crackers`, category: c.name },
    })),
  };

  return (
    <>
      <JsonLd data={organizationSchema()} />
      <JsonLd data={websiteSchema()} />
      <JsonLd data={store} />
      <JsonLd data={itemList} />
      <JsonLd data={searchActionSchema()} />
      <JsonLd data={merchantPolicySchema()} />
      <JsonLd data={faqSchema(FAQS)} />

      <ShopHero productCount={products.length} categoryCount={categories.length} />

      <Suspense
        fallback={
          <Stack width="100%" maxWidth="var(--max-width)" mx="auto" px={{ xs: 2, md: 4 }} py={4} gap={2}>
            <Skeleton variant="text" width={220} height={34} />
            <Skeleton variant="rounded" height={44} sx={{ borderRadius: "10px", maxWidth: 420 }} />
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)", lg: "repeat(4, 1fr)" },
                gap: 1.5, mt: 1,
              }}
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} variant="rounded" sx={{ width: "100%", aspectRatio: "3 / 4", borderRadius: "14px" }} />
              ))}
            </Box>
          </Stack>
        }
      >
        <ShopClient />
      </Suspense>

      <HowItWorks />

      <section style={{ width: "100%", display: "flex", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: "var(--max-width)", padding: "0 16px 40px" }}>
          <CatalogueIndex products={products} categories={categories} />
        </div>
      </section>

      {/* Rendered server-side so the answers are in the HTML an engine reads. */}
      <section
        style={{ width: "100%", display: "flex", justifyContent: "center" }}
        aria-labelledby="faq-heading"
      >
        <div style={{ width: "100%", maxWidth: "var(--max-width)", padding: "0 16px 48px" }}>
          <h2 id="faq-heading" style={{ fontSize: 24, marginBottom: 6, color: "var(--text-color)" }}>
            Frequently asked questions
          </h2>
          <p style={{ fontSize: 14, color: "var(--text-color-secondary)", marginBottom: 20 }}>
            Ordering Sivakasi fireworks from Maharishi Crackers.
          </p>
          <div style={{ display: "grid", gap: 12 }}>
            {FAQS.map((f) => (
              <details
                key={f.q}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  padding: "14px 16px",
                  background: "var(--surface)",
                }}
              >
                <summary style={{ fontWeight: 800, fontSize: 15, cursor: "pointer", color: "var(--text-color)" }}>
                  {f.q}
                </summary>
                <p style={{ marginTop: 10, fontSize: 14, lineHeight: 1.75, color: "var(--text-color-secondary)" }}>
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
