import { Stack, Box, Typography, Button } from "@mui/material";
import Link from "next/link";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import Faq from "@/app/components/Faq";
import PageHero, { Section, Card, Grid } from "@/app/components/pages/PageHero";
import {
  SITE_URL, BUSINESS, KEYWORDS, JsonLd, breadcrumbSchema, faqSchema, organizationSchema,
} from "@/util/site";

export const metadata = {
  title: "Why Sivakasi — Where Our Stock Comes From",
  description:
    "Most fireworks sold in India are made in one town in Virudhunagar district. What that means for a shop trading there, and what it changes about the price you pay.",
  keywords: [...KEYWORDS, "why Sivakasi crackers", "Sivakasi fireworks industry", "crackers direct from Sivakasi"],
  alternates: { canonical: `${SITE_URL}/factory` },
  openGraph: {
    title: "Why Sivakasi",
    description: "Buying fireworks in the town where they are made, and what that changes.",
    url: `${SITE_URL}/factory`, siteName: BUSINESS.name, type: "website",
  },
};

const CHAIN = [
  { n: "01", t: "Made in a licensed unit", b: "Production is licensed and inspected work, carried out in small, spread-out buildings rather than one large plant — a deliberate arrangement, so that an accident stays contained." },
  { n: "02", t: "Bought for the season", b: "We buy across a number of units before the season, choosing item by item. That is what fills a list broader than any single maker turns out." },
  { n: "03", t: "Sold from our counter", b: "From there it goes straight to you — over the counter, or packed and moved by licensed road transport." },
];

const ALL_FAQS = [
  {
    q: "Why is the fireworks trade concentrated in one town?",
    a: "Sivakasi sits in a dry pocket of Virudhunagar district, and dryness matters when you are handling material that must not take on moisture. The trade grew from a match industry in the 1920s, and the skills stayed local — often within the same families across three or four generations.",
  },
  {
    q: "Does Maharishi Crackers make its own fireworks?",
    a: "No. We buy from licensed manufacturing units nearby and sell what we buy. We do not operate a production unit, and nothing on this site is made by us.",
  },
  {
    q: "Does buying here genuinely cost less?",
    a: "Usually, yes. A carton sold in a city has generally paid a distributor and a retailer along the way. Ours has not made that journey, and the price reflects the shorter route rather than a temporary offer.",
  },
  {
    q: "Is the stock fresher than what a city shop has?",
    a: "It tends to be. Fireworks are made to a season and sold within it. Stock bought near the source spends less time in transit and storage before it reaches you, which matters for anything with a fuse.",
  },
  {
    q: "What certifications does the stock carry?",
    a: "Green cracker formulations, made by licensed units around Sivakasi. The approvals sit with those manufacturers — that is where the emission testing and the explosives licences are held — rather than with the shop selling them on, so we do not print a registration number against our own name. If an item's paperwork matters to you, ask and we will get it from the unit.",
  },
];

/** Unanswered entries are held back rather than shown as "TODO" to a customer. */
const FAQS = ALL_FAQS.filter((f) => !f.a.startsWith("TODO"));

export default function FactoryPage() {
  return (
    <>
      <JsonLd data={organizationSchema()} />
      <JsonLd data={breadcrumbSchema([{ name: "Shop", path: "/" }, { name: "Why Sivakasi", path: "/factory" }])} />
      <JsonLd data={faqSchema(FAQS)} />

      <PageHero
        eyebrow="Why Sivakasi"
        title="One town makes most of what India sets off"
        lead="Sivakasi is a town in Virudhunagar district, Tamil Nadu, and it has been making fireworks for about a century. Trading here is not a marketing line — it decides what we can stock and what we can charge."
      />

      <Section
        title="How the stock reaches you"
        lead="Three steps, which is the whole point — a carton sold elsewhere has usually been through five or six."
      >
        <Grid cols={3}>
          {CHAIN.map((s) => (
            <Card key={s.n}>
              <Typography fontSize={12} fontWeight={800} letterSpacing={1} color="var(--secondary-color)">
                {s.n}
              </Typography>
              <Typography fontSize={16.5} fontWeight={800} color="var(--text-color)">{s.t}</Typography>
              <Typography fontSize={13.5} lineHeight={1.75} color="var(--text-color-secondary)">{s.b}</Typography>
            </Card>
          ))}
        </Grid>
      </Section>

      <Section tint title="What we are, and what we are not">
        <Grid cols={2}>
          <Card accent>
            <Typography fontSize={16} fontWeight={800} color="var(--primary-color)">We are a retailer</Typography>
            <Typography fontSize={13.5} lineHeight={1.75} color="var(--text-color-secondary)">
              We choose, buy, store and sell. Buying across several units instead of
              one is what lets the list run wider than any single manufacturer&apos;s
              catalogue, and lets us drop an item that disappoints.
            </Typography>
          </Card>
          <Card>
            <Typography fontSize={16} fontWeight={800} color="var(--text-color)">We are not a manufacturer</Typography>
            <Typography fontSize={13.5} lineHeight={1.75} color="var(--text-color-secondary)">
              We own no factory and make nothing ourselves. Plenty of sites in this
              trade blur that line; it is worth being plain about, because it is the
              difference between selecting stock and producing it.
            </Typography>
          </Card>
        </Grid>
      </Section>

      <Section>
        <Card accent sx={{ p: 0 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            alignItems={{ md: "center" }} justifyContent="space-between" gap={2}
            sx={{ p: { xs: 2.5, md: 3.5 } }}
          >
            <Stack gap={0.75} maxWidth={560}>
              <Typography fontSize={{ xs: 18, md: 21 }} fontWeight={800} color="var(--text-color)">
                Fireworks are worth handling carefully
              </Typography>
              <Typography fontSize={14} lineHeight={1.7} color="var(--text-color-secondary)">
                A short, practical read on storing and lighting them — and what to do
                if something goes wrong.
              </Typography>
            </Stack>
            <Button
              component={Link} href="/safety" endIcon={<ArrowForwardRoundedIcon />}
              sx={{
                flexShrink: 0, textTransform: "none", fontWeight: 800, fontSize: 14.5,
                px: 3, py: 1.2, borderRadius: "var(--radius-pill)",
                backgroundColor: "var(--primary-color)", color: "#fff",
                "&:hover": { backgroundColor: "var(--primary-dark)" },
              }}
            >
              Safety guide
            </Button>
          </Stack>
        </Card>
      </Section>

      <Section tint>
        <Faq heading="About the town and the trade" faqs={FAQS} />
      </Section>
    </>
  );
}
