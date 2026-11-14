import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import OrderingPage from './pages/OrderingPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardLayout from './pages/admin/AdminDashboardLayout';
import OverviewPage from './pages/admin/OverviewPage';
import LiveOrdersPage from './pages/admin/LiveOrdersPage';
import TableBillingPage from './pages/admin/TableBillingPage';
import MenuManagementPage from './pages/admin/MenuManagementPage';
import TableManagementPage from './pages/admin/TableManagementPage';
import OrderHistoryPage from './pages/admin/OrderHistoryPage';
import { CartProvider } from './context/CartContext';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';

// Protected Route Wrapper for Admin
const ProtectedAdminRoute = ({ children }) => {
  const { isAuthenticated } = useAdminAuth();
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

// Customer Layout with Navigation & Footer
const CustomerLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AdminAuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            {/* Customer Direct Access Flow (Strictly NO Login Required) */}
            <Route path="/" element={<CustomerLayout><HomePage /></CustomerLayout>} />
            <Route path="/order" element={<CustomerLayout><OrderingPage /></CustomerLayout>} />
            <Route path="/cart" element={<CustomerLayout><CartPage /></CustomerLayout>} />
            <Route path="/checkout" element={<CustomerLayout><CheckoutPage /></CustomerLayout>} />
            <Route path="/track" element={<CustomerLayout><OrderTrackingPage /></CustomerLayout>} />
            <Route path="/track/:trackingToken" element={<CustomerLayout><OrderTrackingPage /></CustomerLayout>} />

            {/* Admin Authentication */}
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* Admin Protected Dashboard */}
            <Route
              path="/admin"
              element={
                <ProtectedAdminRoute>
                  <AdminDashboardLayout />
                </ProtectedAdminRoute>
              }
            >
              <Route index element={<OverviewPage />} />
              <Route path="orders" element={<LiveOrdersPage />} />
              <Route path="billing" element={<TableBillingPage />} />
              <Route path="menu" element={<MenuManagementPage />} />
              <Route path="tables" element={<TableManagementPage />} />
              <Route path="history" element={<OrderHistoryPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AdminAuthProvider>
  );
}

export default App;

