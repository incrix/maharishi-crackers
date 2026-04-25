"use client";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Image from "next/image";
import green from "@/public/Images/green.png";
import iso from "@/public/Images/iso.png";
import Link from "next/link";
import PhoneIcon from "@mui/icons-material/Phone";
import PersonIcon from "@mui/icons-material/Person";
import MailIcon from "@mui/icons-material/Mail";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useRouter, usePathname } from "next/navigation";

export default function Footer() {
  const router = useRouter();
  const pathname = usePathname();

  const handlePhoneCallOne = () => { window.location.href = "tel:7548820326"; };
  const handlePhoneCallTwo = () => { window.location.href = "tel:9361592454"; };

  const links = [
    { label: "Home", href: "/" },
    { label: "About", href: "/About" },
    { label: "Shop", href: "/Shop" },
    { label: "Contact Us", href: "/Contact" },
  ];

  return (
    <Box
      sx={{
        background: "var(--primary)",
        color: "#fff",
        mt: { xs: 5, md: 0 },
      }}
    >
      <Stack
        sx={{
          maxWidth: "1400px",
          margin: "0 auto",
          px: { xs: 3, md: 8 },
          py: { xs: 5, md: 8 },
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          flexWrap="wrap"
          gap={5}
        >
          {/* Brand Column */}
          <Stack maxWidth="320px" gap={2.5}>
            <Typography
              sx={{
                fontFamily: "var(--font-heading)",
                fontSize: "24px",
                fontWeight: 700,
                color: "#fff",
              }}
            >
              Maharishi{" "}
              <Box component="span" sx={{ color: "var(--secondary-light)" }}>
                Crackers
              </Box>
            </Typography>
            <Typography sx={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", lineHeight: 1.7 }}>
              Premium quality fireworks crafted in Tamil Nadu. Trusted by thousands of families for safe, vibrant celebrations.
            </Typography>

            <Stack gap={1.5} mt={1}>
              <Stack direction="row" gap={1} alignItems="center">
                <PersonIcon sx={{ color: "var(--secondary-light)", fontSize: 18 }} />
                <Typography sx={{ fontSize: "14px" }}>Govindaraj K</Typography>
              </Stack>
              <Stack direction="row" gap={1} alignItems="center">
                <MailIcon sx={{ color: "var(--secondary-light)", fontSize: 18 }} />
                <a href="mailto:info@maharishicrackers.com" style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px" }}>
                  info@maharishicrackers.com
                </a>
              </Stack>
              <Stack direction="row" gap={1} alignItems="center">
                <PhoneIcon sx={{ color: "var(--secondary-light)", fontSize: 18 }} />
                <Typography
                  onClick={handlePhoneCallOne}
                  sx={{ cursor: "pointer", fontSize: "14px", color: "rgba(255,255,255,0.8)" }}
                >
                  +91 75488 20326
                </Typography>
                <span style={{ color: "var(--secondary-light)" }}>|</span>
                <Typography
                  onClick={handlePhoneCallTwo}
                  sx={{ cursor: "pointer", fontSize: "14px", color: "rgba(255,255,255,0.8)" }}
                >
                  +91 93615 92454
                </Typography>
              </Stack>
              <Stack direction="row" gap={1} alignItems="flex-start">
                <LocationOnIcon sx={{ color: "var(--secondary-light)", fontSize: 18, mt: 0.3 }} />
                <Typography sx={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
                  Sivakasi, Tamil Nadu, India
                </Typography>
              </Stack>
            </Stack>
          </Stack>

          {/* Quick Links */}
          <Stack gap={2}>
            <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "var(--secondary-light)" }}>
              Quick Links
            </Typography>
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    color: isActive ? "var(--secondary-light)" : "rgba(255,255,255,0.7)",
                    fontWeight: isActive ? "600" : "400",
                    fontSize: "14px",
                    transition: "all 0.2s",
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </Stack>

          {/* Categories */}
          <Stack gap={2}>
            <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "var(--secondary-light)" }}>
              Categories
            </Typography>
            <Link href="/Shop?category=Flower%20Pots#product" style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px" }}>Flowerpots</Link>
            <Link href="/Shop?category=Ground%20Chakkars#product" style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px" }}>Ground Chakkar</Link>
            <Link href="/Shop?category=One%20Sound#product" style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px" }}>One Sound</Link>
            <Link href="/Shop?category=Special%27s#product" style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px" }}>Special&apos;s</Link>
            <Link href="/Shop?category=Rockets#product" style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px" }}>Rockets</Link>
            <Link href="/Shop?category=Repeating%20shots#product" style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px" }}>Aerials</Link>
            <Link href="/Shop?category=Atom%20bombs#product" style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px" }}>Bombs</Link>
            <Link href="/Shop?category=Twinklers#product" style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px" }}>Twinklers</Link>
          </Stack>

          {/* Certifications */}
          <Stack gap={2}>
            <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "var(--secondary-light)" }}>
              Certified
            </Typography>
            <Box sx={{ background: "#fff", borderRadius: "12px", p: 1.5, width: 130 }}>
              <Image src={green.src} alt="Green Certification" width={100} height={100} style={{ width: "100%", height: "auto" }} />
            </Box>
            <Box sx={{ background: "#fff", borderRadius: "12px", p: 1.5, width: 130 }}>
              <Image src={iso.src} alt="ISO Certification" width={100} height={100} style={{ width: "100%", height: "auto" }} />
            </Box>
          </Stack>
        </Stack>

        {/* Divider */}
        <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.15)", mt: 5, pt: 3 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Typography sx={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", textAlign: { xs: "center", md: "left" } }}>
              &copy; {new Date().getFullYear()}{" "}
              <span
                onClick={() => router.push("/")}
                style={{ color: "var(--secondary-light)", fontWeight: 600, cursor: "pointer" }}
              >
                Maharishi Crackers
              </span>
              . All rights reserved.
            </Typography>
            <Typography sx={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", gap: 0.5 }}>
              Designed by{" "}
              <a href="https://incrix.com/" target="_blank" rel="noopener noreferrer">
                <Image src="https://incrix.com/logo.png" alt="Incrix Logo" width={90} height={20} style={{ width: "90px", height: "20px", filter: "brightness(2)" }} />
              </a>
            </Typography>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
