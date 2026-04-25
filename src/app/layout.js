import { Playfair_Display, Poppins } from "next/font/google";
import "./globals.css";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { CartProvider } from "@/src/app/context/CartContext";
import { BillingProvider } from "@/src/app/context/BillingContext";
import { ProductProvider } from "@/src/app/context/ProductContext";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-heading" });
const poppins = Poppins({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-body" });

export const metadata = {
  title: "Maharishi Crackers | Premium Fireworks",
  description: "Maharishi Crackers — Premium quality fireworks and crackers for every celebration. Trusted by families across India.",
  icons: {
    icon: "/Images/LOGOMC.png",
    apple: "/Images/LOGOMC.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${poppins.variable}`} style={{ fontFamily: "var(--font-body)" }}>
        <AppRouterCacheProvider>
          <ProductProvider>
            <CartProvider>
              <BillingProvider>
                {children}
              </BillingProvider>
            </CartProvider>
          </ProductProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
