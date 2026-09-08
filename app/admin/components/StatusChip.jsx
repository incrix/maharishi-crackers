"use client";
import { Chip } from "@mui/material";

/**
 * Order status styling.
 *
 * These read as a progression, so they are not four arbitrary hues: an
 * untouched order is neutral, work-in-progress is amber, and the two finished
 * states are the brand greens - light for packed, full brand green for
 * dispatched. Every pair is a tinted ground with its own dark ink, so the label
 * carries the meaning and colour only reinforces it.
 */
export const STATUS_STYLE = {
  new:        { label: "New",        bg: "#eee9dd", fg: "#4a4a4a" },
  packing:    { label: "Packing",    bg: "#fff8e1", fg: "#b26a00" },
  packed:     { label: "Packed",     bg: "#e9f8ef", fg: "#14713c" },
  dispatched: { label: "Dispatched", bg: "#e8f0e4", fg: "#1a4d2e" },
  cancelled:  { label: "Cancelled",  bg: "#f3f3f3", fg: "#777777" },
};

export default function StatusChip({ status, size = "small" }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.new;
  return (
    <Chip
      label={s.label}
      size={size}
      sx={{ height: 21, fontSize: 10.5, fontWeight: 800, backgroundColor: s.bg, color: s.fg }}
    />
  );
}
