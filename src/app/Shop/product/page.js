import { Suspense } from "react";
import ProductPage from "@/src/app/Shop/Components/product/ProductPage";
import Typography from "@mui/material/Typography";

export default function Page() {
  return (
    <Suspense fallback={<Typography variant="h4" sx={{ textAlign: "center", mt: "20%" }}>Loading...</Typography>}>
      <ProductPage />
    </Suspense>
  );
}
