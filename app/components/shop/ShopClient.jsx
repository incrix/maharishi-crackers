"use client";
import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Stack, Typography, Box, Drawer, Button, IconButton,
  Snackbar, Alert, Badge, Skeleton, useMediaQuery,
} from "@mui/material";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import { useProducts } from "@/context/ProductContext";
import { useCart } from "@/util/cart";
import ProductCard from "@/app/components/commerce/ProductCard";
import CartPanel from "@/app/components/commerce/CartPanel";

/**
 * Shop - catalogue, filtering and cart.
 *
 * Layout: categories stand in a left rail rather than a horizontal chip strip,
 * so the whole range is legible at once instead of hidden behind a sideways
 * scroll. The cart is not part of the layout at all - it is a floating control
 * opening a drawer, so filling it never reflows the grid.
 *
 * The commerce behaviour is deliberately unchanged: add, quantity stepping,
 * undo on removal and the minimum-order gate work exactly as before.
 */

/** One definition, so the skeletons and the real grid cannot drift apart. */
const GRID_COLS = {
  xs: "repeat(2, 1fr)", sm: "repeat(2, 1fr)",
  md: "repeat(3, 1fr)", lg: "repeat(4, 1fr)",
};

export default function ShopClient() {
  const { productList, loading, searchTerm, setSearchTerm } = useProducts();
  const c = useCart();
  const desktop = useMediaQuery("(min-width:900px)");

  const params = useSearchParams();
  // Shared with the header's search box, so one term drives both. It used to be
  // local state here while the header wrote to context, which meant the header
  // search filtered nothing at all.
  const query = searchTerm || "";
  const setQuery = setSearchTerm;
  // Links like /?category=Rockets arrive from the footer and category grid.
  const [category, setCategory] = useState(params.get("category") || "All");

  useEffect(() => {
    const c = params.get("category");
    if (c) setCategory(c);
  }, [params]);

  const [cartOpen, setCartOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [undo, setUndo] = useState(null);

  // Lock background scroll while either sheet is open
  useEffect(() => {
    const open = cartOpen || filtersOpen;
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [cartOpen, filtersOpen]);

  const categories = useMemo(() => {
    const counts = new Map();
    productList.forEach((p) => counts.set(p.category, (counts.get(p.category) || 0) + 1));
    return [["All", productList.length], ...[...counts.entries()].sort((a, b) => b[1] - a[1])];
  }, [productList]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return productList.filter(
      (p) =>
        (category === "All" || p.category === category) &&
        (!q || p.name.toLowerCase().includes(q))
    );
  }, [productList, category, query]);

  const handleAdd = (p) => {
    c.add(p, 1);
    setToast({ msg: `${p.name} added`, severity: "success" });
  };

  // Remove keeps the item and its position so it can be put back - the old
  // cart deleted immediately with no way to recover a mis-tap.
  const handleRemove = (item, index) => {
    c.remove(item.id);
    setUndo({ item, index });
  };

  const panelProps = {
    ...c,
    products: productList,
    onQty: c.setQty,
    onAdjust: c.adjust,
    onRemove: handleRemove,
    onAdd: handleAdd,
    onKeepShopping: () => setCartOpen(false),
  };

  const pick = (name) => { setCategory(name); setFiltersOpen(false); };

  const categoryList = (
    <Stack gap={0.25}>
      {categories.map(([name, n]) => {
        const on = category === name;
        return (
          <Stack
            key={name}
            component="button"
            onClick={() => pick(name)}
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            gap={1}
            aria-current={on ? "true" : undefined}
            sx={{
              width: "100%", textAlign: "left", cursor: "pointer",
              border: "none", font: "inherit",
              px: 1.5, py: 1.05,
              borderRadius: "var(--radius)",
              backgroundColor: on ? "var(--primary-color)" : "transparent",
              color: on ? "#fff" : "var(--text-color)",
              transition: "background-color var(--transition), color var(--transition)",
              "&:hover": {
                backgroundColor: on ? "var(--primary-color)" : "var(--primary-soft)",
              },
            }}
          >
            <Typography fontSize={13.5} fontWeight={on ? 800 : 600} noWrap>
              {name}
            </Typography>
            <Typography
              fontSize={11}
              fontWeight={800}
              sx={{
                px: 0.85, py: 0.15, borderRadius: "var(--radius-pill)", flexShrink: 0,
                backgroundColor: on ? "rgba(255,255,255,.22)" : "var(--surface-muted)",
                color: on ? "#fff" : "var(--text-color-secondary)",
              }}
            >
              {n}
            </Typography>
          </Stack>
        );
      })}
    </Stack>
  );

  return (
    <main style={{ width: "100%", display: "flex", justifyContent: "center" }}>
      <Stack
        direction="row"
        width="100%"
        maxWidth="var(--max-width)"
        px={{ xs: 2, md: 4 }}
        gap={{ md: 4 }}
        alignItems="flex-start"
        id="catalogue"
        sx={{ scrollMarginTop: "calc(var(--header-h) + 8px)" }}
      >
        {/* Standing category rail. Sticky, so the whole range stays reachable
            however far down the grid you are. */}
        <Box
          component="aside"
          sx={{
            display: { xs: "none", md: "block" },
            width: 230, flexShrink: 0,
            position: "sticky", top: "calc(var(--header-h) + 20px)",
            maxHeight: "calc(100vh - var(--header-h) - 40px)",
            overflowY: "auto", py: 3,
          }}
        >
          <Typography
            fontSize={11}
            fontWeight={800}
            letterSpacing={0.7}
            textTransform="uppercase"
            color="var(--text-color-trinary)"
            sx={{ px: 1.5, mb: 1 }}
          >
            Categories
          </Typography>
          {categoryList}
        </Box>

        <Box flex={1} minWidth={0} pt={{ xs: 2.5, md: 3 }} pb={{ xs: 2, md: 3 }}>
          <Stack
            direction="row"
            alignItems="baseline"
            justifyContent="space-between"
            gap={1}
            mb={1.75}
            flexWrap="wrap"
          >
            <Stack direction="row" alignItems="center" gap={1.25} minWidth={0}>
              <Button
                onClick={() => setFiltersOpen(true)}
                startIcon={<TuneRoundedIcon sx={{ fontSize: 18 }} />}
                sx={{
                  display: { xs: "inline-flex", md: "none" },
                  flexShrink: 0, textTransform: "none", fontWeight: 800, fontSize: 13,
                  px: 1.5, py: 0.7, borderRadius: "var(--radius-pill)",
                  color: "var(--primary-color)",
                  border: "1.5px solid var(--primary-border)",
                  backgroundColor: "var(--surface)",
                }}
              >
                {category === "All" ? "Filter" : category}
              </Button>
              <Typography component="h2" fontSize={{ xs: 20, md: 26 }} fontWeight={800} color="var(--text-color)" noWrap>
                {category === "All" ? "Every cracker we stock" : category}
              </Typography>
            </Stack>
            {!loading && (
              <Typography fontSize={13} color="var(--text-color-secondary)" fontWeight={600}>
                {shown.length} {shown.length === 1 ? "product" : "products"}
                {query ? ` matching “${query}”` : ""}
              </Typography>
            )}
          </Stack>

          {loading ? (
            /* Skeletons in the grid's own shape, so the layout does not jump
               when the products land. */
            <Box sx={{ display: "grid", gridTemplateColumns: GRID_COLS, gap: 2 }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <Stack key={i} gap={1} sx={{ p: 1.25, borderRadius: "var(--radius-lg)", border: "1px solid var(--border)" }}>
                  <Skeleton variant="rounded" sx={{ width: "100%", aspectRatio: "1 / 1", borderRadius: "var(--radius)" }} />
                  <Skeleton variant="text" width="40%" height={12} />
                  <Skeleton variant="text" width="90%" height={18} />
                  <Skeleton variant="text" width="55%" height={20} />
                  <Skeleton variant="rounded" height={32} sx={{ borderRadius: "var(--radius-pill)" }} />
                </Stack>
              ))}
            </Box>
          ) : shown.length === 0 ? (
            <Stack alignItems="center" py={9} gap={1.25} textAlign="center">
              <Box sx={{ fontSize: 34 }}>🔍</Box>
              <Typography fontWeight={800} color="var(--text-color)">
                Nothing matches that
              </Typography>
              <Typography fontSize={13} color="var(--text-color-secondary)" maxWidth={340}>
                {query
                  ? `No products match “${query}”${category !== "All" ? ` in ${category}` : ""}.`
                  : `There are no products in ${category} right now.`}
              </Typography>
              <Button
                onClick={() => { setQuery(""); setCategory("All"); }}
                sx={{
                  mt: 0.5, textTransform: "none", fontWeight: 800, fontSize: 13.5,
                  px: 2.5, py: 0.9, borderRadius: "var(--radius-pill)",
                  color: "var(--primary-color)", border: "1.5px solid var(--primary-color)",
                  "&:hover": { backgroundColor: "var(--primary-color)", color: "#fff" },
                }}
              >
                Show all products
              </Button>
            </Stack>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: GRID_COLS,
                gap: 2,
                pb: { xs: 12, md: 6 }, // room for the floating cart control
              }}
            >
              {shown.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  line={c.inCart(p.id)}
                  onAdd={handleAdd}
                  onQty={c.setQty}
                  onAdjust={c.adjust}
                />
              ))}
            </Box>
          )}
        </Box>
      </Stack>

      {/* Floating cart. Out of the layout entirely, so filling it never
          reflows the grid the way a pinned rail did. */}
      {c.itemCount > 0 && (
        <Stack
          direction="row"
          alignItems="center"
          gap={1.5}
          onClick={() => setCartOpen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setCartOpen(true); }}
          sx={{
            position: "fixed", zIndex: 1200, cursor: "pointer",
            // Full-width bar on a phone, a pill in the corner on a desktop.
            left: { xs: 0, md: "auto" },
            right: { xs: 0, md: 28 },
            bottom: { xs: 0, md: 28 },
            borderRadius: { xs: 0, md: "var(--radius-pill)" },
            px: { xs: 2, md: 2.5 }, py: { xs: 1.4, md: 1.5 },
            justifyContent: { xs: "space-between", md: "flex-start" },
            backgroundColor: "var(--glass-green)",
            backdropFilter: "var(--glass-blur)",
            WebkitBackdropFilter: "var(--glass-blur)",
            boxShadow: "0 8px 30px rgba(26,77,46,.34)",
            transition: "transform var(--transition)",
            "&:hover": { transform: { md: "translateY(-2px)" } },
          }}
        >
          <Stack direction="row" alignItems="center" gap={1.5}>
            <Badge
              badgeContent={c.itemCount}
              sx={{ "& .MuiBadge-badge": { backgroundColor: "var(--secondary-light)", color: "#1a1a1a", fontWeight: 800 } }}
            >
              <ShoppingCartRoundedIcon sx={{ color: "#fff" }} />
            </Badge>
            <Stack>
              <Typography fontSize={15} fontWeight={800} color="#fff" lineHeight={1.15}>
                ₹{c.total.toLocaleString("en-IN")}
              </Typography>
              {!c.meetsMinimum && (
                <Typography fontSize={10.5} color="var(--secondary-light)" fontWeight={700}>
                  ₹{c.shortBy.toLocaleString("en-IN")} to checkout
                </Typography>
              )}
            </Stack>
          </Stack>
          <Typography fontSize={13.5} fontWeight={800} color="#fff" sx={{ ml: { md: 1 } }}>
            View cart →
          </Typography>
        </Stack>
      )}

      {/* Cart: a side panel on desktop, a bottom sheet on a phone. */}
      <Drawer
        anchor={desktop ? "right" : "bottom"}
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: "100%", md: 400 },
            maxHeight: { xs: "88vh", md: "100%" },
            borderTopLeftRadius: { xs: 20, md: 0 },
            borderTopRightRadius: { xs: 20, md: 0 },
            display: "flex", flexDirection: "column",
            backgroundColor: "var(--glass-bg-strong)",
            backdropFilter: "var(--glass-blur)",
            WebkitBackdropFilter: "var(--glass-blur)",
          },
        }}
      >
        {!desktop && (
          <Box sx={{ width: 38, height: 4, borderRadius: 99, backgroundColor: "var(--border-strong)", mx: "auto", mt: 1.25 }} />
        )}
        {desktop && (
          <Stack direction="row" justifyContent="flex-end" sx={{ p: 1, pb: 0 }}>
            <IconButton onClick={() => setCartOpen(false)} aria-label="close cart" size="small">
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
        )}
        <Box sx={{ overflowY: "auto", flex: 1, minHeight: 0 }}>
          <CartPanel {...panelProps} embedded />
        </Box>
      </Drawer>

      {/* Categories on a phone, where the rail is hidden. */}
      <Drawer
        anchor="left"
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        PaperProps={{ sx: { width: "80%", maxWidth: 320, p: 2 } }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
          <Typography fontSize={16} fontWeight={800} color="var(--text-color)">Categories</Typography>
          <IconButton onClick={() => setFiltersOpen(false)} aria-label="close categories" size="small">
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
        {categoryList}
      </Drawer>

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={1600}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{ mb: { xs: 9, md: 2 } }}
      >
        <Alert severity={toast?.severity || "success"} variant="filled" sx={{ fontWeight: 700 }}>
          {toast?.msg}
        </Alert>
      </Snackbar>

      {/* Undo window for accidental removals */}
      <Snackbar
        open={Boolean(undo)}
        autoHideDuration={5000}
        onClose={() => setUndo(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{ mb: { xs: 9, md: 2 } }}
        message={undo ? `${undo.item.name} removed` : ""}
        action={
          <Button
            size="small"
            onClick={() => { c.restore(undo.item, undo.index); setUndo(null); }}
            sx={{ color: "var(--secondary-light)", fontWeight: 800, textTransform: "none" }}
          >
            UNDO
          </Button>
        }
      />
    </main>
  );
}
