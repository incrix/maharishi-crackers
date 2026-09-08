"use client";
import Stack from "@mui/material/Stack";
import NavBar from "@/src/app/Components/HomePage/navBar";
import HeroCarousel from "@/src/app/Components/HomePage/heroCarousel";
import OurProducts from "@/src/app/Components/HomePage/ourProducts";
import AboutUs from "@/src/app/Components/HomePage/aboutUs";
import DoDont from "@/src/app/Components/HomePage/doDont";
import Footer from "@/src/app/Components/HomePage/footer";
import PdfCartFloating from "@/src/app/Components/FloatingIcons/pdfCartFloating";

export default function MyHome() {
  return (
    <Stack position="relative" minHeight="100vh">
      <NavBar />
      <HeroCarousel />
      <OurProducts />
      <AboutUs />
      <DoDont />
      <Footer />
      <PdfCartFloating />
    </Stack>
  );
}
