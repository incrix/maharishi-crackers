"use client";
import { Stack, Typography, Box, Button, InputBase, Tooltip } from "@mui/material";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import PriceChangeRoundedIcon from "@mui/icons-material/PriceChangeRounded";
import { useState } from "react";
import { basisLabel } from "@/util/pricing";

/**
 * The rates an order is being edited against.
 *
 * Two different things are on show, and conflating them is what made a single
 * chip confusing:
 *
 *   "Billed on"      what the customer was originally charged. A fact about the
 *                    order, not a setting, so it is never editable. A counter
 *                    bill written before the concession was recorded has it read
 *                    back off its own lines, and says so.
 *
 *   "Charge new on"  what the NEXT line added will cost. Starts at whatever the
 *                    bill was written on, because that is nearly always right,
 *                    but the biller can move it - someone adding to an old order
 *                    at today's counter rate is an ordinary thing to want.
 *
 * Moving the second away from the first is called out rather than left to be
 * noticed, because the resulting bill would carry two rates at once.
 *
 * Repricing the whole order is deliberately a separate, confirmed action: it
 * restates what the customer owes for things they have already been quoted.
 *
 * There is one price list in this app, so unlike the sister project there is no
 * list to choose - the concession is the whole of the basis, and a website order
 * has nothing to move at all.
 */
export default function BillingBasis({
  primary,      // { pos, extra, recorded, inferred } - how the bill was written
  extra,        // current ExtraDiscount for new lines (string, as typed)
  onExtra,      // (string) => void
  onReprice,    // ({ extraDiscount }) => void
  busy,
}) {
  const [confirming, setConfirming] = useState(false);

  const extraNum = Math.min(95, Math.max(0, Number(extra) || 0));
  const deviates = primary.pos && extraNum !== (primary.extra || 0);

  return (
    <Stack
      gap={1.25}
      sx={{
        p: 1.5, borderRadius: "var(--radius)",
        border: `1px solid ${deviates ? "var(--warning)" : "var(--border)"}`,
        backgroundColor: deviates ? "#fffaf2" : "var(--surface-muted)",
      }}
    >
      {/* ---- what the bill was written on ---- */}
      <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
        <ReceiptLongRoundedIcon sx={{ fontSize: 16, color: "var(--text-color-trinary)" }} />
        <Typography
          fontSize={11} fontWeight={800} color="var(--text-color-trinary)"
          sx={{ textTransform: "uppercase", letterSpacing: 0.4 }}
        >
          Billed on
        </Typography>
        <Tooltip
          title={
            primary.recorded
              ? "Recorded on the order when the bill was written"
              : primary.inferred
                ? "Not recorded - read back from the rates on this bill's own lines. Wrong if a product has been repriced since."
                : "This bill predates the concession being recorded, and it could not be read back from its lines."
          }
        >
          <Typography
            fontSize={13} fontWeight={800}
            color={primary.recorded ? "var(--text-color)" : "#b26a00"}
            sx={{ borderBottom: "1px dotted currentColor", cursor: "help" }}
          >
            {/* An inferred figure is a reading, not a record, and is labelled so. */}
            {primary.inferred && !primary.recorded ? "Looks like " : ""}
            {basisLabel(primary)}
          </Typography>
        </Tooltip>
      </Stack>

      {/* ---- what the next line will cost ---- */}
      <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
        <Typography
          fontSize={11} fontWeight={800} color="var(--text-color-trinary)"
          sx={{ textTransform: "uppercase", letterSpacing: 0.4, minWidth: 96 }}
        >
          Charge new on
        </Typography>

        {primary.pos ? (
          <Stack
            direction="row" alignItems="center" gap={0.5}
            sx={{
              px: 1, py: 0.35, borderRadius: "var(--radius-pill)",
              border: "1px solid var(--border)", backgroundColor: "var(--surface)",
            }}
          >
            <InputBase
              value={extra}
              disabled={busy}
              onChange={(e) => onExtra(e.target.value.replace(/[^0-9.]/g, "").slice(0, 5))}
              inputProps={{
                inputMode: "decimal",
                "aria-label": "extra discount percent for new lines",
                style: { textAlign: "right" },
              }}
              sx={{ width: 34, fontSize: 12, fontWeight: 800 }}
            />
            <Typography fontSize={11.5} fontWeight={700} color="var(--text-color-secondary)">
              % ExtraDiscount
            </Typography>
          </Stack>
        ) : (
          /* A website order is charged the product's own discount. There is no
             concession to set, so offering a field would imply one exists. */
          <Typography fontSize={12.5} fontWeight={700} color="var(--text-color-secondary)">
            Website rates — nothing to set
          </Typography>
        )}
      </Stack>

      {/* ---- only when the two disagree ---- */}
      {deviates && (
        <Stack gap={0.75}>
          <Stack direction="row" alignItems="flex-start" gap={0.75}>
            <WarningAmberRoundedIcon sx={{ fontSize: 15, color: "var(--warning)", mt: "1px" }} />
            <Typography fontSize={11.5} fontWeight={600} color="#8a5a00" lineHeight={1.5}>
              New items will be charged at{" "}
              <b>{extraNum > 0 ? `${extraNum}% ExtraDiscount` : "no concession"}</b>, which is not
              how the rest of this bill was written. The order will carry two different rates.
            </Typography>
          </Stack>

          {confirming ? (
            <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap" sx={{ pl: 2.5 }}>
              <Typography fontSize={11.5} fontWeight={700} color="var(--text-color)">
                Reprice every line at {extraNum}%?
              </Typography>
              <Button
                size="small" onClick={() => setConfirming(false)}
                sx={{ textTransform: "none", fontWeight: 700, fontSize: 11.5, color: "var(--text-color-secondary)" }}
              >
                Keep as is
              </Button>
              <Button
                size="small" disabled={busy}
                onClick={() => { onReprice({ extraDiscount: extraNum }); setConfirming(false); }}
                sx={{
                  textTransform: "none", fontWeight: 800, fontSize: 11.5, px: 1.5,
                  color: "#fff", backgroundColor: "var(--danger)",
                  "&:hover": { backgroundColor: "var(--danger-ink)" },
                }}
              >
                Reprice the whole bill
              </Button>
            </Stack>
          ) : (
            <Button
              size="small" disabled={busy} onClick={() => setConfirming(true)}
              startIcon={<PriceChangeRoundedIcon sx={{ fontSize: 15 }} />}
              sx={{
                alignSelf: "flex-start", ml: 2.5, textTransform: "none",
                fontWeight: 800, fontSize: 11.5, color: "var(--primary-color)",
              }}
            >
              Put the whole bill at {extraNum}%
            </Button>
          )}
        </Stack>
      )}
    </Stack>
  );
}
