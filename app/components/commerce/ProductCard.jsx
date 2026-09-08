"use client";
import { useState } from "react";
import { Stack, Typography, Button, Box, Chip } from "@mui/material";
import AddShoppingCartRoundedIcon from "@mui/icons-material/AddShoppingCartRounded";
import Link from "next/link";
import { assetUrl, productImage } from "@/util/config";
import { productSlug } from "@/util/site";
import QtyStepper from "./QtyStepper";
import { unitPrice } from "@/util/cart";

/**
 * Product tile.
 *
 * Key change from the old card: once an item is in the cart the button becomes
 * the quantity control in place, so adjusting counts never requires a trip to
 * the cart page. The card also reflects cart state live, driven by the shared
 * `cart:updated` event.
 */
export default function ProductCard({ product, line, onAdd, onQty, onAdjust }) {
  const price = unitPrice(product);
  const out = product.countInStock <= 0;
  const added = Boolean(line);
  const saving = Math.max(0, (product.price || 0) - price);

  /**
   * Not every product has a photo, and a missing Cloudinary asset renders as a
   * broken-image glyph. A placeholder tile keeps the grid even instead.
   */
  const raw = product.image?.[0];
  // Tiles render ~265px wide at the widest breakpoint; 400/800 covers 1x and 2x.
  const src = productImage(raw, 400);
  const src2x = productImage(raw, 800);
  const [broken, setBroken] = useState(false);
  const showImage = Boolean(src) && !broken;

  return (
    <Stack
      gap={1}
      sx={{
        p: 1.25,
        borderRadius: "var(--radius-lg)",
        border: added ? "1.5px solid var(--primary-color)" : "1px solid var(--border)",
        backgroundColor: "var(--surface)",
        position: "relative",
        // The lift is tinted with the brand green rather than neutral black, so
        // the shadow belongs to the palette instead of greying the card out.
        transition: "transform var(--transition), box-shadow var(--transition), border-color var(--transition)",
        boxShadow: added ? "0 4px 18px rgba(26,77,46,.10)" : "none",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 12px 28px rgba(26,77,46,.13)",
          borderColor: added ? "var(--primary-color)" : "var(--primary-border)",
        },
        opacity: out ? 0.55 : 1,
      }}
    >
      {product.discount > 0 && (
        <Chip
          label={`${product.discount}% OFF`}
          size="small"
          sx={{
            position: "absolute", top: 8, left: 8, zIndex: 1,
            height: 21, fontSize: 10, fontWeight: 800, letterSpacing: 0.2,
            color: "#fff", backgroundColor: "var(--badge-color)",
            boxShadow: "0 2px 8px rgba(184,150,62,.35)",
          }}
        />
      )}

      {/* Links to the product's own page: needed for customers to read the
          detail, and it is the internal linking that gets those 145 URLs
          crawled in the first place. */}
      <Box
        component={Link}
        href={`/product/${productSlug(product)}`}
        sx={{ display: "block" }}
      >
        {showImage ? (
          <Box
            component="img"
            src={src}
            srcSet={src2x ? `${src} 1x, ${src2x} 2x` : undefined}
            sizes="(max-width: 900px) 50vw, 265px"
            onError={() => setBroken(true)}
            decoding="async"
            alt={`${product.name} - ${product.category} fireworks from Maharishi Crackers, Sivakasi`}
            loading="lazy"
            sx={{
              width: "100%", aspectRatio: "1 / 1", objectFit: "cover",
              borderRadius: "10px", backgroundColor: "var(--surface-muted)", display: "block",
            }}
          />
        ) : (
          <Stack
            alignItems="center"
            justifyContent="center"
            gap={0.5}
            sx={{
              width: "100%", aspectRatio: "1 / 1", borderRadius: "10px",
              backgroundColor: "var(--surface-muted)",
              border: "1px dashed var(--border-strong)",
            }}
          >
            <Box sx={{ fontSize: 26, lineHeight: 1 }} aria-hidden>🎆</Box>
            <Typography fontSize={10.5} fontWeight={700} color="var(--text-color-trinary)">
              Photo coming soon
            </Typography>
          </Stack>
        )}
      </Box>

      <Typography fontSize={10.5} fontWeight={700} color="var(--text-color-trinary)">
        {product.category}
      </Typography>

      <Typography
        component={Link}
        href={`/product/${productSlug(product)}`}
        fontSize={13.5}
        fontWeight={800}
        color="var(--text-color)"
        sx={{
          lineHeight: 1.3, minHeight: 35,
          display: "-webkit-box", WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical", overflow: "hidden",
          "&:hover": { color: "var(--primary-color)" },
        }}
      >
        {product.name}
      </Typography>

      <Stack direction="row" alignItems="baseline" gap={0.75} flexWrap="wrap">
        <Typography fontSize={16} fontWeight={800} color="var(--primary-color)">
          ₹{price.toLocaleString("en-IN")}
        </Typography>
        {saving > 0 && (
          <>
            <Typography
              fontSize={11.5}
              fontWeight={600}
              color="var(--text-color-trinary)"
              sx={{ textDecoration: "line-through" }}
            >
              ₹{product.price.toLocaleString("en-IN")}
            </Typography>
            <Typography fontSize={11} fontWeight={800} color="var(--success)">
              save ₹{saving.toLocaleString("en-IN")}
            </Typography>
          </>
        )}
      </Stack>

      {out ? (
        <Typography fontSize={12} fontWeight={800} color="var(--danger)" py={0.75}>
          Out of stock
        </Typography>
      ) : added ? (
        // In-place editing - no need to open the cart to change quantity
        <Stack direction="row" alignItems="center" justifyContent="space-between" gap={0.5}>
          <QtyStepper
            size="sm"
            value={line.count}
            onChange={(q) => onQty(product.id, q)}
            onAdjust={(d) => onAdjust(product.id, d)}
          />
          <Typography fontSize={11} fontWeight={800} color="var(--success)">
            In cart
          </Typography>
        </Stack>
      ) : (
        <Button
          onClick={() => onAdd(product)}
          startIcon={<AddShoppingCartRoundedIcon sx={{ fontSize: 16 }} />}
          sx={{
            textTransform: "none", fontWeight: 800, fontSize: 13,
            py: 0.8, borderRadius: "var(--radius-pill)",
            color: "var(--primary-color)",
            border: "1.5px solid var(--primary-color)",
            "&:hover": { backgroundColor: "var(--primary-color)", color: "#fff" },
          }}
        >
          Add to cart
        </Button>
      )}
    </Stack>
  );
}
