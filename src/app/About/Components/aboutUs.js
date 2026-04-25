"use client";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Image from "next/image";
import fourImagePic from "@/public/Images/fourPicGrid.png";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import FormatQuoteRoundedIcon from "@mui/icons-material/FormatQuoteRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";

const values = [
  {
    icon: <FavoriteRoundedIcon sx={{ fontSize: 22 }} />,
    title: "Safety First",
    desc: "Every product is tested and certified — your family's safety is our top priority.",
  },
  {
    icon: <EmojiEventsRoundedIcon sx={{ fontSize: 22 }} />,
    title: "Premium Quality",
    desc: "We source only from the finest manufacturers to deliver vibrant, long-lasting fireworks.",
  },
  {
    icon: <GroupsRoundedIcon sx={{ fontSize: 22 }} />,
    title: "Customer Care",
    desc: "From selection to delivery, our team is with you at every step of the celebration.",
  },
];

export default function AboutUs() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <Stack ref={ref} sx={{ px: { xs: 3, md: 8 }, py: { xs: 8, md: 10 }, gap: { xs: 5, md: 6 } }}>

      {/* Row layout — image left, content right */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        sx={{ gap: { xs: 4, md: 6 }, alignItems: { md: "center" } }}
      >
        {/* Left — Image */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ flex: 1 }}
        >
          <Box
            sx={{
              borderRadius: "24px",
              overflow: "hidden",
              boxShadow: "0 12px 40px rgba(26, 77, 46, 0.1)",
              border: "1px solid var(--border)",
              maxWidth: { xs: "100%", md: 520 },
            }}
          >
            <Image
              src={fourImagePic}
              alt="About Maharishi Crackers"
              style={{ width: "100%", height: "auto", display: "block" }}
              placeholder="blur"
            />
          </Box>
        </motion.div>

        {/* Right — Content */}
        <Stack sx={{ flex: 1, gap: 3 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Typography
              sx={{
                fontFamily: "var(--font-heading)",
                fontSize: { xs: "28px", md: "40px" },
                fontWeight: 700,
                color: "var(--primary)",
                lineHeight: 1.15,
              }}
            >
              Where Tradition Meets{" "}
              <Box component="span" sx={{ color: "var(--secondary)" }}>
                Celebration
              </Box>
            </Typography>
          </motion.div>

          {/* Quote */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.25, duration: 0.5 }}
          >
            <Stack
              sx={{
                position: "relative",
                pl: { xs: 3, md: 4 },
                borderLeft: "3px solid var(--secondary)",
              }}
            >
              <FormatQuoteRoundedIcon
                sx={{
                  position: "absolute",
                  top: -6,
                  left: { xs: -8, md: -12 },
                  fontSize: 28,
                  color: "var(--secondary)",
                  opacity: 0.3,
                }}
              />
              <Typography
                sx={{
                  fontFamily: "var(--font-heading)",
                  fontSize: { xs: "16px", md: "20px" },
                  fontWeight: 600,
                  color: "var(--primary)",
                  lineHeight: 1.5,
                  fontStyle: "italic",
                }}
              >
                For years, we have been the trusted name in premium fireworks — serving families
                and event organizers with crackers that are vibrant, safe, and unforgettable.
              </Typography>
            </Stack>
          </motion.div>

          {/* Body */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.35, duration: 0.5 }}
          >
            <Stack gap={2}>
              <Typography sx={{ color: "#666", lineHeight: 1.8, fontSize: { xs: "14px", md: "15px" } }}>
                Welcome to Maharishi Crackers — where tradition meets celebration!
                From intimate family gatherings to grand Diwali nights, we bring the magic
                of light, color, and thunder to every occasion.
              </Typography>
              <Typography sx={{ color: "#666", lineHeight: 1.8, fontSize: { xs: "14px", md: "15px" } }}>
                Our promise is simple: quality you can trust, joy you can feel. Every product
                in our collection is handpicked from certified manufacturers and tested for
                safety, ensuring your celebrations are both spectacular and secure.
              </Typography>
            </Stack>
          </motion.div>
        </Stack>
      </Stack>

      {/* Value cards — full width row below */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" },
          gap: 2.5,
        }}
      >
        {values.map((v, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 25 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.45 + i * 0.1, duration: 0.4 }}
          >
            <Box
              sx={{
                p: { xs: 2.5, md: 3 },
                borderRadius: "20px",
                border: "1px solid var(--border)",
                background: "#fff",
                height: "100%",
                transition: "all 0.25s ease",
                "&:hover": {
                  borderColor: "rgba(26, 77, 46, 0.15)",
                  boxShadow: "0 8px 28px rgba(26, 77, 46, 0.08)",
                  transform: "translateY(-3px)",
                },
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "14px",
                  background: "var(--category-color)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--primary)",
                  mb: 2,
                }}
              >
                {v.icon}
              </Box>
              <Typography
                sx={{
                  fontFamily: "var(--font-heading)",
                  fontSize: { xs: "16px", md: "18px" },
                  fontWeight: 700,
                  color: "var(--primary)",
                  mb: 0.8,
                }}
              >
                {v.title}
              </Typography>
              <Typography sx={{ fontSize: { xs: "13px", md: "14px" }, color: "#888", lineHeight: 1.6 }}>
                {v.desc}
              </Typography>
            </Box>
          </motion.div>
        ))}
      </Box>
    </Stack>
  );
}
