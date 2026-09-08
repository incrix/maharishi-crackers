import { Stack, Box, Typography } from "@mui/material";
import mark from "@/public/images/logo-mark.png";

/**
 * Masthead for the content pages (About, Why Sivakasi, Safety, Contact).
 *
 * One component so the four read as a set rather than four separate designs,
 * and so the shop's green band has an echo on every other page. Shorter than
 * the shop hero - these pages are read, not browsed, so the text starts sooner.
 */
export default function PageHero({ eyebrow, title, lead, children }) {
  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        overflow: "hidden",
        backgroundColor: "var(--primary-color)",
        backgroundImage:
          "radial-gradient(120% 150% at 90% -30%, rgba(45,122,74,.95) 0%, rgba(26,77,46,0) 60%)",
      }}
    >
      <Box
        component="img"
        src={mark.src}
        alt=""
        aria-hidden
        sx={{
          display: { xs: "none", md: "block" },
          position: "absolute", right: -30, top: -20,
          width: 300, opacity: 0.07, pointerEvents: "none",
          filter: "grayscale(1) brightness(3)",
        }}
      />
      <Stack
        width="100%"
        maxWidth="var(--max-width)"
        mx="auto"
        px={{ xs: 2, sm: 3, md: 4 }}
        py={{ xs: 3.5, md: 5 }}
        gap={1.25}
        sx={{ position: "relative" }}
      >
        <Stack direction="row" alignItems="center" gap={1.25}>
          <Box sx={{ width: 24, height: 2, backgroundColor: "var(--secondary-light)", borderRadius: 2 }} />
          <Typography
            fontSize={11.5} fontWeight={800} letterSpacing={1.4}
            textTransform="uppercase" color="var(--secondary-light)"
          >
            {eyebrow}
          </Typography>
        </Stack>

        <Typography
          component="h1"
          fontSize={{ xs: 28, sm: 36, md: 44 }}
          fontWeight={800}
          lineHeight={1.08}
          letterSpacing={-0.4}
          color="#fff"
          maxWidth={860}
        >
          {title}
        </Typography>

        {lead && (
          <Typography
            fontSize={{ xs: 14.5, md: 16.5 }}
            lineHeight={1.7}
            sx={{ color: "rgba(255,255,255,.82)", maxWidth: 680 }}
          >
            {lead}
          </Typography>
        )}

        {children}
      </Stack>
    </Box>
  );
}

/** Shared shells so the four pages keep one rhythm. */
export function Section({ title, lead, children, tint = false }) {
  return (
    <Box sx={{ width: "100%", backgroundColor: tint ? "var(--surface-muted)" : "transparent" }}>
      <Stack
        width="100%" maxWidth="var(--max-width)" mx="auto"
        px={{ xs: 2, sm: 3, md: 4 }} py={{ xs: 3.5, md: 5.5 }} gap={{ xs: 2, md: 3 }}
      >
        {title && (
          <Stack gap={0.75} maxWidth={760}>
            <Typography component="h2" fontSize={{ xs: 21, md: 27 }} fontWeight={800} color="var(--text-color)">
              {title}
            </Typography>
            {lead && (
              <Typography fontSize={{ xs: 14, md: 15.5 }} lineHeight={1.75} color="var(--text-color-secondary)">
                {lead}
              </Typography>
            )}
          </Stack>
        )}
        {children}
      </Stack>
    </Box>
  );
}

export function Card({ children, accent = false, ...sx }) {
  return (
    <Stack
      gap={1}
      sx={{
        p: { xs: 2, md: 2.5 },
        borderRadius: "var(--radius-lg)",
        backgroundColor: "var(--surface)",
        border: "1px solid",
        borderColor: accent ? "var(--primary-border)" : "var(--border)",
        ...sx,
      }}
    >
      {children}
    </Stack>
  );
}

export const Grid = ({ cols = 3, children, gap = 2 }) => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: { xs: "1fr", sm: cols > 2 ? "repeat(2, 1fr)" : "1fr", md: `repeat(${cols}, 1fr)` },
      gap,
    }}
  >
    {children}
  </Box>
);
