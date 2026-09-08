"use client";
import { useState, useEffect, useRef } from "react";
import {
  Stack, Box, Typography, InputBase, IconButton, Badge, Drawer, Button, Divider,
} from "@mui/material";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import { useProducts } from "@/context/ProductContext";
import { useCart } from "@/util/cart";
import { PRICE_LIST_URL, DEFAULT_BANNER } from "@/util/config";
import logo from "../../public/images/logo-mark.png";

/**
 * Site header: announcement strip and a floating navigation island.
 *
 * The bar detaches from the page edges and sits on the content as one rounded
 * glass slab, rather than three stacked full-width rows. That collapses the
 * chrome from roughly 150px to a single row, which on a catalogue-first shop is
 * 150px of products instead of furniture, and the page reads as scrolling
 * *under* the navigation rather than being pushed down by it.
 *
 * The wrapper carries the island as padding, not margin, so its offsetHeight
 * still describes the full space the header occupies - the sticky filter bar
 * in the shop offsets by exactly that.
 */

const LINKS = [
  { href: "/", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/factory", label: "Why Sivakasi" },
  { href: "/safety", label: "Safety" },
  { href: "/contact", label: "Contact" },
];

export default function Header({ banner = DEFAULT_BANNER }) {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const { searchTerm, setSearchTerm } = useProducts();
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  /**
   * Publish the header's live height as --header-h.
   *
   * The header is sticky, so anything else that sticks (the shop's search bar)
   * has to offset by exactly this much or it scrolls underneath. The height is
   * not a constant - the announcement strip can be switched off in the admin,
   * and the island grows a second row on a phone - so it is measured.
   */
  const headerRef = useRef(null);
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const publish = () =>
      document.documentElement.style.setProperty("--header-h", `${el.offsetHeight}px`);
    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(el);
    window.addEventListener("resize", publish);
    return () => { ro.disconnect(); window.removeEventListener("resize", publish); };
  }, [banner?.enabled, banner?.text]);

  const isActive = (href) =>
    href === "/" ? pathname === "/" || pathname.startsWith("/product") : pathname.startsWith(href);

  // Searching from any page lands on the shop, which is what reads the term.
  const submitSearch = () => {
    setMenuOpen(false);
    if (pathname !== "/") router.push("/#catalogue");
  };

  const search = (
    <Stack
      direction="row"
      alignItems="center"
      gap={0.75}
      sx={{
        minWidth: 0,
        // Compact until used, then it opens out. Keeps the island short
        // without hiding search behind an icon.
        width: { md: 178, lg: 210 },
        transition: "width 220ms cubic-bezier(0.4,0,0.2,1), border-color var(--transition), box-shadow var(--transition)",
        border: "1.5px solid var(--border)",
        borderRadius: "var(--radius-pill)",
        px: 1.5, py: 0.6,
        backgroundColor: "var(--surface)",
        "&:focus-within": {
          width: { md: 250, lg: 300 },
          borderColor: "var(--primary-color)",
          boxShadow: "0 0 0 3px var(--primary-soft)",
        },
      }}
    >
      <SearchRoundedIcon sx={{ fontSize: 18, color: "var(--text-color-trinary)", flexShrink: 0 }} />
      <InputBase
        value={searchTerm || ""}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submitSearch()}
        placeholder="Search…"
        inputProps={{ "aria-label": "search products" }}
        sx={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 600 }}
      />
      {searchTerm && (
        <IconButton size="small" aria-label="clear search" onClick={() => setSearchTerm("")} sx={{ p: 0.25 }}>
          <CloseRoundedIcon sx={{ fontSize: 15 }} />
        </IconButton>
      )}
    </Stack>
  );

  return (
    <Box
      component="header"
      ref={headerRef}
      sx={{ position: "sticky", top: 0, zIndex: 1100, pb: { xs: 1, md: 1.5 } }}
    >
      {/* Announcement - text, link and visibility are set in the admin panel */}
      {banner?.enabled !== false && banner?.text ? (
        <Box
          {...(banner.href ? { component: Link, href: banner.href } : {})}
          sx={{ display: "block", backgroundColor: "var(--primary-color)", py: 0.85, px: 2 }}
        >
          <Typography textAlign="center" fontSize={{ xs: 11.5, md: 13 }} fontWeight={800} color="#fff" letterSpacing={0.2}>
            {banner.text}
          </Typography>
        </Box>
      ) : null}

      {/* The island */}
      <Box sx={{ px: { xs: 1.5, md: 3 }, pt: { xs: 1, md: 1.5 } }}>
        <Stack
          width="100%"
          maxWidth="var(--max-width)"
          mx="auto"
          sx={{
            borderRadius: { xs: "var(--radius-lg)", md: "var(--radius-pill)" },
            backgroundColor: "var(--glass-bg-strong)",
            backdropFilter: "var(--glass-blur)",
            WebkitBackdropFilter: "var(--glass-blur)",
            border: "1px solid var(--glass-border)",
            boxShadow: "var(--glass-shadow)",
            px: { xs: 1.5, md: 2 },
            py: { xs: 1, md: 0.85 },
          }}
        >
          <Stack direction="row" alignItems="center" gap={{ xs: 1, md: 2 }}>
            {/* Brand */}
            <Stack component={Link} href="/" direction="row" alignItems="center" gap={1} sx={{ flexShrink: 0 }}>
              <Box component="img" src={logo.src} alt="" sx={{ height: { xs: 32, md: 38 }, width: "auto" }} />
              <Stack minWidth={0}>
                <Typography
                  fontSize={{ xs: 14, md: 16 }}
                  fontWeight={800}
                  color="var(--text-color)"
                  lineHeight={1.15}
                  noWrap
                >
                  Maharishi Crackers
                </Typography>
                <Typography
                  fontSize={{ xs: 9, md: 10 }}
                  fontWeight={700}
                  letterSpacing={0.5}
                  textTransform="uppercase"
                  color="var(--secondary-color)"
                  sx={{ display: { xs: "none", sm: "block" } }}
                  noWrap
                >
                  Sivakasi Fireworks
                </Typography>
              </Stack>
            </Stack>

            {/* Nav, centred in the remaining space */}
            <Stack
              direction="row"
              gap={0.25}
              sx={{ display: { xs: "none", md: "flex" }, flex: 1, justifyContent: "center" }}
            >
              {LINKS.map((l) => {
                const on = isActive(l.href);
                return (
                  <Typography
                    key={l.href}
                    component={Link}
                    href={l.href}
                    fontSize={13.5}
                    fontWeight={on ? 800 : 700}
                    sx={{
                      px: 1.6, py: 0.7,
                      borderRadius: "var(--radius-pill)",
                      whiteSpace: "nowrap",
                      color: on ? "#fff" : "var(--text-color)",
                      backgroundColor: on ? "var(--primary-color)" : "transparent",
                      transition: "color var(--transition), background-color var(--transition)",
                      "&:hover": {
                        color: on ? "#fff" : "var(--primary-color)",
                        backgroundColor: on ? "var(--primary-color)" : "var(--primary-soft)",
                      },
                    }}
                  >
                    {l.label}
                  </Typography>
                );
              })}
            </Stack>

            <Box sx={{ flex: { xs: 1, md: "none" } }} />

            {/* Actions */}
            <Stack direction="row" alignItems="center" gap={{ xs: 0.25, md: 1 }} flexShrink={0}>
              <Box sx={{ display: { xs: "none", md: "block" } }}>{search}</Box>

              <IconButton
                href={PRICE_LIST_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="price list PDF"
                sx={{
                  display: { xs: "none", sm: "inline-flex" },
                  color: "var(--text-color)",
                  "&:hover": { color: "var(--primary-color)", backgroundColor: "var(--primary-soft)" },
                }}
              >
                <PictureAsPdfRoundedIcon sx={{ fontSize: 20 }} />
              </IconButton>

              <IconButton component={Link} href="/cart" aria-label={`cart, ${itemCount} items`}
                sx={{ color: "var(--text-color)", "&:hover": { color: "var(--primary-color)", backgroundColor: "var(--primary-soft)" } }}>
                <Badge
                  badgeContent={itemCount}
                  sx={{ "& .MuiBadge-badge": { backgroundColor: "var(--primary-color)", color: "#fff", fontWeight: 800, fontSize: 10 } }}
                >
                  <ShoppingCartOutlinedIcon />
                </Badge>
              </IconButton>

              <IconButton
                onClick={() => setMenuOpen(true)}
                aria-label="open menu"
                sx={{ display: { xs: "inline-flex", md: "none" }, color: "var(--text-color)" }}
              >
                <MenuRoundedIcon />
              </IconButton>
            </Stack>
          </Stack>

          {/* Phone search sits on a second line inside the island */}
          <Box sx={{ display: { xs: "block", md: "none" }, pt: 1 }}>
            <Stack
              direction="row" alignItems="center" gap={0.75}
              sx={{
                border: "1.5px solid var(--border)", borderRadius: "var(--radius-pill)",
                px: 1.5, py: 0.6, backgroundColor: "var(--surface)",
                "&:focus-within": { borderColor: "var(--primary-color)" },
              }}
            >
              <SearchRoundedIcon sx={{ fontSize: 18, color: "var(--text-color-trinary)" }} />
              <InputBase
                value={searchTerm || ""}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitSearch()}
                placeholder="Search crackers…"
                inputProps={{ "aria-label": "search products" }}
                sx={{ flex: 1, fontSize: 13.5, fontWeight: 600 }}
              />
              {searchTerm && (
                <IconButton size="small" aria-label="clear search" onClick={() => setSearchTerm("")} sx={{ p: 0.25 }}>
                  <CloseRoundedIcon sx={{ fontSize: 15 }} />
                </IconButton>
              )}
            </Stack>
          </Box>
        </Stack>
      </Box>

      {/* Mobile menu */}
      <Drawer
        anchor="right"
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        PaperProps={{ sx: { width: "82%", maxWidth: 330, p: 2.5 } }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography fontSize={17} fontWeight={800} color="var(--text-color)">Menu</Typography>
          <IconButton onClick={() => setMenuOpen(false)} aria-label="close menu"><CloseRoundedIcon /></IconButton>
        </Stack>

        <Stack gap={0.5}>
          {LINKS.map((l) => (
            <Typography
              key={l.href}
              component={Link}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              fontSize={16}
              fontWeight={800}
              sx={{
                py: 1.35, px: 1.5, borderRadius: "var(--radius)",
                color: isActive(l.href) ? "var(--primary-color)" : "var(--text-color)",
                backgroundColor: isActive(l.href) ? "var(--primary-soft)" : "transparent",
              }}
            >
              {l.label}
            </Typography>
          ))}
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Stack gap={1}>
          <Button
            component={Link} href="/cart" onClick={() => setMenuOpen(false)}
            startIcon={<ShoppingCartOutlinedIcon sx={{ fontSize: 18 }} />}
            sx={outlineBtn}
          >
            Cart{itemCount ? ` (${itemCount})` : ""}
          </Button>
          <Button
            href={PRICE_LIST_URL} target="_blank" rel="noopener noreferrer"
            startIcon={<PictureAsPdfRoundedIcon sx={{ fontSize: 18 }} />}
            sx={outlineBtn}
          >
            Price list
          </Button>
        </Stack>
      </Drawer>
    </Box>
  );
}

const outlineBtn = {
  justifyContent: "flex-start",
  textTransform: "none", fontWeight: 700, fontSize: 14,
  py: 1.1, px: 1.75, borderRadius: "var(--radius)",
  color: "var(--text-color)", border: "1px solid var(--border)",
  "&:hover": { borderColor: "var(--primary-color)", color: "var(--primary-color)", backgroundColor: "var(--primary-soft)" },
};
