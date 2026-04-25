"use client";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Image from "next/image";
import Link from "next/link";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LocalPhoneRoundedIcon from "@mui/icons-material/LocalPhoneRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return iso;
  }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
  const [confirmClear, setConfirmClear] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const hist = JSON.parse(localStorage.getItem("orderHistory") || "[]");
    setOrders(hist);
    setHydrated(true);
  }, []);

  const handleReorder = (order) => {
    const cart = order.items.map((it) => ({
      id: it.id,
      name: it.name,
      image: it.image,
      price: it.price,
      discount: it.discount,
      count: it.count,
    }));
    localStorage.setItem("cart", JSON.stringify(cart));
    setToast({ open: true, message: "Items added to cart!", severity: "success" });
    setTimeout(() => router.push("/Cart"), 800);
  };

  const handleDelete = (id) => {
    const updated = orders.filter((o) => o.id !== id);
    setOrders(updated);
    localStorage.setItem("orderHistory", JSON.stringify(updated));
    setToast({ open: true, message: "Order removed from history", severity: "info" });
  };

  const handleClearAll = () => {
    setOrders([]);
    localStorage.removeItem("orderHistory");
    setConfirmClear(false);
    setToast({ open: true, message: "Order history cleared", severity: "info" });
  };

  if (!hydrated) {
    return (
      <Stack sx={{ minHeight: "60vh", pt: { xs: "100px", md: "120px" } }}>
        <Typography sx={{ color: "#999" }}>Loading...</Typography>
      </Stack>
    );
  }

  return (
    <Stack sx={{ width: "100%", minHeight: "60vh", pt: { xs: "100px", md: "120px" }, gap: { xs: 3, md: 4 }, pb: 6 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1.5}>
          <Stack direction="row" alignItems="center" gap={1.5}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "14px",
                background: "var(--category-color)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <HistoryRoundedIcon sx={{ color: "var(--primary)", fontSize: 24 }} />
            </Box>
            <Stack>
              <Typography sx={{ fontFamily: "var(--font-heading)", fontSize: { xs: 28, md: 36 }, fontWeight: 700, color: "var(--primary)", lineHeight: 1.1 }}>
                Order History
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#999", fontWeight: 500 }}>
                {orders.length > 0 ? `${orders.length} order${orders.length > 1 ? "s" : ""} placed` : "No orders yet"}
              </Typography>
            </Stack>
          </Stack>

          {orders.length > 0 && (
            <Button
              variant="text"
              size="small"
              startIcon={<DeleteOutlineRoundedIcon />}
              onClick={() => setConfirmClear(true)}
              sx={{
                color: "var(--tertiary)",
                textTransform: "none",
                fontWeight: 600,
                fontSize: 13,
                "&:hover": { background: "rgba(139, 26, 26, 0.06)" },
              }}
            >
              Clear all
            </Button>
          )}
        </Stack>
      </motion.div>

      {orders.length === 0 ? (
        /* Empty state */
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <Paper
            elevation={0}
            sx={{
              py: 8,
              px: 4,
              borderRadius: "24px",
              border: "1px solid var(--border)",
              background: "linear-gradient(145deg, #fff 0%, var(--card-color) 100%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "var(--category-color)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 1,
              }}
            >
              <ReceiptLongRoundedIcon sx={{ fontSize: 36, color: "var(--primary)" }} />
            </Box>
            <Typography sx={{ fontFamily: "var(--font-heading)", fontSize: 22, fontWeight: 700, color: "var(--primary)" }}>
              No orders yet
            </Typography>
            <Typography sx={{ fontSize: 14, color: "#999", textAlign: "center", maxWidth: 320 }}>
              Once you place your first order, it will appear here. You can reorder anytime with one tap.
            </Typography>
            <Button
              disableElevation
              variant="contained"
              endIcon={<ArrowForwardRoundedIcon />}
              sx={{
                mt: 2,
                background: "var(--primary)",
                color: "#fff",
                textTransform: "none",
                borderRadius: "14px",
                fontWeight: 600,
                fontSize: 15,
                px: 4,
                py: 1.2,
                "&:hover": { background: "var(--primary)", opacity: 0.9 },
              }}
            >
              <Link style={{ textDecoration: "none", color: "#fff" }} href="/Shop">Browse Products</Link>
            </Button>
          </Paper>
        </motion.div>
      ) : (
        /* Orders list */
        <Stack gap={2}>
          <AnimatePresence>
            {orders.map((order, idx) => (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.04 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2, md: 2.5 },
                    borderRadius: "20px",
                    border: "1px solid var(--border)",
                    background: "#fff",
                    transition: "all 0.25s ease",
                    "&:hover": {
                      boxShadow: "0 8px 30px rgba(26, 77, 46, 0.08)",
                      borderColor: "rgba(26, 77, 46, 0.15)",
                    },
                  }}
                >
                  <Stack gap={2}>
                    {/* Top row: id + date + status + total */}
                    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} gap={1}>
                      <Stack gap={0.3}>
                        <Stack direction="row" alignItems="center" gap={1}>
                          <Typography sx={{ fontSize: { xs: 14, md: 16 }, fontWeight: 700, color: "var(--primary)" }}>
                            {order.id}
                          </Typography>
                          <Box
                            sx={{
                              background: "rgba(26, 77, 46, 0.08)",
                              color: "var(--primary)",
                              fontSize: 10,
                              fontWeight: 700,
                              px: 1,
                              py: 0.2,
                              borderRadius: "6px",
                              textTransform: "uppercase",
                              letterSpacing: "0.4px",
                            }}
                          >
                            {order.status || "Pending"}
                          </Box>
                        </Stack>
                        <Stack direction="row" alignItems="center" gap={0.5}>
                          <CalendarTodayRoundedIcon sx={{ fontSize: 11, color: "#aaa" }} />
                          <Typography sx={{ fontSize: 12, color: "#999" }}>
                            {formatDate(order.date)}
                          </Typography>
                        </Stack>
                      </Stack>
                      <Stack direction="row" alignItems="baseline" gap={0.6}>
                        <Typography sx={{ fontSize: 13, color: "#888" }}>
                          {order.totalItems} item{order.totalItems > 1 ? "s" : ""} ·
                        </Typography>
                        <Typography sx={{ fontSize: { xs: 18, md: 22 }, fontWeight: 800, color: "var(--primary)" }}>
                          ₹{order.total}
                        </Typography>
                      </Stack>
                    </Stack>

                    {/* Customer info */}
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      gap={{ xs: 1, sm: 2.5 }}
                      sx={{
                        background: "var(--card-color)",
                        borderRadius: "12px",
                        px: 2,
                        py: 1.2,
                      }}
                    >
                      <Stack direction="row" alignItems="center" gap={0.6}>
                        <PersonOutlineRoundedIcon sx={{ fontSize: 14, color: "var(--primary)" }} />
                        <Typography sx={{ fontSize: 12, color: "#666", fontWeight: 600 }}>{order.customer.name}</Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" gap={0.6}>
                        <LocalPhoneRoundedIcon sx={{ fontSize: 14, color: "var(--primary)" }} />
                        <Typography sx={{ fontSize: 12, color: "#666" }}>{order.customer.phone}</Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" gap={0.6} sx={{ minWidth: 0 }}>
                        <EmailOutlinedIcon sx={{ fontSize: 14, color: "var(--primary)" }} />
                        <Typography sx={{ fontSize: 12, color: "#666", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {order.customer.email}
                        </Typography>
                      </Stack>
                    </Stack>

                    {/* Item thumbnails preview */}
                    <Stack direction="row" gap={1} sx={{ overflowX: "auto", scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } }}>
                      {order.items.slice(0, 6).map((it, i) => (
                        <Box
                          key={i}
                          sx={{
                            position: "relative",
                            width: 56,
                            height: 56,
                            borderRadius: "10px",
                            overflow: "hidden",
                            background: "linear-gradient(145deg, #f8f6f0 0%, #efe9dc 100%)",
                            flexShrink: 0,
                            border: "1px solid var(--border)",
                          }}
                        >
                          <Image
                            src={`https://e-com.incrix.com/Sankamithra%20Products/${it.image[0]}`}
                            alt={it.name}
                            fill
                            style={{ objectFit: "contain", padding: "5px" }}
                            sizes="56px"
                          />
                          <Box
                            sx={{
                              position: "absolute",
                              bottom: 0,
                              right: 0,
                              background: "var(--primary)",
                              color: "#fff",
                              fontSize: 9,
                              fontWeight: 700,
                              px: 0.5,
                              borderRadius: "4px 0 0 0",
                            }}
                          >
                            ×{it.count}
                          </Box>
                        </Box>
                      ))}
                      {order.items.length > 6 && (
                        <Box
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: "10px",
                            background: "var(--category-color)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--primary)",
                            fontSize: 12,
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          +{order.items.length - 6}
                        </Box>
                      )}
                    </Stack>

                    {/* Action buttons */}
                    <Stack direction="row" gap={1} flexWrap="wrap">
                      <Button
                        disableElevation
                        variant="contained"
                        size="small"
                        startIcon={<RefreshRoundedIcon sx={{ fontSize: "16px !important" }} />}
                        onClick={() => handleReorder(order)}
                        sx={{
                          background: "var(--primary)",
                          color: "#fff",
                          textTransform: "none",
                          borderRadius: "10px",
                          fontWeight: 600,
                          fontSize: 13,
                          px: 2,
                          "&:hover": { background: "var(--primary)", opacity: 0.9 },
                        }}
                      >
                        Reorder
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setSelectedOrder(order)}
                        sx={{
                          border: "1.5px solid var(--border)",
                          color: "var(--primary)",
                          textTransform: "none",
                          borderRadius: "10px",
                          fontWeight: 600,
                          fontSize: 13,
                          px: 2,
                          "&:hover": { border: "1.5px solid var(--primary)", background: "var(--category-color)" },
                        }}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="text"
                        size="small"
                        startIcon={<DeleteOutlineRoundedIcon sx={{ fontSize: "16px !important" }} />}
                        onClick={() => handleDelete(order.id)}
                        sx={{
                          color: "var(--tertiary)",
                          textTransform: "none",
                          fontWeight: 600,
                          fontSize: 13,
                          ml: { sm: "auto" },
                          "&:hover": { background: "rgba(139, 26, 26, 0.06)" },
                        }}
                      >
                        Remove
                      </Button>
                    </Stack>
                  </Stack>
                </Paper>
              </motion.div>
            ))}
          </AnimatePresence>
        </Stack>
      )}

      {/* Confirm clear dialog */}
      <Dialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        PaperProps={{ sx: { borderRadius: "20px", p: 1 } }}
      >
        <DialogContent>
          <Stack gap={2} alignItems="center" textAlign="center" py={2}>
            <Box sx={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(139,26,26,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <DeleteOutlineRoundedIcon sx={{ fontSize: 30, color: "var(--tertiary)" }} />
            </Box>
            <Typography sx={{ fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 700, color: "var(--primary)" }}>
              Clear all orders?
            </Typography>
            <Typography sx={{ fontSize: 13, color: "#888", maxWidth: 320 }}>
              This will permanently remove your local order history. This action cannot be undone.
            </Typography>
            <Stack direction="row" gap={1.5} mt={1}>
              <Button
                variant="outlined"
                onClick={() => setConfirmClear(false)}
                sx={{
                  textTransform: "none",
                  borderRadius: "10px",
                  fontWeight: 600,
                  border: "1.5px solid var(--border)",
                  color: "#666",
                  px: 3,
                }}
              >
                Cancel
              </Button>
              <Button
                disableElevation
                variant="contained"
                onClick={handleClearAll}
                sx={{
                  background: "var(--tertiary)",
                  color: "#fff",
                  textTransform: "none",
                  borderRadius: "10px",
                  fontWeight: 700,
                  px: 3,
                  "&:hover": { background: "var(--tertiary)", opacity: 0.9 },
                }}
              >
                Clear All
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* Order details dialog */}
      <Dialog
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "24px", overflow: "hidden" } }}
      >
        {selectedOrder && (
          <>
            <Box sx={{ background: "var(--primary)", px: 3, py: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Stack>
                <Typography sx={{ fontFamily: "var(--font-heading)", fontSize: 18, fontWeight: 700, color: "#fff" }}>
                  {selectedOrder.id}
                </Typography>
                <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>
                  {formatDate(selectedOrder.date)}
                </Typography>
              </Stack>
              <IconButton onClick={() => setSelectedOrder(null)} sx={{ color: "rgba(255,255,255,0.7)" }}>
                <CloseRoundedIcon />
              </IconButton>
            </Box>
            <DialogContent sx={{ p: 3 }}>
              <Stack gap={2}>
                <Stack gap={1.5}>
                  {selectedOrder.items.map((it, i) => {
                    const unit = Math.round(it.price - (it.price * (it.discount || 0)) / 100);
                    return (
                      <Stack key={i} direction="row" gap={1.5} alignItems="center">
                        <Box sx={{ width: 50, height: 50, borderRadius: "8px", overflow: "hidden", background: "linear-gradient(145deg, #f8f6f0 0%, #efe9dc 100%)", position: "relative", flexShrink: 0 }}>
                          <Image src={`https://e-com.incrix.com/Sankamithra%20Products/${it.image[0]}`} alt={it.name} fill style={{ objectFit: "contain", padding: "5px" }} sizes="50px" />
                        </Box>
                        <Stack sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {it.name}
                          </Typography>
                          <Typography sx={{ fontSize: 11, color: "#888" }}>
                            {it.count} × ₹{unit}
                          </Typography>
                        </Stack>
                        <Typography sx={{ fontSize: 14, fontWeight: 700, color: "var(--primary)" }}>
                          ₹{unit * it.count}
                        </Typography>
                      </Stack>
                    );
                  })}
                </Stack>
                <Box sx={{ height: "1px", background: "var(--border)" }} />
                <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }}>Total</Typography>
                  <Typography sx={{ fontSize: 22, fontWeight: 800, color: "var(--primary)" }}>₹{selectedOrder.total}</Typography>
                </Stack>
                <Button
                  disableElevation
                  variant="contained"
                  startIcon={<RefreshRoundedIcon />}
                  onClick={() => { handleReorder(selectedOrder); setSelectedOrder(null); }}
                  sx={{
                    background: "var(--primary)",
                    color: "#fff",
                    textTransform: "none",
                    borderRadius: "12px",
                    fontWeight: 700,
                    py: 1.2,
                    mt: 1,
                    "&:hover": { background: "var(--primary)", opacity: 0.9 },
                  }}
                >
                  Reorder
                </Button>
              </Stack>
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToast({ ...toast, open: false })}
          severity={toast.severity}
          variant="filled"
          sx={{ borderRadius: "12px", fontWeight: 600 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
