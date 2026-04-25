"use client";
import Fab from "@mui/material/Fab";
import { GiFireworkRocket } from "react-icons/gi";

export default function FloatingTopButton() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <Fab
      aria-label="scroll to top"
      onClick={scrollToTop}
      sx={{
        backgroundColor: "var(--secondary)",
        color: "#fff",
        position: "fixed",
        bottom: 16,
        left: { xs: 18, md: 16 },
        zIndex: 1000,
        boxShadow: "0 0 8px var(--secondary), 0 0 16px var(--secondary)",
        animation: "mcFloat 2.5s ease-in-out infinite",
        "&:hover": { backgroundColor: "var(--secondary)", opacity: 0.9 },
        "@keyframes mcFloat": {
          "0%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
          "100%": { transform: "translateY(0)" },
        },
      }}
    >
      <GiFireworkRocket style={{ fontSize: "2rem" }} />
    </Fab>
  );
}
