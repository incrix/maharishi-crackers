"use client";
import { Text, View, Image } from "@react-pdf/renderer";
import Logo from "@/src/assets/maharishiLogo.png";

export default function RenderInvoiceHeader() {
  return (
    <View fixed style={{ flexDirection: "row", gap: 10 }}>
      <Image src={Logo.src} style={{ width: 60, height: 60, objectFit: "contain" }} />
      <View style={{ gap: 2, fontSize: 8 }}>
        <Text style={{ fontSize: 10, fontFamily: "Lato Bold", textTransform: "uppercase" }}>Maharishi Crackers</Text>
        <Text style={{ color: "#333", maxWidth: 220, fontFamily: "Lato" }}>
          Sivakasi, Tamil Nadu, India.
        </Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Text style={{ color: "#333", maxWidth: 200 }}>Mobile: +91 75488 20326</Text>
          <Text style={{ color: "#333", maxWidth: 200 }}>Email: info@maharishicrackers.com</Text>
        </View>
        <Text style={{ color: "#333", maxWidth: 200 }}>Website: www.maharishicrackers.com</Text>
      </View>
      <View style={{ fontSize: 8, marginLeft: "auto", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
        <Text style={{ color: "#1a4d2e", fontFamily: "Lato Bold" }}>PROFORMA</Text>
        <Text style={{ color: "#333", fontFamily: "Lato" }}>ORIGINAL FOR RECIPIENT</Text>
      </View>
    </View>
  );
}
