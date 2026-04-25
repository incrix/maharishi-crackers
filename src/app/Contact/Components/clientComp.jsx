"use client";
import Button from "@mui/material/Button";
import LocalPhoneRoundedIcon from "@mui/icons-material/LocalPhoneRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";

export function CallButton() {
  return (
    <Button
      variant="contained"
      onClick={() => window.open("tel:+917548820326", "_self")}
      sx={{
        background: "var(--primary)",
        height: "50px",
        textTransform: "none",
        color: "#fff",
        borderRadius: "12px",
        fontWeight: 600,
        "&:hover": { background: "var(--primary)", opacity: 0.9 },
      }}
      startIcon={<LocalPhoneRoundedIcon />}
    >
      Call now!
    </Button>
  );
}

export function WhatsappButton() {
  return (
    <Button
      variant="outlined"
      sx={{
        borderColor: "var(--primary)",
        borderWidth: 2,
        height: "50px",
        textTransform: "none",
        color: "var(--primary)",
        borderRadius: "12px",
        fontWeight: 600,
        "&:hover": { borderColor: "var(--primary)", borderWidth: 2 },
      }}
      startIcon={<SendRoundedIcon />}
      onClick={() => window.open("https://wa.me/+917548820326?text=I'm%20interested%20in%20your%20products.", "_blank")}
    >
      Whatsapp
    </Button>
  );
}
