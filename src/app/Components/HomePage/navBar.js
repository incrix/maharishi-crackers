"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemButton from "@mui/material/ListItemButton";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Badge from "@mui/material/Badge";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import PhoneInTalkIcon from "@mui/icons-material/PhoneInTalk";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/About" },
  { label: "Shop", href: "/Shop" },
  { label: "Orders", href: "/Orders" },
  { label: "Contact", href: "/Contact" },
];

export default function NavBar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const toggleDrawer = (open) => () => setDrawerOpen(open);
  const pathname = usePathname();

  useEffect(() => {
    const updateCart = () => {
      setCartCount(
        localStorage.getItem("cart")
          ? JSON.parse(localStorage.getItem("cart")).length
          : 0
      );
    };
    updateCart();
    const interval = setInterval(updateCart, 500);
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll);
    return () => {
      clearInterval(interval);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      {/* ===== FLOATING PILL NAVBAR ===== */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "fixed",
          top: scrolled ? 12 : 20,
          left: 0,
          right: 0,
          margin: "0 auto",
          zIndex: 1300,
          width: "92%",
          maxWidth: "1280px",
          transition: "all 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            overflow: "hidden",
            background: pathname === "/" ? "rgba(26, 77, 46, 0.55)" : "rgba(26, 77, 46, 0.92)",
            backdropFilter: "blur(24px) saturate(1.4)",
            WebkitBackdropFilter: "blur(24px) saturate(1.4)",
            borderRadius: "60px",
            border: pathname === "/" ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid rgba(184, 150, 62, 0.2)",
            px: { xs: 2, md: 3.5 },
            py: { xs: 1, md: 1.3 },
            gap: { xs: 2, md: 3 },
            boxShadow: "0 8px 32px rgba(26, 77, 46, 0.25), inset 0 1px 0 rgba(255,255,255,0.08)",
            transition: "all 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {/* Logo */}
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Typography
              component="div"
              onClick={() => router.push("/")}
              sx={{
                cursor: "pointer",
                fontFamily: "var(--font-heading)",
                fontSize: { xs: "16px", md: "20px" },
                fontWeight: 700,
                color: "#fff",
                letterSpacing: "0.3px",
                userSelect: "none",
                display: "flex",
                alignItems: "center",
                gap: 0.8,
              }}
            >
              <Image
                src="/Images/LOGOMC.png"
                alt="Maharishi Crackers"
                width={32}
                height={32}
                style={{ borderRadius: "6px", objectFit: "contain", flexShrink: 0 }}
              />
              <Box sx={{ display: { xs: "none", sm: "block" } }}>
                Maharishi
                <Box component="span" sx={{ color: "var(--secondary-light)", ml: 0.5 }}>
                  Crackers
                </Box>
              </Box>
            </Typography>
          </motion.div>

          {/* Desktop Center Nav */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: 0.8,
              background: "rgba(255,255,255,0.1)",
              borderRadius: "50px",
              px: 1.5,
              py: 0.6,
            }}
          >
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link key={link.label} href={link.href} style={{ textDecoration: "none" }}>
                  <Box
                    sx={{
                      position: "relative",
                      px: 3,
                      py: 1,
                      borderRadius: "50px",
                      fontSize: "14px",
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? "#fff" : "rgba(255,255,255,0.7)",
                      background: isActive ? "rgba(184, 150, 62, 0.25)" : "transparent",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        color: "#fff",
                        background: isActive
                          ? "rgba(184, 150, 62, 0.25)"
                          : "rgba(255,255,255,0.06)",
                      },
                    }}
                  >
                    {link.label}
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        style={{
                          position: "absolute",
                          bottom: 2,
                          left: "50%",
                          transform: "translateX(-50%)",
                          width: 16,
                          height: 2,
                          borderRadius: 1,
                          background: "var(--secondary-light)",
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                  </Box>
                </Link>
              );
            })}
          </Box>

          {/* Desktop Right Actions */}
          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 2 }}>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <IconButton
                onClick={() => router.push("/Cart")}
                sx={{
                  color: "#fff",
                  position: "relative",
                  width: 40,
                  height: 40,
                  background: "rgba(255,255,255,0.1)",
                  "&:hover": { background: "rgba(255,255,255,0.18)" },
                }}
              >
                <Badge
                  badgeContent={cartCount}
                  sx={{
                    "& .MuiBadge-badge": {
                      backgroundColor: "var(--secondary)",
                      color: "#fff",
                      fontSize: "10px",
                      minWidth: 18,
                      height: 18,
                    },
                  }}
                >
                  <ShoppingCartIcon sx={{ fontSize: 20 }} />
                </Badge>
              </IconButton>
            </motion.div>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                size="small"
                endIcon={<PhoneInTalkIcon sx={{ fontSize: "16px !important" }} />}
                onClick={() => router.push("/Contact")}
                sx={{
                  background: "var(--gold-gradient)",
                  color: "#fff",
                  borderRadius: "50px",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "13px",
                  px: 2.5,
                  py: 0.8,
                  minHeight: 0,
                  whiteSpace: "nowrap",
                  "&:hover": { background: "var(--gold-gradient)", opacity: 0.9 },
                }}
                disableElevation
              >
                Call Us
              </Button>
            </motion.div>
          </Box>

          {/* Mobile Right */}
          <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", gap: 1 }}>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <IconButton
                onClick={() => router.push("/Cart")}
                sx={{ color: "#fff", width: 36, height: 36, background: "rgba(255,255,255,0.08)" }}
              >
                <Badge
                  badgeContent={cartCount}
                  sx={{ "& .MuiBadge-badge": { backgroundColor: "var(--secondary)", color: "#fff", fontSize: "9px", minWidth: 16, height: 16 } }}
                >
                  <ShoppingCartIcon sx={{ fontSize: 18 }} />
                </Badge>
              </IconButton>
            </motion.div>

            <IconButton
              onClick={toggleDrawer(true)}
              sx={{
                color: "#fff",
                width: 36,
                height: 36,
                background: "rgba(255,255,255,0.08)",
                "&:hover": { background: "rgba(255,255,255,0.14)" },
              }}
            >
              <MenuIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
        </Box>
      </motion.div>

      {/* ===== MOBILE DRAWER — Full screen overlay ===== */}
      <AnimatePresence>
        {drawerOpen && (
          <Drawer
            anchor="top"
            open={drawerOpen}
            onClose={toggleDrawer(false)}
            sx={{ zIndex: 1400 }}
            PaperProps={{
              sx: {
                width: "100vw",
                height: "100vh",
                background: "linear-gradient(160deg, #0d2e1a 0%, #1a4d2e 40%, #0d2e1a 100%)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              },
            }}
          >
            {/* Close */}
            <IconButton
              onClick={toggleDrawer(false)}
              sx={{
                position: "absolute",
                top: 24,
                right: 24,
                zIndex: 1400,
                color: "var(--secondary-light)",
                border: "1px solid rgba(184,150,62,0.3)",
                background: "rgba(13, 46, 26, 0.8)",
                width: 44,
                height: 44,
                "&:hover": { background: "rgba(13, 46, 26, 0.95)" },
              }}
            >
              <CloseIcon />
            </IconButton>

            <Stack alignItems="center" gap={3}>
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.label}
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Link href={link.href} onClick={toggleDrawer(false)} style={{ textDecoration: "none" }}>
                    <Typography
                      sx={{
                        fontFamily: "var(--font-heading)",
                        fontSize: "36px",
                        fontWeight: 700,
                        color: pathname === link.href ? "var(--secondary-light)" : "rgba(255,255,255,0.6)",
                        textAlign: "center",
                        transition: "color 0.3s",
                        "&:hover": { color: "#fff" },
                      }}
                    >
                      {link.label}
                    </Typography>
                  </Link>
                </motion.div>
              ))}

              {/* CTA in drawer */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: navLinks.length * 0.08 + 0.1 }}
              >
                <Button
                  endIcon={<PhoneInTalkIcon />}
                  onClick={() => { router.push("/Contact"); setDrawerOpen(false); }}
                  sx={{
                    mt: 3,
                    background: "var(--gold-gradient)",
                    color: "#fff",
                    borderRadius: "50px",
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "16px",
                    px: 4,
                    py: 1.5,
                    "&:hover": { background: "var(--gold-gradient)", opacity: 0.9 },
                  }}
                  disableElevation
                >
                  Contact Us
                </Button>
              </motion.div>
            </Stack>
          </Drawer>
        )}
      </AnimatePresence>
    </>
  );
}
