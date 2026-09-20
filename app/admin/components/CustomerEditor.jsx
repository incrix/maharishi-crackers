"use client";
import { useEffect, useState } from "react";
import { Stack, Typography, Button, TextField, Box } from "@mui/material";

/**
 * Correcting the customer's details on a bill that has already been raised.
 *
 * Numbers get taken down wrong across a counter and addresses change between
 * the order and the dispatch. Until this existed the only fix was to cancel
 * the bill and write it again, which throws away the reference the customer
 * was already given and the packing progress with it.
 *
 * Only what actually changed is sent, so this cannot blank a field it never
 * showed, and the store records the change in the order's history.
 */

const FIELDS = [
  { key: "name", label: "Name", required: true, width: 12 },
  { key: "phone", label: "Phone", width: 6, hint: "Where WhatsApp updates go" },
  { key: "email", label: "Email", width: 6, hint: "Where the order emails go" },
  { key: "address", label: "Address", width: 12, multiline: true },
  { key: "city", label: "City", width: 5 },
  { key: "state", label: "State", width: 4 },
  { key: "zip", label: "PIN", width: 3 },
];

const clean = (v) => String(v ?? "").trim();

export default function CustomerEditor({ customer, onSave, onCancel, busy }) {
  const [form, setForm] = useState({});
  const [error, setError] = useState("");

  // Re-seeded when a different order is opened, so the form never shows the
  // previous customer's details for a moment.
  useEffect(() => {
    const seed = {};
    FIELDS.forEach(({ key }) => { seed[key] = clean(customer?.[key]); });
    setForm(seed);
    setError("");
  }, [customer]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  /** Only the fields that actually moved, so nothing untouched is rewritten. */
  const changed = FIELDS
    .map(({ key }) => key)
    .filter((key) => clean(form[key]) !== clean(customer?.[key]));

  const submit = () => {
    if (!clean(form.name)) {
      setError("A bill needs a name — it is what the challan and every notification address.");
      return;
    }
    if (!changed.length) { onCancel(); return; }
    onSave(Object.fromEntries(changed.map((key) => [key, clean(form[key])])));
  };

  return (
    <Stack gap={1.25} sx={{ p: 1.5, borderRadius: "var(--radius)", border: "1px solid var(--border)", backgroundColor: "var(--surface-muted)" }}>
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 1 }}>
        {FIELDS.map(({ key, label, width, multiline, hint, required }) => (
          <Box key={key} sx={{ gridColumn: { xs: "span 12", sm: `span ${width}` } }}>
            <TextField
              fullWidth
              size="small"
              label={label}
              required={required}
              value={form[key] ?? ""}
              onChange={set(key)}
              disabled={busy}
              multiline={multiline}
              minRows={multiline ? 2 : undefined}
              helperText={hint}
              InputProps={{ sx: { fontSize: 13, fontWeight: 600, backgroundColor: "#fff" } }}
              InputLabelProps={{ sx: { fontSize: 13 } }}
              FormHelperTextProps={{ sx: { fontSize: 10.5, mx: 0.25 } }}
            />
          </Box>
        ))}
      </Box>

      {error && (
        <Typography fontSize={11.5} fontWeight={700} color="var(--danger-ink)">{error}</Typography>
      )}

      <Stack direction="row" gap={1} alignItems="center">
        <Button
          onClick={submit}
          disabled={busy}
          sx={{
            textTransform: "none", fontWeight: 800, fontSize: 13, px: 2, py: 0.6,
            borderRadius: "var(--radius-sm)", color: "#fff", backgroundColor: "var(--primary-color)",
            "&:hover": { backgroundColor: "var(--primary-dark)" },
            "&.Mui-disabled": { backgroundColor: "#9dbfa6", color: "#fff" },
          }}
        >
          {changed.length ? `Save ${changed.length} change${changed.length === 1 ? "" : "s"}` : "Done"}
        </Button>
        <Button
          onClick={onCancel}
          disabled={busy}
          sx={{ textTransform: "none", fontWeight: 700, fontSize: 13, color: "var(--text-color-secondary)" }}
        >
          Cancel
        </Button>
        {/* Named rather than counted: changing a phone number moves where every
            later notification for this order is delivered. */}
        {changed.length > 0 && (
          <Typography fontSize={11} fontWeight={600} color="var(--text-color-secondary)" sx={{ ml: "auto", textAlign: "right" }}>
            {changed.join(", ")}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
}
