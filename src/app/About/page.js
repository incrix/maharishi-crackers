"use client";
import Stack from "@mui/material/Stack";
import NavBar from "@/src/app/Components/HomePage/navBar";
import MyProcess from "@/src/app/About/Components/myProcess";
import AboutUs from "@/src/app/About/Components/aboutUs";
import Offer from "@/src/app/About/Components/offer";
import DoDont from "@/src/app/Components/HomePage/doDont";
import Footer from "@/src/app/Components/HomePage/footer";
import PdfCartFloating from "@/src/app/Components/FloatingIcons/pdfCartFloating";

export default function About() {
  return (
    <Stack position="relative" minHeight="100vh" sx={{ background: "var(--background)" }}>
      <NavBar />
      <Stack sx={{ maxWidth: "1400px", mx: "auto", width: "100%" }}>
        <MyProcess />
        <AboutUs />
        <Offer />
      </Stack>
      <DoDont />
      <Footer />
      <PdfCartFloating />
    </Stack>
  );
}
