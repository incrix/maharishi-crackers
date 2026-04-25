"use client";
import NavBar from "@/src/app/Components/HomePage/navBar";
import Footer from "@/src/app/Components/HomePage/footer";
import Stack from "@mui/material/Stack";
import CheckoutPage from "@/src/app/Checkout/Components/checkOutPage";

export default function Checkout() {
  return (
    <Stack>
      <NavBar />
      <Stack sx={{ px: { xs: 3, md: 8 }, mx: "auto", maxWidth: "1400px", width: "100%" }}>
        <CheckoutPage />
      </Stack>
      <Footer />
    </Stack>
  );
}
