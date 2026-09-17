import { Stack, Box, Typography, Button } from "@mui/material";
import CallRoundedIcon from "@mui/icons-material/CallRounded";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import Faq from "@/app/components/Faq";
import PageHero, { Section, Card, Grid } from "@/app/components/pages/PageHero";
import { SITE_URL, BUSINESS, KEYWORDS, JsonLd, breadcrumbSchema, faqSchema, localBusinessSchema, formatAddress, openingHoursLabel } from "@/util/site";

export const metadata = {
  title: "Contact — Reach the Shop",
  description:
    "How to reach Maharishi Crackers: phone, WhatsApp, email and the shop address in Sattur, near Sivakasi, and what to expect after you place an order.",
  keywords: [...KEYWORDS, "Maharishi Crackers contact", "crackers shop Sivakasi address"],
  alternates: { canonical: `${SITE_URL}/contact` },
  openGraph: {
    title: "Contact Maharishi Crackers",
    description: "Phone, WhatsApp, email and the shop address.",
    url: `${SITE_URL}/contact`, siteName: BUSINESS.name, type: "website",
  },
};

/** A value is only shown once it is real; placeholders never reach a customer. */
const pending = (v) => !v || String(v).includes("TODO") || /^\+?91[\s0]*0{5,}/.test(String(v));

const FAQS = [
  {
    q: "What happens after I place an order?",
    a: "You get an emailed acknowledgement with a reference in the form MC-0001. Someone then rings or messages you, usually within a day, to confirm the items, the total and the delivery charge. Nothing is packed or sent until you have agreed to all three.",
  },
  {
    q: "Why can I not just pay on the website?",
    a: "Firecrackers cannot be sold outright online in India — the Supreme Court's 2018 ruling does not permit it. What you submit here reaches us as an enquiry, and the sale is completed by a person. That is also why no card details are taken on this site.",
  },
  {
    q: "How do I check where my order is?",
    a: "Quote your MC- reference when you ring or message and we can tell you whether it is being packed, has been handed to the carrier, or is on its way.",
  },
  {
    q: "Do you deliver outside Tamil Nadu?",
    a: "Yes, by licensed road transport. Fireworks are barred from ordinary courier and air freight, so everything moves by approved carriers. Cost and timing depend on the destination and are agreed on the confirmation call, not estimated at checkout.",
  },
  {
    q: "Can I come to the shop instead?",
    a: "Yes — you can buy any quantity over the counter, with no minimum. For anything large, a call ahead means the stock is ready when you arrive rather than being picked while you wait.",
  },
];

function Channel({ icon, label, value, href, note, ready }) {
  return (
    <Card accent={ready}>
      <Stack direction="row" alignItems="center" gap={1}>
        <Box
          sx={{
            display: "grid", placeItems: "center", width: 32, height: 32,
            borderRadius: "var(--radius-sm)",
            backgroundColor: ready ? "var(--primary-soft)" : "var(--surface-muted)",
            color: ready ? "var(--primary-color)" : "var(--text-color-trinary)",
            "& svg": { fontSize: 18 },
          }}
        >
          {icon}
        </Box>
        <Typography fontSize={13} fontWeight={800} letterSpacing={0.3} textTransform="uppercase" color="var(--text-color-secondary)">
          {label}
        </Typography>
      </Stack>

      {ready ? (
        <Typography
          component={href ? "a" : "div"}
          href={href}
          fontSize={{ xs: 16, md: 17.5 }}
          fontWeight={800}
          color="var(--text-color)"
          sx={{ wordBreak: "break-word", "&:hover": href ? { color: "var(--primary-color)" } : {} }}
        >
          {value}
        </Typography>
      ) : (
        <Typography fontSize={14} fontWeight={700} color="var(--text-color-trinary)">
          Not published yet
        </Typography>
      )}

      {note && (
        <Typography fontSize={12.5} lineHeight={1.65} color="var(--text-color-secondary)">
          {note}
        </Typography>
      )}
    </Card>
  );
}

export default function ContactPage() {
  const phone = BUSINESS.phone?.[0];
  const hasPhone = !pending(phone);
  const hasEmail = !pending(BUSINESS.email);
  const hasWa = !pending(BUSINESS.whatsapp);
  const hasAddress = !pending(BUSINESS.office?.street);
  const anyMissing = !(hasPhone && hasEmail && hasWa && hasAddress);

  return (
    <>
      <JsonLd data={localBusinessSchema()} />
      <JsonLd data={breadcrumbSchema([{ name: "Shop", path: "/" }, { name: "Contact", path: "/contact" }])} />
      <JsonLd data={faqSchema(FAQS)} />

      <PageHero
        eyebrow="Contact"
        title="Talk to someone at the shop"
        lead="Every order is confirmed by a person before it ships, so it is worth knowing how to reach us — and what happens once you have sent one."
      />

      <Section title="How to reach us">
        <Grid cols={2}>
          <Channel
            icon={<CallRoundedIcon />} label="Phone" ready={hasPhone}
            value={phone} href={hasPhone ? `tel:+${String(phone).replace(/\D/g, "")}` : undefined}
            note="Best for anything urgent, and for large orders where stock needs checking."
          />
          <Channel
            icon={<WhatsAppIcon />} label="WhatsApp" ready={hasWa}
            value={hasWa ? phone : null}
            href={hasWa ? `https://wa.me/${BUSINESS.whatsapp}` : undefined}
            note="Easiest way to send a list, or a photo of what you are after."
          />
          <Channel
            icon={<MailOutlineRoundedIcon />} label="Email" ready={hasEmail}
            value={BUSINESS.email} href={hasEmail ? `mailto:${BUSINESS.email}` : undefined}
            note="For quotations and anything you want a written record of."
          />
          <Channel
            icon={<PlaceOutlinedIcon />} label="Shop" ready={hasAddress}
            value={hasAddress ? formatAddress() : null}
            note="Buy any quantity over the counter — no minimum, unlike online orders."
          />
        </Grid>

        {anyMissing && (
          <Card sx={{ borderColor: "var(--warning)", backgroundColor: "var(--warning-soft)" }}>
            <Typography fontSize={13.5} fontWeight={800} color="var(--warning)">
              Contact details are not filled in yet
            </Typography>
            <Typography fontSize={13} lineHeight={1.7} color="var(--text-color-secondary)">
              {/* Phone, WhatsApp, email and the address are now filled in, so this
                  card no longer renders. Left in place because it is what would
                  catch the next detail that goes missing — each channel above turns
                  itself on or off on the value alone, and the same values feed the
                  footer, the invoices and the search listing. */}
              Set them in <b>BUSINESS</b> in <code>util/site.js</code>. Each card above
              switches on by itself once a real value is present, and the same values
              feed the footer, the PDFs and the search listing. Nothing invented is
              shown to a customer in the meantime.
            </Typography>
          </Card>
        )}
      </Section>

      <Section tint title="What to expect">
        <Grid cols={3}>
          {[
            ["1 · You send an order", "Build it on the shop page and submit your details. You get an emailed acknowledgement with an MC- reference straight away."],
            ["2 · We call to confirm", "Usually within a day. We go through the items, the total and what delivery costs to your address, and you decide."],
            ["3 · It is packed and sent", "Once agreed, the order is packed and handed to a licensed carrier. Your reference tracks it from there."],
          ].map(([t, b]) => (
            <Card key={t}>
              <Typography fontSize={15.5} fontWeight={800} color="var(--primary-color)">{t}</Typography>
              <Typography fontSize={13.5} lineHeight={1.75} color="var(--text-color-secondary)">{b}</Typography>
            </Card>
          ))}
        </Grid>
      </Section>

      <Section>
        <Card>
          <Stack direction="row" alignItems="center" gap={1}>
            <Box sx={{ color: "var(--primary-color)", display: "flex" }}><ScheduleRoundedIcon /></Box>
            <Typography fontSize={16} fontWeight={800} color="var(--text-color)">Trading hours</Typography>
          </Stack>
          <Typography fontSize={13.5} lineHeight={1.75} color="var(--text-color-secondary)">
            {/* The standard hours live in BUSINESS.openingHours and go into the
                search listing. They are not repeated here on purpose: the season
                runs longer than they do, and a second copy would be the one that
                went stale. */}
            The shop keeps standard hours of {openingHoursLabel()}. From roughly a
            month before Diwali it opens longer and stock moves fastest, so ring{" "}
            {BUSINESS.phone[0]} to check the day&apos;s hours before travelling any
            distance.
          </Typography>
        </Card>
      </Section>

      <Section tint>
        <Faq heading="Before you get in touch" faqs={FAQS} />
      </Section>
    </>
  );
}
