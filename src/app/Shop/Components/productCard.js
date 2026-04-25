"use client";

import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { ShoppingCart } from "@mui/icons-material";
import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import Image from "next/image";
import { motion } from "framer-motion";

export default function ProductCard({ product }) {
  const [count, setCount] = useState(1);
  const [open, setOpen] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const router = useRouter();
  const pathArray = usePathname().split("/");
  const [cart, setCart] = useState([]);

  const discountedPrice = Math.round(product.price - (product.discount / 100) * product.price);

  const handleIncrement = () => {
    if (isAdded) {
      cart.map((item) => {
        if (item.id == product.id) {
          item.count += 1;
          setCount(item.count);
          localStorage.setItem("cart", JSON.stringify(cart));
        }
      });
    } else {
      setCount(count + 1);
    }
  };

  const handleDecrement = () => {
    if (isAdded) {
      cart.map((item) => {
        if (item.id == product.id) {
          if (item.count > 1) {
            item.count -= 1;
            setCount(item.count);
            localStorage.setItem("cart", JSON.stringify(cart));
          } else {
            let newCart = cart.filter((item) => item.id != product.id);
            localStorage.setItem("cart", JSON.stringify(newCart));
            setIsAdded(false);
            handleOpen();
            setCount(1);
          }
        }
      });
    } else {
      if (count > 1) setCount(count - 1);
    }
  };

  const handleClose = () => setOpen(false);
  const handleOpen = () => setOpen(true);

  const navigateToProduct = () => {
    pathArray.length > 2
      ? router.push(`product?id=${product.id}`)
      : router.push(`Shop/product?id=${product.id}`);
  };

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem("cart")) || []);
  }, []);

  const isProductAdded = useCallback(() => {
    let item = cart.filter((item) => item.id == product.id)[0];
    if (item) {
      setIsAdded(true);
      setCount(item.count);
    } else {
      setIsAdded(false);
      setCount(1);
    }
  }, [cart, product.id]);

  useEffect(() => {
    isProductAdded();
  }, [cart, isProductAdded]);

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      style={{ width: "100%", height: "100%" }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          height: "100%",
          position: "relative",
          borderRadius: "18px",
          backgroundColor: "#fff",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
          border: isAdded ? "2px solid var(--primary)" : "1px solid rgba(0,0,0,0.06)",
          boxShadow: isAdded
            ? "0 8px 28px rgba(26, 77, 46, 0.16)"
            : "0 1px 6px rgba(0,0,0,0.04)",
          "&:hover": {
            boxShadow: "0 12px 36px rgba(26, 77, 46, 0.12), 0 2px 8px rgba(0,0,0,0.04)",
            "& .product-image": {
              transform: "scale(1.06)",
            },
            "& .hover-actions": {
              opacity: 1,
              transform: "translateY(0)",
            },
          },
        }}
      >
        <Snackbar open={open} autoHideDuration={2500} onClose={handleClose} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
          <Alert onClose={handleClose} severity={isAdded ? "success" : "info"} sx={{ width: "100%" }}>
            {product.name + (!isAdded ? ` removed from cart` : ` added to cart`)}
          </Alert>
        </Snackbar>

        {/* Image Area */}
        <Box
          sx={{
            position: "relative",
            overflow: "hidden",
            cursor: "pointer",
            background: "linear-gradient(145deg, #f9f7f2 0%, #f0ece2 100%)",
            aspectRatio: "1",
          }}
          onClick={navigateToProduct}
        >
          <Image
            className="product-image"
            src={`https://e-com.incrix.com/Sankamithra%20Products/${product.image[0]}`}
            alt={product.name || "Product image"}
            fill
            style={{
              objectFit: "contain",
              padding: "10px",
              transition: "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
            sizes="(max-width: 600px) 50vw, (max-width: 960px) 33vw, 20vw"
          />

          {/* Discount ribbon */}
          {product.discount > 0 && (
            <Box
              sx={{
                position: "absolute",
                top: 10,
                left: 0,
                display: "flex",
                alignItems: "center",
                gap: 0.3,
                background: "var(--tertiary)",
                color: "#fff",
                fontSize: { xs: "10px", sm: "11px" },
                fontWeight: 800,
                px: { xs: 0.8, sm: 1.2 },
                py: 0.35,
                borderRadius: "0 6px 6px 0",
                letterSpacing: "0.2px",
              }}
            >
              <LocalOfferRoundedIcon sx={{ fontSize: 11 }} />
              {product.discount}% OFF
            </Box>
          )}

          {/* Badge */}
          {product.badge && (
            <Box
              sx={{
                position: "absolute",
                top: 10,
                right: 10,
                background: "var(--gold-gradient)",
                borderRadius: "6px",
                px: 1,
                py: 0.2,
                fontSize: "9px",
                fontWeight: 700,
                color: "#fff",
                letterSpacing: "0.3px",
              }}
            >
              {product.badge}
            </Box>
          )}

          {/* Quick add on hover */}
          {!isAdded && (
            <Box
              className="hover-actions"
              sx={{
                position: "absolute",
                bottom: 10,
                right: 10,
                opacity: 0,
                transform: "translateY(6px)",
                transition: "all 0.25s ease",
              }}
            >
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  let cart = JSON.parse(localStorage.getItem("cart")) || [];
                  let item = cart.filter((item) => item.id == product.id)[0];
                  if (item) {
                    item.count += count;
                  } else {
                    cart.push({ ...product, count: count });
                  }
                  localStorage.setItem("cart", JSON.stringify(cart));
                  setIsAdded(true);
                  handleOpen();
                }}
                sx={{
                  background: "var(--primary)",
                  color: "#fff",
                  width: 36,
                  height: 36,
                  boxShadow: "0 4px 12px rgba(26, 77, 46, 0.35)",
                  "&:hover": { background: "var(--primary)", opacity: 0.95 },
                }}
              >
                <ShoppingCart sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          )}
        </Box>

        {/* Content */}
        <Stack sx={{ p: { xs: 1.2, sm: 1.8 }, flex: 1, justifyContent: "space-between", gap: 0.8 }}>
          {/* Top: Name + Price */}
          <Stack gap={0.4}>
            <Typography
              onClick={navigateToProduct}
              sx={{
                fontSize: { xs: "13px", sm: "14px" },
                fontWeight: 600,
                cursor: "pointer",
                color: "var(--foreground)",
                lineHeight: 1.35,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                minHeight: { xs: "35px", sm: "38px" },
                transition: "color 0.2s",
                "&:hover": { color: "var(--primary)" },
              }}
            >
              {product.name}
            </Typography>

            <Stack direction="row" alignItems="center" gap={0.6} flexWrap="wrap">
              <Typography sx={{ fontWeight: 800, color: "var(--primary)", fontSize: { xs: "17px", sm: "20px" }, lineHeight: 1 }}>
                ₹{discountedPrice}
              </Typography>
              {product.discount > 0 && (
                <Typography sx={{ color: "#ccc", fontSize: { xs: "11px", sm: "12px" }, textDecoration: "line-through" }}>
                  ₹{product.price}
                </Typography>
              )}
            </Stack>
          </Stack>

          {/* Bottom: Actions */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            {/* Quantity */}
            <Stack
              direction="row"
              alignItems="center"
              sx={{
                borderRadius: "10px",
                overflow: "hidden",
                border: "1.5px solid var(--border)",
                background: "#fafaf7",
              }}
            >
              <IconButton
                onClick={handleDecrement}
                size="small"
                sx={{
                  borderRadius: 0,
                  width: { xs: 26, sm: 30 },
                  height: { xs: 26, sm: 30 },
                  color: "var(--primary)",
                  "&:hover": { background: "var(--category-color)" },
                }}
              >
                <RemoveRoundedIcon sx={{ fontSize: { xs: 13, sm: 15 } }} />
              </IconButton>
              <Box
                sx={{
                  minWidth: { xs: 24, sm: 30 },
                  height: { xs: 26, sm: 30 },
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  color: "var(--primary)",
                  fontSize: { xs: "12px", sm: "13px" },
                  borderLeft: "1.5px solid var(--border)",
                  borderRight: "1.5px solid var(--border)",
                }}
              >
                {count}
              </Box>
              <IconButton
                onClick={handleIncrement}
                size="small"
                sx={{
                  borderRadius: 0,
                  width: { xs: 26, sm: 30 },
                  height: { xs: 26, sm: 30 },
                  color: "var(--primary)",
                  "&:hover": { background: "var(--category-color)" },
                }}
              >
                <AddRoundedIcon sx={{ fontSize: { xs: 13, sm: 15 } }} />
              </IconButton>
            </Stack>

            {/* Add/Remove */}
            <motion.div whileTap={{ scale: 0.9 }}>
              <Button
                disableElevation
                variant="contained"
                size="small"
                onClick={() => {
                  if (!isAdded) {
                    let cart = JSON.parse(localStorage.getItem("cart")) || [];
                    let item = cart.filter((item) => item.id == product.id)[0];
                    if (item) {
                      item.count += count;
                    } else {
                      cart.push({ ...product, count: count });
                    }
                    localStorage.setItem("cart", JSON.stringify(cart));
                    setIsAdded(true);
                    handleOpen();
                  } else {
                    let cart = JSON.parse(localStorage.getItem("cart")) || [];
                    let newCart = cart.filter((item) => item.id != product.id);
                    localStorage.setItem("cart", JSON.stringify(newCart));
                    setIsAdded(false);
                    handleOpen();
                  }
                }}
                sx={{
                  color: "white",
                  fontWeight: 700,
                  textTransform: "none",
                  fontSize: { xs: "11px", sm: "12px" },
                  background: isAdded ? "var(--tertiary)" : "var(--primary)",
                  borderRadius: "10px",
                  px: { xs: 1.2, sm: 2 },
                  py: { xs: 0.5, sm: 0.7 },
                  minHeight: 0,
                  minWidth: 0,
                  boxShadow: isAdded
                    ? "0 2px 10px rgba(139, 26, 26, 0.2)"
                    : "0 2px 10px rgba(26, 77, 46, 0.2)",
                  "&:hover": {
                    opacity: 0.9,
                    background: isAdded ? "var(--tertiary)" : "var(--primary)",
                  },
                }}
              >
                {isAdded ? "Remove" : "Add"}
              </Button>
            </motion.div>
          </Stack>
        </Stack>

        {/* Cart indicator line */}
        <Box
          sx={{
            height: isAdded ? "3px" : "0px",
            background: "var(--primary)",
            transition: "height 0.3s ease",
          }}
        />
      </Paper>
    </motion.div>
  );
}
