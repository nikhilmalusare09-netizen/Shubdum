import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminLogin as apiLogin } from '../api/adminApi';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    try {
      const saved = localStorage.getItem('shubdum_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('shubdum_admin_token') || null;
  });

  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const data = await apiLogin(username, password);
      setToken(data.token);
      const user = { username: data.username, fullName: data.fullName, role: data.role };
      setAdmin(user);
      localStorage.setItem('shubdum_admin_token', data.token);
      localStorage.setItem('shubdum_admin_user', JSON.stringify(user));
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid username or password';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setAdmin(null);
    setToken(null);
    localStorage.removeItem('shubdum_admin_token');
    localStorage.removeItem('shubdum_admin_user');
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        token,
        isAuthenticated: !!token,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return context;
};

