"use client";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import Chip from "@mui/material/Chip";
import ProductCard from "@/src/app/Shop/Components/productCard";
import { useEffect, useState } from "react";
import { useProducts } from "@/src/app/context/ProductContext";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Image from "next/image";

import aerial from "@/public/Images/aerial.png";
import chakkar from "@/public/Images/chakkar.png";
import flower from "@/public/Images/flower.png";
import rocket from "@/public/Images/rocket.png";
import sound from "@/public/Images/sound.png";
import special from "@/public/Images/special.png";
import bomb from "@/public/Images/bomb.png";
import twinkle from "@/public/Images/twinkle.png";

const CATEGORY_CONFIG = [
  { key: "Flower Pots", label: "Flowerpots", icon: flower, categories: ["Flower Pots"] },
  { key: "Ground Chakkars", label: "Ground Chakkars", icon: chakkar, categories: ["Ground Chakkars"] },
  { key: "One Sound", label: "One Sound Crackers", icon: sound, categories: ["One Sound"] },
  { key: "Special's", label: "Special Collection", icon: special, categories: ["Special's"] },
  { key: "Rockets", label: "Rockets", icon: rocket, categories: ["Rockets"] },
  { key: "Repeating shots", label: "Aerials & Repeating Shots", icon: aerial, categories: ["Repeating shots"] },
  { key: "Atom bombs", label: "Atom Bombs & Bijili Crackers", icon: bomb, categories: ["Atom bombs", "Bijili crackers"] },
  { key: "Twinklers", label: "Twinklers & Pencils", icon: twinkle, categories: ["Twinkling stars", "Pencils"] },
];

// Staggered card animation
const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.06,
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

function CategorySection({ config, products, index }) {
  if (products.length === 0) return null;
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.05, rootMargin: "60px" });

  return (
    <div ref={ref}>
      <Stack gap={3} sx={{ mb: 6 }}>
        {/* Category Header with animated underline */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="row" alignItems="center" gap={1.5}>
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={inView ? { scale: 1, rotate: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1, type: "spring", stiffness: 200 }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "14px",
                    background: "linear-gradient(135deg, var(--category-color) 0%, #d8ecd0 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: "0 2px 8px rgba(26, 77, 46, 0.08)",
                  }}
                >
                  <Image src={config.icon} alt={config.label} width={26} height={26} style={{ objectFit: "contain" }} />
                </Box>
              </motion.div>
              <Stack>
                <Typography
                  sx={{
                    fontFamily: "var(--font-heading)",
                    fontSize: { xs: "20px", md: "24px" },
                    fontWeight: 700,
                    color: "var(--primary)",
                    lineHeight: 1.2,
                  }}
                >
                  {config.label}
                </Typography>
              </Stack>
            </Stack>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.25, duration: 0.3 }}
            >
              <Chip
                label={`${products.length} items`}
                size="small"
                sx={{
                  background: "var(--category-color)",
                  color: "var(--primary)",
                  fontWeight: 600,
                  fontSize: "12px",
                  height: 28,
                }}
              />
            </motion.div>
          </Stack>

          {/* Animated divider line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{
              height: 2,
              background: "linear-gradient(90deg, var(--primary) 0%, var(--border) 60%, transparent 100%)",
              marginTop: 12,
              borderRadius: 1,
              transformOrigin: "left",
            }}
          />
        </motion.div>

        {/* Products Grid — staggered card reveal */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, 1fr)",
              sm: "repeat(3, 1fr)",
              md: "repeat(4, 1fr)",
              lg: "repeat(5, 1fr)",
            },
            gap: { xs: 1.5, sm: 2, md: 2.5 },
          }}
        >
          {products.map((product, i) => (
            <motion.div
              key={`${product.id}-${i}`}
              custom={i}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              variants={cardVariants}
              style={{ width: "100%", height: "100%" }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </Box>
      </Stack>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <Stack gap={5} mt={2}>
      {[1, 2].map((section) => (
        <Stack key={section} gap={2.5}>
          <Stack direction="row" alignItems="center" gap={1.5}>
            <Skeleton variant="rounded" width={44} height={44} sx={{ borderRadius: "14px" }} animation="wave" />
            <Skeleton variant="rounded" width={180} height={28} sx={{ borderRadius: "8px" }} animation="wave" />
          </Stack>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)", md: "repeat(4, 1fr)", lg: "repeat(5, 1fr)" },
              gap: { xs: 1.5, sm: 2, md: 2.5 },
            }}
          >
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} variant="rounded" animation="wave" sx={{ width: "100%", height: { xs: 280, sm: 360 }, borderRadius: "20px" }} />
            ))}
          </Box>
        </Stack>
      ))}
    </Stack>
  );
}

export default function ProductTab({ category }) {
  const { productList, loading } = useProducts();
  const [filteredProductList, setFilteredProductList] = useState([]);

  useEffect(() => {
    if (!loading) {
      setFilteredProductList(
        category
          ? productList.filter((product) =>
              category === "Atom bombs"
                ? product.category === "Atom bombs" || product.category === "Bijili crackers"
                : category === "Twinklers"
                ? product.category === "Twinkling stars" || product.category === "Pencils"
                : product.category === category
            )
          : productList
      );
    }
  }, [category, productList, loading]);

  if (loading) return <LoadingSkeleton />;

  // Single category selected
  if (category) {
    const config = CATEGORY_CONFIG.find((c) => c.key === category);
    return (
      <Stack id="product" mt={2} width="100%">
        {config ? (
          <CategorySection config={config} products={filteredProductList} index={0} />
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)", md: "repeat(4, 1fr)", lg: "repeat(5, 1fr)" },
              gap: { xs: 1.5, sm: 2, md: 2.5 },
            }}
          >
            {filteredProductList.map((product, i) => (
              <ProductCard key={`${product.id}-${i}`} product={product} />
            ))}
          </Box>
        )}
      </Stack>
    );
  }

  // All products — grouped by category
  return (
    <Stack id="product" mt={2} width="100%">
      {/* Results summary */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
          <Stack direction="row" alignItems="baseline" gap={1}>
            <Typography
              sx={{
                fontFamily: "var(--font-heading)",
                fontSize: { xs: "22px", md: "28px" },
                fontWeight: 700,
                color: "var(--primary)",
              }}
            >
              All Products
            </Typography>
            <Typography sx={{ fontSize: 14, color: "#bbb", fontWeight: 500 }}>
              ({productList.length})
            </Typography>
          </Stack>
        </Stack>
      </motion.div>

      {CATEGORY_CONFIG.map((config, index) => {
        const products = productList.filter((p) => config.categories.includes(p.category));
        return <CategorySection key={config.key} config={config} products={products} index={index} />;
      })}
    </Stack>
  );
}
