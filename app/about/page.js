import { Stack, Box, Typography, Button } from "@mui/material";
import Link from "next/link";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import HandshakeRoundedIcon from "@mui/icons-material/HandshakeRounded";
import CallRoundedIcon from "@mui/icons-material/CallRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import Faq from "@/app/components/Faq";
import PageHero, { Section, Card, Grid } from "@/app/components/pages/PageHero";
import {
  SITE_URL, BUSINESS, KEYWORDS, JsonLd, organizationSchema, breadcrumbSchema, faqSchema,
} from "@/util/site";
import { getProducts } from "@/util/products.server";

export const metadata = {
  title: "About Us — A Fireworks Shop near Sivakasi",
  description:
    "Maharishi Crackers is a fireworks retailer in Sattur, near Sivakasi in Tamil Nadu. What we stock, how we buy it, and what ordering from us actually involves.",
  keywords: [...KEYWORDS, "about Maharishi Crackers", "Sivakasi crackers shop", "fireworks retailer Sivakasi"],
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: "About Maharishi Crackers",
    description: BUSINESS.description,
    url: `${SITE_URL}/about`,
    siteName: BUSINESS.name,
    type: "website",
  },
};

const WHAT_WE_DO = [
  {
    icon: <StorefrontRoundedIcon />,
    title: "We sell, we don't manufacture",
    body: "Maharishi Crackers is a retail business. Nothing here is made by us — it is bought from licensed manufacturing units around Sivakasi and sold on, over the counter and through this site.",
  },
  {
    icon: <Inventory2RoundedIcon />,
    title: "Chosen line by line",
    body: "Because we buy across a number of units rather than taking one maker's full range, the list is assembled item by item. If something does not sell or does not perform, it comes off.",
  },
  {
    icon: <HandshakeRoundedIcon />,
    title: "Households, shops and events",
    body: "Most orders are family boxes for Diwali night. The rest are shops stocking up for the season and people buying for weddings, temple functions and openings.",
  },
  {
    icon: <CallRoundedIcon />,
    title: "Every order ends in a conversation",
    body: "Nothing ships on a click. We ring to confirm what you have chosen, what it comes to and what the delivery costs, before a single box is packed.",
  },
];

const ALL_FAQS = [
  {
    q: "Is Maharishi Crackers a manufacturer?",
    a: "No. We are a retailer. Our stock comes from licensed manufacturing units in and around Sivakasi, and we sell it from our counter and through this website. We do not run a production unit.",
  },
  {
    q: "Why is buying from Sivakasi cheaper?",
    a: "Distance, mostly. A carton that reaches a shop in another state has usually paid a distributor and a retailer on the way. Buying where the stock is made skips those hands, and the difference stays in the price rather than in somebody's margin.",
  },
  {
    q: "Can I buy a small quantity?",
    a: "At the counter, yes — buy a single item if that is all you need. Online orders carry a minimum, because packing and licensed transport cost the same whether the carton is half full or full.",
  },
  {
    q: "How do I know what I am getting?",
    a: "Every item on the list has its own page with the price and what is in the pack. If you are unsure what suits a particular evening — a family with small children, or a wedding — say so on the confirmation call and we will tell you honestly what works.",
  },
  {
    q: "Is the stock licensed?",
    a: "Yes. Fireworks in India cannot lawfully be made or sold outside the licensing system, and the units we buy from hold the manufacturing licences. What we stock is green crackers, the lower-emission formulations. We hold no manufacturing registration ourselves — we are a retailer — so you will not see a certificate number quoted here that is not ours to quote. Ask for a specific item's paperwork and we will get it from the unit that made it.",
  },
];

/** Unanswered entries are held back rather than shown as "TODO" to a customer. */
const FAQS = ALL_FAQS.filter((f) => !f.a.startsWith("TODO"));

export default async function AboutPage() {
  const products = await getProducts();

  return (
    <>
      <JsonLd data={organizationSchema()} />
      <JsonLd data={breadcrumbSchema([{ name: "Shop", path: "/" }, { name: "About", path: "/about" }])} />
      <JsonLd data={faqSchema(FAQS)} />

      <PageHero
        eyebrow="About us"
        title="A fireworks shop in the district that makes them"
        lead="Maharishi Crackers trades from Sattur, in the Sivakasi fireworks belt of Tamil Nadu. We buy from licensed units nearby and sell to households, shops and event buyers — across the counter, and across the country through this site."
      >
        <Stack direction="row" gap={3.5} flexWrap="wrap" sx={{ pt: 1.5 }}>
          {[
            [`${products.length}`, "products on the list"],
            ["13", "categories"],
            ["Sivakasi", "where we buy"],
          ].map(([n, l]) => (
            <Stack key={l}>
              <Typography fontSize={{ xs: 22, md: 26 }} fontWeight={800} color="var(--secondary-light)" lineHeight={1.1}>
                {n}
              </Typography>
              <Typography fontSize={12} fontWeight={600} sx={{ color: "rgba(255,255,255,.75)" }}>
                {l}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </PageHero>

      <Section
        title="What we actually do"
        lead="Plainly, so there is no confusion about what kind of business this is."
      >
        <Grid cols={2}>
          {WHAT_WE_DO.map((c) => (
            <Card key={c.title}>
              <Box
                sx={{
                  display: "grid", placeItems: "center", width: 34, height: 34,
                  borderRadius: "var(--radius-sm)", backgroundColor: "var(--primary-soft)",
                  color: "var(--primary-color)", "& svg": { fontSize: 19 },
                }}
              >
                {c.icon}
              </Box>
              <Typography fontSize={{ xs: 15.5, md: 16.5 }} fontWeight={800} color="var(--text-color)">
                {c.title}
              </Typography>
              <Typography fontSize={{ xs: 13.5, md: 14 }} lineHeight={1.75} color="var(--text-color-secondary)">
                {c.body}
              </Typography>
            </Card>
          ))}
        </Grid>
      </Section>

      <Section tint title="Where the price comes from">
        <Grid cols={3}>
          {[
            ["Fewer hands", "The stock travels from a licensed unit to our counter. It does not pass through a distributor and a city retailer first, and it is not priced as though it had."],
            ["Bought for the season", "Fireworks are a once-a-year trade. Buying for the whole season at once, rather than topping up in small lots, is what makes the rate possible."],
            ["No payment on this site", "You are not charged here. The total is agreed on the phone — including delivery — and settled directly, so there is no gap between what you expected and what you pay."],
          ].map(([t, b]) => (
            <Card key={t} accent>
              <Typography fontSize={15.5} fontWeight={800} color="var(--primary-color)">{t}</Typography>
              <Typography fontSize={13.5} lineHeight={1.75} color="var(--text-color-secondary)">{b}</Typography>
            </Card>
          ))}
        </Grid>
      </Section>

      <Section>
        <Card accent sx={{ p: 0 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            alignItems={{ md: "center" }}
            justifyContent="space-between"
            gap={2}
            sx={{ p: { xs: 2.5, md: 3.5 } }}
          >
            <Stack gap={0.75} maxWidth={560}>
              <Typography fontSize={{ xs: 18, md: 21 }} fontWeight={800} color="var(--text-color)">
                The list is open — have a look
              </Typography>
              <Typography fontSize={14} lineHeight={1.7} color="var(--text-color-secondary)">
                Everything we stock, with prices, in the order it appears on the printed sheet.
              </Typography>
            </Stack>
            <Button
              component={Link}
              href="/"
              endIcon={<ArrowForwardRoundedIcon />}
              sx={{
                flexShrink: 0, textTransform: "none", fontWeight: 800, fontSize: 14.5,
                px: 3, py: 1.2, borderRadius: "var(--radius-pill)",
                backgroundColor: "var(--primary-color)", color: "#fff",
                "&:hover": { backgroundColor: "var(--primary-dark)" },
              }}
            >
              Shop the range
            </Button>
          </Stack>
        </Card>
      </Section>

      <Section tint>
        <Faq heading="Questions people ask" faqs={FAQS} />
      </Section>
    </>
  );
}
