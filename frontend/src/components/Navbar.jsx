import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, UtensilsCrossed, Compass, Shield, Menu, X, PhoneCall } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { totalItemsCount, grandTotal } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3.5 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-700 via-red-800 to-amber-700 p-2 shadow-md group-hover:scale-105 transition-transform flex items-center justify-center">
              <img src="/logo.svg" alt="Shubdum Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="block font-serif text-xl sm:text-2xl font-bold text-red-900 tracking-tight leading-tight group-hover:text-red-700 transition-colors">
                SHUBDUM
              </span>
              <span className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-amber-700">
                Chinese Corner &amp; Indian Kitchen
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/order"
              className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
                isActive('/order')
                  ? 'text-red-700 border-b-2 border-red-700 pb-1'
                  : 'text-stone-700 hover:text-red-700'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              Browse Menu
            </Link>

            <Link
              to="/track"
              className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
                isActive('/track')
                  ? 'text-red-700 border-b-2 border-red-700 pb-1'
                  : 'text-stone-700 hover:text-red-700'
              }`}
            >
              <Compass className="w-4 h-4" />
              Track Order
            </Link>

            <a
              href="tel:+919876543210"
              className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 font-medium"
            >
              <PhoneCall className="w-3.5 h-3.5 text-amber-600" />
              Thane East
            </a>

            {/* Cart Button */}
            <Link
              to="/cart"
              className="relative flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-red-700 hover:bg-red-800 text-white font-medium text-sm shadow-md hover:shadow-lg transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Cart</span>
              {totalItemsCount > 0 ? (
                <span className="bg-amber-400 text-red-950 text-xs font-extrabold px-2 py-0.5 rounded-full">
                  {totalItemsCount} &middot; ₹{grandTotal}
                </span>
              ) : (
                <span className="bg-red-800 text-red-200 text-xs px-2 py-0.5 rounded-full">
                  0
                </span>
              )}
            </Link>

            {/* Admin Portal Shortcut */}
            <Link
              to="/admin/login"
              className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 border border-stone-200 px-3 py-1.5 rounded-lg hover:bg-stone-50 transition-colors"
              title="Restaurant Management Portal"
            >
              <Shield className="w-3.5 h-3.5 text-stone-600" />
              Admin
            </Link>
          </nav>

          {/* Mobile Menu & Cart Icon */}
          <div className="flex md:hidden items-center gap-3">
            <Link
              to="/cart"
              className="relative p-2.5 rounded-full bg-red-700 text-white shadow"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-400 text-red-950 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                  {totalItemsCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-stone-700 hover:bg-stone-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <Link
            to="/order"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-stone-800 font-semibold hover:bg-stone-50"
          >
            <UtensilsCrossed className="w-5 h-5 text-red-700" />
            Browse Menu &amp; Order
          </Link>
          <Link
            to="/track"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-stone-800 font-semibold hover:bg-stone-50"
          >
            <Compass className="w-5 h-5 text-amber-600" />
            Track Ongoing Order
          </Link>
          <Link
            to="/cart"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-red-50 text-red-900 font-semibold"
          >
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-red-700" />
              Shopping Cart
            </div>
            <span className="bg-red-700 text-white text-xs px-2.5 py-1 rounded-full font-bold">
              {totalItemsCount} items &middot; ₹{grandTotal}
            </span>
          </Link>
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between px-3">
            <span className="text-xs text-stone-500">Restaurant Staff Only</span>
            <Link
              to="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 hover:text-red-700"
            >
              <Shield className="w-4 h-4 text-stone-500" />
              Admin Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

