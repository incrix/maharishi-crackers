"use client";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Image from "next/image";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import RetailBoxes from "@/public/Images/retailBoxes.png";
import WholeSale from "@/public/Images/wholeSale.png";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

export default function Offer() {
  const router = useRouter();
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 });

  const cards = [
    {
      title: "Retail Excellence",
      desc: "Bringing joy closer to homes with a wide selection of vibrant, safe, and exciting fireworks.",
      features: ["Curated Festive Combos", "Kid-Friendly Sparklers", "Premium Sky Shots"],
      bg: "var(--primary)", color: "#fff", btnAction: () => router.push("/Shop"), btnText: "Buy Now",
      image: RetailBoxes, imagePosition: "top",
    },
    {
      title: "Wholesale",
      desc: "Supporting businesses & event organizers with reliable bulk supply and seamless service.",
      features: ["Competitive Bulk Pricing", "Timely, Hassle-Free Delivery", "Certified Quality Assurance"],
      bg: "#fff", color: "#1a1a1a", btnAction: () => router.push("/Contact"), btnText: "Get in Touch",
      image: WholeSale, imagePosition: "bottom",
    },
    {
      title: "Memorable Moments",
      desc: "Because every celebration deserves magic. We help you craft unforgettable moments with fireworks that light up the skies.",
      features: ["Signature Showstopper Pieces", "Vibrant Ground Effects", "Brilliant Aerial Displays"],
      bg: "#1a1a1a", color: "#fff", btnAction: () => router.push("/Contact"), btnText: "Get in Touch",
      image: null, imagePosition: null,
    },
  ];

  return (
    <Stack ref={ref} sx={{ px: { xs: 3, md: 6 }, py: { xs: 8, md: 10 } }}>
      <Stack sx={{ background: "var(--card-color)", py: { xs: 3, md: 5 }, px: { xs: 2.5, md: 5 }, borderRadius: "24px", border: "1px solid var(--border)" }}>
        {/* Header */}
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.8,
            background: "#fff",
            borderRadius: "50px",
            px: 2,
            py: 0.6,
            width: "fit-content",
            border: "1px solid var(--border)",
            mb: 3,
          }}
        >
          <AutoAwesomeRoundedIcon sx={{ fontSize: 14, color: "var(--secondary)" }} />
          <Typography sx={{ fontWeight: 600, fontSize: "12px", color: "var(--primary)", letterSpacing: "0.5px" }}>WHAT WE OFFER</Typography>
        </Box>

        <Typography sx={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: { xs: "24px", md: "36px" }, color: "var(--primary)", mb: 4, lineHeight: 1.2 }}>
          Igniting Celebrations{" "}
          <Box component="span" sx={{ color: "var(--secondary)" }}>Through Quality</Box>
        </Typography>

        <Box sx={{ display: "grid", gap: 2.5, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" } }}>
          {cards.map((card, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 25 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 + i * 0.12, duration: 0.45 }}>
              <Box
                sx={{
                  background: card.bg,
                  borderRadius: "20px",
                  p: { xs: 3, md: 3.5 },
                  color: card.color,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: { xs: "auto", md: "560px" },
                  border: card.bg === "#fff" ? "1px solid var(--border)" : "none",
                  transition: "transform 0.25s ease, box-shadow 0.25s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 12px 36px rgba(0,0,0,0.1)",
                  },
                }}
              >
                {card.imagePosition === "top" && card.image && (
                  <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
                    <Image width={400} height={300} src={card.image.src} alt={card.title} style={{ borderRadius: "14px", maxWidth: "100%", height: "auto", width: "100%" }} />
                  </Box>
                )}
                <Typography sx={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: { xs: "20px", md: "24px" } }}>{card.title}</Typography>
                <Typography sx={{ mt: 1, fontSize: { xs: "13px", md: "14px" }, opacity: 0.75, lineHeight: 1.6 }}>{card.desc}</Typography>
                <Stack spacing={1.5} sx={{ mt: 3 }}>
                  {card.features.map((feat, j) => (
                    <Typography key={j} sx={{ pb: 1, borderBottom: `1px solid ${card.color === "#fff" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)"}`, fontSize: { xs: "13px", md: "14px" }, fontWeight: 500 }}>{feat}</Typography>
                  ))}
                </Stack>
                {card.imagePosition === "bottom" && card.image && (
                  <Stack sx={{ mt: 3, alignItems: "center" }}>
                    <Image width={400} height={300} src={card.image.src} alt={card.title} style={{ borderRadius: "14px", maxWidth: "100%", width: "100%", height: "auto" }} />
                  </Stack>
                )}
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    disableElevation
                    variant="contained"
                    endIcon={<ArrowForwardRoundedIcon />}
                    onClick={card.btnAction}
                    sx={{
                      mt: 3,
                      background: "var(--gold-gradient)",
                      borderRadius: "50px",
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: "13px",
                      px: 3,
                      py: 1,
                      "&:hover": { background: "var(--gold-gradient)", opacity: 0.9 },
                    }}
                  >
                    {card.btnText}
                  </Button>
                </motion.div>
              </Box>
            </motion.div>
          ))}
        </Box>
      </Stack>
    </Stack>
  );
}
