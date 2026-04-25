"use client";

import React, { createContext, useContext, useState, useMemo } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  const addToCart = (product, qty = 1) => {
    setCart((prev) => {
      const id = typeof product === "object" ? product.id : product;
      const existing = prev.find((i) => i.id === id);
      if (existing) {
        return prev.map((i) =>
          i.id === id ? { ...i, count: i.count + qty } : i
        );
      }
      const newItem =
        typeof product === "object"
          ? { ...product, count: qty }
          : { id, count: qty };
      return [...prev, newItem];
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const updateCount = (id, newCount) => {
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, count: newCount } : i))
    );
  };

  const clearCart = () => setCart([]);

  const totalItems = useMemo(
    () => cart.reduce((sum, item) => sum + (item.count || 0), 0),
    [cart]
  );

  const totalPrice = useMemo(
    () =>
      cart.reduce((sum, item) => {
        const unitPrice = item.discount
          ? Math.round(item.price - (item.price * item.discount) / 100)
          : Number(item.price) || 0;
        return sum + (item.count || 0) * unitPrice;
      }, 0),
    [cart]
  );

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateCount,
    clearCart,
    totalItems,
    totalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
