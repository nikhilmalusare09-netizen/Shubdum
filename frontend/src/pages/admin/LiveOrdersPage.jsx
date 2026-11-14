import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  ShoppingBag, Search, Filter, CheckCircle, XCircle, 
  ChefHat, Bell, Utensils, CheckCircle2, Download, Printer, 
  IndianRupee, RefreshCw, AlertCircle, Eye 
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import { fetchAdminOrders, updateOrderStatus, updatePaymentStatus } from '../../api/adminApi';
import { socketManager } from '../../api/socket';

const STATUS_TABS = [
  { key: 'ALL', label: 'All Orders' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'PREPARING', label: 'In Kitchen' },
  { key: 'READY', label: 'Ready' },
  { key: 'SERVED', label: 'Served' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'REJECTED', label: 'Rejected' },
];

const LiveOrdersPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'ALL';
  const initialSearch = searchParams.get('search') || '';

  const [activeTab, setActiveTab] = useState(initialStatus);
  const [search, setSearch] = useState(initialSearch);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderForModal, setSelectedOrderForModal] = useState(null);

  const loadOrders = async () => {
    try {
      const data = await fetchAdminOrders({
        status: activeTab === 'ALL' ? null : activeTab,
        search: search.trim() || null,
      });
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();

    // Subscribe to live incoming orders and status updates
    const unsubscribe = socketManager.subscribe('/topic/admin/orders', () => {
      loadOrders();
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [activeTab, search]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      loadOrders();
      if (selectedOrderForModal && selectedOrderForModal.orderId === orderId) {
        setSelectedOrderForModal((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert('Failed to update order status');
    }
  };

  const handleMarkPaid = async (orderId) => {
    try {
      await updatePaymentStatus(orderId, 'PAID', 'CASH', 'Cash received at desk');
      loadOrders();
      if (selectedOrderForModal && selectedOrderForModal.orderId === orderId) {
        setSelectedOrderForModal((prev) => ({ ...prev, paymentStatus: 'PAID' }));
      }
    } catch (err) {
      alert('Failed to mark payment');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            Live Order Management
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Real-time incoming dining orders with live status transmission to customer tracking pages.
          </p>
        </div>

        <button
          onClick={loadOrders}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-stone-700 shadow-sm transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh List
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="space-y-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setSearchParams({ status: tab.key });
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? 'bg-stone-900 text-white shadow-md'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order ID, customer, table, or phone..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-600 shadow-sm"
          />
        </div>
      </div>

      {/* ORDERS CARDS / LIST */}
      {loading ? (
        <div className="py-20 text-center text-stone-400 space-y-2">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-red-700" />
          <p className="text-xs">Fetching active orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center text-stone-500 max-w-md mx-auto space-y-3">
          <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-stone-900">No Orders Found</h3>
          <p className="text-xs">There are no orders matching your current filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className={`bg-white rounded-2xl border transition-all flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md ${
                ord.status === 'PENDING'
                  ? 'border-amber-400 ring-2 ring-amber-400/20'
                  : 'border-stone-200'
              }`}
            >
              {/* Card Header */}
              <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
                <div>
                  <span className="text-[11px] font-mono text-stone-500 block">
                    {ord.orderId}
                  </span>
                  <span className="text-base font-extrabold text-red-900">
                    {ord.tableNumber}
                  </span>
                </div>
                <div className="text-right">
                  <StatusBadge status={ord.status} type="order" />
                  <div className="mt-1">
                    <StatusBadge status={ord.paymentStatus} type="payment" />
                  </div>
                </div>
              </div>

              {/* Customer & Timestamp */}
              <div className="px-4 py-2.5 bg-stone-50/20 border-b border-stone-100 text-xs text-stone-600 flex items-center justify-between">
                <div>
                  <strong className="text-stone-900 font-semibold">{ord.customerName}</strong>
                  <span className="text-stone-400 ml-1.5">{ord.customerPhone}</span>
                </div>
                <span className="text-[11px] text-stone-400">
                  {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Items Breakdown */}
              <div className="p-4 space-y-2 flex-1 text-xs">
                <div className="space-y-1.5 divide-y divide-stone-100 max-h-40 overflow-y-auto pr-1">
                  {ord.items.map((item) => (
                    <div key={item.id} className="pt-1.5 first:pt-0 flex items-center justify-between">
                      <span className="font-medium text-stone-800">
                        {item.quantity} &times; {item.itemName}
                      </span>
                      <span className="font-semibold text-stone-900">
                        ₹{item.itemTotal}
                      </span>
                    </div>
                  ))}
                </div>

                {ord.notes && (
                  <div className="mt-2 p-2 rounded-lg bg-amber-50/80 border border-amber-200/60 text-[11px] text-amber-900">
                    <strong>Note:</strong> {ord.notes}
                  </div>
                )}
              </div>

              {/* Total & Bottom Action Pipeline */}
              <div className="p-4 border-t border-stone-100 bg-stone-50/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-500 font-medium">Grand Total</span>
                  <span className="text-xl font-black text-red-900">
                    ₹{ord.grandTotal}
                  </span>
                </div>

                {/* Workflow Actions */}
                <div className="space-y-2">
                  {/* Status Advancement Buttons */}
                  {ord.status === 'PENDING' && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleStatusChange(ord.orderId, 'APPROVED')}
                        className="py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusChange(ord.orderId, 'REJECTED')}
                        className="py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center justify-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </div>
                  )}

                  {ord.status === 'APPROVED' && (
                    <button
                      onClick={() => handleStatusChange(ord.orderId, 'PREPARING')}
                      className="w-full py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <ChefHat className="w-4 h-4" />
                      Send to Kitchen (Preparing)
                    </button>
                  )}

                  {ord.status === 'PREPARING' && (
                    <button
                      onClick={() => handleStatusChange(ord.orderId, 'READY')}
                      className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <Bell className="w-4 h-4" />
                      Mark Ready at Pass
                    </button>
                  )}

                  {ord.status === 'READY' && (
                    <button
                      onClick={() => handleStatusChange(ord.orderId, 'SERVED')}
                      className="w-full py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <Utensils className="w-4 h-4" />
                      Mark Served at Table
                    </button>
                  )}

                  {ord.status === 'SERVED' && (
                    <button
                      onClick={() => handleStatusChange(ord.orderId, 'COMPLETED')}
                      className="w-full py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Mark Order Completed
                    </button>
                  )}

                  {/* Payment toggle */}
                  {ord.paymentStatus !== 'PAID' && (
                    <button
                      onClick={() => handleMarkPaid(ord.orderId)}
                      className="w-full py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center justify-center gap-1"
                    >
                      <IndianRupee className="w-3 h-3" />
                      Mark Cash Received (Paid)
                    </button>
                  )}

                  {/* View Details / PDF */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setSelectedOrderForModal(ord)}
                      className="flex-1 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 text-stone-700 text-[11px] font-semibold flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Bill
                    </button>
                    <a
                      href={`/api/orders/${ord.orderId}/pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 text-stone-700"
                      title="Download PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

              </div>

            </div>
          ))}
        </div>
      )}

      {/* FULL BILL MODAL */}
      {selectedOrderForModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest block">
                  Official Bill View
                </span>
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  SHUBDUM TAX INVOICE
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrderForModal(null)}
                className="w-8 h-8 rounded-full bg-stone-100 text-stone-500 hover:text-stone-900 flex items-center justify-center font-bold"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-stone-50 p-4 rounded-xl border border-stone-100">
              <div>
                <span className="text-stone-400 block">Order ID</span>
                <strong className="text-stone-900 font-mono">{selectedOrderForModal.orderId}</strong>
              </div>
              <div>
                <span className="text-stone-400 block">Table</span>
                <strong className="text-stone-900 font-bold">{selectedOrderForModal.tableNumber}</strong>
              </div>
              <div>
                <span className="text-stone-400 block">Customer</span>
                <strong className="text-stone-900">{selectedOrderForModal.customerName}</strong>
              </div>
              <div>
                <span className="text-stone-400 block">Phone</span>
                <strong className="text-stone-900">{selectedOrderForModal.customerPhone}</strong>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Itemized Summary
              </h4>
              <div className="border border-stone-200 rounded-xl divide-y divide-stone-100 text-xs">
                {selectedOrderForModal.items.map((it) => (
                  <div key={it.id} className="p-3 flex justify-between">
                    <div>
                      <strong className="text-stone-900">{it.itemName}</strong>
                      <span className="text-stone-400 block">₹{it.unitPrice} &times; {it.quantity}</span>
                    </div>
                    <span className="font-bold text-stone-900">₹{it.itemTotal}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-stone-600 border-t border-stone-200 pt-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <strong className="text-stone-900">₹{selectedOrderForModal.subtotal}</strong>
              </div>
              <div className="flex justify-between">
                <span>Additional Charges:</span>
                <strong className="text-stone-900">₹{selectedOrderForModal.additionalCharges}</strong>
              </div>
              <div className="flex justify-between text-base font-bold text-red-900 pt-2 border-t border-dashed border-stone-200">
                <span>Grand Total:</span>
                <span>₹{selectedOrderForModal.grandTotal}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={`/api/orders/${selectedOrderForModal.orderId}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow"
              >
                <Download className="w-4 h-4" />
                Download PDF Bill
              </a>
              <button
                onClick={() => window.print()}
                className="px-4 py-3 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 font-bold text-xs"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default LiveOrdersPage;

