import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, Clock, CheckCircle2, ChefHat, Bell, 
  IndianRupee, TrendingUp, Layers, CheckCircle, XCircle, ArrowRight, RefreshCw 
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import { fetchDashboardStats, fetchAdminOrders, updateOrderStatus } from '../../api/adminApi';
import { socketManager } from '../../api/socket';

const OverviewPage = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [statsData, ordersData] = await Promise.all([
        fetchDashboardStats(),
        fetchAdminOrders(),
      ]);
      setStats(statsData);
      setRecentOrders(ordersData.slice(0, 6));
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Listen to real-time events to refresh stats & recent orders
    const unsubOrders = socketManager.subscribe('/topic/admin/orders', () => {
      loadData();
    });
    const unsubTables = socketManager.subscribe('/topic/tables', () => {
      loadData();
    });

    return () => {
      if (unsubOrders) unsubOrders();
      if (unsubTables) unsubTables();
    };
  }, []);

  const handleQuickApprove = async (orderId) => {
    try {
      await updateOrderStatus(orderId, 'APPROVED');
      loadData();
    } catch (err) {
      alert('Error approving order');
    }
  };

  const handleQuickReject = async (orderId) => {
    if (!window.confirm(`Are you sure you want to reject order ${orderId}?`)) return;
    try {
      await updateOrderStatus(orderId, 'REJECTED');
      loadData();
    } catch (err) {
      alert('Error rejecting order');
    }
  };

  if (loading && !stats) {
    return (
      <div className="py-20 text-center text-stone-500 space-y-3">
        <div className="w-10 h-10 border-4 border-red-700 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-medium">Loading restaurant metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            Restaurant Operations Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Real-time analytics and live kitchen workflow for Shubdum.
          </p>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-stone-700 shadow-sm transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Stats
        </button>
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Today's Revenue */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Today's Revenue
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-stone-900">
              ₹{stats?.todayRevenue || 0}
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Live
            </span>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Monthly Revenue
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-stone-900">
              ₹{stats?.monthlyRevenue || 0}
            </span>
            <span className="text-[11px] text-stone-400 font-semibold">
              Month-to-date
            </span>
          </div>
        </div>

        {/* Pending Orders (Actionable Alert) */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
              Pending Orders
            </span>
            <div className={`w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold ${
              stats?.pendingOrders > 0 ? 'animate-bounce' : ''
            }`}>
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-600">
              {stats?.pendingOrders || 0}
            </span>
            <Link
              to="/admin/orders?status=PENDING"
              className="text-[11px] text-amber-700 font-bold hover:underline"
            >
              Review Now &rarr;
            </Link>
          </div>
        </div>

        {/* Table Occupancy */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Table Occupancy
            </span>
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-700 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-stone-900">
              {stats?.occupiedTables || 0} / {stats?.totalTables || 10}
            </span>
            <span className="text-[11px] text-emerald-600 font-bold">
              {stats?.availableTables || 0} Free
            </span>
          </div>
        </div>

      </div>

      {/* SECONDARY PIPELINE METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-stone-200 text-center">
          <span className="text-[11px] font-semibold text-blue-700 uppercase block">Approved</span>
          <span className="text-xl font-black text-stone-900">{stats?.approvedOrders || 0}</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-stone-200 text-center">
          <span className="text-[11px] font-semibold text-orange-700 uppercase block">In Kitchen</span>
          <span className="text-xl font-black text-stone-900">{stats?.preparingOrders || 0}</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-stone-200 text-center">
          <span className="text-[11px] font-semibold text-purple-700 uppercase block">Ready at Pass</span>
          <span className="text-xl font-black text-stone-900">{stats?.readyOrders || 0}</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-stone-200 text-center">
          <span className="text-[11px] font-semibold text-teal-700 uppercase block">Served</span>
          <span className="text-xl font-black text-stone-900">{stats?.servedOrders || 0}</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-stone-200 text-center col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase block">Completed</span>
          <span className="text-xl font-black text-stone-900">{stats?.completedOrders || 0}</span>
        </div>
      </div>

      {/* RECENT INCOMING ORDERS TABLE */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg font-bold text-stone-900">
              Live Incoming Orders
            </h2>
            <p className="text-xs text-stone-500">
              Incoming customer orders appearing in real time.
            </p>
          </div>
          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700 hover:text-red-800"
          >
            <span>View All Live Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-12 text-center text-stone-400 text-sm">
            No active orders at the moment.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Table</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Dishes</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                      {ord.orderId}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-red-800">
                      {ord.tableNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-stone-900">{ord.customerName}</div>
                      <div className="text-[11px] text-stone-400">{ord.customerPhone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-stone-800">
                        {ord.items.map((i) => `${i.itemName} (${i.quantity})`).join(', ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-stone-900">
                      ₹{ord.grandTotal}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={ord.status} type="order" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {ord.status === 'PENDING' ? (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleQuickApprove(ord.orderId)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleQuickReject(ord.orderId)}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-[11px] border border-rose-200"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <Link
                          to={`/admin/orders?search=${ord.orderId}`}
                          className="text-[11px] font-bold text-stone-600 hover:text-stone-900 underline"
                        >
                          Manage &rarr;
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default OverviewPage;

