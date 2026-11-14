import React, { useState, useEffect } from 'react';
import { 
  Receipt, Download, Printer, CheckCircle2, AlertCircle, 
  Layers, User, Phone, Clock, IndianRupee, RefreshCw, ArrowRight 
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import { fetchTables, fetchTableBill, checkoutTableBill } from '../../api/adminApi';
import { socketManager } from '../../api/socket';

const TableBillingPage = () => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableBill, setTableBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingBill, setLoadingBill] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadTables = async () => {
    try {
      const data = await fetchTables();
      setTables(data);
      if (!selectedTable && data.length > 0) {
        // default select first occupied table or table 1
        const occupied = data.find((t) => t.occupied);
        setSelectedTable(occupied ? occupied.tableNumber : data[0].tableNumber);
      }
    } catch (err) {
      console.error('Failed to load tables', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTables();

    const unsubTables = socketManager.subscribe('/topic/tables', () => {
      loadTables();
    });

    return () => {
      if (unsubTables) unsubTables();
    };
  }, []);

  const loadBillForTable = async (tableNum) => {
    if (!tableNum) return;
    setLoadingBill(true);
    setErrorMsg('');
    try {
      const bill = await fetchTableBill(tableNum);
      setTableBill(bill);
    } catch (err) {
      setTableBill(null);
      setErrorMsg(err.response?.data?.message || 'No active dining session for this table.');
    } finally {
      setLoadingBill(false);
    }
  };

  useEffect(() => {
    if (selectedTable) {
      loadBillForTable(selectedTable);
    }
  }, [selectedTable]);

  const handleCheckoutSession = async () => {
    if (!selectedTable) return;
    if (!window.confirm(`Are you sure you want to mark table ${selectedTable} as PAID and close this dining session? Table will be released to AVAILABLE.`)) return;

    setCheckoutLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await checkoutTableBill(selectedTable, 'CASH', 'Payment received in cash. Session closed.');
      setSuccessMsg(`Dining session closed successfully! Table ${selectedTable} is now Available.`);
      await loadTables();
      await loadBillForTable(selectedTable);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to checkout table session.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            Table-Wise Combined Billing
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Aggregate multiple orders (Order #001, #002, etc.) for a single dining session into one master bill.
          </p>
        </div>

        <button
          onClick={() => {
            loadTables();
            if (selectedTable) loadBillForTable(selectedTable);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-stone-700 shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* TABLE SELECTOR STRIP */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-stone-400 block">
          Select Dining Table:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
          {tables.map((t) => {
            const isSelected = selectedTable === t.tableNumber;
            const isOccupied = Boolean(t.occupied);

            return (
              <button
                key={t.id}
                onClick={() => setSelectedTable(t.tableNumber)}
                className={`p-3 rounded-xl border-2 text-center transition-all flex flex-col items-center justify-between ${
                  isSelected
                    ? 'border-red-700 bg-red-50 text-red-950 font-bold shadow-md'
                    : isOccupied
                    ? 'border-amber-300 bg-amber-50/50 text-amber-900 hover:bg-amber-50'
                    : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isOccupied ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                    }`}
                  />
                  <span className="text-[10px] text-stone-400 font-mono">
                    {t.activeOrdersCount || 0} ord
                  </span>
                </div>
                <span className="text-xs font-extrabold mt-1 block">
                  {t.tableNumber}
                </span>
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider ${
                    isOccupied ? 'text-amber-700' : 'text-emerald-700'
                  }`}
                >
                  {isOccupied ? 'Active' : 'Free'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* BILLING DISPLAY */}
      {loadingBill ? (
        <div className="py-20 text-center text-stone-400 text-sm">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-red-700 mb-2" />
          Loading combined table statement...
        </div>
      ) : !tableBill ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
            <Receipt className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-xl font-bold text-stone-900">
            No Active Session for {selectedTable}
          </h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            This table is currently unoccupied or has closed its dining session. When customers place orders for {selectedTable}, they will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Orders in this Session & Aggregated Items */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Session Orders List */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h3 className="font-serif text-base font-bold text-stone-900">
                  Separate Orders in Current Dining Session
                </h3>
                <span className="text-xs font-semibold text-stone-500">
                  {tableBill.orders.length} {tableBill.orders.length === 1 ? 'Order' : 'Orders'}
                </span>
              </div>

              <div className="space-y-3">
                {tableBill.orders.map((ord, idx) => (
                  <div
                    key={ord.id}
                    className="p-3.5 rounded-xl border border-stone-100 bg-stone-50/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-stone-800">
                        Order #{idx + 1}: {ord.orderId}
                      </span>
                      <div className="text-stone-500 mt-0.5">
                        {ord.items.map((i) => `${i.itemName} (${i.quantity})`).join(', ')}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-extrabold text-stone-900 block text-sm">
                        ₹{ord.grandTotal}
                      </span>
                      <StatusBadge status={ord.status} type="order" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Aggregated Consolidated Breakdown */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h3 className="font-serif text-base font-bold text-stone-900">
                  Aggregated Dishes Across Table Session
                </h3>
                <span className="text-xs text-stone-400">Merged Quantities</span>
              </div>

              <div className="divide-y divide-stone-100 text-xs">
                {tableBill.aggregatedItems.map((item, i) => (
                  <div key={i} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-stone-900">{item.itemName}</span>
                      <span className="text-stone-400 block">₹{item.unitPrice} &times; {item.quantity}</span>
                    </div>
                    <span className="font-bold text-stone-900">₹{item.itemTotal}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right: Master Table Bill & Session Checkout */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-6">
              <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-red-700 uppercase tracking-widest block">
                    Combined Master Bill
                  </span>
                  <h3 className="font-serif text-xl font-bold text-stone-900">
                    {tableBill.tableNumber} Dining Bill
                  </h3>
                </div>
                <StatusBadge status={tableBill.paymentStatus} type="payment" />
              </div>

              <div className="space-y-2 text-xs text-stone-600 bg-stone-50 p-4 rounded-xl border border-stone-100">
                <div className="flex justify-between">
                  <span>Session Code:</span>
                  <strong className="font-mono text-stone-900">{tableBill.sessionCode}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Customer Name:</span>
                  <strong className="text-stone-900">{tableBill.customerName}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Contact:</span>
                  <strong className="text-stone-900">{tableBill.customerPhone}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Seated Since:</span>
                  <span>{new Date(tableBill.startTime).toLocaleTimeString()}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-stone-600 border-t border-stone-100 pt-3">
                <div className="flex justify-between">
                  <span>Combined Subtotal:</span>
                  <strong className="text-stone-900">₹{tableBill.subtotal}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Additional Charges:</span>
                  <strong className="text-stone-900">₹{tableBill.additionalCharges}</strong>
                </div>
                <div className="pt-3 border-t border-dashed border-stone-200 flex justify-between items-baseline">
                  <span className="font-serif text-lg font-bold text-stone-900">
                    Combined Grand Total
                  </span>
                  <span className="text-3xl font-black text-red-800">
                    ₹{tableBill.grandTotal}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-2">
                <a
                  href={`/api/tables/${encodeURIComponent(tableBill.tableNumber)}/bill-pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider shadow transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Combined Table PDF
                </a>

                {tableBill.sessionStatus === 'ACTIVE' && (
                  <button
                    onClick={handleCheckoutSession}
                    disabled={checkoutLoading}
                    className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Close Session &amp; Mark Table Available</span>
                  </button>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default TableBillingPage;

