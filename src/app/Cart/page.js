import Stack from "@mui/material/Stack";
import CartPage from "./Components/cartPage";
import NavBar from "@/src/app/Components/HomePage/navBar";
import Footer from "@/src/app/Components/HomePage/footer";

export default function Cart() {
  return (
    <Stack>
      <NavBar />
      <Stack sx={{ px: { xs: 3, md: 8 }, mx: "auto", maxWidth: "1400px", width: "100%" }}>
        <CartPage />
      </Stack>
      <Footer />
    </Stack>
  );
}
