"use client";
import {
  Dialog, DialogTitle, DialogContent, Stack, Box, Typography, InputBase,
  IconButton, Button, Divider, Chip,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useMemo, useState, useEffect } from "react";
import { useProducts } from "@/context/ProductContext";
import { assetUrl } from "@/util/config";
import { unitPrice } from "@/util/cart";
import QtyStepper from "@/app/components/commerce/QtyStepper";

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

/**
 * Add a product to a bill that has already been raised.
 *
 * Deliberately shows what the order total becomes before anything is committed:
 * the customer has usually already been quoted a figure, so the person adding a
 * line needs to see the new one, not discover it afterwards.
 *
 * Products already on the order are shown as such - picking one raises that
 * line rather than creating a duplicate, which is what the server does too.
 */
export default function AddItemPicker({ open, order, onClose, onAdd }) {
  const { productList } = useProducts();
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState(null);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (!open) { setQuery(""); setPicked(null); setQty(1); }
  }, [open]);

  const onOrder = useMemo(
    () => new Map((order?.items || []).map((it) => [String(it.id), it])),
    [order]
  );

  const options = useMemo(() => {
    const q = query.trim().toLowerCase();
    return productList
      .filter((p) => (q ? p.name.toLowerCase().includes(q) : true))
      .slice(0, 60);
  }, [productList, query]);

  if (!order) return null;

  const price = picked ? unitPrice(picked) : 0;
  const addedValue = price * qty;
  const newTotal = (order.total || 0) + addedValue;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm"
      PaperProps={{ sx: { borderRadius: "var(--radius-lg)" } }}>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, pb: 1 }}>
        <Stack flex={1} minWidth={0}>
          <Typography fontSize={16} fontWeight={800} color="var(--text-color)">
            Add a product to {order.ref}
          </Typography>
          <Typography fontSize={11.5} color="var(--text-color-secondary)">
            Current total {inr(order.total)}
          </Typography>
        </Stack>
        <IconButton onClick={onClose} size="small" aria-label="close"><CloseRoundedIcon /></IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        <Box sx={{ p: 2, pb: 1 }}>
          <Stack direction="row" alignItems="center" gap={1}
            sx={{ border: "1.5px solid var(--border)", borderRadius: "var(--radius-pill)", px: 2, py: 0.75,
                  "&:focus-within": { borderColor: "var(--primary-color)" } }}>
            <SearchRoundedIcon sx={{ fontSize: 19, color: "var(--text-color-trinary)" }} />
            <InputBase autoFocus value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the catalogue…" sx={{ flex: 1, fontSize: 14, fontWeight: 600 }} />
          </Stack>
        </Box>

        <Stack sx={{ maxHeight: 320, overflowY: "auto" }}>
          {options.length === 0 && (
            <Typography fontSize={13} color="var(--text-color-secondary)" textAlign="center" py={4}>
              Nothing matches that.
            </Typography>
          )}
          {options.map((p) => {
            const already = onOrder.get(String(p.id));
            const on = picked?.id === p.id;
            const out = p.countInStock <= 0;
            return (
              <Stack key={p.id} direction="row" alignItems="center" gap={1.5}
                onClick={() => setPicked(p)}
                sx={{ px: 2, py: 1, cursor: "pointer",
                      backgroundColor: on ? "var(--primary-soft)" : "transparent",
                      borderLeft: "3px solid", borderColor: on ? "var(--primary-color)" : "transparent",
                      "&:hover": { backgroundColor: on ? "var(--primary-soft)" : "var(--surface-muted)" } }}>
                <Box component="img" src={assetUrl(p.image?.[0])} alt=""
                  sx={{ width: 38, height: 38, borderRadius: "var(--radius-sm)", objectFit: "cover",
                        backgroundColor: "var(--surface-muted)", flexShrink: 0 }} />
                <Stack flex={1} minWidth={0}>
                  <Typography fontSize={13.5} fontWeight={700} color="var(--text-color)" noWrap>{p.name}</Typography>
                  <Stack direction="row" gap={0.75} alignItems="center">
                    <Typography fontSize={11} color="var(--text-color-secondary)">{p.category}</Typography>
                    {already && (
                      <Chip size="small" label={`on order ×${already.count}`}
                        sx={{ height: 17, fontSize: 9.5, fontWeight: 800,
                              backgroundColor: "var(--primary-soft)", color: "var(--primary-color)" }} />
                    )}
                    {out && (
                      <Chip size="small" label="out of stock"
                        sx={{ height: 17, fontSize: 9.5, fontWeight: 800,
                              backgroundColor: "var(--danger-soft)", color: "var(--danger-ink)" }} />
                    )}
                  </Stack>
                </Stack>
                <Typography fontSize={13.5} fontWeight={800} color="var(--text-color)">
                  {inr(unitPrice(p))}
                </Typography>
              </Stack>
            );
          })}
        </Stack>

        <Divider />

        <Stack direction="row" alignItems="center" gap={1.5} sx={{ p: 2, flexWrap: "wrap" }}>
          <QtyStepper value={qty} onChange={setQty} onAdjust={(d) => setQty((q) => Math.max(1, q + d))} />
          <Stack flex={1} minWidth={140}>
            {picked ? (
              <>
                <Typography fontSize={13} fontWeight={800} color="var(--text-color)">
                  {onOrder.has(String(picked.id)) ? "Raises" : "Adds"} {inr(addedValue)}
                </Typography>
                <Typography fontSize={11.5} color="var(--text-color-secondary)">
                  {inr(order.total)} → <b>{inr(newTotal)}</b>
                </Typography>
              </>
            ) : (
              <Typography fontSize={12.5} color="var(--text-color-secondary)">
                Pick a product to add.
              </Typography>
            )}
          </Stack>
          <Button
            disabled={!picked}
            onClick={() => { onAdd({ productId: picked.id, count: qty }); onClose(); }}
            sx={{ textTransform: "none", fontWeight: 800, fontSize: 14, px: 2.5, py: 1,
                  borderRadius: "var(--radius-pill)", backgroundColor: "var(--primary-color)", color: "#fff",
                  "&:hover": { backgroundColor: "var(--primary-dark)" },
                  "&.Mui-disabled": { backgroundColor: "var(--border)", color: "var(--text-color-trinary)" } }}
          >
            Add to order
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
