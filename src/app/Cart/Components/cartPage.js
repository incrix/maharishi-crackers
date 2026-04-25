"use client";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Link from "next/link";
import Image from "next/image";
import { Delete } from "@mui/icons-material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import LocalMallOutlinedIcon from "@mui/icons-material/LocalMallOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { pdf } from "@react-pdf/renderer";
import Template1 from "@/src/utils/invoice/Template1/Template";

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    setCart(localStorage.getItem("cart") ? JSON.parse(localStorage.getItem("cart")) : []);
  }, []);

  const handleIncrement = (index) => {
    const newCart = [...cart];
    newCart[index].count += 1;
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const handleDecrement = (index) => {
    if (cart[index].count === 1) return;
    const newCart = [...cart];
    newCart[index].count -= 1;
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const handleRemove = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const total = cart.reduce(
    (acc, item) => acc + Math.round(item.price - (item.price * (item.discount || 0)) / 100) * (item.count || 0),
    0
  );

  const totalItems = cart.reduce((acc, item) => acc + (item.count || 0), 0);

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Enter a valid email";
    if (!form.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(form.phone)) newErrors.phone = "Enter a valid 10-digit number";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;
    setLoading(true);
    setSubmitError("");

    try {
      const billingDetails = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: "",
        city: "",
        state: "",
        zip: "",
      };

      const pdfDoc = <Template1 billingDetails={billingDetails} productList={cart} />;
      const blob = await pdf(pdfDoc).toBlob();
      const reader = new FileReader();

      const base64 = await new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result.split(",")[1]);
        reader.readAsDataURL(blob);
      });

      const res = await fetch("/api/sendmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billingDetails,
          productList: cart,
          invoice: base64,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        // Open owner's WhatsApp with prefilled order summary
        const rawNumber = (process.env.NEXT_PUBLIC_OWNER_WHATSAPP || "917548820326").trim();
        const ownerNumber = rawNumber.startsWith("91") ? rawNumber : `91${rawNumber}`;
        const itemsList = cart
          .map((it, i) => {
            const price = Math.round(it.price - (it.price * (it.discount || 0)) / 100);
            return `${i + 1}. ${it.name} — ${it.count} x ₹${price} = ₹${price * it.count}`;
          })
          .join("\n");
        const msg =
          `*New Order — Maharishi Crackers*\n\n` +
          `*Customer Details*\n` +
          `Name: ${form.name}\n` +
          `Email: ${form.email}\n` +
          `Phone: ${form.phone}\n\n` +
          `*Order Items (${totalItems})*\n${itemsList}\n\n` +
          `*Total: ₹${total}*`;
        const waUrl = `https://wa.me/${ownerNumber}?text=${encodeURIComponent(msg)}`;
        window.open(waUrl, "_blank");

        // Save order to history
        const order = {
          id: `ORD-${Date.now()}`,
          date: new Date().toISOString(),
          customer: { name: form.name, email: form.email, phone: form.phone },
          items: cart.map((it) => ({
            id: it.id,
            name: it.name,
            image: it.image,
            price: it.price,
            discount: it.discount || 0,
            count: it.count,
          })),
          totalItems,
          total,
          status: "Pending Confirmation",
        };
        const history = JSON.parse(localStorage.getItem("orderHistory") || "[]");
        history.unshift(order);
        localStorage.setItem("orderHistory", JSON.stringify(history.slice(0, 50)));

        setSuccess(true);
        localStorage.removeItem("cart");
        setCart([]);
      } else {
        setSubmitError(data.message || "Failed to send your order. Please try again.");
      }
    } catch (err) {
      console.error("Order failed:", err);
      setSubmitError("Network error — please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    const wasSuccess = success;
    setDialogOpen(false);
    setSuccess(false);
    setSubmitError("");
    setForm({ name: "", email: "", phone: "" });
    setErrors({});
    if (wasSuccess) {
      setToast({ open: true, message: "Order sent successfully! We'll contact you within 24 hrs.", severity: "success" });
    }
  };

  return (
    <Stack sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", pb: 6 }}>
      <Stack sx={{ width: "100%", minHeight: "60vh", maxWidth: "1200px", pt: { xs: "100px", md: "120px" }, gap: { xs: 3, md: 4 } }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
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
              <ShoppingCartOutlinedIcon sx={{ color: "var(--primary)", fontSize: 24 }} />
            </Box>
            <Stack>
              <Typography sx={{ fontFamily: "var(--font-heading)", fontSize: { xs: 28, md: 36 }, fontWeight: 700, color: "var(--primary)", lineHeight: 1.1 }}>
                Your Cart
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#999", fontWeight: 500 }}>
                {cart.length > 0 ? `${totalItems} item${totalItems > 1 ? "s" : ""} in your cart` : "No items yet"}
              </Typography>
            </Stack>
          </Stack>
        </motion.div>

        {cart.length === 0 ? (
          /* Empty Cart State */
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
                <LocalMallOutlinedIcon sx={{ fontSize: 36, color: "var(--primary)" }} />
              </Box>
              <Typography sx={{ fontFamily: "var(--font-heading)", fontSize: 22, fontWeight: 700, color: "var(--primary)" }}>
                Your cart is empty
              </Typography>
              <Typography sx={{ fontSize: 14, color: "#999", textAlign: "center", maxWidth: 300 }}>
                Looks like you haven't added any crackers yet. Browse our collection and light up your celebrations!
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
          /* Cart Content */
          <Stack direction={{ xs: "column", md: "row" }} gap={{ xs: 3, md: 4 }}>

            {/* Cart Items */}
            <Stack sx={{ flex: 1, gap: 2 }}>
              <AnimatePresence>
                {cart.map((row, index) => {
                  const unitPrice = Math.round(row.price - (row.price * row.discount) / 100);
                  return (
                    <motion.div
                      key={row.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, height: 0 }}
                      transition={{ duration: 0.25, delay: index * 0.05 }}
                    >
                      <Paper
                        elevation={0}
                        sx={{
                          p: { xs: 1.5, md: 2.5 },
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
                        <Stack direction="row" gap={{ xs: 1.5, md: 2.5 }} alignItems="center">
                          <Box
                            sx={{
                              width: { xs: 80, md: 110 },
                              height: { xs: 80, md: 110 },
                              borderRadius: "14px",
                              overflow: "hidden",
                              background: "linear-gradient(145deg, #f8f6f0 0%, #efe9dc 100%)",
                              flexShrink: 0,
                              position: "relative",
                            }}
                          >
                            <Image
                              src={`https://e-com.incrix.com/Sankamithra%20Products/${row.image[0]}`}
                              alt={row.name}
                              fill
                              style={{ objectFit: "contain", padding: "8px" }}
                              sizes="110px"
                            />
                          </Box>

                          <Stack sx={{ flex: 1, minWidth: 0, gap: 0.5 }}>
                            <Typography
                              sx={{
                                fontSize: { xs: 14, md: 16 },
                                fontWeight: 600,
                                color: "var(--foreground)",
                                lineHeight: 1.3,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {row.name}
                            </Typography>

                            <Stack direction="row" alignItems="center" gap={1}>
                              <Typography sx={{ fontSize: { xs: 16, md: 18 }, fontWeight: 700, color: "var(--primary)" }}>
                                ₹{unitPrice}
                              </Typography>
                              {row.discount > 0 && (
                                <>
                                  <Typography sx={{ fontSize: 12, color: "#bbb", textDecoration: "line-through" }}>
                                    ₹{row.price}
                                  </Typography>
                                  <Box
                                    sx={{
                                      background: "rgba(139, 26, 26, 0.08)",
                                      color: "var(--tertiary)",
                                      fontSize: 11,
                                      fontWeight: 700,
                                      px: 0.8,
                                      py: 0.15,
                                      borderRadius: "6px",
                                    }}
                                  >
                                    {row.discount}% off
                                  </Box>
                                </>
                              )}
                            </Stack>

                            <Stack direction="row" alignItems="center" justifyContent="space-between" mt={0.5}>
                              <Stack
                                direction="row"
                                alignItems="center"
                                sx={{
                                  borderRadius: "12px",
                                  overflow: "hidden",
                                  border: "1.5px solid var(--border)",
                                  background: "#fafaf7",
                                }}
                              >
                                <IconButton
                                  onClick={() => handleDecrement(index)}
                                  size="small"
                                  sx={{ borderRadius: 0, width: { xs: 30, md: 34 }, height: { xs: 30, md: 34 }, color: "var(--primary)", "&:hover": { background: "var(--category-color)" } }}
                                >
                                  <RemoveRoundedIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                                <Box
                                  sx={{
                                    minWidth: { xs: 32, md: 38 },
                                    height: { xs: 30, md: 34 },
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: 700,
                                    color: "var(--primary)",
                                    fontSize: 14,
                                    borderLeft: "1.5px solid var(--border)",
                                    borderRight: "1.5px solid var(--border)",
                                  }}
                                >
                                  {row.count}
                                </Box>
                                <IconButton
                                  onClick={() => handleIncrement(index)}
                                  size="small"
                                  sx={{ borderRadius: 0, width: { xs: 30, md: 34 }, height: { xs: 30, md: 34 }, color: "var(--primary)", "&:hover": { background: "var(--category-color)" } }}
                                >
                                  <AddRoundedIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Stack>
                              <Typography sx={{ fontSize: { xs: 15, md: 17 }, fontWeight: 700, color: "var(--primary)" }}>
                                ₹{unitPrice * row.count}
                              </Typography>
                            </Stack>
                          </Stack>

                          <motion.div whileTap={{ scale: 0.85 }}>
                            <IconButton
                              onClick={() => handleRemove(index)}
                              sx={{
                                width: { xs: 36, md: 40 },
                                height: { xs: 36, md: 40 },
                                color: "var(--tertiary)",
                                background: "rgba(139, 26, 26, 0.06)",
                                borderRadius: "12px",
                                transition: "all 0.2s ease",
                                "&:hover": { background: "rgba(139, 26, 26, 0.12)" },
                              }}
                            >
                              <Delete sx={{ fontSize: { xs: 18, md: 20 } }} />
                            </IconButton>
                          </motion.div>
                        </Stack>
                      </Paper>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </Stack>

            {/* Cart Summary Sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{ width: "100%", maxWidth: "380px" }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, md: 3 },
                  borderRadius: "24px",
                  border: "1px solid var(--border)",
                  background: "linear-gradient(160deg, #fff 0%, var(--card-color) 100%)",
                  position: { md: "sticky" },
                  top: { md: "120px" },
                }}
              >
                <Stack gap={2.5}>
                  <Typography sx={{ fontFamily: "var(--font-heading)", fontSize: 22, fontWeight: 700, color: "var(--primary)" }}>
                    Order Summary
                  </Typography>

                  <Divider sx={{ borderColor: "var(--border)" }} />

                  <Stack gap={1.5}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography sx={{ fontSize: 14, color: "#888" }}>Subtotal ({totalItems} items)</Typography>
                      <Typography sx={{ fontSize: 14, fontWeight: 600 }}>₹{total}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography sx={{ fontSize: 14, color: "#888" }}>Savings</Typography>
                      <Typography sx={{ fontSize: 14, fontWeight: 600, color: "var(--primary)" }}>
                        -₹{cart.reduce((acc, item) => acc + Math.round((item.price * (item.discount || 0)) / 100) * (item.count || 0), 0)}
                      </Typography>
                    </Stack>
                  </Stack>

                  <Divider sx={{ borderColor: "var(--border)" }} />

                  <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                    <Typography sx={{ fontSize: 16, fontWeight: 600, color: "var(--foreground)" }}>Total</Typography>
                    <Typography sx={{ fontSize: 28, fontWeight: 800, color: "var(--primary)" }}>
                      ₹{total}
                    </Typography>
                  </Stack>

                  {total <= 1000 && cart.length > 0 && (
                    <Box
                      sx={{
                        background: "rgba(139, 26, 26, 0.06)",
                        border: "1px solid rgba(139, 26, 26, 0.12)",
                        borderRadius: "12px",
                        px: 2,
                        py: 1.2,
                      }}
                    >
                      <Typography sx={{ fontSize: 13, fontWeight: 600, color: "var(--tertiary)", lineHeight: 1.4 }}>
                        Minimum order amount is ₹1,000. Add ₹{1000 - total} more to proceed.
                      </Typography>
                    </Box>
                  )}

                  {/* Notice */}
                  <Box
                    sx={{
                      background: "rgba(26, 77, 46, 0.04)",
                      border: "1px solid rgba(26, 77, 46, 0.08)",
                      borderRadius: "12px",
                      px: 2,
                      py: 1.2,
                    }}
                  >
                    <Typography sx={{ fontSize: 12, color: "#888", lineHeight: 1.5 }}>
                      Your order will be sent to our team. We will contact you within 24 hrs to confirm via WhatsApp or phone call.
                    </Typography>
                  </Box>

                  <Stack gap={1.5} mt={0.5}>
                    <Button
                      disableElevation
                      variant="contained"
                      disabled={cart.length === 0 || total <= 1000}
                      endIcon={<SendRoundedIcon />}
                      onClick={() => setDialogOpen(true)}
                      sx={{
                        background: "var(--primary)",
                        color: "#fff",
                        textTransform: "none",
                        borderRadius: "14px",
                        fontWeight: 700,
                        fontSize: 15,
                        py: 1.5,
                        boxShadow: "0 4px 16px rgba(26, 77, 46, 0.25)",
                        "&:hover": { background: "var(--primary)", opacity: 0.9 },
                        "&.Mui-disabled": {
                          background: "#e0e0e0",
                          color: "#aaa",
                          boxShadow: "none",
                        },
                      }}
                    >
                      Place Order
                    </Button>

                    <Button
                      disableElevation
                      variant="outlined"
                      startIcon={<StorefrontRoundedIcon />}
                      onClick={() => window.location.href = "/Shop"}
                      sx={{
                        border: "2px solid var(--border)",
                        color: "var(--primary)",
                        textTransform: "none",
                        borderRadius: "14px",
                        fontWeight: 600,
                        fontSize: 14,
                        py: 1.2,
                        "&:hover": { border: "2px solid var(--primary)", background: "var(--category-color)" },
                      }}
                    >
                      Continue Shopping
                    </Button>
                  </Stack>
                </Stack>
              </Paper>
            </motion.div>
          </Stack>
        )}
      </Stack>

      {/* Place Order Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={!loading ? handleCloseDialog : undefined}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "24px",
            p: 0,
            overflow: "hidden",
          },
        }}
      >
        {/* Dialog Header */}
        <Box
          sx={{
            background: "var(--primary)",
            px: 3,
            py: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Stack direction="row" alignItems="center" gap={1.5}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "12px",
                background: "rgba(255,255,255,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PersonOutlineRoundedIcon sx={{ color: "#fff", fontSize: 22 }} />
            </Box>
            <Stack>
              <Typography sx={{ fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 700, color: "#fff" }}>
                Place Your Order
              </Typography>
              <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                Enter your details and we'll get back to you
              </Typography>
            </Stack>
          </Stack>
          {!loading && (
            <IconButton onClick={handleCloseDialog} sx={{ color: "rgba(255,255,255,0.6)", "&:hover": { color: "#fff" } }}>
              <CloseRoundedIcon />
            </IconButton>
          )}
        </Box>

        <DialogContent sx={{ p: 3 }}>
          {success ? (
            /* Success State */
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <Stack alignItems="center" gap={2} py={4}>
                <Box
                  sx={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: "var(--category-color)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CheckCircleRoundedIcon sx={{ fontSize: 40, color: "var(--primary)" }} />
                </Box>
                <Typography sx={{ fontFamily: "var(--font-heading)", fontSize: 24, fontWeight: 700, color: "var(--primary)" }}>
                  Order Placed!
                </Typography>
                <Typography sx={{ fontSize: 14, color: "#888", textAlign: "center", maxWidth: 340 }}>
                  Your order has been sent successfully. Our team will contact you within 24 hours to confirm your order via WhatsApp or phone call.
                </Typography>
                <Button
                  disableElevation
                  variant="contained"
                  onClick={handleCloseDialog}
                  sx={{
                    mt: 1,
                    background: "var(--primary)",
                    color: "#fff",
                    textTransform: "none",
                    borderRadius: "12px",
                    fontWeight: 600,
                    px: 4,
                    py: 1,
                    "&:hover": { background: "var(--primary)", opacity: 0.9 },
                  }}
                >
                  Done
                </Button>
              </Stack>
            </motion.div>
          ) : (
            /* Form */
            <Stack gap={2.5} py={1}>
              {/* Order summary mini */}
              <Box
                sx={{
                  background: "var(--card-color)",
                  borderRadius: "14px",
                  px: 2.5,
                  py: 2,
                  border: "1px solid var(--border)",
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography sx={{ fontSize: 14, color: "#888" }}>{totalItems} items</Typography>
                  <Typography sx={{ fontSize: 20, fontWeight: 800, color: "var(--primary)" }}>₹{total}</Typography>
                </Stack>
              </Box>

              <TextField
                label="Full Name"
                placeholder="Enter your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                error={!!errors.name}
                helperText={errors.name}
                fullWidth
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": { borderRadius: "12px" },
                  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "var(--primary)" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "var(--primary)" },
                }}
              />

              <TextField
                label="Email Address"
                placeholder="your@email.com"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                error={!!errors.email}
                helperText={errors.email}
                fullWidth
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": { borderRadius: "12px" },
                  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "var(--primary)" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "var(--primary)" },
                }}
              />

              <TextField
                label="Phone Number"
                placeholder="10-digit mobile number"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                error={!!errors.phone}
                helperText={errors.phone}
                fullWidth
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": { borderRadius: "12px" },
                  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "var(--primary)" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "var(--primary)" },
                }}
              />

              {submitError && (
                <Alert severity="error" sx={{ borderRadius: "12px", fontSize: 13 }}>
                  {submitError}
                </Alert>
              )}

              <Button
                disableElevation
                variant="contained"
                disabled={loading}
                onClick={handlePlaceOrder}
                endIcon={loading ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : <SendRoundedIcon />}
                sx={{
                  background: "var(--primary)",
                  color: "#fff",
                  textTransform: "none",
                  borderRadius: "14px",
                  fontWeight: 700,
                  fontSize: 15,
                  py: 1.5,
                  mt: 1,
                  boxShadow: "0 4px 16px rgba(26, 77, 46, 0.25)",
                  "&:hover": { background: "var(--primary)", opacity: 0.9 },
                  "&.Mui-disabled": { background: "var(--primary)", opacity: 0.7, color: "#fff" },
                }}
              >
                {loading ? "Sending Order..." : "Submit Order"}
              </Button>

              <Typography sx={{ fontSize: 11, color: "#bbb", textAlign: "center", lineHeight: 1.4 }}>
                By placing this order, you agree to be contacted by our team for order confirmation.
              </Typography>
            </Stack>
          )}
        </DialogContent>
      </Dialog>

      {/* Global success toast — appears after dialog closes */}
      <Snackbar
        open={toast.open}
        autoHideDuration={5000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToast({ ...toast, open: false })}
          severity={toast.severity}
          variant="filled"
          icon={<CheckCircleRoundedIcon />}
          sx={{
            borderRadius: "14px",
            fontWeight: 600,
            background: "var(--primary)",
            color: "#fff",
            boxShadow: "0 8px 28px rgba(26, 77, 46, 0.3)",
            "& .MuiAlert-icon": { color: "var(--secondary-light)" },
          }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
