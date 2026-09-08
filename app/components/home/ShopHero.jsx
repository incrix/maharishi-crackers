import { Stack, Box, Typography, Button } from "@mui/material";
import Link from "next/link";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import SavingsRoundedIcon from "@mui/icons-material/SavingsRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import { PRICE_LIST_URL } from "@/util/config";
import mark from "@/public/images/logo-mark.png";

/**
 * Home banner.
 *
 * A full-bleed brand band rather than a text block on white: the shop's ground
 * is a warm off-white, so a deep green panel gives the page a masthead and
 * separates "who this is" from "what is for sale" without a rule.
 *
 * It stays short on purpose. This is a catalogue-first shop, and a returning
 * customer wants the grid, so the band states the offer and gets out of the way.
 *
 * The trust line is not decoration: phone confirmation, road transport and the
 * minimum order are the three things that surprise people at checkout, so they
 * are said before anything reaches the cart.
 */

const TRUST = [
  { icon: <SavingsRoundedIcon />, label: "Bought at source in Sivakasi" },
  { icon: <SupportAgentRoundedIcon />, label: "Confirmed by phone within a day" },
  { icon: <LocalShippingRoundedIcon />, label: "Licensed transport across India" },
  { icon: <VerifiedRoundedIcon />, label: "Stock from licensed units only" },
];

export default function ShopHero({ productCount, categoryCount }) {
  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        overflow: "hidden",
        backgroundColor: "var(--primary-color)",
        // A second, lighter green thrown from the top-right keeps the panel
        // from reading as one flat slab.
        backgroundImage:
          "radial-gradient(120% 140% at 88% -20%, rgba(45,122,74,.95) 0%, rgba(26,77,46,0) 62%)",
      }}
    >
      {/* The leaf mark, oversized and barely there - a watermark, not a logo
          placement. Hidden on a phone, where it would crowd the type. */}
      <Box
        component="img"
        src={mark.src}
        alt=""
        aria-hidden
        sx={{
          display: { xs: "none", md: "block" },
          position: "absolute", right: -40, top: -30,
          width: 380, opacity: 0.07, pointerEvents: "none",
          filter: "grayscale(1) brightness(3)",
        }}
      />

      <Stack
        width="100%"
        maxWidth="var(--max-width)"
        mx="auto"
        px={{ xs: 2, sm: 3, md: 4 }}
        py={{ xs: 4, md: 6 }}
        gap={{ xs: 2.5, md: 3 }}
        sx={{ position: "relative" }}
      >
        <Stack gap={1.5} maxWidth={780}>
          <Stack direction="row" alignItems="center" gap={1.25}>
            <Box sx={{ width: 26, height: 2, backgroundColor: "var(--secondary-light)", borderRadius: 2 }} />
            <Typography
              fontSize={11.5}
              fontWeight={800}
              letterSpacing={1.4}
              textTransform="uppercase"
              color="var(--secondary-light)"
            >
              Sivakasi · Tamil Nadu
            </Typography>
          </Stack>

          <Typography
            component="h1"
            fontSize={{ xs: 30, sm: 40, md: 52 }}
            fontWeight={800}
            lineHeight={1.06}
            color="#fff"
            letterSpacing={-0.5}
          >
            The Diwali range,{" "}
            <Box component="span" sx={{ color: "var(--secondary-light)" }}>
              priced at the source
            </Box>
          </Typography>

          <Typography
            fontSize={{ xs: 14.5, md: 16.5 }}
            lineHeight={1.7}
            sx={{ color: "rgba(255,255,255,.82)", maxWidth: 620 }}
          >
            {productCount > 0
              ? `${productCount} crackers across ${categoryCount} categories — sparklers, chakkars, flower pots, aerial shots and gift boxes. Build your order below; we confirm it on the phone.`
              : "Sparklers, chakkars, flower pots, aerial shots and gift boxes. Build your order below; we confirm it on the phone."}
          </Typography>
        </Stack>

        <Stack direction="row" gap={1.25} flexWrap="wrap">
          <Button
            component={Link}
            href="#catalogue"
            sx={{
              textTransform: "none", fontWeight: 800, fontSize: 14.5,
              px: 3, py: 1.25, borderRadius: "var(--radius-pill)",
              backgroundColor: "var(--secondary-color)", color: "#1a1a1a",
              boxShadow: "0 6px 20px rgba(0,0,0,.22)",
              "&:hover": { backgroundColor: "var(--secondary-light)" },
            }}
          >
            Shop the range
          </Button>
          <Button
            href={PRICE_LIST_URL}
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<PictureAsPdfRoundedIcon />}
            sx={{
              textTransform: "none", fontWeight: 800, fontSize: 14.5,
              px: 3, py: 1.25, borderRadius: "var(--radius-pill)",
              color: "#fff", border: "1.5px solid rgba(255,255,255,.35)",
              "&:hover": { borderColor: "#fff", backgroundColor: "rgba(255,255,255,.08)" },
            }}
          >
            Price list PDF
          </Button>
        </Stack>

        {/* One quiet line, not four boxes: the claims are short enough to read
            in a row, and boxing them would rebuild the panel as a card grid. */}
        <Stack
          direction="row"
          flexWrap="wrap"
          gap={{ xs: 1.5, md: 3.5 }}
          sx={{ pt: { xs: 1, md: 1.5 }, borderTop: "1px solid rgba(255,255,255,.14)" }}
        >
          {TRUST.map((t) => (
            <Stack key={t.label} direction="row" alignItems="center" gap={1}>
              <Box sx={{ display: "flex", color: "var(--secondary-light)", "& svg": { fontSize: 17 } }}>
                {t.icon}
              </Box>
              <Typography fontSize={{ xs: 12, md: 13 }} fontWeight={600} sx={{ color: "rgba(255,255,255,.88)" }}>
                {t.label}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}
