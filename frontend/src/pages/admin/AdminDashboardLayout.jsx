import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingBag, Receipt, UtensilsCrossed, 
  Layers, History, LogOut, ExternalLink, ShieldCheck, 
  Menu, X, Bell, Wifi, WifiOff 
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { socketManager } from '../../api/socket';

const AdminDashboardLayout = () => {
  const { admin, logout } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [wsConnected, setWsConnected] = useState(socketManager.connected);
  const [pendingAlertCount, setPendingAlertCount] = useState(0);

  useEffect(() => {
    // Monitor websocket connection
    const checkConn = () => setWsConnected(socketManager.connected);
    const interval = setInterval(checkConn, 3000);

    // Subscribe to new orders to sound notification chime
    const unsubscribe = socketManager.subscribe('/topic/admin/orders', (payload) => {
      if (payload && payload.type === 'NEW_ORDER') {
        setPendingAlertCount((prev) => prev + 1);
        try {
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
          audio.play().catch(() => {});
        } catch {}
      }
    });

    return () => {
      clearInterval(interval);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const navItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Live Orders', path: '/admin/orders', icon: ShoppingBag, badge: pendingAlertCount },
    { label: 'Table Billing', path: '/admin/billing', icon: Receipt },
    { label: 'Menu Management', path: '/admin/menu', icon: UtensilsCrossed },
    { label: 'Table Management', path: '/admin/tables', icon: Layers },
    { label: 'Order History', path: '/admin/history', icon: History },
  ];

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col md:flex-row">
      
      {/* MOBILE HEADER */}
      <div className="md:hidden bg-stone-900 text-white px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-700 p-1 flex items-center justify-center">
            <img src="/logo.svg" alt="Shubdum" className="w-full h-full object-contain" />
          </div>
          <span className="font-serif font-bold text-sm tracking-wide">
            SHUBDUM ADMIN
          </span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-lg text-stone-300 hover:text-white"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* SIDEBAR NAVIGATION */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-stone-900 text-stone-300 flex flex-col justify-between p-5 z-40 transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Brand */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-700 to-amber-700 p-1.5 flex items-center justify-center shadow">
              <img src="/logo.svg" alt="Shubdum" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="block font-serif text-lg font-bold text-white leading-tight">
                SHUBDUM
              </span>
              <span className="block text-[10px] font-semibold text-amber-500 uppercase tracking-widest">
                Management System
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-xs sm:text-sm transition-all ${
                    active
                      ? 'bg-red-700 text-white font-bold shadow-md'
                      : 'text-stone-400 hover:text-white hover:bg-stone-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>

                  {item.badge > 0 && (
                    <span className="bg-amber-400 text-red-950 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="pt-4 border-t border-stone-800 space-y-3">
          {/* Real-time indicator */}
          <div className="px-3 py-2 rounded-xl bg-stone-800/80 border border-stone-700/60 flex items-center justify-between text-xs">
            <span className="text-stone-400 text-[11px] flex items-center gap-1.5">
              {wsConnected ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live WebSocket
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Connecting...
                </>
              )}
            </span>
            <span className="text-[10px] text-stone-500 font-mono">PORT 8080</span>
          </div>

          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 text-xs transition-colors"
          >
            <span>Customer Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 text-xs font-semibold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <Outlet />
      </main>

    </div>
  );
};

export default AdminDashboardLayout;

