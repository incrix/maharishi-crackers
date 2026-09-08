import { Stack, Box, Typography } from "@mui/material";
import { MIN_ORDER } from "@/util/commerce";

/**
 * How ordering works.
 *
 * This is the single most important explainer on the site. Firecrackers cannot
 * be sold outright online under the 2018 Supreme Court ruling, so an order
 * placed here is an enquiry that a person confirms by phone. A customer who
 * does not know that reads the cart as a normal checkout, expects an instant
 * confirmation and a courier tracking number, and treats the call as a problem.
 *
 * Server-rendered: it is factual content an answer engine should be able to
 * read, and it must not depend on JavaScript.
 */

const STEPS = [
  {
    n: "1",
    title: "Build your order",
    body: `Add what you want to the cart and adjust quantities as you browse. Online orders start at ₹${MIN_ORDER.toLocaleString("en-IN")}.`,
  },
  {
    n: "2",
    title: "We call to confirm",
    body: "Submit your details and we ring or message you within a day to confirm the items, the total and the delivery charge before anything is packed.",
  },
  {
    n: "3",
    title: "Packed and dispatched",
    body: "Once you approve it, the order is packed and sent by licensed road transport. Your reference tracks it from that point on.",
  },
];

export default function HowItWorks() {
  return (
    <Box sx={{ width: "100%", backgroundColor: "var(--surface-muted)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
      <Stack
        width="100%"
        maxWidth="var(--max-width)"
        mx="auto"
        px={{ xs: 2, sm: 3, md: 4 }}
        py={{ xs: 3, md: 4.5 }}
        gap={{ xs: 2, md: 3 }}
      >
        <Stack gap={0.5}>
          <Typography component="h2" fontSize={{ xs: 19, md: 23 }} fontWeight={800} color="var(--text-color)">
            How ordering works
          </Typography>
          <Typography fontSize={{ xs: 13, md: 14 }} color="var(--text-color-secondary)" lineHeight={1.7} maxWidth={760}>
            Fireworks cannot be sold outright online in India, so your order reaches
            us as an enquiry and a person confirms it with you before it ships. No
            payment is taken on this site.
          </Typography>
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: { xs: 1.5, md: 2.5 },
          }}
        >
          {STEPS.map((s) => (
            <Stack
              key={s.n}
              gap={1}
              sx={{
                p: { xs: 2, md: 2.5 },
                borderRadius: "var(--radius-lg)",
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              <Box
                sx={{
                  display: "grid", placeItems: "center",
                  width: 30, height: 30, borderRadius: "var(--radius-pill)",
                  backgroundColor: "var(--primary-color)", color: "#fff",
                  fontSize: 14, fontWeight: 800,
                }}
              >
                {s.n}
              </Box>
              <Typography fontSize={{ xs: 15, md: 16 }} fontWeight={800} color="var(--text-color)">
                {s.title}
              </Typography>
              <Typography fontSize={{ xs: 13, md: 13.5 }} color="var(--text-color-secondary)" lineHeight={1.7}>
                {s.body}
              </Typography>
            </Stack>
          ))}
        </Box>
      </Stack>
    </Box>
  );
}
