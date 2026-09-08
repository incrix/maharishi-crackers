"use client";
import { useState } from "react";
import { Stack, Box, Typography, Chip, Tooltip } from "@mui/material";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import { panel } from "./RevenueChart";
import { channelBreakdown, channelsSince, adjustmentImpact, sinceDays } from "@/util/analytics";

/**
 * Where the money came from.
 *
 * Counter and website are one pipeline once an order exists, so the panel had
 * no way to say which half of the business was working. Gross is what the
 * goods list at, net is what was charged, and the difference is the discount
 * given away - on an 80%-off price list that gap is the whole margin story.
 */

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const RANGES = [
  { key: 1, label: "Today" },
  { key: 7, label: "7 days" },
  { key: 30, label: "30 days" },
  { key: 0, label: "All time" },
];

export default function SalesBreakdown({ orders }) {
  const [days, setDays] = useState(0);
  const c = days ? channelsSince(orders, days) : channelBreakdown(orders);
  const adj = adjustmentImpact(sinceDays(orders, days));
  const share = c.posShare;
  // With no bills there is no proportion to draw. Rendering the bar anyway put
  // the whole track under one channel and read as "Website 100%", which claims
  // a split that does not exist.
  const hasSales = c.total.orders > 0;

  return (
    <Stack gap={1.5} sx={panel}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1} flexWrap="wrap">
        <Stack>
          <Typography fontSize={14} fontWeight={800} color="var(--text-color)">Sales</Typography>
          <Typography fontSize={11.5} color="var(--text-color-secondary)">
            Counter and website, cancelled orders excluded
          </Typography>
        </Stack>
        <Stack direction="row" gap={0.5}>
          {RANGES.map((r) => {
            const on = days === r.key;
            return (
              <Chip key={r.key} label={r.label} size="small" onClick={() => setDays(r.key)}
                sx={{ fontWeight: 800, fontSize: 11, cursor: "pointer",
                      backgroundColor: on ? "var(--primary-color)" : "var(--surface-muted)",
                      color: on ? "#fff" : "var(--text-color-secondary)",
                      "&:hover": { backgroundColor: on ? "var(--primary-color)" : "var(--border)" } }} />
            );
          })}
        </Stack>
      </Stack>

      {/* Net sales leads: it is the figure the owner actually banks. */}
      <Stack direction="row" alignItems="baseline" gap={1.5} flexWrap="wrap">
        <Stack>
          <Typography fontSize={11} fontWeight={800} textTransform="uppercase" letterSpacing={0.5} color="var(--text-color-secondary)">
            Net sales
          </Typography>
          <Typography fontSize={{ xs: 26, md: 30 }} fontWeight={800} color="var(--primary-color)" lineHeight={1.1}>
            {inr(c.total.net)}
          </Typography>
        </Stack>
        <Stack gap={0.25} sx={{ pb: 0.5 }}>
          <Typography fontSize={12} color="var(--text-color-secondary)">
            {c.total.orders} {c.total.orders === 1 ? "bill" : "bills"} · {c.total.units} units · avg {inr(c.total.avg)}
          </Typography>
          <Typography fontSize={12} color="var(--text-color-secondary)">
            {inr(c.total.gross)} at list, {inr(c.total.discount)} discount given
          </Typography>
        </Stack>
      </Stack>

      {/* One bar, two segments, with a 2px surface gap so the boundary reads
          even where the two fills meet. Each segment carries its own tooltip. */}
      {!hasSales ? (
        <Box
          sx={{
            py: 2, px: 1.5, borderRadius: "var(--radius)",
            border: "1px dashed var(--border-strong)",
            backgroundColor: "var(--surface-muted)", textAlign: "center",
          }}
        >
          <Typography fontSize={12.5} fontWeight={700} color="var(--text-color-secondary)">
            No bills in this period
          </Typography>
          <Typography fontSize={11.5} color="var(--text-color-trinary)">
            The counter/website split appears once there is a sale to divide.
          </Typography>
        </Box>
      ) : (
      <Stack gap={0.75}>
        <Box sx={{ display: "flex", height: 12, borderRadius: 99, overflow: "hidden", backgroundColor: "var(--surface-muted)" }}>
          <Tooltip title={`Retail counter · ${inr(c.pos.net)} · ${share}%`} arrow>
            <Box sx={{ width: `${share}%`, backgroundColor: "var(--series-counter)", cursor: "default" }} />
          </Tooltip>
          <Box sx={{ width: 2, backgroundColor: "var(--surface)", flexShrink: 0 }} />
          <Tooltip title={`Website · ${inr(c.online.net)} · ${100 - share}%`} arrow>
            <Box sx={{ flex: 1, backgroundColor: "var(--series-website)", cursor: "default" }} />
          </Tooltip>
        </Box>

        {/* Legend. The swatch carries identity; the text stays in ink, so the
            label is never colour-alone and stays legible for CVD readers. */}
        <Stack direction="row" justifyContent="space-between">
          <LegendKey color="var(--series-counter)" label={`Counter ${share}%`} />
          <LegendKey color="var(--series-website)" label={`Website ${100 - share}%`} />
        </Stack>
      </Stack>
      )}

      <Stack direction={{ xs: "column", sm: "row" }} gap={1.25}>
        <Channel icon={<StorefrontRoundedIcon sx={{ fontSize: 16 }} />} label="Retail counter" accent="var(--series-counter)" d={c.pos} />
        <Channel icon={<LanguageRoundedIcon sx={{ fontSize: 16 }} />} label="Website" accent="var(--series-website)" d={c.online} />
      </Stack>

      {(c.total.cancelled > 0 || adj.count > 0) && (
        <Stack gap={0.5} sx={{ pt: 1, borderTop: "1px solid var(--border)" }}>
          {c.total.cancelled > 0 && (
            <Line label={`Cancelled (${c.total.cancelled})`} value={`− ${inr(c.total.cancelledValue)}`} />
          )}
          {adj.count > 0 && (
            <Line label={`Changed by packing (${adj.count})`}
              value={`${adj.delta < 0 ? "−" : "+"} ${inr(Math.abs(adj.delta))}`} />
          )}
        </Stack>
      )}
    </Stack>
  );
}

function Channel({ icon, label, accent, d }) {
  return (
    <Stack flex={1} gap={0.5} sx={{ p: 1.25, borderRadius: "var(--radius)", border: "1px solid var(--border)", backgroundColor: "var(--surface-muted)" }}>
      <Stack direction="row" alignItems="center" gap={0.75}>
        <Box sx={{ color: accent, display: "flex" }}>{icon}</Box>
        <Typography fontSize={11.5} fontWeight={800} color="var(--text-color)">{label}</Typography>
      </Stack>
      <Typography fontSize={19} fontWeight={800} color="var(--text-color)" lineHeight={1.15}>{inr(d.net)}</Typography>
      <Typography fontSize={11} color="var(--text-color-secondary)">
        {d.orders} {d.orders === 1 ? "bill" : "bills"} · {d.units} units · avg {inr(d.avg)}
      </Typography>
      <Typography fontSize={11} color="var(--text-color-secondary)">
        {inr(d.discount)} discount off {inr(d.gross)}
      </Typography>
    </Stack>
  );
}

/**
 * A colour chip beside ink text. Identity is carried by the swatch, never by
 * colouring the words - coloured text is the thing that fails first for a
 * low-vision reader, and it is also unreadable at these weights.
 */
function LegendKey({ color, label }) {
  return (
    <Stack direction="row" alignItems="center" gap={0.625}>
      <Box sx={{ width: 9, height: 9, borderRadius: "2px", backgroundColor: color, flexShrink: 0 }} />
      <Typography fontSize={11} fontWeight={800} color="var(--text-color)">{label}</Typography>
    </Stack>
  );
}

const Line = ({ label, value }) => (
  <Stack direction="row" justifyContent="space-between">
    <Typography fontSize={12} color="var(--text-color-secondary)">{label}</Typography>
    <Typography fontSize={12} fontWeight={800} color="var(--text-color-secondary)">{value}</Typography>
  </Stack>
);
