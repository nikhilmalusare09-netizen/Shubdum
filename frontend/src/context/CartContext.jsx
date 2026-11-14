import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const saved = sessionStorage.getItem('shubdum_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedTable, setSelectedTable] = useState(() => {
    return sessionStorage.getItem('shubdum_table') || '';
  });

  const [customerDetails, setCustomerDetails] = useState(() => {
    try {
      const saved = sessionStorage.getItem('shubdum_customer');
      return saved ? JSON.parse(saved) : { name: '', phone: '', notes: '' };
    } catch {
      return { name: '', phone: '', notes: '' };
    }
  });

  useEffect(() => {
    sessionStorage.setItem('shubdum_cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (selectedTable) {
      sessionStorage.setItem('shubdum_table', selectedTable);
    } else {
      sessionStorage.removeItem('shubdum_table');
    }
  }, [selectedTable]);

  useEffect(() => {
    sessionStorage.setItem('shubdum_customer', JSON.stringify(customerDetails));
  }, [customerDetails]);

  const addItem = (dish) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.dish.id === dish.id);
      if (existing) {
        return prev.map((i) =>
          i.dish.id === dish.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { dish, quantity: 1 }];
    });
  };

  const updateQuantity = (dishId, newQty) => {
    if (newQty <= 0) {
      removeItem(dishId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.dish.id === dishId ? { ...i, quantity: newQty } : i))
    );
  };

  const removeItem = (dishId) => {
    setItems((prev) => prev.filter((i) => i.dish.id !== dishId));
  };

  const clearCart = () => {
    setItems([]);
    sessionStorage.removeItem('shubdum_cart');
  };

  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.dish.price) * item.quantity,
    0
  );

  const additionalCharges = 0; // Dine-in included
  const grandTotal = subtotal + additionalCharges;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        totalItemsCount,
        subtotal,
        additionalCharges,
        grandTotal,
        selectedTable,
        setSelectedTable,
        customerDetails,
        setCustomerDetails,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

