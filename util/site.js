/**
 * Single source of truth for site identity, search keywords and structured data.
 *
 * Everything an engine reads about this business - the name it trades under,
 * where it is, what it sells, what questions it answers - is declared once here
 * and consumed by every page's metadata and JSON-LD.
 */

import { assetUrl } from "@/util/config";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/$/, "");

/**
 * Whether Maharishi's supplier certifications have been verified.
 *
 * The green-certified and ISO 9001:2015 badges were inherited from the
 * Sankamithra build. Displaying a certification mark the business cannot
 * evidence is a factual claim about a regulated product, so the badges and the
 * copy that references them stay hidden until this is deliberately switched on.
 *
 * TODO(abishek): set to true once you confirm the certifications Maharishi's
 * suppliers actually hold.
 */
export const CERTIFICATIONS_VERIFIED = false;

/**
 * True when a BUSINESS value is still a placeholder rather than a real detail.
 *
 * The contact block ships deliberately invalid until the real numbers arrive.
 * Anything that renders one of those values - the footer, the contact page, the
 * PDFs, and above all the JSON-LD a search engine reads - has to check first.
 * A fake phone number indexed as this shop's number is worse than no number.
 */
export const isPlaceholder = (v) =>
  !v ||
  /TODO/i.test(String(v)) ||
  String(v).includes("example.invalid") ||
  /^\+?91[\s0]*0{5,}/.test(String(v));

/** Contact details fit to publish? */
export const hasContact = () =>
  !isPlaceholder(BUSINESS.phone?.[0]) && !isPlaceholder(BUSINESS.email);
export const hasAddress = () =>
  !isPlaceholder(BUSINESS.office?.street) && !isPlaceholder(BUSINESS.office?.postalCode);

export const BUSINESS = {
  name: "Maharishi Crackers",
  // TODO(abishek): confirm the registered legal entity name — may differ from
  // the trading name (e.g. "... Firework Industries" / "... Traders").
  legalName: "Maharishi Crackers",
  alternateName: ["Maharishi Fireworks", "Maharishi Crackers Sivakasi", "Maharishi"],
  tagline: "Sivakasi fireworks, delivered across India",
  description:
    "Maharishi Crackers supplies Sivakasi fireworks and crackers direct to customers across India. Order sparklers, ground chakkars, flower pots, aerial shots and gift boxes online for doorstep delivery.",
  // TODO(abishek): Maharishi's real contact numbers. These placeholders are
  // deliberately invalid so they cannot ship unnoticed.
  phone: ["+91 00000 00000"],
  // TODO(abishek): WhatsApp number, digits only, with country code (e.g. 91XXXXXXXXXX).
  whatsapp: "910000000000",
  // TODO(abishek): Maharishi's public enquiry address.
  email: "TODO@example.invalid",
  // TODO(abishek): Maharishi's shop/office address. Left blank rather than
  // guessed — a wrong address breaks local search and the PDF documents.
  office: {
    street: "TODO",
    locality: "Sivakasi",
    region: "Tamil Nadu",
    postalCode: "TODO",
    country: "IN",
  },
  // TODO(abishek): coordinates of Maharishi's premises (Google Maps -> right
  // click -> copy lat/long). Currently Sivakasi town centre, not the shop.
  geo: { latitude: 9.4499, longitude: 77.7983 },
  // TODO(abishek): confirm trading hours.
  openingHours: "Mo-Sa 09:00-19:00",
  // TODO(abishek): year the business started. Removed rather than inherited —
  // claiming a founding year that isn't yours is a factual error in the schema.
  founded: "TODO",
};

/**
 * Search terms real customers use. These inform copy and metadata - they are
 * never stuffed into a hidden block, which search engines discount and can
 * penalise.
 */
export const KEYWORDS = [
  "Maharishi Crackers",
  "Maharishi fireworks",
  "Maharishi crackers Sivakasi",
  "Sivakasi crackers online",
  "fireworks shop in Sivakasi",
  "crackers shop in Sivakasi",
  "buy crackers online Tamil Nadu",
  "Diwali crackers online",
  "Diwali crackers offer 2026",
  "crackers price list Sivakasi",
  "Sivakasi crackers direct purchase",
  "online crackers shopping India",
  "gift box crackers Sivakasi",
  "flower pots crackers",
  "ground chakkar online",
  "sparklers online India",
  "aerial shots crackers",
  "rockets crackers online",
  "crackers home delivery Tamil Nadu",
];

/** URL-safe, stable, human-readable product slug: "lucky-money-1". */
export const productSlug = (p) =>
  `${String(p.name)
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")}-${p.id}`;

export const idFromSlug = (slug) => {
  const m = String(slug || "").match(/-(\d+)$/);
  return m ? Number(m[1]) : null;
};

export const categorySlug = (c) =>
  String(c).toLowerCase().replace(/['']/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/** Discounted unit price, matching the cart, checkout and invoice. */
export const priceOf = (p) => Math.round(p.price - (p.price * (p.discount || 0)) / 100);

/**
 * Absolute image URL for structured data. Search engines need a fully-qualified
 * address, and product artwork lives on the asset host, not this origin.
 */
export const imageUrl = (path) => {
  if (!path) return `${SITE_URL}/images/logo.png`;
  const url = assetUrl(path);
  return url.startsWith("http") ? url : `${SITE_URL}${url}`;
};

/** Renders a JSON-LD block. Next injects it into the served HTML. */
export function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export const organizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: BUSINESS.name,
  legalName: BUSINESS.legalName,
  alternateName: BUSINESS.alternateName,
  url: SITE_URL,
  logo: `${SITE_URL}/images/logo.png`,
  description: BUSINESS.description,
  ...(isPlaceholder(BUSINESS.founded) ? {} : { foundingDate: BUSINESS.founded }),
  ...(isPlaceholder(BUSINESS.phone[0]) ? {} : { telephone: BUSINESS.phone[0] }),
  ...(isPlaceholder(BUSINESS.email) ? {} : { email: BUSINESS.email }),
  ...(hasAddress()
    ? {
        address: {
          "@type": "PostalAddress",
          streetAddress: BUSINESS.office.street,
          addressLocality: BUSINESS.office.locality,
          addressRegion: BUSINESS.office.region,
          postalCode: BUSINESS.office.postalCode,
          addressCountry: BUSINESS.office.country,
        },
      }
    : {}),
});

/**
 * The shop itself. "Store" rather than a manufacturing type, because that is
 * what Maharishi Crackers is — and a local search result is judged on address, hours,
 * phone and area served, all of which are declared here.
 */
export const localBusinessSchema = () => ({
  "@context": "https://schema.org",
  "@type": ["Store", "LocalBusiness"],
  "@id": `${SITE_URL}/#store`,
  name: BUSINESS.name,
  image: `${SITE_URL}/images/logo.png`,
  url: SITE_URL,
  ...(isPlaceholder(BUSINESS.phone[0]) ? {} : { telephone: BUSINESS.phone[0] }),
  ...(isPlaceholder(BUSINESS.email) ? {} : { email: BUSINESS.email }),
  priceRange: "₹₹",
  description: BUSINESS.description,
  ...(hasAddress()
    ? {
        address: {
          "@type": "PostalAddress",
          streetAddress: BUSINESS.office.street,
          addressLocality: BUSINESS.office.locality,
          addressRegion: BUSINESS.office.region,
          postalCode: BUSINESS.office.postalCode,
          addressCountry: BUSINESS.office.country,
        },
      }
    : {}),
  geo: { "@type": "GeoCoordinates", latitude: BUSINESS.geo.latitude, longitude: BUSINESS.geo.longitude },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    opens: "09:00",
    closes: "19:00",
  },
  areaServed: [
    { "@type": "Country", name: "India" },
    { "@type": "State", name: "Tamil Nadu" },
  ],
  currenciesAccepted: "INR",
  paymentAccepted: "Cash, UPI, Bank Transfer",
  keywords: KEYWORDS.slice(0, 10).join(", "),
  slogan: "Sivakasi fireworks, delivered across India",
  hasMap: `https://www.google.com/maps/search/?api=1&query=${BUSINESS.geo.latitude},${BUSINESS.geo.longitude}`,
  sameAs: [],
});

/**
 * Tells a search engine the site has its own search, which can earn a sitelinks
 * search box in results.
 */
export const searchActionSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website-search`,
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
});

/** Delivery, payment and returns, so an answer engine can state them directly. */
export const merchantPolicySchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#policies`,
  name: BUSINESS.name,
  hasMerchantReturnPolicy: {
    "@type": "MerchantReturnPolicy",
    applicableCountry: "IN",
    returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
    merchantReturnLink: `${SITE_URL}/contact`,
  },
  makesOffer: {
    "@type": "Offer",
    priceCurrency: "INR",
    eligibleTransactionVolume: {
      "@type": "PriceSpecification",
      minPrice: 3000,
      priceCurrency: "INR",
      description: "Minimum order value for online orders",
    },
    availableDeliveryMethod: "https://schema.org/ParcelService",
    areaServed: { "@type": "Country", name: "India" },
  },
});

export const websiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: BUSINESS.name,
  description: BUSINESS.description,
  publisher: { "@id": `${SITE_URL}/#organization` },
});

export const breadcrumbSchema = (trail) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: trail.map((t, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: t.name,
    item: `${SITE_URL}${t.path}`,
  })),
});

/** Answer-engine friendly: a plain question/answer pair list. */
export const faqSchema = (faqs) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
});
