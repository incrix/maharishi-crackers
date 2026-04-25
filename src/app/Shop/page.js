"use client";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import NavBar from "@/src/app/Components/HomePage/navBar";
import ProductTab from "@/src/app/Shop/Components/productTab";
import ShopByCategory from "@/src/app/Shop/Components/shopCategory";
import Footer from "@/src/app/Components/HomePage/footer";
import PdfCartFloating from "@/src/app/Components/FloatingIcons/pdfCartFloating";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import FloatingTopButton from "@/src/app/Components/FloatingIcons/floatingTopButton";
import { motion } from "framer-motion";
import { useProducts } from "@/src/app/context/ProductContext";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";

function ShopHero({ category }) {
  const { productList } = useProducts();
  return (
    <Box
      sx={{
        position: "relative",
        pt: { xs: "100px", md: "120px" },
        pb: { xs: 8, md: 6 },
        px: { xs: 3, md: 8 },
        background: "linear-gradient(160deg, #0d2e1a 0%, #1a4d2e 35%, #0f3820 70%, #1a4d2e 100%)",
        overflow: "hidden",
      }}
    >
      {/* Animated floating gold orb — top right */}
      <motion.div
        animate={{ y: [0, -18, 0], x: [0, 8, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", top: -60, right: -40, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(184, 150, 62, 0.14) 0%, transparent 70%)", pointerEvents: "none" }}
      />

      {/* Animated floating orb — bottom left */}
      <motion.div
        animate={{ y: [0, 14, 0], x: [0, -10, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        style={{ position: "absolute", bottom: -40, left: -50, width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle, rgba(184, 150, 62, 0.1) 0%, transparent 70%)", pointerEvents: "none" }}
      />

      {/* Animated floating sparkle */}
      <motion.div
        animate={{ y: [0, -10, 0], opacity: [0.15, 0.4, 0.15], rotate: [0, 15, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        style={{ position: "absolute", top: "30%", right: "15%", pointerEvents: "none" }}
      >
        <AutoAwesomeRoundedIcon sx={{ color: "var(--secondary-light)", fontSize: 22, opacity: 0.3 }} />
      </motion.div>

      {/* Another sparkle */}
      <motion.div
        animate={{ y: [0, 8, 0], opacity: [0.1, 0.3, 0.1], rotate: [0, -20, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        style={{ position: "absolute", top: "55%", right: "35%", pointerEvents: "none" }}
      >
        <AutoAwesomeRoundedIcon sx={{ color: "#fff", fontSize: 14, opacity: 0.2 }} />
      </motion.div>

      {/* Subtle dot pattern */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          opacity: 0.03,
          backgroundImage: `radial-gradient(circle at 25% 25%, #fff 1px, transparent 1px),
                            radial-gradient(circle at 75% 75%, #fff 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
          pointerEvents: "none",
        }}
      />

      {/* Animated gold line across the top */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: "linear-gradient(90deg, transparent 0%, var(--secondary-light) 50%, transparent 100%)",
          transformOrigin: "left",
          opacity: 0.4,
        }}
      />

      <Stack sx={{ maxWidth: "1400px", mx: "auto", position: "relative", zIndex: 1 }}>
        {/* Subtitle with fire icon */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Stack direction="row" alignItems="center" gap={1} mb={1}>
            <motion.div animate={{ rotate: [0, -8, 8, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}>
              <LocalFireDepartmentRoundedIcon sx={{ color: "var(--secondary-light)", fontSize: 20 }} />
            </motion.div>
            <Typography sx={{ color: "var(--secondary-light)", fontSize: 13, fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase" }}>
              {category ? "Filtered Collection" : "Our Complete Collection"}
            </Typography>
          </Stack>
        </motion.div>

        {/* Main heading with staggered word animation */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Typography
            sx={{
              fontFamily: "var(--font-heading)",
              fontSize: { xs: 32, md: 48 },
              fontWeight: 700,
              color: "#fff",
              lineHeight: 1.1,
              mb: 1,
            }}
          >
            {category
              ? category === "Atom bombs"
                ? "Atom Bombs & Bijili"
                : category === "Twinklers"
                ? "Twinklers & Pencils"
                : category === "Repeating shots"
                ? "Aerials & Repeating Shots"
                : category === "Ground Chakkars"
                ? "Ground Chakkars"
                : category === "Flower Pots"
                ? "Flowerpots"
                : category
              : "Shop Crackers"}
          </Typography>
        </motion.div>

        {/* Description with underline draw animation */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: { xs: 14, md: 16 }, maxWidth: 500, mb: 0.5 }}>
            Premium quality fireworks crafted with care for safe and unforgettable celebrations.
          </Typography>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{
              width: 60,
              height: 3,
              borderRadius: 2,
              background: "var(--gold-gradient)",
              transformOrigin: "left",
            }}
          />
        </motion.div>

        {/* Category chips */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.45 }}
        >
          <Box sx={{ mt: { xs: 3, md: 4 } }}>
            <ShopByCategory />
          </Box>
        </motion.div>
      </Stack>

      {/* Bottom curve */}
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

function ShopContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");

  return (
    <>
      <ShopHero category={category} />
      <Stack sx={{ px: { xs: 3, md: 8 }, mx: { xs: 0, md: "auto" }, maxWidth: "1400px", width: "100%", pt: 2 }}>
        <ProductTab category={category} />
      </Stack>
    </>
  );
}

export default function Shop() {
  return (
    <Stack position="relative" minHeight="100vh" sx={{ background: "var(--background)" }}>
      <NavBar />
      <Suspense fallback={<Stack sx={{ mt: 20, textAlign: "center" }}>Loading shop...</Stack>}>
        <ShopContent />
      </Suspense>
      <Stack mt={{ xs: 4, md: 6 }}>
        <Footer />
      </Stack>
      <PdfCartFloating />
      <FloatingTopButton />
    </Stack>
  );
}
