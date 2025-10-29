import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user, token } = useAuth();

  const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  useEffect(() => {
    if (user && token) {
      fetchCart();
    } else {
      setCart([]);
      setCartCount(0);
    }
  }, [user, token]);

  const fetchCart = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart(response.data.cart || []);
      setCartCount(response.data.cart?.length || 0);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      toast.error('Lütfen giriş yapın');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/cart/add`,
        { product_id: productId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      await fetchCart();
      toast.success('Ürün sepete eklendi!');
      return response.data;
    } catch (error) {
      toast.error('Ürün eklenemedi');
      console.error('Failed to add to cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (productId, quantity) => {
    setLoading(true);
    try {
      await axios.put(
        `${API_URL}/api/cart/update`,
        { product_id: productId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      await fetchCart();
      toast.success('Sepet güncellendi');
    } catch (error) {
      toast.error('Güncelleme başarısız');
      console.error('Failed to update cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/api/cart/remove/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      await fetchCart();
      toast.success('Ürün sepetten çıkarıldı');
    } catch (error) {
      toast.error('Silme başarısız');
      console.error('Failed to remove from cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/api/cart/clear`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCart([]);
      setCartCount(0);
      toast.success('Sepet temizlendi');
    } catch (error) {
      toast.error('Temizleme başarısız');
      console.error('Failed to clear cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.subtotal, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        loading,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        getCartTotal,
        fetchCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
