import { useState, useEffect } from 'react';

export function useCart(companySlug, tableNumber) {
  const storageKey = `simple_order_cart_${companySlug || 'default'}_${tableNumber || 'counter'}`;

  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(cart));
    } catch (_) {}
  }, [cart, storageKey]);

  const addItem = (product, quantity = 1, notes = '') => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.productId === product.id && item.notes === notes
      );

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += quantity;
        return next;
      }

      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: Number(product.price),
          imageUrl: product.imageUrl,
          quantity,
          notes,
        },
      ];
    });
  };

  const updateQuantity = (index, newQuantity) => {
    setCart((prev) => {
      if (newQuantity <= 0) {
        return prev.filter((_, i) => i !== index);
      }
      const next = [...prev];
      next[index].quantity = newQuantity;
      return next;
    });
  };

  const removeItem = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setCart([]);
    try {
      localStorage.removeItem(storageKey);
    } catch (_) {}
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return {
    cart,
    total,
    totalItems,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  };
}
