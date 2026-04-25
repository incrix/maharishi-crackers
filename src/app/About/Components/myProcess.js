"use client";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Image from "next/image";
import SparkOne from "@/public/Images/SparkOne.svg";
import SparkTwo from "@/public/Images/SparkTwo.svg";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

export default function MyProcess() {
  const router = useRouter();
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 });

  const steps = [
    { num: "01", title: "Selection", desc: "We handpick the safest, most vibrant crackers from certified manufacturers — ensuring top quality for both retail & wholesale customers." },
    { num: "02", title: "Showcase", desc: "Our catalog is always stocked with a stunning variety of fireworks — from family-friendly sparklers to show-stopping aerial displays." },
    { num: "03", title: "Service", desc: "Whether you are buying a single box or placing a bulk order, our team serves you with care, advice, and fast fulfillment." },
    { num: "04", title: "Celebrate", desc: "You light them up — we light up your smiles! Enjoy a dazzling celebration with the best products at the right price." },
  ];

  return (
    <Stack ref={ref} sx={{ pt: { xs: "100px", md: "120px" }, pb: { xs: 4, md: 6 } }}>
      <Stack direction={{ xs: "column", md: "row" }} sx={{ px: { xs: 3, md: 6 }, gap: { xs: 5, md: 6 } }}>
        {/* Left */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.5 }} style={{ flex: 1 }}>
          <Stack spacing={3}>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.8,
                background: "var(--category-color)",
                borderRadius: "50px",
                px: 2,
                py: 0.6,
                width: "fit-content",
                border: "1px solid var(--border)",
              }}
            >
              <AutoAwesomeRoundedIcon sx={{ fontSize: 14, color: "var(--primary)" }} />
              <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "var(--primary)", letterSpacing: "0.5px" }}>OUR PROCESS</Typography>
            </Box>

            <Typography
              sx={{
                fontFamily: "var(--font-heading)",
                lineHeight: 1.15,
                fontSize: { xs: "28px", md: "42px" },
                fontWeight: 700,
                color: "var(--primary)",
              }}
            >
              Our <Box component="span" sx={{ color: "var(--secondary)" }}>Sparkling</Box> Journey
            </Typography>

            <motion.div whileHover={{ scale: 1.03, x: 3 }} whileTap={{ scale: 0.97 }}>
              <Button
                disableElevation
                variant="contained"
                endIcon={<ArrowForwardRoundedIcon />}
                onClick={() => router.push("/Shop")}
                sx={{
                  width: "fit-content",
                  borderRadius: "50px",
                  px: 3.5,
                  py: 1.2,
                  background: "var(--gold-gradient)",
                  color: "#fff",
                  fontWeight: 600,
                  textTransform: "none",
                  fontSize: "14px",
                  boxShadow: "0 4px 16px rgba(184, 150, 62, 0.25)",
                  "&:hover": { background: "var(--gold-gradient)", opacity: 0.9 },
                }}
              >
                Order Now
              </Button>
            </motion.div>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mt={2}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Box sx={{ borderRadius: "20px", overflow: "hidden", boxShadow: "0 8px 30px rgba(0,0,0,0.08)", border: "1px solid var(--border)" }}>
                  <Image src={SparkOne.src} alt="Spark One" width={280} height={480} style={{ borderRadius: "20px", width: "100%", height: "auto" }} />
                </Box>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <Box sx={{ borderRadius: "20px", overflow: "hidden", boxShadow: "0 8px 30px rgba(0,0,0,0.08)", border: "1px solid var(--border)" }}>
                  <Image src={SparkTwo.src} alt="Spark Two" width={280} height={480} style={{ borderRadius: "20px", width: "100%", height: "auto" }} />
                </Box>
              </motion.div>
            </Stack>
          </Stack>
        </motion.div>

        {/* Right — Steps */}
        <Stack flex={1} spacing={0} pt={{ xs: 0, md: 10 }}>
          {steps.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.15 + i * 0.1 }}>
              <Stack
                direction="row"
                gap={2}
                sx={{
                  py: 3,
                  borderBottom: "1px solid var(--border)",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    pl: 1,
                    background: "rgba(26, 77, 46, 0.02)",
                    borderRadius: "12px",
                  },
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "var(--font-heading)",
                    fontSize: { xs: "14px", md: "16px" },
                    fontWeight: 700,
                    color: "var(--secondary)",
                    minWidth: 28,
                    pt: 0.3,
                  }}
                >
                  {item.num}
                </Typography>
                <Stack spacing={0.8}>
                  <Typography
                    sx={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 700,
                      fontSize: { xs: "18px", md: "22px" },
                      color: "var(--primary)",
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography sx={{ color: "#777", fontSize: { xs: "13px", md: "14.5px" }, lineHeight: 1.7 }}>
                    {item.desc}
                  </Typography>
                </Stack>
              </Stack>
            </motion.div>
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
}
