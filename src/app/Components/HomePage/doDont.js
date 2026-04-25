"use client";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import {
  Store,
  SupervisedUserCircle,
  CleaningServices,
  Opacity,
  Whatshot,
  MenuBook,
  Science,
  Group,
  LocalFireDepartment,
  Checkroom,
  Pets,
  WineBar,
} from "@mui/icons-material";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const dosList = [
  { icon: <Store sx={{ fontSize: 20 }} />, text: "Purchase fireworks from licensed merchants only." },
  { icon: <SupervisedUserCircle sx={{ fontSize: 20 }} />, text: "Ensure a responsible adult supervises at all times." },
  { icon: <CleaningServices sx={{ fontSize: 20 }} />, text: "Clear the area of dried leaves, wood, and flammable materials." },
  { icon: <Opacity sx={{ fontSize: 20 }} />, text: "Keep water (hose, bucket, or pump) readily accessible." },
  { icon: <Whatshot sx={{ fontSize: 20 }} />, text: "Light fireworks one at a time, away from your body." },
  { icon: <MenuBook sx={{ fontSize: 20 }} />, text: "Follow all warnings and instructions printed on the pack." },
];

const dontsList = [
  { icon: <Science sx={{ fontSize: 20 }} />, text: "Never use illegal or uncertified fireworks." },
  { icon: <Group sx={{ fontSize: 20 }} />, text: "Never allow children to handle fireworks unsupervised." },
  { icon: <LocalFireDepartment sx={{ fontSize: 20 }} />, text: "Never try to extinguish a lit firework with your hands." },
  { icon: <Checkroom sx={{ fontSize: 20 }} />, text: "Never carry fireworks in your pockets or clothing." },
  { icon: <Pets sx={{ fontSize: 20 }} />, text: "Never point fireworks toward people or animals." },
  { icon: <WineBar sx={{ fontSize: 20 }} />, text: "Never use metal or glass containers to launch fireworks." },
];

const itemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.4 + i * 0.07, duration: 0.35, ease: "easeOut" },
  }),
};

function SafetyItem({ item, index, type, inView }) {
  const isGreen = type === "do";

  return (
    <motion.div custom={index} initial="hidden" animate={inView ? "visible" : "hidden"} variants={itemVariants}>
      <Stack
        direction="row"
        alignItems="center"
        gap={2}
        sx={{
          px: { xs: 2, md: 3 },
          py: { xs: 1.5, md: 2 },
          position: "relative",
          transition: "all 0.2s ease",
          "&:hover": {
            background: isGreen ? "rgba(26, 77, 46, 0.03)" : "rgba(139, 26, 26, 0.03)",
            "& .item-indicator": {
              transform: "scale(1.15)",
            },
          },
        }}
      >
        {/* Numbered indicator */}
        <Box
          className="item-indicator"
          sx={{
            width: 36,
            height: 36,
            borderRadius: "12px",
            background: isGreen
              ? "linear-gradient(135deg, rgba(26, 77, 46, 0.08) 0%, rgba(26, 77, 46, 0.04) 100%)"
              : "linear-gradient(135deg, rgba(139, 26, 26, 0.08) 0%, rgba(139, 26, 26, 0.04) 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            color: isGreen ? "var(--primary)" : "var(--tertiary)",
            transition: "transform 0.2s ease",
          }}
        >
          {item.icon}
        </Box>

        <Typography sx={{ fontSize: { xs: "13px", md: "14.5px" }, color: "#555", lineHeight: 1.5, flex: 1 }}>
          {item.text}
        </Typography>

        {/* Status indicator */}
        <Box
          sx={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: isGreen ? "rgba(26, 77, 46, 0.1)" : "rgba(139, 26, 26, 0.1)",
            display: { xs: "none", sm: "flex" },
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {isGreen ? (
            <CheckRoundedIcon sx={{ fontSize: 14, color: "var(--primary)" }} />
          ) : (
            <CloseRoundedIcon sx={{ fontSize: 14, color: "var(--tertiary)" }} />
          )}
        </Box>
      </Stack>

      {/* Separator */}
      {index < 5 && (
        <Box
          sx={{
            mx: { xs: 2, md: 3 },
            height: "1px",
            background: isGreen
              ? "linear-gradient(90deg, rgba(26, 77, 46, 0.08) 0%, transparent 100%)"
              : "linear-gradient(90deg, rgba(139, 26, 26, 0.08) 0%, transparent 100%)",
          }}
        />
      )}
    </motion.div>
  );
}

export default function DoDont() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <Box
      ref={ref}
      sx={{
        px: { xs: 3, md: 8 },
        py: { xs: 8, md: 10 },
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(180deg, var(--background) 0%, #f5f3ee 100%)",
      }}
    >
      {/* Decorative shield watermark */}
      <motion.div
        animate={{ rotate: [0, 3, 0], opacity: [0.02, 0.04, 0.02] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }}
      >
        <ShieldRoundedIcon sx={{ fontSize: 300, color: "var(--primary)" }} />
      </motion.div>

      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <Stack alignItems="center" mb={{ xs: 5, md: 7 }}>
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={inView ? { scale: 1, rotate: 0 } : {}}
            transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: "18px",
                background: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2.5,
                boxShadow: "0 4px 20px rgba(26, 77, 46, 0.2)",
              }}
            >
              <ShieldRoundedIcon sx={{ color: "#fff", fontSize: 28 }} />
            </Box>
          </motion.div>

          <Typography
            sx={{
              fontFamily: "var(--font-heading)",
              fontSize: { xs: "26px", md: "40px" },
              fontWeight: 700,
              color: "var(--primary)",
              textAlign: "center",
              lineHeight: 1.15,
            }}
          >
            Safety{" "}
            <Box component="span" sx={{ color: "var(--secondary)" }}>
              First
            </Box>
          </Typography>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ delay: 0.4, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{ width: 50, height: 3, borderRadius: 2, background: "var(--gold-gradient)", transformOrigin: "center", marginTop: 14 }}
          />

          <Typography sx={{ color: "#999", textAlign: "center", maxWidth: 440, mt: 2, fontSize: { xs: "13px", md: "15px" } }}>
            Celebrate responsibly. Follow these guidelines for a safe and memorable experience.
          </Typography>
        </Stack>
      </motion.div>

      {/* Cards */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        gap={{ xs: 3, md: 4 }}
        sx={{ maxWidth: 1100, mx: "auto", position: "relative", zIndex: 1 }}
      >
        {/* Do's */}
        <motion.div
          style={{ flex: 1 }}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <Box
            sx={{
              background: "#fff",
              borderRadius: "24px",
              overflow: "hidden",
              height: "100%",
              boxShadow: "0 2px 16px rgba(26, 77, 46, 0.06)",
              border: "1px solid rgba(26, 77, 46, 0.08)",
              transition: "box-shadow 0.3s ease",
              "&:hover": {
                boxShadow: "0 8px 32px rgba(26, 77, 46, 0.1)",
              },
            }}
          >
            {/* Header */}
            <Stack
              direction="row"
              alignItems="center"
              gap={1.5}
              sx={{
                px: { xs: 2, md: 3 },
                py: 2,
                background: "linear-gradient(135deg, rgba(26, 77, 46, 0.04) 0%, rgba(26, 77, 46, 0.02) 100%)",
                borderBottom: "1px solid rgba(26, 77, 46, 0.06)",
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "10px",
                  background: "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CheckRoundedIcon sx={{ color: "#fff", fontSize: 18 }} />
              </Box>
              <Typography
                sx={{
                  fontFamily: "var(--font-heading)",
                  fontSize: { xs: "20px", md: "22px" },
                  fontWeight: 700,
                  color: "var(--primary)",
                }}
              >
                Do&apos;s
              </Typography>
              <Box
                sx={{
                  ml: "auto",
                  background: "rgba(26, 77, 46, 0.08)",
                  borderRadius: "50px",
                  px: 1.5,
                  py: 0.3,
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--primary)",
                }}
              >
                {dosList.length} tips
              </Box>
            </Stack>

            {/* Items */}
            <Stack>
              {dosList.map((item, i) => (
                <SafetyItem key={i} item={item} index={i} type="do" inView={inView} />
              ))}
            </Stack>
          </Box>
        </motion.div>

        {/* Don'ts */}
        <motion.div
          style={{ flex: 1 }}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <Box
            sx={{
              background: "#fff",
              borderRadius: "24px",
              overflow: "hidden",
              height: "100%",
              boxShadow: "0 2px 16px rgba(139, 26, 26, 0.05)",
              border: "1px solid rgba(139, 26, 26, 0.08)",
              transition: "box-shadow 0.3s ease",
              "&:hover": {
                boxShadow: "0 8px 32px rgba(139, 26, 26, 0.08)",
              },
            }}
          >
            {/* Header */}
            <Stack
              direction="row"
              alignItems="center"
              gap={1.5}
              sx={{
                px: { xs: 2, md: 3 },
                py: 2,
                background: "linear-gradient(135deg, rgba(139, 26, 26, 0.04) 0%, rgba(139, 26, 26, 0.02) 100%)",
                borderBottom: "1px solid rgba(139, 26, 26, 0.06)",
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "10px",
                  background: "var(--tertiary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CloseRoundedIcon sx={{ color: "#fff", fontSize: 18 }} />
              </Box>
              <Typography
                sx={{
                  fontFamily: "var(--font-heading)",
                  fontSize: { xs: "20px", md: "22px" },
                  fontWeight: 700,
                  color: "var(--tertiary)",
                }}
              >
                Don&apos;ts
              </Typography>
              <Box
                sx={{
                  ml: "auto",
                  background: "rgba(139, 26, 26, 0.08)",
                  borderRadius: "50px",
                  px: 1.5,
                  py: 0.3,
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--tertiary)",
                }}
              >
                {dontsList.length} warnings
              </Box>
            </Stack>

            {/* Items */}
            <Stack>
              {dontsList.map((item, i) => (
                <SafetyItem key={i} item={item} index={i} type="dont" inView={inView} />
              ))}
            </Stack>
          </Box>
        </motion.div>
      </Stack>
    </Box>
  );
}
