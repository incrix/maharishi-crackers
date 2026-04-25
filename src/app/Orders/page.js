"use client";
import Stack from "@mui/material/Stack";
import NavBar from "@/src/app/Components/HomePage/navBar";
import Footer from "@/src/app/Components/HomePage/footer";
import OrdersPage from "./Components/ordersPage";

export default function Orders() {
  return (
    <Stack position="relative" minHeight="100vh" sx={{ background: "var(--background)" }}>
      <NavBar />
      <Stack sx={{ px: { xs: 3, md: 8 }, mx: "auto", maxWidth: "1400px", width: "100%" }}>
        <OrdersPage />
      </Stack>
      <Footer />
    </Stack>
  );
}
