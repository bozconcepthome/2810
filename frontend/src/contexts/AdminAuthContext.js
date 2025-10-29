import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AdminAuthContext = createContext();

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      try {
        const response = await axios.get(`${API_URL}/api/admin/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAdmin(response.data);
      } catch (error) {
        localStorage.removeItem('adminToken');
        setAdmin(null);
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/admin/auth/login`, {
        email,
        password
      });
      
      const { access_token } = response.data;
      localStorage.setItem('adminToken', access_token);
      
      // Get admin info
      const adminResponse = await axios.get(`${API_URL}/api/admin/auth/me`, {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      
      setAdmin(adminResponse.data);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.detail || 'Giriş başarısız'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setAdmin(null);
  };

  const getAuthHeader = () => {
    const token = localStorage.getItem('adminToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        loading,
        login,
        logout,
        getAuthHeader,
        isAuthenticated: !!admin
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};
