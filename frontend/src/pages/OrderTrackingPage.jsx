import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  Compass, Clock, CheckCircle2, ChefHat, Bell, Download, 
  Printer, ArrowLeft, RefreshCw, AlertCircle, Phone, User, 
  MapPin, Utensils, Receipt, Sparkles, XCircle, Search, History, ChevronRight, Eye 
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import VegBadge from '../components/VegBadge';
import { trackOrderByToken, searchOrders } from '../api/orderApi';
import { socketManager } from '../api/socket';

const STEPS = [
  { key: 'PENDING', label: 'Pending', icon: Clock, desc: 'Waiting for Admin approval' },
  { key: 'APPROVED', label: 'Approved', icon: CheckCircle2, desc: 'Order confirmed by Manager' },
  { key: 'PREPARING', label: 'Preparing', icon: ChefHat, desc: 'Wok tossed fresh in Kitchen' },
  { key: 'READY', label: 'Ready', icon: Bell, desc: 'Plated & ready at pass' },
  { key: 'SERVED', label: 'Served', icon: Utensils, desc: 'Served hot at your table' },
  { key: 'COMPLETED', label: 'Completed', icon: CheckCircle2, desc: 'Dining session closed' },
];

const OrderTrackingPage = () => {
  const { trackingToken } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [tokenInput, setTokenInput] = useState('');
  const [order, setOrder] = useState(null);
  const [multipleOrders, setMultipleOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [loading, setLoading] = useState(Boolean(trackingToken));
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [recentOrders, setRecentOrders] = useState([]);

  // Load recently placed orders from local storage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('shubdum_my_orders') || '[]');
      setRecentOrders(saved);
    } catch {
      setRecentOrders([]);
    }
  }, []);

  const fetchOrderData = async (query) => {
    if (!query || !query.trim()) return;
    try {
      setLoading(true);
      setError('');
      setMultipleOrders([]);

      // 1. Try primary track endpoint (handles token, Order ID like SHB-1004, phone number, name)
      try {
        const data = await trackOrderByToken(query.trim());
        if (data && data.orderId) {
          setOrder(data);
          return;
        }
      } catch (errDirect) {
        // Fallback to direct getOrderById
      }

      // 2. Try direct getOrderById endpoint
      try {
        const data = await getOrderById(query.trim());
        if (data && data.orderId) {
          setOrder(data);
          return;
        }
      } catch (errId) {
        // Fallback to multi-order search
      }

      // 3. Try multi-order search
      const list = await searchOrders(query.trim());
      if (Array.isArray(list) && list.length > 0) {
        if (list.length === 1) {
          setOrder(list[0]);
        } else {
          setMultipleOrders(list);
          // By default expand the first order's bill
          setExpandedOrderId(list[0].orderId);
          setOrder(null);
        }
        return;
      }

      setError(`No active order found for "${query}".`);
      setOrder(null);
    } catch (err) {
      console.error('Failed to track order', err);
      setError(`No order found for "${query}". Please check your Order ID, mobile number, or name.`);
      setOrder(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (trackingToken) {
      fetchOrderData(trackingToken);

      // Real-time WebSocket subscription for live status changes
      const unsubscribe = socketManager.subscribe(
        `/topic/orders/${trackingToken}`,
        (payload) => {
          if (payload && payload.order) {
            setOrder(payload.order);
          } else {
            fetchOrderData(trackingToken);
          }
        }
      );

      return () => {
        if (unsubscribe) unsubscribe();
      };
    } else {
      setLoading(false);
    }
  }, [trackingToken]);

  const handleManualSearch = (e) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    navigate(`/track/${encodeURIComponent(tokenInput.trim())}`);
  };

  const getStepIndex = (status) => {
    if (status === 'REJECTED') return -1;
    return STEPS.findIndex((s) => s.key === status);
  };

  const currentStepIndex = order ? getStepIndex(order.status) : 0;

  // VIEW 1: Multiple Matching Orders List (with expandable bills & direct PDF downloads)
  if (multipleOrders.length > 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
              {multipleOrders.length} Orders Found
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-2">
              Select Your Order / View Bill
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Click <strong>"View Bill"</strong> to inspect dishes &amp; prices, or <strong>"PDF Bill"</strong> to download your official receipt.
            </p>
          </div>

          <button
            onClick={() => {
              setMultipleOrders([]);
              setOrder(null);
              navigate('/track');
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 shadow-sm shrink-0"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search Other Order</span>
          </button>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {multipleOrders.map((ord) => {
            const isExpanded = expandedOrderId === ord.orderId;

            return (
              <div
                key={ord.id || ord.orderId}
                className="rounded-2xl border-2 border-stone-200 bg-white shadow-sm overflow-hidden transition-all hover:border-red-300"
              >
                {/* Order Summary Header Bar */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  {/* Left Column: ID & Meta */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono font-extrabold text-stone-900 text-base sm:text-lg">
                        {ord.orderId}
                      </span>
                      <StatusBadge status={ord.status} type="order" />
                      <span className="text-xs font-bold text-stone-700 bg-stone-100 px-2.5 py-0.5 rounded-full border border-stone-200">
                        {ord.tableNumber}
                      </span>
                    </div>

                    <div className="text-xs text-stone-500 flex items-center gap-2 flex-wrap">
                      <span>Customer: <strong className="text-stone-800 font-semibold">{ord.customerName}</strong></span>
                      <span>&bull;</span>
                      <span>Mobile: <strong className="text-stone-800 font-semibold">{ord.customerPhone}</strong></span>
                      <span>&bull;</span>
                      <span>{new Date(ord.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Right Column: Bill Total & Action Buttons */}
                  <div className="flex items-center gap-3 justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0">
                    <div className="text-left sm:text-right mr-1">
                      <span className="text-[10px] text-stone-400 block uppercase font-bold tracking-wider">Grand Total</span>
                      <span className="text-xl sm:text-2xl font-black text-red-700">₹{ord.grandTotal}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* VIEW BILL TOGGLE BUTTON */}
                      <button
                        type="button"
                        onClick={() => setExpandedOrderId(isExpanded ? null : ord.orderId)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                          isExpanded 
                            ? 'bg-amber-600 text-white' 
                            : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200'
                        }`}
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>{isExpanded ? 'Hide Bill' : 'View Bill'}</span>
                      </button>

                      {/* PDF BILL DOWNLOAD */}
                      <a
                        href={`/api/orders/${ord.orderId}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold shadow-sm transition-all"
                        title="Download Official PDF Tax Invoice"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">PDF</span>
                      </a>

                      {/* FULL TRACKER BUTTON */}
                      <button
                        type="button"
                        onClick={() => {
                          setOrder(ord);
                          setMultipleOrders([]);
                          navigate(`/track/${ord.orderId}`);
                        }}
                        className="inline-flex items-center gap-1 px-4 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold shadow-sm transition-all"
                      >
                        <span>Track</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* EXPANDABLE BILL BREAKDOWN (ACCORDION) */}
                {isExpanded && (
                  <div className="border-t border-stone-200 bg-stone-50/80 p-4 sm:p-6 space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                      <h4 className="font-serif text-sm font-bold text-stone-900 flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-red-700" />
                        <span>Itemized Bill &amp; Dishes — {ord.orderId}</span>
                      </h4>
                      <span className="text-xs font-semibold text-stone-500">
                        {ord.items?.length || 0} {ord.items?.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>

                    {/* Dishes Itemized List */}
                    <div className="bg-white rounded-xl border border-stone-200 divide-y divide-stone-100 overflow-hidden text-xs shadow-sm">
                      {ord.items && ord.items.length > 0 ? (
                        ord.items.map((item, i) => (
                          <div key={i} className="p-3.5 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
                              <div>
                                <span className="font-bold text-stone-900 text-sm block leading-snug">
                                  {item.itemName}
                                </span>
                                <span className="text-stone-500 text-[11px]">
                                  ₹{item.unitPrice} each &times; {item.quantity}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-extrabold text-stone-900 text-sm">
                                ₹{item.itemTotal}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-stone-400 text-center">No dish details found.</div>
                      )}
                    </div>

                    {/* Bill Totals Summary */}
                    <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-2 text-xs shadow-sm">
                      <div className="flex justify-between text-stone-600">
                        <span>Items Subtotal:</span>
                        <strong className="text-stone-900">₹{ord.subtotal}</strong>
                      </div>
                      <div className="flex justify-between text-stone-600">
                        <span>Dine-in Charges &amp; Taxes:</span>
                        <strong className="text-stone-900">₹{ord.additionalCharges}</strong>
                      </div>
                      <div className="flex justify-between text-stone-600">
                        <span>Payment Status:</span>
                        <strong className="text-emerald-700 uppercase">{ord.paymentStatus}</strong>
                      </div>
                      <div className="pt-2.5 border-t border-stone-200 flex justify-between items-baseline">
                        <span className="font-serif text-base font-bold text-stone-900">Grand Total:</span>
                        <span className="text-2xl font-black text-red-700">₹{ord.grandTotal}</span>
                      </div>
                    </div>

                    {/* Action Bar inside Expanded Bill */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                      <a
                        href={`/api/orders/${ord.orderId}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider shadow transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Official PDF Tax Bill</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => {
                          setOrder(ord);
                          setMultipleOrders([]);
                        }}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold shadow transition-colors"
                      >
                        <Compass className="w-4 h-4" />
                        <span>Open Full Kitchen Tracker</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                )}

              </div>
            );
          })}
        </div>

      </div>
    );
  }

  // VIEW 2: Search page when no trackingToken or order is loaded
  if (!trackingToken && !order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-red-50 text-red-700 flex items-center justify-center mx-auto shadow-inner">
          <Compass className="w-10 h-10 animate-spin-slow" />
        </div>
        <div className="space-y-2">
          <h1 className="font-serif text-3xl font-bold text-stone-900">
            Track Your Food Order &amp; Bill
          </h1>
          <p className="text-sm text-stone-500 max-w-md mx-auto">
            Search using your <strong>Order ID</strong> (e.g. <code>SHB-1004</code>), <strong>Mobile Number</strong>, or <strong>Name</strong>.
          </p>
        </div>

        <form onSubmit={handleManualSearch} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Order ID, Mobile No, or Name..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 shadow-sm font-medium"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-sm shadow transition-colors"
          >
            Track Order
          </button>
        </form>

        {/* Quick Recent Orders */}
        {recentOrders.length > 0 && (
          <div className="pt-6 border-t border-stone-200 text-left space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-stone-400" />
              Your Recent Orders
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {recentOrders.slice(0, 4).map((rec) => (
                <button
                  key={rec.orderId}
                  type="button"
                  onClick={() => navigate(`/track/${rec.trackingToken || rec.orderId}`)}
                  className="p-3 rounded-xl border border-stone-200 hover:border-red-600 bg-white hover:bg-red-50/40 text-left transition-all flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-stone-900 text-xs block">
                      {rec.orderId}
                    </span>
                    <span className="text-[11px] text-stone-500">
                      {rec.tableNumber} &bull; ₹{rec.grandTotal}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2">
          <Link to="/order" className="text-xs font-semibold text-stone-500 hover:text-stone-800">
            &larr; Back to Food Menu
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-red-700 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-stone-600 font-medium text-sm">Connecting to live order stream...</p>
      </div>
    );
  }

  // VIEW 3: Order Not Found (With embedded search box)
  if (error || !order) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif text-2xl font-bold text-stone-900">Order Not Found</h2>
          <p className="text-sm text-stone-600 max-w-sm mx-auto">
            {error || 'No order matched this search.'}
          </p>
        </div>

        {/* Embedded Search Form on Not Found Screen */}
        <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 space-y-3 text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
            Try Searching Again:
          </span>
          <form onSubmit={handleManualSearch} className="flex gap-2">
            <input
              type="text"
              required
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Order ID (SHB-...), Mobile, or Name"
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs shadow transition-colors"
            >
              Search
            </button>
          </form>
          <p className="text-[11px] text-stone-500">
            Tip: You can search by your <strong>10-digit mobile number</strong> used during checkout.
          </p>
        </div>

        {/* Recent orders fallback */}
        {recentOrders.length > 0 && (
          <div className="text-left space-y-2">
            <span className="text-xs font-bold text-stone-600">Your Recently Placed Orders:</span>
            <div className="space-y-1.5">
              {recentOrders.slice(0, 3).map((rec) => (
                <button
                  key={rec.orderId}
                  type="button"
                  onClick={() => navigate(`/track/${rec.trackingToken || rec.orderId}`)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-xs flex items-center justify-between transition-colors"
                >
                  <span className="font-bold text-stone-800">{rec.orderId} ({rec.tableNumber})</span>
                  <span className="text-red-700 font-semibold">Track &rarr;</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2">
          <Link
            to="/order"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-700 text-white font-bold text-sm shadow hover:bg-red-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go to Food Menu</span>
          </Link>
        </div>
      </div>
    );
  }

  // VIEW 4: Full Order Tracking & Itemized Bill Details
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
              Live Order Tracker
            </span>
            <span className="text-xs font-bold text-stone-700 font-mono bg-stone-100 px-2 py-0.5 rounded">
              ID: {order.orderId}
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-stone-900 mt-2">
            Order Status for {order.tableNumber}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Real-time updates via live WebSocket connection.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setRefreshing(true);
              fetchOrderData(trackingToken || order.orderId);
            }}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <a
            href={`/api/orders/${order.orderId}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            PDF Bill
          </a>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold"
            title="Print Receipt"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* REJECTED ALERT BANNER */}
      {order.status === 'REJECTED' && (
        <div className="p-6 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 flex items-start gap-4">
          <XCircle className="w-8 h-8 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-lg">Order Not Approved / Cancelled</h3>
            <p className="text-sm text-rose-700 mt-1 leading-relaxed">
              Unfortunately, the kitchen was unable to accept this order at this time. Please speak with our restaurant staff or place a new order.
            </p>
          </div>
        </div>
      )}

      {/* STEP PROGRESS TIMELINE */}
      {order.status !== 'REJECTED' && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h2 className="font-serif text-lg font-bold text-stone-900">
                Kitchen &amp; Table Progress
              </h2>
            </div>
            <StatusBadge status={order.status} type="order" />
          </div>

          {/* Stepper bar */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 sm:gap-2">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isPassed = currentStepIndex >= idx;
              const isCurrent = currentStepIndex === idx;

              return (
                <div
                  key={step.key}
                  className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-between min-h-[110px] ${
                    isCurrent
                      ? 'border-red-600 bg-red-50 text-red-950 font-bold shadow-md ring-2 ring-red-600/20'
                      : isPassed
                      ? 'border-emerald-200 bg-emerald-50/50 text-emerald-900'
                      : 'border-stone-100 bg-stone-50 text-stone-400 opacity-60'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mb-1.5 ${
                      isCurrent
                        ? 'bg-red-600 text-white animate-pulse'
                        : isPassed
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-200 text-stone-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <span className="text-xs font-extrabold block">
                    {step.label}
                  </span>
                  <span className="text-[10px] leading-tight opacity-75 mt-0.5 line-clamp-2">
                    {step.desc}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ORDER & BILL DETAILS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Itemized Dishes */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Ordered Dishes
            </h3>
            <span className="text-xs font-semibold text-stone-500">
              {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          <div className="divide-y divide-stone-100">
            {order.items && order.items.length > 0 ? (
              order.items.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-red-600" />
                    <div>
                      <h4 className="font-semibold text-stone-900 text-sm">
                        {item.itemName}
                      </h4>
                      <span className="text-xs text-stone-500">
                        ₹{item.unitPrice} &times; {item.quantity}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-bold text-stone-900">
                      ₹{item.itemTotal}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-4 text-stone-400 text-center text-xs">No items found for this order.</div>
            )}
          </div>

          {order.notes && (
            <div className="mt-4 p-3 rounded-xl bg-stone-50 border border-stone-100 text-xs text-stone-600">
              <strong className="text-stone-800 block">Chef Instructions:</strong>
              <span>{order.notes}</span>
            </div>
          )}
        </div>

        {/* Right: Customer & Final Bill Breakdown */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Details Card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
            <h3 className="font-serif text-base font-bold text-stone-900 border-b border-stone-100 pb-2">
              Dining Details
            </h3>

            <div className="space-y-2.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Table Number:</span>
                <strong className="text-stone-900 font-bold text-sm">{order.tableNumber}</strong>
              </div>
              <div className="flex justify-between">
                <span>Customer Name:</span>
                <strong className="text-stone-900 font-medium">{order.customerName}</strong>
              </div>
              <div className="flex justify-between">
                <span>Phone:</span>
                <strong className="text-stone-900 font-medium">{order.customerPhone}</strong>
              </div>
              <div className="flex justify-between">
                <span>Order Time:</span>
                <span className="text-stone-900">{new Date(order.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-stone-100">
                <span>Payment Status:</span>
                <StatusBadge status={order.paymentStatus} type="payment" />
              </div>
            </div>
          </div>

          {/* Bill Summary Card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
              <Receipt className="w-4 h-4 text-red-700" />
              <h3 className="font-serif text-base font-bold text-stone-900">
                Official Bill Summary
              </h3>
            </div>

            <div className="space-y-2 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <strong className="text-stone-900">₹{order.subtotal}</strong>
              </div>
              <div className="flex justify-between">
                <span>Additional Charges</span>
                <strong className="text-stone-900">₹{order.additionalCharges}</strong>
              </div>
              <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline">
                <span className="font-serif text-base font-bold text-stone-900">Grand Total</span>
                <span className="text-2xl font-black text-red-700">₹{order.grandTotal}</span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={`/api/orders/${order.orderId}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider shadow transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Official Tax Bill</span>
              </a>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default OrderTrackingPage;
