import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Plus, Minus, Trash2, ArrowRight, ArrowLeft, Receipt, ShieldCheck, UtensilsCrossed } from 'lucide-react';
import VegBadge from '../components/VegBadge';
import { useCart } from '../context/CartContext';

const CartPage = () => {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    additionalCharges,
    grandTotal,
    totalItemsCount,
    selectedTable,
    setSelectedTable,
  } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-24 h-24 rounded-3xl bg-red-50 text-red-700 flex items-center justify-center mx-auto shadow-inner">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif text-3xl font-bold text-stone-900">
            Your Cart is Empty
          </h2>
          <p className="text-stone-500 text-sm max-w-sm mx-auto">
            Explore our mouthwatering Chinese &amp; Indian menu and add your favorite dishes to begin your order.
          </p>
        </div>
        <Link
          to="/order"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-sm shadow-md transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Browse Food Menu</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
            Step 3
          </span>
          <h1 className="font-serif text-3xl font-bold text-stone-900 mt-2">
            Shopping Cart &amp; Live Bill
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Review itemized prices and dish quantities. Bill recalculates automatically.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={clearCart}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Cart
          </button>
          <Link
            to="/order"
            className="inline-flex items-center gap-1 text-xs font-semibold text-stone-700 hover:text-stone-900 px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50"
          >
            + Add More Dishes
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-stone-200 divide-y divide-stone-100 shadow-sm overflow-hidden">
            {items.map(({ dish, quantity }) => {
              const itemTotal = Number(dish.price) * quantity;
              return (
                <div key={dish.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                  
                  {/* Dish Info */}
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="pt-0.5 shrink-0">
                      <VegBadge isVeg={dish.foodType} size="md" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-stone-900 text-sm sm:text-base leading-snug">
                        {dish.name}
                      </h3>
                      <div className="text-xs text-stone-500 mt-0.5">
                        Unit Price: <span className="font-medium text-stone-800">₹{dish.price}</span>
                      </div>
                      <div className="text-xs font-bold text-red-700 mt-1 sm:hidden">
                        Total: ₹{itemTotal}
                      </div>
                    </div>
                  </div>

                  {/* Quantity Modifier & Line Total */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="flex items-center gap-1.5 bg-stone-100 border border-stone-200 rounded-xl p-1">
                      <button
                        onClick={() => updateQuantity(dish.id, quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-stone-700 hover:bg-stone-50 shadow-sm active:scale-95 transition-all"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-extrabold text-sm min-w-[1.5rem] text-center text-stone-900">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(dish.id, quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-stone-700 hover:bg-stone-50 shadow-sm active:scale-95 transition-all"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="hidden sm:block text-right min-w-[5rem]">
                      <span className="text-[10px] text-stone-400 block font-medium">Item Total</span>
                      <span className="text-base font-bold text-stone-900">
                        ₹{itemTotal}
                      </span>
                    </div>

                    <button
                      onClick={() => removeItem(dish.id)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Bill Summary */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
              <Receipt className="w-5 h-5 text-red-700" />
              <h2 className="font-serif text-lg font-bold text-stone-900">
                Live Bill Summary
              </h2>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between text-stone-600">
                <span>Items Subtotal ({totalItemsCount} items)</span>
                <span className="font-semibold text-stone-900">₹{subtotal}</span>
              </div>
              <div className="flex items-center justify-between text-stone-600">
                <span className="flex items-center gap-1.5">
                  Dine-in Service &amp; Taxes
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                    Included
                  </span>
                </span>
                <span className="font-semibold text-stone-900">₹{additionalCharges}</span>
              </div>

              <div className="pt-3 border-t border-dashed border-stone-200 flex items-center justify-between">
                <div>
                  <span className="font-serif text-lg font-bold text-stone-900 block">
                    Grand Total
                  </span>
                  <span className="text-[11px] text-stone-500">
                    Pay via cash at restaurant
                  </span>
                </div>
                <span className="text-2xl font-black text-red-700">
                  ₹{grandTotal}
                </span>
              </div>
            </div>

            {/* Quick Table Selection Option in Cart */}
            <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-stone-700 uppercase tracking-wide flex items-center gap-1.5">
                  <UtensilsCrossed className="w-3.5 h-3.5 text-red-700" />
                  <span>Select Dining Table</span>
                </span>
                {selectedTable ? (
                  <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
                    {selectedTable} Selected
                  </span>
                ) : (
                  <span className="text-stone-400 text-[11px]">Choose here or at checkout</span>
                )}
              </div>
              <select
                value={selectedTable || ''}
                onChange={(e) => setSelectedTable(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-stone-300 bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-red-600 cursor-pointer"
              >
                <option value="">-- Select Your Table (Table 01 - Table 10) --</option>
                {['Table 01', 'Table 02', 'Table 03', 'Table 04', 'Table 05', 'Table 06', 'Table 07', 'Table 08', 'Table 09', 'Table 10'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="pt-2">
              <Link
                to="/checkout"
                className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-base shadow-lg shadow-red-900/20 active:scale-95 transition-all"
              >
                <span>Proceed to Table &amp; Details</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                Final bill is calculated securely by the backend and snapshotted. Previous bills will never change if menu prices update.
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default CartPage;

