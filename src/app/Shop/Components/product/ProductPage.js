"use client";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Box from "@mui/material/Box";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import HeroCategory from "@/src/app/Shop/Components/heroCategory";
import ProductCard from "@/src/app/Shop/Components/productCard";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import NavBar from "@/src/app/Components/HomePage/navBar";
import Footer from "@/src/app/Components/HomePage/footer";
import Image from "next/image";
import { useProducts } from "@/src/app/context/ProductContext";
import PdfCartFloating from "@/src/app/Components/FloatingIcons/pdfCartFloating";
import { motion } from "framer-motion";

export default function ProductPage() {
  const searchParams = useSearchParams();
  const search = searchParams.get("id");
  const router = useRouter();
  const { productList, loading } = useProducts();
  const [product, setProduct] = useState(null);
  const [itemCount, setItemCount] = useState(1);

  useEffect(() => {
    if (!loading && productList.length > 0) {
      const found = productList.find((p) => p.id == search);
      setProduct(found || null);
    }
  }, [search, productList, loading]);

  if (loading) {
    return (
      <Stack sx={{ mt: 20, textAlign: "center" }}>
        <Typography variant="h6" sx={{ color: "var(--primary)" }}>Loading product...</Typography>
      </Stack>
    );
  }

  return (
    <Stack sx={{ background: "var(--background)" }}>
      <NavBar />
      <Stack sx={{ px: { xs: 2, md: 6 }, mx: { xs: 1, md: 3 }, mt: { xs: 12, md: 12 } }}>
        <Stack sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
          <Stack width="100%" maxWidth="var(--max-width)" padding={{ xs: "20px", md: "40px", xl: "40px 0" }}>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <Button
                size="small"
                sx={{ width: "fit-content", color: "var(--primary)", fontWeight: 600, mb: "20px", textTransform: "none", "&:hover": { background: "var(--category-color)" } }}
                onClick={() => router.push("/Shop")}
                startIcon={<ArrowBackIosNewRoundedIcon />}
              >
                Back to Shop
              </Button>
            </motion.div>

            {product && (
              <Stack direction={{ sm: "column", md: "row" }} gap={{ sm: 3, md: 8 }} justifyContent="space-between">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: "100%", maxWidth: 700 }}>
                  <Box sx={{ borderRadius: "16px", overflow: "hidden", border: "2px solid var(--border)" }}>
                    <Carousel
                      showArrows={true}
                      useKeyboardArrows={true}
                      interval={5000}
                      dynamicHeight={true}
                      stopOnHover={true}
                      infiniteLoop={true}
                      transitionTime={500}
                      showThumbs={true}
                      showIndicators={true}
                      emulateTouch={true}
                      autoPlay={true}
                      renderThumbs={(children) =>
                        children.map((item) => (
                          <Image key={item} src={item.props.children.props.src} alt="thumb" width={80} height={80} />
                        ))
                      }
                    >
                      {product.image.map((image, index) => (
                        <div key={index} style={{ width: "100%" }}>
                          <Image
                            src={`https://e-com.incrix.com/Sankamithra%20Products/${image}`}
                            alt={product.name}
                            width={800}
                            height={600}
                            style={{ width: "100%", height: "auto" }}
                          />
                        </div>
                      ))}
                    </Carousel>
                  </Box>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={{ width: "100%" }}>
                  <Stack gap={2.5}>
                    <Box sx={{ background: "var(--category-color)", color: "var(--primary)", fontSize: "12px", fontWeight: 700, borderRadius: "8px", px: 1.5, py: 0.5, width: "fit-content" }}>
                      Sale Off
                    </Box>
                    <Typography sx={{ fontFamily: "var(--font-heading)", fontSize: { xs: "24px", md: "32px" }, fontWeight: 700, color: "var(--primary)" }}>
                      {product.name}
                    </Typography>
                    <Stack direction="row" gap={2} alignItems="center">
                      <Typography sx={{ fontSize: 38, color: "var(--primary)", fontWeight: 700 }}>
                        ₹{Math.ceil(product.price - product.price * (product.discount / 100))}
                      </Typography>
                      <Typography sx={{ fontSize: 18, color: "#aaa" }}>
                        <s>₹{product.price}</s>
                      </Typography>
                      <Box sx={{ background: "var(--gold-gradient)", color: "#fff", px: 1.5, py: 0.3, borderRadius: "8px", fontSize: "14px", fontWeight: 600 }}>
                        {product.discount}% off
                      </Box>
                    </Stack>
                    <Typography sx={{ fontSize: 15, color: "#666", lineHeight: 1.7 }}>
                      {product.shortDescription}
                    </Typography>

                    <Stack direction="row" gap={2} alignItems="center">
                      <ButtonGroup>
                        <Button
                          variant="contained"
                          sx={{ fontWeight: 700, fontSize: "18px", background: "var(--secondary)", "&:hover": { background: "var(--secondary)", opacity: 0.9 } }}
                          onClick={() => { itemCount > 1 && setItemCount(itemCount - 1); }}
                        >-</Button>
                        <Typography sx={{ color: "var(--secondary)", width: 50, textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center", fontWeight: 700, fontSize: "18px" }}>
                          {itemCount}
                        </Typography>
                        <Button
                          variant="contained"
                          sx={{ fontWeight: 700, fontSize: "18px", background: "var(--secondary)", "&:hover": { background: "var(--secondary)", opacity: 0.9 } }}
                          onClick={() => setItemCount(itemCount + 1)}
                        >+</Button>
                      </ButtonGroup>
                      <Button
                        disableElevation
                        variant="contained"
                        sx={{ textTransform: "none", background: "var(--primary)", borderRadius: "12px", px: 3, fontWeight: 600, "&:hover": { background: "var(--primary)", opacity: 0.9 } }}
                        onClick={() => {
                          let cart = JSON.parse(localStorage.getItem("cart")) || [];
                          let item = cart.filter((item) => item.id == product.id)[0];
                          if (item) { item.count += itemCount; }
                          else { cart.push({ ...product, count: itemCount }); }
                          localStorage.setItem("cart", JSON.stringify(cart));
                        }}
                      >
                        Add to Cart
                      </Button>
                    </Stack>

                    <Stack direction={{ xs: "column", sm: "row" }} gap={2} alignItems={{ xs: "flex-start", sm: "center" }} mt={1}>
                      <Stack direction="row" gap={0.5}><Typography sx={{ color: "#999", fontSize: "13px" }}>Category:</Typography><Typography sx={{ color: "var(--primary)", fontWeight: 600, fontSize: "13px" }}>{product.category}</Typography></Stack>
                      <Stack direction="row" gap={0.5}><Typography sx={{ color: "#999", fontSize: "13px" }}>Stock:</Typography><Typography sx={{ color: "var(--primary)", fontWeight: 600, fontSize: "13px" }}>{product.countInStock} Items</Typography></Stack>
                      <Stack direction="row" gap={0.5}><Typography sx={{ color: "#999", fontSize: "13px" }}>SKU:</Typography><Typography sx={{ color: "var(--primary)", fontWeight: 600, fontSize: "13px" }}>{product.sku}</Typography></Stack>
                    </Stack>
                  </Stack>
                </motion.div>

                <Stack sx={{ display: { xs: "none", lg: "block" } }}>
                  <HeroCategory />
                </Stack>
              </Stack>
            )}

            <Box sx={{ p: { md: 4 }, my: 5, border: { md: "1px solid var(--border)" }, borderRadius: 3 }}>
              <Typography sx={{ fontFamily: "var(--font-heading)", fontSize: "28px", fontWeight: 700, color: "var(--primary)", mb: 2 }}>Description</Typography>
              <Typography sx={{ color: "#666", lineHeight: 1.8 }}>{product && product.description}</Typography>
            </Box>

            <Box sx={{ p: { xs: 2, md: 4 }, my: 5, border: { md: "1px solid var(--border)" }, borderRadius: 3 }}>
              <Typography sx={{ fontFamily: "var(--font-heading)", fontSize: { xs: "22px", md: "26px" }, fontWeight: 700, color: "var(--primary)", mb: 3 }}>
                Related Products
              </Typography>
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
                {product && productList
                  .filter((item) => product.category === item.category && product.id != item.id)
                  .slice(0, 10)
                  .map((item, index) => (
                    <ProductCard key={`${item.id}-${index}`} product={item} />
                  ))}
              </Box>
            </Box>
          </Stack>
        </Stack>
      </Stack>
      <PdfCartFloating />
      <Footer />
    </Stack>
  );
}
