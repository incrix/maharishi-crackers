"use client";
import { useState, useEffect } from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

// Mini showcase card — compact, visual-only, no cart actions
function ShowcaseCard({ product, index, inView, offsetY, rotate, delay, size = "md" }) {
  const router = useRouter();
  const discountedPrice = Math.round(product.price - (product.discount / 100) * product.price);

  const sizes = {
    sm: { w: { xs: 130, md: 160 }, imgH: { xs: 110, md: 130 } },
    md: { w: { xs: 150, md: 200 }, imgH: { xs: 130, md: 170 } },
    lg: { w: { xs: 170, md: 230 }, imgH: { xs: 150, md: 200 } },
  };

  const s = sizes[size];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotate: rotate * 0.5, scale: 0.85 }}
      animate={inView ? { opacity: 1, y: offsetY, rotate, scale: 1 } : {}}
      transition={{ delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: offsetY - 12, rotate: 0, scale: 1.05, zIndex: 10 }}
      style={{ flexShrink: 0, cursor: "pointer", zIndex: size === "lg" ? 3 : size === "md" ? 2 : 1 }}
      onClick={() => router.push(`/Shop/product?id=${product.id}`)}
    >
      <Box
        sx={{
          width: s.w,
          borderRadius: "20px",
          background: "#fff",
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(26, 77, 46, 0.1), 0 2px 8px rgba(0,0,0,0.04)",
          border: "1px solid rgba(0,0,0,0.04)",
          transition: "box-shadow 0.3s ease",
          "&:hover": {
            boxShadow: "0 20px 50px rgba(26, 77, 46, 0.18), 0 4px 12px rgba(0,0,0,0.06)",
          },
        }}
      >
        {/* Image */}
        <Box
          sx={{
            height: s.imgH,
            position: "relative",
            background: "linear-gradient(145deg, #f9f7f2 0%, #f0ece2 100%)",
            overflow: "hidden",
          }}
        >
          <Image
            src={`https://e-com.incrix.com/Sankamithra%20Products/${product.image[0]}`}
            alt={product.name}
            fill
            style={{ objectFit: "contain", padding: "10px" }}
            sizes="230px"
          />
          {product.discount > 0 && (
            <Box
              sx={{
                position: "absolute",
                top: 8,
                left: 0,
                background: "var(--tertiary)",
                color: "#fff",
                fontSize: "9px",
                fontWeight: 800,
                px: 1,
                py: 0.3,
                borderRadius: "0 6px 6px 0",
              }}
            >
              {product.discount}% OFF
            </Box>
          )}
        </Box>

        {/* Info */}
        <Stack sx={{ p: 1.5, gap: 0.3 }}>
          <Typography
            sx={{
              fontSize: { xs: "12px", md: "13px" },
              fontWeight: 600,
              color: "var(--foreground)",
              lineHeight: 1.3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {product.name}
          </Typography>
          <Stack direction="row" alignItems="center" gap={0.5}>
            <Typography sx={{ fontWeight: 800, color: "var(--primary)", fontSize: { xs: "15px", md: "17px" } }}>
              ₹{discountedPrice}
            </Typography>
            {product.discount > 0 && (
              <Typography sx={{ color: "#ccc", fontSize: "11px", textDecoration: "line-through" }}>
                ₹{product.price}
              </Typography>
            )}
          </Stack>
        </Stack>
      </Box>
    </motion.div>
  );
}

// Arc layout positions — each card gets an offsetY and rotation to create a wave/arc
const arcPositions = [
  { offsetY: 30, rotate: -3, size: "sm", delay: 0.1 },
  { offsetY: -5, rotate: -1.5, size: "md", delay: 0.15 },
  { offsetY: -30, rotate: 0, size: "lg", delay: 0.2 },
  { offsetY: -45, rotate: 0.5, size: "lg", delay: 0.25 },
  { offsetY: -30, rotate: 1, size: "lg", delay: 0.3 },
  { offsetY: -5, rotate: 1.5, size: "md", delay: 0.35 },
  { offsetY: 30, rotate: 3, size: "sm", delay: 0.4 },
];

const mobileArcPositions = [
  { offsetY: 15, rotate: -2, size: "sm", delay: 0.1 },
  { offsetY: -10, rotate: -0.5, size: "md", delay: 0.15 },
  { offsetY: -25, rotate: 0, size: "lg", delay: 0.2 },
  { offsetY: -10, rotate: 0.5, size: "md", delay: 0.25 },
  { offsetY: 15, rotate: 2, size: "sm", delay: 0.3 },
];

export default function OurProducts() {
  const [productList, setProductList] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.08 });

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetch("https://e-com.incrix.com/Sankamithra%20Products/productData.json")
      .then((response) => response.json())
      .then((data) => {
        data.sort((a, b) => a.sort_id - b.sort_id);
        const grouped = data.reduce((acc, product) => {
          if (!acc[product.category]) acc[product.category] = [];
          acc[product.category].push(product);
          return acc;
        }, {});
        let selectedProducts = [];
        Object.keys(grouped).forEach((category) => {
          selectedProducts.push(...grouped[category].slice(0, 1));
        });
        setProductList(selectedProducts.slice(0, 7));
      });
  }, []);

  const positions = isMobile ? mobileArcPositions : arcPositions;
  const displayProducts = productList.slice(0, positions.length);

  return (
    <Stack
      ref={ref}
      sx={{
        py: { xs: 8, md: 10 },
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(180deg, var(--background) 0%, #f0ede4 50%, var(--background) 100%)",
      }}
    >
      {/* Decorative blobs */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.04, 0.08, 0.04] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: -100,
          right: -100,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.03, 0.06, 0.03] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        style={{
          position: "absolute",
          bottom: -80,
          left: -80,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "radial-gradient(circle, var(--secondary) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <Stack alignItems="center" mb={{ xs: 5, md: 7 }} px={3}>
          <motion.div
            initial={{ scale: 0 }}
            animate={inView ? { scale: 1 } : {}}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <Box
              sx={{
                background: "var(--primary)",
                color: "#fff",
                px: 3,
                py: 0.8,
                borderRadius: "20px",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                mb: 2.5,
                display: "flex",
                alignItems: "center",
                gap: 0.8,
              }}
            >
              <AutoAwesomeRoundedIcon sx={{ fontSize: 14 }} />
              Our Collection
            </Box>
          </motion.div>
          <Typography
            sx={{
              fontFamily: "var(--font-heading)",
              fontSize: { xs: "26px", md: "42px" },
              fontWeight: 700,
              color: "var(--primary)",
              textAlign: "center",
              lineHeight: 1.15,
            }}
          >
            Premium Crackers for Every
            <Box component="span" sx={{ color: "var(--secondary)", display: "block" }}>
              Festive Occasion
            </Box>
          </Typography>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{ width: 60, height: 3, borderRadius: 2, background: "var(--gold-gradient)", transformOrigin: "center", marginTop: 16 }}
          />
          <Typography
            sx={{
              color: "#999",
              fontSize: { xs: "14px", md: "16px" },
              textAlign: "center",
              maxWidth: 460,
              mt: 2,
            }}
          >
            Handpicked selection of vibrant, safe fireworks designed for every festive mood.
          </Typography>
        </Stack>
      </motion.div>

      {/* Arc Showcase — cards in a curved wave */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: { xs: 1.5, md: 2.5 },
          px: { xs: 2, md: 6 },
          py: { xs: 2, md: 4 },
          overflowX: { xs: "auto", md: "visible" },
          overflowY: "visible",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
          minHeight: { xs: 280, md: 380 },
        }}
      >
        {displayProducts.map((product, index) => {
          const pos = positions[index] || positions[positions.length - 1];
          return (
            <ShowcaseCard
              key={product.id}
              product={product}
              index={index}
              inView={inView}
              offsetY={pos.offsetY}
              rotate={pos.rotate}
              delay={pos.delay}
              size={pos.size}
            />
          );
        })}
      </Box>

      {/* View All Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.6, duration: 0.4 }}
      >
        <Stack alignItems="center" mt={{ xs: 4, md: 5 }}>
          <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
            <Button
              endIcon={<ArrowForwardIcon />}
              onClick={() => router.push("/Shop")}
              sx={{
                background: "var(--primary)",
                color: "white",
                textTransform: "none",
                borderRadius: "50px",
                fontSize: "15px",
                fontWeight: 600,
                px: 5,
                py: 1.5,
                boxShadow: "0 4px 20px rgba(26, 77, 46, 0.25)",
                "&:hover": { background: "var(--primary)", opacity: 0.9 },
              }}
            >
              View Entire Collection
            </Button>
          </motion.div>
        </Stack>
      </motion.div>
    </Stack>
  );
}
