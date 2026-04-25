"use client";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { styled } from "@mui/material/styles";
import { useState, useEffect } from "react";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import { pdf } from "@react-pdf/renderer";
import Template1 from "@/src/utils/invoice/Template1/Template";
import LoadingButton from "@mui/lab/LoadingButton";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    background: "linear-gradient(135deg, #1a4d2e 0%, #2d7a4a 100%)",
    color: theme.palette.common.white,
    fontWeight: 700,
  },
  [`&.${tableCellClasses.body}`]: { fontSize: 14 },
}));

const StyledTableRow = styled(TableRow)(() => ({
  "& td, & th": { borderBottom: "1px solid var(--border)" },
}));

export default function Page() {
  const [checkoutState, setCheckoutState] = useState("billing");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "error" });
  const [billingDetails, setBillingDetails] = useState({ name: "", email: "", phone: "", address: "", city: "", state: "", zip: "" });

  const onBillingDetailsChange = (e) => {
    setBillingDetails({ ...billingDetails, [e.target.name]: e.target.value });
    localStorage.setItem("billingDetails", JSON.stringify({ ...billingDetails, [e.target.name]: e.target.value }));
  };

  const handleCloseSnackbar = (_, reason) => {
    if (reason === "clickaway") return;
    setSnackbar({ ...snackbar, open: false });
  };

  useEffect(() => {
    const stored = localStorage.getItem("billingDetails");
    if (stored) setBillingDetails(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("billingDetails", JSON.stringify(billingDetails));
  }, [billingDetails]);

  const showBillingError = (message) => setSnackbar({ open: true, message, severity: "error" });
  const showOrderSuccess = (message) => setSnackbar({ open: true, message, severity: "success" });

  const handleNextClick = () => {
    if (!billingDetails.name || !billingDetails.email || !billingDetails.phone || !billingDetails.address || !billingDetails.city || !billingDetails.state || !billingDetails.zip) {
      showBillingError("Please fill all the fields"); return;
    }
    if (billingDetails.phone.length !== 10) { showBillingError("Please enter a valid phone number"); return; }
    if (billingDetails.zip.length !== 6) { showBillingError("Please enter a valid zip code"); return; }
    if (billingDetails.email.indexOf("@") === -1) { showBillingError("Please enter a valid email"); return; }
    setCheckoutState("order");
  };

  return (
    <main style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", padding: "0 20px" }}>
      <Snackbar anchorOrigin={{ vertical: "top", horizontal: "right" }} open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: "100%" }}>{snackbar.message}</Alert>
      </Snackbar>
      <Stack sx={{ width: "100%", maxWidth: "var(--max-width)", padding: "40px 0", gap: 5 }}>
        <Typography sx={{ fontFamily: "var(--font-heading)", fontSize: 36, fontWeight: 700, color: "var(--primary)", textAlign: "center" }}>Checkout</Typography>
        <StepIndicator checkoutState={checkoutState} />
        {checkoutState === "billing" && <BillingDetails handleClick={handleNextClick} billingDetails={billingDetails} onBillingDetailsChange={onBillingDetailsChange} />}
        {checkoutState === "order" && <OrderSummary setCheckoutState={setCheckoutState} showOrderSuccess={showOrderSuccess} showError={showBillingError} />}
      </Stack>
    </main>
  );
}

function OrderSummary({ setCheckoutState, showOrderSuccess, showError }) {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { setCart(JSON.parse(localStorage.getItem("cart")) || []); }, []);

  const totalAmount = cart.reduce((acc, item) => acc + Math.round((item.price - (item.price * item.discount) / 100) * item.count), 0);

  const handlePlaceOrder = async () => {
    if (totalAmount <= 1000) { showError("The total amount must be above ₹1000 to place an order."); return; }
    setLoading(true);
    const pdfStream = await pdf(<Template1 billingDetails={JSON.parse(localStorage.getItem("billingDetails"))} productList={cart} />).toBuffer();
    const chunks = [];
    pdfStream.on("data", (chunk) => chunks.push(chunk));
    pdfStream.on("end", async () => {
      const pdfBuffer = Buffer.concat(chunks);
      const base64String = pdfBuffer.toString("base64");
      fetch("/api/sendmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billingDetails: JSON.parse(localStorage.getItem("billingDetails")), productList: cart, invoice: base64String }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "success") { showOrderSuccess("Order placed successfully!"); localStorage.removeItem("cart"); localStorage.removeItem("billingDetails"); setCheckoutState("billing"); }
          else { showError("Failed to place order. Please try again."); }
        })
        .catch(() => { showError("An error occurred. Please check your connection."); })
        .finally(() => setLoading(false));
    });
  };

  return (
    <Stack gap={2}>
      <Button variant="text" sx={{ textTransform: "none", width: "fit-content", color: "var(--primary)", "&:hover": { color: "var(--primary)", background: "var(--category-color)" } }} startIcon={<ArrowBackIosNewRoundedIcon />} onClick={() => setCheckoutState("billing")}>Billing details</Button>
      <Typography sx={{ fontFamily: "var(--font-heading)", fontSize: 24, color: "var(--primary)", fontWeight: 700 }}>Order Summary</Typography>
      <TableContainer>
        <Table sx={{ minWidth: 700 }}>
          <TableHead><TableRow><StyledTableCell>Products</StyledTableCell><StyledTableCell>Quantity</StyledTableCell><StyledTableCell align="right">Unit price</StyledTableCell><StyledTableCell align="right">Subtotal</StyledTableCell></TableRow></TableHead>
          <TableBody>
            {cart.length === 0 && <StyledTableRow><StyledTableCell colSpan={4} align="center">Your cart is empty</StyledTableCell></StyledTableRow>}
            {cart.map((row) => (
              <StyledTableRow key={row.name}>
                <StyledTableCell>{row.name}</StyledTableCell>
                <StyledTableCell>{row.count}</StyledTableCell>
                <StyledTableCell align="right">{Math.round(row.price - (row.price * row.discount) / 100)}</StyledTableCell>
                <StyledTableCell align="right">{Math.round((row.price - (row.price * row.discount) / 100) * row.count)}</StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Stack justifyContent="flex-end" direction="row" gap={5}>
        <Typography fontWeight={700}>Total:</Typography>
        <Typography fontSize={20} fontWeight={700} sx={{ color: "var(--primary)" }}>₹ {totalAmount}</Typography>
      </Stack>
      <Typography sx={{ fontWeight: 600, color: "#555", fontSize: "14px", lineHeight: 1.7 }}>
        As per 2018 supreme court order, online sale of firecrackers are not permitted! We value our customers and respect jurisdiction. Please add your products to cart and submit the required crackers through the place order button. We will contact you within 24 hrs and confirm the order through WhatsApp or phone call.
      </Typography>
      <Stack direction="row" justifyContent="flex-end">
        <LoadingButton variant="contained" loading={loading} disabled={cart.length === 0} sx={{ background: "var(--primary)", width: 160, borderRadius: "12px", "&:hover": { background: "var(--primary)", opacity: 0.9 }, textTransform: "none", fontWeight: 600 }} onClick={handlePlaceOrder}>Place Order</LoadingButton>
      </Stack>
    </Stack>
  );
}

function StepIndicator({ checkoutState }) {
  return (
    <Stack direction="row" width="100%" sx={{ borderRadius: "12px", overflow: "hidden", border: "1px solid var(--border)" }}>
      <Box sx={{ width: "100%", textAlign: "center", py: 1.5, fontWeight: 700, fontSize: { xs: 12, md: 16 }, background: "var(--primary)", color: "#fff" }}>Checkout Progress</Box>
      <Box sx={{ width: "100%", textAlign: "center", py: 1.5, fontWeight: 700, fontSize: { xs: 12, md: 16 }, background: checkoutState === "billing" ? "var(--category-color)" : "#fff", color: checkoutState === "billing" ? "var(--primary)" : "#aaa", borderLeft: "1px solid var(--border)" }}>Billing Details</Box>
      <Box sx={{ width: "100%", textAlign: "center", py: 1.5, fontWeight: 700, fontSize: { xs: 12, md: 16 }, background: checkoutState === "order" ? "var(--category-color)" : "#fff", color: checkoutState === "order" ? "var(--primary)" : "#aaa", borderLeft: "1px solid var(--border)" }}>Place Order</Box>
    </Stack>
  );
}

function BillingDetails({ handleClick, billingDetails, onBillingDetailsChange }) {
  const textFieldSx = { width: { xs: "100%", sm: "350px" }, "& .MuiOutlinedInput-root": { borderRadius: "12px", "&:hover fieldset": { borderColor: "var(--primary)" }, "&.Mui-focused fieldset": { borderColor: "var(--primary)" } } };
  return (
    <Stack gap={5}>
      <Typography sx={{ fontFamily: "var(--font-heading)", fontSize: 22, color: "var(--primary)", fontWeight: 600 }}>Contact Information</Typography>
      <Stack gap={2}>
        <Stack direction={{ xs: "column", sm: "row" }} gap={2}>
          <TextField label="Name" name="name" value={billingDetails.name} onChange={onBillingDetailsChange} sx={textFieldSx} />
          <TextField label="Email" name="email" value={billingDetails.email} onChange={onBillingDetailsChange} sx={textFieldSx} />
        </Stack>
        <TextField label="Phone" name="phone" value={billingDetails.phone} onChange={onBillingDetailsChange} sx={textFieldSx} />
      </Stack>
      <Typography sx={{ fontFamily: "var(--font-heading)", fontSize: 22, color: "var(--primary)", fontWeight: 600 }}>Shipping Address</Typography>
      <Stack gap={2}>
        <Stack direction={{ xs: "column", sm: "row" }} gap={2}>
          <TextField label="Address" name="address" value={billingDetails.address} onChange={onBillingDetailsChange} sx={textFieldSx} />
          <TextField label="City" name="city" value={billingDetails.city} onChange={onBillingDetailsChange} sx={textFieldSx} />
        </Stack>
        <Stack direction={{ xs: "column", sm: "row" }} gap={2}>
          <TextField label="State" name="state" value={billingDetails.state} onChange={onBillingDetailsChange} sx={textFieldSx} />
          <TextField label="Zip" name="zip" value={billingDetails.zip} onChange={onBillingDetailsChange} sx={textFieldSx} />
        </Stack>
      </Stack>
      <Button variant="contained" sx={{ background: "var(--primary)", width: 160, borderRadius: "12px", fontWeight: 600, "&:hover": { background: "var(--primary)", opacity: 0.9 } }} onClick={handleClick}>Next</Button>
    </Stack>
  );
}
