import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { AdminAuthProvider, useAdminAuth } from './contexts/AdminAuthContext';
import { Toaster } from './components/ui/sonner';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminLayout from './components/admin/AdminLayout';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Auth from './pages/Auth';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Account from './pages/Account';
import BozPlus from './pages/BozPlus';
import About from './pages/About';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCategories from './pages/admin/AdminCategories';
import AdminCategoryProducts from './pages/admin/AdminCategoryProducts';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminBozPlus from './pages/admin/AdminBozPlus';
import AdminBozPlusPricing from './pages/admin/AdminBozPlusPricing';
import './App.css';

// Protected Admin Route Component
const ProtectedAdminRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C9A962]"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AdminAuthProvider>
          <BrowserRouter>
            <div className="App">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={
                  <>
                    <Navbar />
                  <Home />
                  <Footer />
                </>
              } />
              <Route path="/products" element={
                <>
                  <Navbar />
                  <Products />
                  <Footer />
                </>
              } />
              <Route path="/products/:id" element={
                <>
                  <Navbar />
                  <ProductDetail />
                  <Footer />
                </>
              } />
              <Route path="/auth" element={
                <>
                  <Navbar />
                  <Auth />
                  <Footer />
                </>
              } />
              <Route path="/cart" element={
                <>
                  <Navbar />
                  <Cart />
                  <Footer />
                </>
              } />
              <Route path="/checkout" element={
                <>
                  <Navbar />
                  <Checkout />
                  <Footer />
                </>
              } />
              <Route path="/orders" element={
                <>
                  <Navbar />
                  <Orders />
                  <Footer />
                </>
              } />
              <Route path="/boz-plus" element={
                <>
                  <Navbar />
                  <BozPlus />
                  <Footer />
                </>
              } />
              <Route path="/about" element={
                <>
                  <Navbar />
                  <About />
                  <Footer />
                </>
              } />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={
                <ProtectedAdminRoute>
                  <AdminLayout />
                </ProtectedAdminRoute>
              }>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="products/new" element={<AdminProductForm />} />
                <Route path="products/edit/:id" element={<AdminProductForm />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="categories/:categoryName/products" element={<AdminCategoryProducts />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="boz-plus" element={<AdminBozPlus />} />
                <Route path="boz-plus-pricing" element={<AdminBozPlusPricing />} />
              </Route>
            </Routes>
            <Toaster position="top-right" />
          </div>
        </BrowserRouter>
      </AdminAuthProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;