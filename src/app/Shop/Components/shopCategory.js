"use client";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import aerial from "@/public/Images/aerial.png";
import chakkar from "@/public/Images/chakkar.png";
import flower from "@/public/Images/flower.png";
import rocket from "@/public/Images/rocket.png";
import sound from "@/public/Images/sound.png";
import special from "@/public/Images/special.png";
import bomb from "@/public/Images/bomb.png";
import all from "@/public/Images/all.png";
import twinkle from "@/public/Images/twinkle.png";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { useProducts } from "@/src/app/context/ProductContext";

const catList = [
  { id: 0, title: "All", imgURL: all.src },
  { id: 1, title: "Flowerpots", imgURL: flower.src, url: "Flower%20Pots", query: "Flower Pots" },
  { id: 2, title: "Chakkars", imgURL: chakkar.src, url: "Ground%20Chakkars", query: "Ground Chakkars" },
  { id: 3, title: "One Sound", imgURL: sound.src, url: "One%20Sound", query: "One Sound" },
  { id: 4, title: "Special's", imgURL: special.src, url: "Special%27s", query: "Special's" },
  { id: 5, title: "Rockets", imgURL: rocket.src, url: "Rockets", query: "Rockets" },
  { id: 6, title: "Aerials", imgURL: aerial.src, url: "Repeating%20shots", query: "Repeating shots" },
  { id: 7, title: "Bombs", imgURL: bomb.src, url: "Atom%20bombs", query: "Atom bombs" },
  { id: 8, title: "Twinklers", imgURL: twinkle.src, url: "Twinklers", query: "Twinklers" },
];

const CatChip = ({ title, imgURL, url, isSelected, index, count }) => {
  const router = useRouter();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03 }}
      whileTap={{ scale: 0.96 }}
    >
      <Box
        onClick={() => {
          !url ? router.push("/Shop#product") : router.push("/Shop?category=" + url + "#product");
        }}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          cursor: "pointer",
          px: { xs: 1.5, sm: 2 },
          py: { xs: 0.8, sm: 1 },
          borderRadius: "50px",
          whiteSpace: "nowrap",
          background: isSelected
            ? "var(--gold-gradient)"
            : "rgba(255,255,255,0.1)",
          border: isSelected
            ? "1.5px solid rgba(184, 150, 62, 0.5)"
            : "1.5px solid rgba(255,255,255,0.12)",
          backdropFilter: "blur(8px)",
          boxShadow: isSelected
            ? "0 4px 20px rgba(184, 150, 62, 0.3)"
            : "none",
          transition: "all 0.25s ease",
          "&:hover": {
            background: isSelected
              ? "var(--gold-gradient)"
              : "rgba(255,255,255,0.2)",
            borderColor: isSelected ? "rgba(184, 150, 62, 0.5)" : "rgba(255,255,255,0.3)",
            boxShadow: isSelected
              ? "0 4px 20px rgba(184, 150, 62, 0.3)"
              : "0 2px 12px rgba(255,255,255,0.08)",
          },
        }}
      >
        <Box
          sx={{
            width: { xs: 24, sm: 28 },
            height: { xs: 24, sm: 28 },
            borderRadius: "50%",
            background: isSelected ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Image src={imgURL} alt={title} width={18} height={18} style={{ objectFit: "contain" }} />
        </Box>
        <Typography
          sx={{
            fontSize: { xs: "12px", sm: "13px" },
            fontWeight: isSelected ? 700 : 500,
            color: isSelected ? "#fff" : "rgba(255,255,255,0.75)",
          }}
        >
          {title}
        </Typography>
        {count !== undefined && (
          <Box
            sx={{
              background: isSelected ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.08)",
              borderRadius: "50px",
              px: 0.8,
              py: 0.1,
              fontSize: "10px",
              fontWeight: 700,
              color: isSelected ? "#fff" : "rgba(255,255,255,0.5)",
              minWidth: 20,
              textAlign: "center",
            }}
          >
            {count}
          </Box>
        )}
      </Box>
    </motion.div>
  );
};

export default function ShopByCategory() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const { productList, loading } = useProducts();
  useEffect(() => {}, [category]);

  const getCategoryCount = (query) => {
    if (!query) return productList.length;
    if (query === "Atom bombs") return productList.filter((p) => p.category === "Atom bombs" || p.category === "Bijili crackers").length;
    if (query === "Twinklers") return productList.filter((p) => p.category === "Twinkling stars" || p.category === "Pencils").length;
    return productList.filter((p) => p.category === query).length;
  };

  return (
    <Stack
      direction="row"
      gap={{ xs: 0.8, sm: 1 }}
      sx={{
        overflowX: "auto",
        pb: 0.5,
        scrollbarWidth: "none",
        "&::-webkit-scrollbar": { display: "none" },
      }}
    >
      {catList.map((cat, index) => (
        <CatChip
          key={cat.id}
          title={cat.title}
          imgURL={cat.imgURL}
          url={cat.url}
          isSelected={cat.query ? category === cat.query : !category}
          index={index}
          count={!loading ? getCategoryCount(cat.query) : undefined}
        />
      ))}
    </Stack>
  );
}
