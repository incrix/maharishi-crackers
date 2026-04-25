"use client";

import Stack from "@mui/material/Stack";
import NavBar from "@/src/app/Components/HomePage/navBar";
import Footer from "@/src/app/Components/HomePage/footer";
import ContactPage from "@/src/app/Contact/Components/contactPage";
import PdfCartFloating from "@/src/app/Components/FloatingIcons/pdfCartFloating";

export default function Contact() {
  return (
    <Stack position="relative" minHeight="100vh" sx={{ background: "var(--background)" }}>
      <NavBar />
      <ContactPage />
      <Footer />
      <PdfCartFloating />
    </Stack>
  );
}
