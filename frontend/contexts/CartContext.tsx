'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import api from '@/lib/api';
import type { CartItem, CartResponse } from '@/lib/types';
import { useAuth } from './AuthContext';

interface CartContextType {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
  loading: boolean;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  removeItem: (cartItemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      setSubtotal(0);
      setItemCount(0);
      return;
    }
    try {
      setLoading(true);
      const data = await api.get<CartResponse>('/cart');
      setItems(data.items);
      setSubtotal(data.subtotal);
      setItemCount(data.item_count);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId: number, quantity = 1) => {
    await api.post('/cart', { product_id: productId, quantity });
    await refreshCart();
  };

  const updateQuantity = async (cartItemId: number, quantity: number) => {
    await api.put(`/cart/${cartItemId}`, { quantity });
    await refreshCart();
  };

  const removeItem = async (cartItemId: number) => {
    await api.delete(`/cart/${cartItemId}`);
    await refreshCart();
  };

  const clearCart = async () => {
    await api.delete('/cart-clear');
    await refreshCart();
  };

  return (
    <CartContext.Provider value={{ items, subtotal, itemCount, loading, addToCart, updateQuantity, removeItem, clearCart, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
