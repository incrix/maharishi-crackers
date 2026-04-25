"use client";
import Stack from "@mui/material/Stack";
import Fab from "@mui/material/Fab";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Badge from "@mui/material/Badge";
import { styled } from "@mui/material/styles";

const StyledBadge = styled(Badge)(() => ({
  "& .MuiBadge-badge": {
    border: "2px solid var(--secondary)",
    background: "var(--secondary)",
    padding: "0 2px",
  },
}));

export default function PdfCartFloating() {
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const update = () => setCartCount(localStorage.getItem("cart") ? JSON.parse(localStorage.getItem("cart")).length : 0);
    update();
    const interval = setInterval(update, 500);
    return () => clearInterval(interval);
  }, []);

  const handlePdfDownload = async () => {
    const pdfUrl = "https://e-com.incrix.com/Radhey/RadheyThunders(2025%20Pricelist).pdf";
    const fileName = "MaharishiCrackers_2025_Pricelist.pdf";
    try {
      window.open(pdfUrl, "_blank");
      const response = await fetch(pdfUrl, { method: "GET", headers: { "Content-Type": "application/pdf" } });
      if (!response.ok) throw new Error("Failed to fetch the PDF");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading PDF:", error);
    }
  };

  const fabStyle = (glowColor, bgColor, delay = "0s") => ({
    boxShadow: `0 0 8px ${glowColor}, 0 0 16px ${glowColor}`,
    color: "white",
    position: "relative",
    overflow: "hidden",
    backgroundColor: bgColor,
    transition: "opacity 0.3s ease",
    animation: `mcFloat 2.5s ease-in-out infinite ${delay}`,
    "&:hover": { opacity: 0.9, backgroundColor: bgColor },
    "@keyframes mcFloat": {
      "0%": { transform: "translateY(0)" },
      "50%": { transform: "translateY(-8px)" },
      "100%": { transform: "translateY(0)" },
    },
  });

  return (
    <Stack spacing={2} sx={{ position: "fixed", bottom: 16, right: { xs: 18, md: 16 }, zIndex: 1000 }}>
      <Fab aria-label="pdf" onClick={handlePdfDownload} sx={fabStyle("#b8963e", "var(--secondary)", "0s")}>
        <PictureAsPdfIcon />
      </Fab>
      <Fab aria-label="cart" onClick={() => router.push("/Cart")} sx={fabStyle("#2d7a4a", "var(--primary)", "0.3s")}>
        <StyledBadge badgeContent={cartCount}>
          <ShoppingCartIcon />
        </StyledBadge>
      </Fab>
    </Stack>
  );
}
