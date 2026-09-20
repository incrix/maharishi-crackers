"use client";
import { useMemo, useState } from "react";
import { Stack, Typography, Box, Checkbox, LinearProgress, Chip, Button, Tooltip, InputBase, IconButton } from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import RemoveShoppingCartRoundedIcon from "@mui/icons-material/RemoveShoppingCartRounded";
import UndoRoundedIcon from "@mui/icons-material/UndoRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { assetUrl } from "@/util/config";

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

/**
 * The packing checklist - the screen the owner actually works from.
 *
 * Rows are large and tappable because this gets used standing at a table with
 * a phone in one hand. A line can be ticked, marked out of stock, or replaced
 * with another product; a line the packer can't fill never blocks the order
 * from being completed.
 */
export default function PackingList({ items, onToggle, onTickAll, onUnavailable, onSubstitute, onRemove, onAdd, busy, locked }) {
  // A line is settled once it's packed, or once the packer has recorded that
  // it couldn't be filled. Both count as "dealt with".
  const settled = items.filter((i) => i.packed || (i.unavailable && !i.substitute)).length;
  const pct = items.length ? (settled / items.length) * 100 : 0;
  const short = items.filter((i) => i.unavailable).length;

  /**
   * Finding one line on a long bill.
   *
   * A 27-line order does not fit on a phone screen, so "is the Laxmi on this
   * bill, and how many" meant scrolling the whole list twice. Behind a button
   * rather than always open: most bills are short enough not to need it, and
   * a permanent field on every order is a permanent thing to scroll past.
   */
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const shown = useMemo(() => {
    if (!q) return items;
    return items.filter((i) =>
      [i.name, i.category, i.substitute?.name].filter(Boolean)
        .some((t) => String(t).toLowerCase().includes(q))
    );
  }, [items, q]);

  /**
   * Counts and progress stay on the whole bill, never on what is filtered.
   *
   * "3/3 done" while a search hides the other 24 lines would be a lie the
   * packer acts on - the bar has to mean the order, not the view.
   *
   * Ticking, on the other hand, follows the search on purpose: filter to
   * "sparkler" and tick all sparklers. The label says which it is about to do.
   */
  const tickTarget = (q ? shown : items).filter((i) => !(i.unavailable && !i.substitute));
  const allTicked = tickTarget.length > 0 && tickTarget.every((i) => i.packed);

  return (
    <Stack gap={1.5}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
        <Typography fontSize={14} fontWeight={800} color="var(--text-color)">Packing list</Typography>
        <Stack direction="row" alignItems="center" gap={1.25}>
          <Typography fontSize={12} fontWeight={700} color="var(--text-color-secondary)">
            {settled}/{items.length} done{short ? ` · ${short} short` : ""}
          </Typography>
          {/* Editing a raised bill. Available in every state except cancelled,
              which the server refuses - a dispatched order can still be
              corrected if the customer rings back. */}
          {onAdd && (
            <Button
              size="small"
              onClick={onAdd}
              disabled={busy}
              startIcon={<AddRoundedIcon sx={{ fontSize: 16 }} />}
              sx={{
                textTransform: "none", fontWeight: 800, fontSize: 12, py: 0.25, px: 1.25,
                minWidth: 0, borderRadius: "var(--radius-pill)", color: "#fff",
                backgroundColor: "var(--primary-color)",
                "&:hover": { backgroundColor: "var(--primary-dark)" },
              }}
            >
              Add product
            </Button>
          )}
          {items.length > 4 && (
            <Tooltip title="Search this bill">
              <IconButton
                size="small"
                aria-label="search this bill"
                onClick={() => { setSearching((v) => !v); if (searching) setQuery(""); }}
                sx={{
                  p: 0.5, borderRadius: "var(--radius-sm)",
                  color: searching || q ? "var(--primary-color)" : "var(--text-color-secondary)",
                  backgroundColor: searching || q ? "var(--primary-soft)" : "transparent",
                }}
              >
                <SearchRoundedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          )}
          {onTickAll && !locked && (
            <Button
              size="small"
              onClick={() => onTickAll(q ? shown : null)}
              startIcon={<DoneAllRoundedIcon sx={{ fontSize: 15 }} />}
              sx={{
                textTransform: "none", fontWeight: 800, fontSize: 12, py: 0.25, px: 1.25,
                minWidth: 0, borderRadius: "var(--radius-pill)", color: "var(--primary-color)",
                border: "1px solid var(--primary-color)",
                "&:hover": { backgroundColor: "var(--primary-soft)" },
              }}
            >
              {allTicked ? "Clear" : "Tick"} {q ? `${tickTarget.length} shown` : "all"}
            </Button>
          )}
        </Stack>
      </Stack>

      {searching && (
        <Stack
          direction="row" alignItems="center" gap={1}
          sx={{ border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)", px: 1.25, py: 0.5,
                "&:focus-within": { borderColor: "var(--primary-color)" } }}
        >
          <SearchRoundedIcon sx={{ fontSize: 17, color: "var(--text-color-trinary)" }} />
          <InputBase
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find an item on this bill..."
            sx={{ flex: 1, fontSize: 13, fontWeight: 600 }}
          />
          {q && (
            <Typography fontSize={11.5} fontWeight={700} color="var(--text-color-secondary)" sx={{ whiteSpace: "nowrap" }}>
              {shown.length} of {items.length}
            </Typography>
          )}
          <IconButton size="small" aria-label="close search"
            onClick={() => { setQuery(""); setSearching(false); }} sx={{ p: 0.25 }}>
            <CloseRoundedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Stack>
      )}

      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{
          height: 8, borderRadius: 99, backgroundColor: "#eee9dd",
          "& .MuiLinearProgress-bar": {
            borderRadius: 99,
            backgroundColor: pct === 100 ? "var(--success)" : "var(--primary-color)",
          },
        }}
      />

      <Stack gap={0.75}>
        {q && shown.length === 0 && (
          <Typography fontSize={12.5} fontWeight={600} color="var(--text-color-secondary)" sx={{ py: 2, textAlign: "center" }}>
            Nothing on this bill matches &ldquo;{query.trim()}&rdquo;.
          </Typography>
        )}
        {shown.map((it) => {
          const dropped = it.unavailable && !it.substitute;
          const swapped = Boolean(it.substitute);

          return (
            <Stack
              key={it.id}
              gap={1}
              sx={{
                p: 1, borderRadius: "var(--radius)",
                border: "1px solid",
                borderColor: dropped ? "#ffd4d4" : swapped ? "#ffe2b0" : it.packed ? "#b6e7c9" : "var(--border)",
                backgroundColor: dropped ? "#fff6f6" : swapped ? "#fffaf0" : it.packed ? "#f3fbf6" : "#fff",
                opacity: busy ? 0.6 : 1,
              }}
            >
              <Stack direction="row" alignItems="center" gap={1.25}>
                <Checkbox
                  checked={Boolean(it.packed)}
                  disabled={dropped}
                  onChange={() => onToggle(it)}
                  disableRipple
                  inputProps={{ "aria-label": `packed: ${it.name}` }}
                  sx={{ p: 0.5, color: "var(--text-color-trinary)", "&.Mui-checked": { color: "var(--success)" } }}
                />

                <Box component="img" src={assetUrl(it.image)} alt=""
                  sx={{ width: 42, height: 42, borderRadius: "var(--radius-sm)", objectFit: "cover", flexShrink: 0, backgroundColor: "#f4f0e6" }} />

                <Stack flex={1} minWidth={0}>
                  <Typography
                    fontSize={13.5} fontWeight={800} color="var(--text-color)"
                    sx={{ lineHeight: 1.3, textDecoration: it.packed || dropped || swapped ? "line-through" : "none",
                          opacity: dropped || swapped ? 0.65 : 1 }}
                  >
                    {it.name}
                  </Typography>
                  <Typography fontSize={11.5} color="var(--text-color-secondary)" fontWeight={600}>
                    {it.category} · {inr(it.unitPrice)} each
                  </Typography>
                </Stack>

                <Chip
                  label={`× ${it.count}`}
                  sx={{
                    fontWeight: 800, fontSize: 13, height: 30, minWidth: 52,
                    backgroundColor: it.packed ? "var(--success-soft)" : "var(--primary-soft)",
                    color: it.packed ? "var(--success-ink)" : "var(--primary-color)",
                    opacity: dropped || swapped ? 0.5 : 1,
                  }}
                />
              </Stack>

              {/* Replacement chosen for this line */}
              {swapped && (
                <Stack direction="row" alignItems="center" gap={1.25}
                  sx={{ ml: 4.5, p: 1, borderRadius: "var(--radius-sm)", backgroundColor: "#fff", border: "1px dashed var(--border-strong)" }}>
                  <SwapHorizRoundedIcon sx={{ fontSize: 17, color: "var(--warning)", flexShrink: 0 }} />
                  <Box component="img" src={assetUrl(it.substitute.image)} alt=""
                    sx={{ width: 32, height: 32, borderRadius: 6, objectFit: "cover", flexShrink: 0, backgroundColor: "#f4f0e6" }} />
                  <Stack flex={1} minWidth={0}>
                    <Typography fontSize={12.5} fontWeight={800} color="var(--text-color)" noWrap>
                      {it.substitute.name}
                    </Typography>
                    <Typography fontSize={11} color="var(--text-color-secondary)" fontWeight={600}>
                      Replacement · {inr(it.substitute.unitPrice)} each
                    </Typography>
                  </Stack>
                  <Chip label={`× ${it.substitute.count}`}
                    sx={{ fontWeight: 800, fontSize: 12, height: 26, backgroundColor: "var(--warning-soft)", color: "var(--warning)" }} />
                </Stack>
              )}

              {dropped && (
                <Typography fontSize={11.5} fontWeight={700} color="var(--danger-ink)" sx={{ ml: 4.5 }}>
                  Out of stock — removed from the order ({inr(it.total)} off the total)
                </Typography>
              )}

              {/* Actions */}
              <Stack direction="row" gap={0.75} sx={{ ml: 4.5 }} flexWrap="wrap">
                {!it.unavailable ? (
                  <Tooltip title="Shelf is empty for this item">
                    <Button size="small" disabled={busy} onClick={() => onUnavailable(it, true)}
                      startIcon={<RemoveShoppingCartRoundedIcon sx={{ fontSize: 14 }} />} sx={miniBtn}>
                      Out of stock
                    </Button>
                  </Tooltip>
                ) : (
                  <Button size="small" disabled={busy} onClick={() => onUnavailable(it, false)}
                    startIcon={<UndoRoundedIcon sx={{ fontSize: 14 }} />} sx={miniBtn}>
                    Back in stock
                  </Button>
                )}

                <Button size="small" disabled={busy} onClick={() => onSubstitute(it)}
                  startIcon={<SwapHorizRoundedIcon sx={{ fontSize: 14 }} />}
                  sx={{ ...miniBtn, color: "var(--primary-color)", borderColor: "#cfe0c8" }}>
                  {swapped ? "Change replacement" : "Replace"}
                </Button>

                {/* Distinct from "out of stock": that records a line the shop
                    could not fill and keeps it on the bill at zero. This takes
                    the line off the order altogether. */}
                {onRemove && (
                  <Tooltip title="Take this line off the order entirely">
                    <Button size="small" disabled={busy} onClick={() => onRemove(it)}
                      startIcon={<DeleteOutlineRoundedIcon sx={{ fontSize: 14 }} />}
                      sx={{ ...miniBtn, color: "var(--danger-ink)", borderColor: "var(--danger-soft)" }}>
                      Remove
                    </Button>
                  </Tooltip>
                )}
              </Stack>
            </Stack>
          );
        })}
        {q && shown.length > 0 && shown.length < items.length && (
          <Typography fontSize={11.5} fontWeight={700} color="var(--text-color-secondary)" sx={{ pt: 0.5, textAlign: "center" }}>
            {items.length - shown.length} more line{items.length - shown.length === 1 ? "" : "s"} on this bill are hidden by the search
          </Typography>
        )}
      </Stack>
    </Stack>
  );
}

const miniBtn = {
  textTransform: "none", fontWeight: 700, fontSize: 11.5,
  py: 0.25, px: 1, borderRadius: "var(--radius-sm)", minWidth: 0,
  color: "var(--text-color-secondary)",
  border: "1px solid var(--border)",
  "&:hover": { backgroundColor: "var(--surface-muted)" },
};
