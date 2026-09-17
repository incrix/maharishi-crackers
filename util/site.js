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
 * Whether to show the green crackers badge.
 *
 * This is the shop's own statement about what it sells, and it shows no
 * certifying body and no certificate number - which is the distinction that
 * matters. The inherited badge did carry both: a CSIR-NEERI mark and the
 * registration NE/TN/788-01/2023, belonging to the sister shop's supplier.
 * Republishing another party's registration is a false accreditation claim
 * however true the underlying product claim is, so that image was deleted
 * rather than reused.
 *
 * The ISO 9001:2015 badge is gone with it. A quality-management certification
 * is held by a named organisation against an audited scope; there is nothing
 * to point at here.
 */
export const GREEN_CRACKERS_BADGE = true;

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

/**
 * The address as one string, for anywhere that prints it rather than marking it
 * up - the footer, the contact card, the invoice and the delivery challan.
 *
 * It lived as five slightly different template literals across those files, so
 * the same address read differently depending on where you saw it and the
 * district appeared nowhere. `multiline` is for the PDFs, which set it in a
 * narrow column. Falls back to town and state while the street is unset, so a
 * half-filled block never prints "TODO" on a document.
 */
export const formatAddress = ({ multiline = false } = {}) => {
  const o = BUSINESS.office || {};
  if (!hasAddress()) return [o.locality, o.region].filter(Boolean).join(", ");
  const town = [o.locality, o.district && `${o.district} District`].filter(Boolean).join(", ");
  return [o.street, town, `${o.region} ${o.postalCode}`]
    .filter(Boolean)
    .join(multiline ? "\n" : ", ");
};

/**
 * "9am to 7pm, Monday to Saturday" from the stored 24-hour values.
 *
 * Derived rather than written out beside them, because the pair that gets
 * edited and the sentence a customer reads must not be able to disagree.
 */
export const openingHoursLabel = () => {
  const h = BUSINESS.openingHours;
  if (!h) return null;
  const clock = (t) => {
    const [hh, mm] = t.split(":").map(Number);
    const suffix = hh < 12 ? "am" : "pm";
    const h12 = hh % 12 === 0 ? 12 : hh % 12;
    return `${h12}${mm ? `.${String(mm).padStart(2, "0")}` : ""}${suffix}`;
  };
  const days = h.days.length === 7
    ? "every day"
    : `${h.days[0]} to ${h.days[h.days.length - 1]}`;
  return `${clock(h.opens)} to ${clock(h.closes)}, ${days}`;
};

export const BUSINESS = {
  name: "Maharishi Crackers",
  // Confirmed: the registered name and the trading name are the same.
  legalName: "Maharishi Crackers",
  alternateName: ["Maharishi Fireworks", "Maharishi Crackers Sivakasi", "Maharishi"],
  tagline: "Sivakasi fireworks, delivered across India",
  description:
    "Maharishi Crackers supplies Sivakasi fireworks and crackers direct to customers across India. Order sparklers, ground chakkars, flower pots, aerial shots and gift boxes online for doorstep delivery.",
  // The shop's own number. Printed unguarded on the invoice, the challan and
  // every order email, which is why the placeholder that used to sit here was
  // not merely untidy - customers were being told to call 00000 00000.
  phone: ["+91 75488 20326"],
  // Digits only with the country code: this is interpolated straight into a
  // wa.me link, which rejects spaces and a leading +.
  whatsapp: "917548820326",
  email: "maharishicrackers@gmail.com",
  /**
   * The principal place of business, as recorded in the partnership deed.
   *
   * Note it is in Sattur taluk, not Sivakasi - see the district and the 626203
   * postcode. Most of the site's copy still says Sivakasi, which is the trade
   * region rather than this address. That is flagged rather than papered over:
   * this block is what feeds local search and what prints on the challan.
   */
  office: {
    street: "D.No. 9/62/H, West Street, K. Meenatchipuram, Kanmaisurangudi, O. Mettupatti Post",
    locality: "Sattur",
    district: "Virudhunagar",
    region: "Tamil Nadu",
    postalCode: "626203",
    country: "IN",
  },
  /**
   * Deliberately absent, rather than approximate.
   *
   * What used to be here (9.4499, 77.7983) was Sivakasi town centre, about
   * 20km from the registered address and in a different taluk - a map pin in
   * the wrong town. The village is O. Mettupatti in Sattur taluk, for which no
   * published coordinates could be found, and a pin is a precise claim: it is
   * what a customer or a courier drives to. So the schema omits `geo` while
   * this is null and builds its map link from the written address instead,
   * which Google resolves itself.
   *
   * TODO(abishek): stand at the shop, open Google Maps, long-press your own
   * location and paste the two numbers here.
   */
  geo: null,
  /**
   * The hours the shop publishes.
   *
   * These are the owner's stated standard hours, not an inherited guess. They
   * go into the search listing, which is what makes a result say "Open until
   * 7pm", so they are the one value here a customer may act on before ever
   * reaching the site - change them the day the hours change.
   *
   * The contact page deliberately does not repeat them. It tells people to
   * ring first, because the season before Diwali runs longer than this and no
   * single line covers both.
   */
  openingHours: { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], opens: "09:00", closes: "19:00" },
  // Confirmed by the owner. Published as foundingDate in the Organization
  // schema, which is where a search result gets "established 2020" from.
  founded: "2020",
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
  ...(BUSINESS.geo
    ? { geo: { "@type": "GeoCoordinates", latitude: BUSINESS.geo.latitude, longitude: BUSINESS.geo.longitude } }
    : {}),
  ...(BUSINESS.openingHours
    ? {
        openingHoursSpecification: {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: BUSINESS.openingHours.days,
          opens: BUSINESS.openingHours.opens,
          closes: BUSINESS.openingHours.closes,
        },
      }
    : {}),
  areaServed: [
    { "@type": "Country", name: "India" },
    { "@type": "State", name: "Tamil Nadu" },
  ],
  currenciesAccepted: "INR",
  paymentAccepted: "Cash, UPI, Bank Transfer",
  keywords: KEYWORDS.slice(0, 10).join(", "),
  slogan: "Sivakasi fireworks, delivered across India",
  // Coordinates when they exist, otherwise the written address - a search
  // Google resolves itself, which beats a pin dropped in the wrong town.
  hasMap: `https://www.google.com/maps/search/?api=1&query=${
    BUSINESS.geo
      ? `${BUSINESS.geo.latitude},${BUSINESS.geo.longitude}`
      : encodeURIComponent(`${BUSINESS.name}, ${formatAddress()}`)
  }`,
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
