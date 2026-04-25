"use client";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Image from "next/image";
import fourImagePic from "@/public/Images/fourPicGrid.png";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import SpaIcon from "@mui/icons-material/Spa";
import VerifiedIcon from "@mui/icons-material/Verified";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import { useRouter } from "next/navigation";

export default function AboutUs() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 });
  const router = useRouter();

  const features = [
    { icon: <SpaIcon sx={{ fontSize: 22 }} />, title: "Eco-Friendly", desc: "Green certified crackers", color: "#1a4d2e" },
    { icon: <VerifiedIcon sx={{ fontSize: 22 }} />, title: "ISO Certified", desc: "Quality assured products", color: "#b8963e" },
    { icon: <LocalShippingIcon sx={{ fontSize: 22 }} />, title: "Pan India", desc: "Fast & safe delivery", color: "#8b1a1a" },
  ];

  const stats = [
    { number: "500+", label: "Products" },
    { number: "10K+", label: "Happy Customers" },
    { number: "15+", label: "Years Experience" },
  ];

  return (
    <Box
      ref={ref}
      sx={{
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(160deg, #0d2e1a 0%, #1a4d2e 40%, #0f3820 100%)",
      }}
    >
      {/* Decorative elements */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.06, 0.1, 0.06] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute", top: -120, right: -120, width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, var(--secondary) 0%, transparent 70%)", pointerEvents: "none",
        }}
      />
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.04, 0.08, 0.04] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        style={{
          position: "absolute", bottom: -80, left: -80, width: 300, height: 300, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)", pointerEvents: "none",
        }}
      />

      {/* Dot pattern */}
      <Box
        sx={{
          position: "absolute", inset: 0, opacity: 0.03, pointerEvents: "none",
          backgroundImage: `radial-gradient(circle, #fff 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      <Stack
        direction={{ xs: "column", md: "row" }}
        sx={{
          maxWidth: 1300,
          mx: "auto",
          px: { xs: 3, md: 8 },
          py: { xs: 8, md: 10 },
          gap: { xs: 6, md: 8 },
          alignItems: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Left Content */}
        <Stack sx={{ flex: 1, gap: 3.5 }}>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4 }}
          >
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.8,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "50px",
                px: 2,
                py: 0.6,
                width: "fit-content",
              }}
            >
              <AutoAwesomeRoundedIcon sx={{ fontSize: 14, color: "var(--secondary-light)" }} />
              <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "var(--secondary-light)", letterSpacing: "0.5px" }}>
                About Us
              </Typography>
            </Box>
          </motion.div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Typography
              sx={{
                fontFamily: "var(--font-heading)",
                fontSize: { xs: "30px", md: "46px" },
                fontWeight: 700,
                color: "#fff",
                lineHeight: 1.1,
              }}
            >
              Crafting Moments of{" "}
              <Box component="span" sx={{ color: "var(--secondary-light)" }}>
                Pure Joy
              </Box>
            </Typography>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Stack gap={2}>
              <Typography sx={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.8, fontSize: { xs: "14px", md: "15px" } }}>
                Welcome to Maharishi Crackers — where tradition meets celebration!
                For years, we have been the trusted name in premium fireworks, serving
                families and event organizers with crackers that are vibrant, safe,
                and unforgettable.
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.8, fontSize: { xs: "14px", md: "15px" } }}>
                From intimate family gatherings to grand Diwali nights, Maharishi Crackers
                brings the magic of light, color, and thunder to every celebration.
              </Typography>
            </Stack>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Stack
              direction="row"
              gap={{ xs: 3, md: 5 }}
              sx={{
                py: 3,
                borderTop: "1px solid rgba(255,255,255,0.08)",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.4 + i * 0.1, type: "spring", stiffness: 200 }}
                >
                  <Stack>
                    <Typography
                      sx={{
                        fontFamily: "var(--font-heading)",
                        fontSize: { xs: "28px", md: "36px" },
                        fontWeight: 700,
                        color: "var(--secondary-light)",
                        lineHeight: 1,
                      }}
                    >
                      {stat.number}
                    </Typography>
                    <Typography sx={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", fontWeight: 500, mt: 0.5 }}>
                      {stat.label}
                    </Typography>
                  </Stack>
                </motion.div>
              ))}
            </Stack>
          </motion.div>

          {/* Feature cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.45 }}
          >
            <Stack direction="row" flexWrap="wrap" gap={1.5}>
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  whileHover={{ y: -3 }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "16px",
                      px: 2,
                      py: 1.5,
                      transition: "all 0.25s ease",
                      "&:hover": {
                        background: "rgba(255,255,255,0.08)",
                        borderColor: "rgba(255,255,255,0.15)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: "12px",
                        background: `rgba(255,255,255,0.08)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--secondary-light)",
                        flexShrink: 0,
                      }}
                    >
                      {f.icon}
                    </Box>
                    <Stack>
                      <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#fff" }}>
                        {f.title}
                      </Typography>
                      <Typography sx={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>{f.desc}</Typography>
                    </Stack>
                  </Box>
                </motion.div>
              ))}
            </Stack>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <motion.div whileHover={{ scale: 1.03, x: 4 }} whileTap={{ scale: 0.97 }}>
              <Button
                disableElevation
                variant="contained"
                endIcon={<ArrowForwardRoundedIcon />}
                onClick={() => router.push("/Shop")}
                sx={{
                  background: "var(--gold-gradient)",
                  color: "#fff",
                  textTransform: "none",
                  borderRadius: "50px",
                  fontWeight: 700,
                  fontSize: "14px",
                  px: 4,
                  py: 1.5,
                  boxShadow: "0 4px 20px rgba(184, 150, 62, 0.3)",
                  "&:hover": { background: "var(--gold-gradient)", opacity: 0.9 },
                }}
              >
                Explore Our Collection
              </Button>
            </motion.div>
          </motion.div>
        </Stack>

        {/* Right — Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.25 }}
          style={{ flex: "0 1 auto", maxWidth: 480, width: "100%", position: "relative" }}
        >
          {/* Glow */}
          <Box
            sx={{
              position: "absolute",
              inset: -30,
              borderRadius: "50%",
              background: "radial-gradient(ellipse at center, rgba(184, 150, 62, 0.08) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <Box
            sx={{
              position: "relative",
              borderRadius: "24px",
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
              transition: "transform 0.4s ease, box-shadow 0.4s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 28px 70px rgba(0,0,0,0.3)",
              },
            }}
          >
            <Image
              src={fourImagePic}
              alt="About Maharishi Crackers"
              style={{ width: "100%", height: "auto", display: "block" }}
            />
            {/* Subtle overlay */}
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(180deg, transparent 60%, rgba(13, 46, 26, 0.25) 100%)",
                pointerEvents: "none",
              }}
            />
          </Box>

          {/* Floating trust badge */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ delay: 0.7, type: "spring", stiffness: 150 }}
            style={{ position: "absolute", bottom: -18, left: 20, zIndex: 2 }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.2,
                background: "rgba(13, 46, 26, 0.92)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "16px",
                px: 2.5,
                py: 1.5,
                boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "10px",
                  background: "var(--gold-gradient)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <VerifiedIcon sx={{ color: "#fff", fontSize: 20 }} />
              </Box>
              <Stack>
                <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#fff" }}>
                  Trusted Brand
                </Typography>
                <Typography sx={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>
                  Since 2010
                </Typography>
              </Stack>
            </Box>
          </motion.div>
        </motion.div>
      </Stack>

      {/* Bottom curve transition */}
      <Box
        sx={{
          position: "absolute",
          bottom: -1,
          left: 0,
          right: 0,
          height: 40,
          background: "var(--background)",
          borderRadius: "40px 40px 0 0",
        }}
      />
    </Box>
  );
}
