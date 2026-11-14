import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Eye, Calendar, RefreshCw } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import { fetchAdminOrders } from '../../api/adminApi';

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const loadOrders = async () => {
    try {
      const data = await fetchAdminOrders({
        status: statusFilter === 'ALL' ? null : statusFilter,
        paymentStatus: paymentFilter === 'ALL' ? null : paymentFilter,
        search: search.trim() || null,
      });
      setOrders(data);
    } catch (err) {
      console.error('Failed to load order history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter, paymentFilter, search]);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            Order History &amp; Records
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Complete database audit of all past and completed customer orders.
          </p>
        </div>

        <button
          onClick={loadOrders}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-stone-700 shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Order ID, customer, table, or phone..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white text-stone-700 font-medium"
          >
            <option value="ALL">All Order Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="PREPARING">Preparing</option>
            <option value="READY">Ready</option>
            <option value="SERVED">Served</option>
            <option value="COMPLETED">Completed</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white text-stone-700 font-medium"
          >
            <option value="ALL">All Payment Statuses</option>
            <option value="PAID">Paid</option>
            <option value="PAYMENT_PENDING">Pending Payment</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>

      </div>

      {/* ORDERS TABLE */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-stone-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-red-700 mb-2" />
            Loading archive...
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-stone-400 text-sm">
            No matching order records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Date &amp; Time</th>
                  <th className="py-3.5 px-4">Table</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Items Summary</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Order Status</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-stone-900">
                      {ord.orderId}
                    </td>
                    <td className="py-3 px-4 text-stone-500 whitespace-nowrap">
                      {new Date(ord.createdAt).toLocaleDateString()} {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 font-bold text-red-900">
                      {ord.tableNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-stone-900">{ord.customerName}</div>
                      <div className="text-[11px] text-stone-400">{ord.customerPhone}</div>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate">
                      {ord.items.map((i) => `${i.itemName} (${i.quantity})`).join(', ')}
                    </td>
                    <td className="py-3 px-4 font-bold text-stone-900 text-sm">
                      ₹{ord.grandTotal}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={ord.status} type="order" />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={ord.paymentStatus} type="payment" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-700"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={`/api/orders/${ord.orderId}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-700"
                          title="Download Receipt PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Order {selectedOrder.orderId}
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-stone-400 hover:text-stone-700 font-bold text-lg"
              >
                &times;
              </button>
            </div>

            <div className="space-y-1.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Table:</span>
                <strong className="text-stone-900">{selectedOrder.tableNumber}</strong>
              </div>
              <div className="flex justify-between">
                <span>Customer:</span>
                <strong className="text-stone-900">{selectedOrder.customerName}</strong>
              </div>
              <div className="flex justify-between">
                <span>Phone:</span>
                <strong className="text-stone-900">{selectedOrder.customerPhone}</strong>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{new Date(selectedOrder.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-1 border-t border-stone-100 pt-2 text-xs">
              <span className="font-bold text-stone-700 block mb-1">Itemized Breakdown:</span>
              {selectedOrder.items.map((it) => (
                <div key={it.id} className="flex justify-between py-1 border-b border-stone-50">
                  <span>{it.itemName} &times; {it.quantity}</span>
                  <span className="font-bold text-stone-900">₹{it.itemTotal}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-baseline pt-2 border-t border-stone-200">
              <span className="font-bold text-sm">Grand Total:</span>
              <span className="font-black text-xl text-red-900">₹{selectedOrder.grandTotal}</span>
            </div>

            <div className="pt-2">
              <a
                href={`/api/orders/${selectedOrder.orderId}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-700 text-white font-bold text-xs uppercase tracking-wider"
              >
                <Download className="w-3.5 h-3.5" />
                Download Tax Bill PDF
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default OrderHistoryPage;

