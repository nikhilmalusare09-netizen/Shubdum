import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, Phone, MapPin, CheckCircle2, AlertCircle, ArrowLeft, 
  Send, ShieldCheck, Loader2, Sparkles, UtensilsCrossed, ChevronDown 
} from 'lucide-react';
import VegBadge from '../components/VegBadge';
import { useCart } from '../context/CartContext';
import { fetchTables } from '../api/adminApi';
import { createOrder } from '../api/orderApi';
import { socketManager } from '../api/socket';

// Default guaranteed 10 tables for instant display & offline fallback
const DEFAULT_TABLES = [
  { id: 1, tableNumber: 'Table 01', capacity: 4, occupied: false },
  { id: 2, tableNumber: 'Table 02', capacity: 4, occupied: false },
  { id: 3, tableNumber: 'Table 03', capacity: 4, capacityLabel: '4 Seats', occupied: false },
  { id: 4, tableNumber: 'Table 04', capacity: 4, occupied: false },
  { id: 5, tableNumber: 'Table 05', capacity: 6, occupied: false },
  { id: 6, tableNumber: 'Table 06', capacity: 6, occupied: false },
  { id: 7, tableNumber: 'Table 07', capacity: 6, occupied: false },
  { id: 8, tableNumber: 'Table 08', capacity: 6, occupied: false },
  { id: 9, tableNumber: 'Table 09', capacity: 8, occupied: false },
  { id: 10, tableNumber: 'Table 10', capacity: 8, occupied: false },
];

const CheckoutPage = () => {
  const navigate = useNavigate();
  const {
    items,
    subtotal,
    additionalCharges,
    grandTotal,
    clearCart,
    selectedTable,
    setSelectedTable,
    customerDetails,
    setCustomerDetails,
  } = useCart();

  const [name, setName] = useState(customerDetails.name || '');
  const [phone, setPhone] = useState(customerDetails.phone || '');
  const [notes, setNotes] = useState(customerDetails.notes || '');

  // Pre-populate with default tables so options are never missing or blank
  const [tables, setTables] = useState(DEFAULT_TABLES);
  const [loadingTables, setLoadingTables] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Load tables from backend & merge live occupancy
  const loadTablesList = async () => {
    try {
      const data = await fetchTables();
      if (Array.isArray(data) && data.length > 0) {
        setTables(data);
      } else {
        setTables(DEFAULT_TABLES);
      }
    } catch (err) {
      console.warn('Backend tables unavailable, showing default restaurant tables:', err);
      // Keep DEFAULT_TABLES
    } finally {
      setLoadingTables(false);
    }
  };

  useEffect(() => {
    loadTablesList();

    // Subscribe to live table updates
    const unsubscribe = socketManager.subscribe('/topic/tables', () => {
      loadTablesList();
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Sync customer details to cart context
  useEffect(() => {
    setCustomerDetails({ name, phone, notes });
  }, [name, phone, notes]);

  // If cart is empty, redirect to order
  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-stone-900">Your cart is empty</h2>
        <p className="text-sm text-stone-500">Please select food items before checking out.</p>
        <Link
          to="/order"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-700 text-white font-bold text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go to Food Menu</span>
        </Link>
      </div>
    );
  }

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!selectedTable) {
      setErrorMessage('Please select a dining table from the table map below.');
      return;
    }

    setSubmitting(true);
    try {
      const orderPayload = {
        customerName: name.trim(),
        customerPhone: cleanPhone,
        tableNumber: selectedTable,
        notes: notes.trim() || null,
        items: items.map((i) => ({
          menuItemId: i.dish.id,
          quantity: i.quantity,
        })),
      };

      const response = await createOrder(orderPayload);
      clearCart();

      // Store in customer local history for 1-click tracking
      try {
        const recent = JSON.parse(localStorage.getItem('shubdum_my_orders') || '[]');
        const updated = [
          {
            orderId: response.orderId,
            trackingToken: response.trackingToken,
            customerName: response.customerName,
            customerPhone: response.customerPhone,
            tableNumber: response.tableNumber,
            grandTotal: response.grandTotal,
            createdAt: response.createdAt || new Date().toISOString(),
          },
          ...recent.filter((r) => r.orderId !== response.orderId),
        ].slice(0, 10);
        localStorage.setItem('shubdum_my_orders', JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not save recent order locally', e);
      }

      // Redirect to customer order tracking page with secure token
      navigate(`/track/${response.trackingToken}`, {
        state: { newOrderPlaced: true, orderId: response.orderId },
      });
    } catch (err) {
      console.error('Order submission error', err);
      const msg = err.response?.data?.message || 'Failed to place order. Please try again.';
      setErrorMessage(msg);
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Title */}
      <div className="border-b border-stone-200 pb-5">
        <div className="flex items-center gap-2">
          <Link
            to="/cart"
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
              Steps 4, 5 &amp; 6
            </span>
            <h1 className="font-serif text-3xl font-bold text-stone-900 mt-2">
              Dine-In Checkout &amp; Table Selection
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              No account creation required. Direct dining access with instant table reservation.
            </p>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold block">Could not place order</strong>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Customer Details & Table Map */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* STEP 4: CUSTOMER DETAILS */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center">
                  04
                </div>
                <h2 className="font-serif text-lg font-bold text-stone-900">
                  Customer Details (No Login Needed)
                </h2>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                Direct Access
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide">
                  Your Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide">
                  Mobile Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="10-digit mobile number"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide">
                Special Cooking Instructions / Requests
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Extra spicy, no onions, extra schezwan dip..."
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 shadow-sm"
              />
            </div>
          </div>

          {/* STEP 5: TABLE SELECTION (DROPDOWN OPTION + INTERACTIVE MAP) */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center">
                  05
                </div>
                <div>
                  <h2 className="font-serif text-lg font-bold text-stone-900 leading-snug">
                    Select Restaurant Table
                  </h2>
                  <span className="text-xs text-stone-500">
                    Tables 01 to 10 &bull; Live Dining Layout
                  </span>
                </div>
              </div>

              {/* Status Legend */}
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-stone-600 font-medium">Available</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-stone-600 font-medium">Occupied</span>
                </div>
              </div>
            </div>

            {/* OPTION A: TABLE SELECTION DROPDOWN */}
            <div className="bg-stone-50/80 rounded-xl p-4 border border-stone-200 space-y-2">
              <div className="flex items-center justify-between">
                <label 
                  htmlFor="table-dropdown-select" 
                  className="block text-xs font-bold text-stone-700 uppercase tracking-wide flex items-center gap-1.5"
                >
                  <UtensilsCrossed className="w-3.5 h-3.5 text-red-700" />
                  <span>Table Selection Option (Dropdown) *</span>
                </label>
                {selectedTable && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {selectedTable} Selected
                  </span>
                )}
              </div>

              <div className="relative">
                <select
                  id="table-dropdown-select"
                  value={selectedTable || ''}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  className="w-full appearance-none pl-4 pr-10 py-3 rounded-xl border-2 border-stone-300 bg-white text-stone-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 shadow-sm cursor-pointer transition-colors"
                >
                  <option value="" disabled>-- Click here to choose your Table (Table 01 - Table 10) --</option>
                  {tables.map((tbl) => {
                    const isOccupied = Boolean(tbl.occupied);
                    return (
                      <option
                        key={tbl.id || tbl.tableNumber}
                        value={tbl.tableNumber}
                        disabled={isOccupied}
                      >
                        {tbl.tableNumber} ({tbl.capacity} Seats) {isOccupied ? '— Occupied (Unavailable)' : '— Available ✓'}
                      </option>
                    );
                  })}
                </select>
                <ChevronDown className="w-5 h-5 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <p className="text-[11px] text-stone-500">
                Choose your table from this dropdown, or click directly on any table card below.
              </p>
            </div>

            {/* OPTION B: VISUAL INTERACTIVE TABLE MAP */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wide">
                  Or Click Table on Dining Map:
                </span>
                {loadingTables && (
                  <span className="text-xs text-stone-400 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin text-red-700" />
                    Syncing live tables...
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {tables.map((tbl) => {
                  const isOccupied = Boolean(tbl.occupied);
                  const isSelected = selectedTable === tbl.tableNumber;

                  return (
                    <button
                      key={tbl.id || tbl.tableNumber}
                      type="button"
                      disabled={isOccupied}
                      onClick={() => setSelectedTable(tbl.tableNumber)}
                      className={`relative p-3.5 rounded-xl border-2 text-center transition-all flex flex-col items-center justify-between min-h-[96px] ${
                        isSelected
                          ? 'border-red-600 bg-red-50 text-red-950 font-bold shadow-md scale-105 ring-2 ring-red-400/50'
                          : isOccupied
                          ? 'border-stone-200 bg-stone-100 text-stone-400 cursor-not-allowed opacity-60'
                          : 'border-emerald-200 bg-emerald-50/50 hover:border-emerald-400 text-emerald-950 hover:bg-emerald-50 active:scale-95 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            isOccupied ? 'bg-rose-500' : 'bg-emerald-500'
                          }`}
                        />
                        <span className="text-[10px] font-semibold text-stone-500">
                          {tbl.capacity} Seats
                        </span>
                      </div>

                      <div className="my-1.5">
                        <span className="text-sm font-extrabold block">
                          {tbl.tableNumber}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${
                          isOccupied 
                            ? 'text-rose-600' 
                            : isSelected 
                            ? 'text-red-700 font-black' 
                            : 'text-emerald-700'
                        }`}
                      >
                        {isOccupied ? 'Occupied' : isSelected ? '✓ Selected' : 'Available'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SELECTION CONFIRMATION / PROMPT */}
            {selectedTable ? (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between shadow-sm">
                <span className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Reserved for this order: <strong className="font-extrabold text-sm text-emerald-800">{selectedTable}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedTable('')}
                  className="text-stone-500 hover:text-stone-800 underline text-xs font-semibold"
                >
                  Change Table
                </button>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Please select a dining table using the dropdown above or by clicking any available table card.</span>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: STEP 6: ORDER SUMMARY & PLACE ORDER */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
              <div className="w-7 h-7 rounded-lg bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center">
                06
              </div>
              <h2 className="font-serif text-lg font-bold text-stone-900">
                Order Confirmation
              </h2>
            </div>

            {/* Selected items breakdown */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1 divide-y divide-stone-100 text-xs">
              {items.map(({ dish, quantity }) => (
                <div key={dish.id} className="pt-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <VegBadge isVeg={dish.foodType} size="sm" />
                    <span className="font-semibold text-stone-900 truncate">
                      {dish.name}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-stone-500">
                      {quantity} &times; ₹{dish.price} =
                    </span>{' '}
                    <strong className="text-stone-900 font-bold">
                      ₹{Number(dish.price) * quantity}
                    </strong>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="pt-4 border-t border-stone-200 space-y-2 text-sm">
              <div className="flex items-center justify-between text-stone-600">
                <span>Subtotal</span>
                <span className="font-semibold text-stone-900">₹{subtotal}</span>
              </div>
              <div className="flex items-center justify-between text-stone-600">
                <span>Dine-in Charges</span>
                <span className="font-semibold text-stone-900">₹{additionalCharges}</span>
              </div>
              <div className="pt-2 border-t border-dashed border-stone-200 flex items-center justify-between">
                <div>
                  <span className="font-serif text-lg font-bold text-stone-900 block">
                    Grand Total
                  </span>
                  <span className="text-[11px] text-stone-500">
                    Cash Payment at Restaurant
                  </span>
                </div>
                <span className="text-2xl font-black text-red-700">
                  ₹{grandTotal}
                </span>
              </div>
            </div>

            {/* Table & Customer verification pill */}
            <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-100 text-xs space-y-1.5 text-stone-600">
              <div className="flex justify-between">
                <span>Table:</span>
                <strong className="text-stone-900">{selectedTable || 'None selected'}</strong>
              </div>
              <div className="flex justify-between">
                <span>Customer:</span>
                <strong className="text-stone-900">{name || '—'}</strong>
              </div>
              <div className="flex justify-between">
                <span>Contact:</span>
                <strong className="text-stone-900">{phone || '—'}</strong>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-base shadow-xl shadow-red-900/20 active:scale-95 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Placing Order with Kitchen...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>PLACE ORDER NOW</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-2 text-[11px] text-stone-500 justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>An order is pending until approved by restaurant admin.</span>
            </div>
          </div>
        </div>

      </form>

    </div>
  );
};

export default CheckoutPage;

