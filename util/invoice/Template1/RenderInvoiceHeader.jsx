"use client";
import { Text, View, Image } from "@react-pdf/renderer";
import Logo from "@/public/images/logo.png";
import { BUSINESS, SITE_URL } from "@/util/site";

export default function RenderInvoiceHeader() {
  return (
    <View fixed style={{ flexDirection: "row", gap: 10 }}>
      <Image
        src={Logo.src}
        style={{
          width: 72,
          height: 80,
          objectFit: "contain",
        }}
      />
      <View style={{ gap: 2, fontSize: 8 }}>
        <Text
          style={{
            fontSize: 10,
            fontFamily: "Lato Bold",
            textTransform: "uppercase",
          }}
        >
          {BUSINESS.name}
        </Text>
        <Text
          style={{
            color: "#333",
            maxWidth: 220,
            fontFamily: "Lato",
          }}
        >
          {`${BUSINESS.office.street}, ${BUSINESS.office.locality} ${BUSINESS.office.postalCode}.`}
        </Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Text
            style={{
              color: "#333",
              maxWidth: 200,
            }}
          >
            {`Mobile: ${BUSINESS.phone[0]}`}
          </Text>
          <Text
            style={{
              color: "#333",
              maxWidth: 200,
            }}
          >
            {`Email: ${BUSINESS.email}`}
          </Text>
        </View>
        <Text
          style={{
            color: "#333",
            maxWidth: 200,
          }}
        >
          {`Website: ${SITE_URL.replace(/^https?:\/\//, "")}`}
        </Text>
      </View>
      <View
        style={{
          fontSize: 8,
          marginLeft: "auto",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 2,
        }}
      >
        <Text
          style={{
            color: "#0080FF",
            fontFamily: "Lato Bold",
          }}
        >
          PROFORMA
        </Text>
        <Text
          style={{
            color: "#333",
            fontFamily: "Lato",
          }}
        >
          ORIGINAL FOR RECIPIENT
        </Text>
      </View>
    </View>
  );
}
