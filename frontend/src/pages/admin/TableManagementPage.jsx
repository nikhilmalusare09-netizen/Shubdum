import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Layers, CheckCircle2, AlertCircle, 
  User, Phone, IndianRupee, RefreshCw, ShoppingBag 
} from 'lucide-react';
import { fetchTables, createTable, deleteTable } from '../../api/adminApi';
import { socketManager } from '../../api/socket';

const TableManagementPage = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTableNum, setNewTableNum] = useState('');
  const [newTableCap, setNewTableCap] = useState(4);

  const loadTables = async () => {
    try {
      const data = await fetchTables();
      setTables(data);
    } catch (err) {
      console.error('Failed to load tables', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTables();

    const unsub = socketManager.subscribe('/topic/tables', () => {
      loadTables();
    });

    return () => {
      if (unsub) unsub();
    };
  }, []);

  const handleAddTable = async (e) => {
    e.preventDefault();
    if (!newTableNum.trim()) return;
    try {
      await createTable(newTableNum.trim(), Number(newTableCap));
      setIsAddModalOpen(false);
      setNewTableNum('');
      setNewTableCap(4);
      loadTables();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating table');
    }
  };

  const handleDeleteTable = async (id, tableNumber, occupied) => {
    if (occupied) {
      alert(`Cannot delete ${tableNumber} while it is occupied!`);
      return;
    }
    if (!window.confirm(`Are you sure you want to delete ${tableNumber}?`)) return;
    try {
      await deleteTable(id);
      loadTables();
    } catch (err) {
      alert('Error deleting table');
    }
  };

  const occupiedCount = tables.filter((t) => t.occupied).length;
  const availableCount = tables.length - occupiedCount;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            Table &amp; Seating Management
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Configure restaurant tables, view real-time occupancy, and inspect ongoing table sessions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadTables}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-stone-700 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs uppercase tracking-wider shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Table
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Total Tables</span>
          <span className="text-3xl font-black text-stone-900 block mt-1">{tables.length}</span>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Available Tables</span>
          <span className="text-3xl font-black text-emerald-700 block mt-1">{availableCount}</span>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Occupied Tables</span>
          <span className="text-3xl font-black text-amber-600 block mt-1">{occupiedCount}</span>
        </div>
      </div>

      {/* TABLES GRID */}
      {loading ? (
        <div className="py-20 text-center text-stone-400 text-sm">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-red-700 mb-2" />
          Loading table status...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {tables.map((t) => {
            const isOccupied = Boolean(t.occupied);

            return (
              <div
                key={t.id}
                className={`bg-white rounded-2xl border p-4 shadow-sm flex flex-col justify-between space-y-4 transition-all ${
                  isOccupied
                    ? 'border-amber-400 bg-amber-50/20 ring-1 ring-amber-400/30'
                    : 'border-stone-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                    <span className="font-serif text-lg font-bold text-stone-900">
                      {t.tableNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        isOccupied
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isOccupied ? 'Occupied' : 'Available'}
                    </span>
                  </div>

                  <div className="mt-2 text-xs text-stone-500">
                    Capacity: <strong className="text-stone-700">{t.capacity} Guests</strong>
                  </div>

                  {isOccupied ? (
                    <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-1">
                      <div className="text-stone-500 text-[10px] uppercase font-bold text-amber-800">
                        Current Session:
                      </div>
                      <div className="font-bold text-stone-900 truncate">
                        {t.activeCustomerName}
                      </div>
                      <div className="text-stone-500 text-[11px]">
                        {t.activeCustomerPhone}
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-amber-200/60 font-semibold text-amber-950">
                        <span>{t.activeOrdersCount} orders</span>
                        <span>₹{t.activeSessionTotal}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 py-6 text-center text-stone-300 text-xs font-medium">
                      Table is Free
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-[10px] text-stone-400 font-mono">ID #{t.id}</span>
                  {!isOccupied && (
                    <button
                      onClick={() => handleDeleteTable(t.id, t.tableNumber, isOccupied)}
                      className="text-stone-400 hover:text-rose-600 p-1"
                      title="Delete Table"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD TABLE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Add Restaurant Table
            </h3>

            <form onSubmit={handleAddTable} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-700 uppercase">
                  Table Number / Name *
                </label>
                <input
                  type="text"
                  required
                  value={newTableNum}
                  onChange={(e) => setNewTableNum(e.target.value)}
                  placeholder="e.g. Table 11"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-700 uppercase">
                  Seating Capacity
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  required
                  value={newTableCap}
                  onChange={(e) => setNewTableCap(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-700 text-white font-bold text-xs uppercase tracking-wider"
                >
                  Create Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default TableManagementPage;

