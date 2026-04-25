"use client";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import aerial from "@/public/Images/aerial.png";
import chakkar from "@/public/Images/chakkar.png";
import flower from "@/public/Images/flower.png";
import rocket from "@/public/Images/rocket.png";
import sound from "@/public/Images/sound.png";
import special from "@/public/Images/special.png";
import bomb from "@/public/Images/bomb.png";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useProducts } from "@/src/app/context/ProductContext";

const CatButton = ({ title, img, count, link }) => {
  const router = useRouter();
  return (
    <Stack
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{
        border: "1px solid var(--border)",
        borderRadius: "12px",
        height: "50px",
        padding: "0 16px",
        color: "#fff",
        background: "var(--primary)",
        cursor: "pointer",
        transition: "all 0.2s",
        "&:hover": { opacity: 0.9, transform: "translateX(4px)" },
      }}
      onClick={() => router.push(`/Shop?category=${link}`)}
    >
      <Image src={img} alt={title} width={28} height={28} style={{ objectFit: "contain" }} />
      <Typography sx={{ fontSize: "13px", fontWeight: 600 }}>{title}</Typography>
      <Stack sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: "28px", height: "28px", borderRadius: "50%", background: "var(--secondary)", color: "#fff", fontSize: "12px", fontWeight: 700 }}>
        {count}
      </Stack>
    </Stack>
  );
};

export default function HeroCategory() {
  const { productList = [], loading } = useProducts();
  if (loading) return <Typography sx={{ color: "var(--primary)" }}>Loading categories...</Typography>;
  return (
    <Paper elevation={0} sx={{ p: 3, width: "100%", minWidth: "280px", maxWidth: "600px", border: "2px solid var(--border)", borderRadius: "16px", position: "sticky", top: "90px" }}>
      <Stack>
        <Typography sx={{ fontFamily: "var(--font-heading)", pb: 1.5, fontSize: "22px", fontWeight: 700, color: "var(--primary)" }}>Category</Typography>
        <hr style={{ width: "100%", height: "2px", backgroundColor: "var(--border)", border: "none", marginBottom: "16px" }} />
        <Stack gap={2}>
          <CatButton title="Flower Pots" count={productList.filter((p) => p.category === "Flower Pots").length} img={flower} link="Flower Pots" />
          <CatButton title="Ground Chakkars" count={productList.filter((p) => p.category === "Ground Chakkars").length} img={chakkar} link="Ground Chakkars" />
          <CatButton title="One Sound" count={productList.filter((p) => p.category === "One Sound").length} img={sound} link="One Sound" />
          <CatButton title="Special's" count={productList.filter((p) => p.category == "Special's").length} img={special} link="Special%27s" />
          <CatButton title="Rockets" count={productList.filter((p) => p.category == "Rockets").length} img={rocket} link="Rockets" />
          <CatButton title="Aerials" count={productList.filter((p) => p.category == "Repeating shots").length} img={aerial} link="Repeating shots" />
          <CatButton title="Bombs" count={productList.filter((p) => p.category == "Atom bombs").length + productList.filter((p) => p.category == "Bijili crackers").length} img={bomb} link="Atom bombs" />
          <CatButton title="Twinklers" count={productList.filter((p) => p.category == "Twinkling stars").length + productList.filter((p) => p.category == "Pencils").length} img={aerial} link="Twinklers" />
        </Stack>
      </Stack>
    </Paper>
  );
}
