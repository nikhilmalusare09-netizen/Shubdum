import React from 'react';
import { Plus, Minus, Check, Flame } from 'lucide-react';
import VegBadge from './VegBadge';
import { useCart } from '../context/CartContext';

const FoodCard = ({ dish }) => {
  const { items, addItem, updateQuantity } = useCart();

  const cartEntry = items.find((i) => i.dish.id === dish.id);
  const quantity = cartEntry ? cartEntry.quantity : 0;

  const isAvailable = Boolean(dish.available);

  return (
    <div className={`bg-white rounded-2xl border border-stone-200/80 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group ${
      !isAvailable ? 'opacity-60 pointer-events-none' : ''
    }`}>
      <div>
        {/* Dish Image */}
        <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
          <img
            src={dish.imageUrl || "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80"}
            alt={dish.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2.5 left-2.5 z-10 bg-white/90 backdrop-blur-md rounded-md p-1 shadow-sm">
            <VegBadge isVeg={dish.foodType} size="md" />
          </div>

          {!isAvailable && (
            <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-red-600 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow">
                Sold Out
              </span>
            </div>
          )}

          {dish.categoryName && (
            <span className="absolute bottom-2 right-2 bg-stone-900/80 backdrop-blur-sm text-stone-200 text-[11px] font-medium px-2 py-0.5 rounded-full">
              {dish.categoryName}
            </span>
          )}
        </div>

        {/* Dish Info */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-stone-900 text-base leading-snug group-hover:text-red-700 transition-colors">
              {dish.name}
            </h3>
          </div>
          {dish.description && (
            <p className="mt-1 text-xs text-stone-500 line-clamp-2 leading-relaxed">
              {dish.description}
            </p>
          )}
        </div>
      </div>

      {/* Price & Action */}
      <div className="px-4 pb-4 pt-2 border-t border-stone-100 flex items-center justify-between mt-auto">
        <div>
          <span className="text-xs text-stone-400 font-medium block">Price</span>
          <span className="text-lg font-bold text-stone-900">
            ₹{dish.price}
          </span>
        </div>

        <div>
          {quantity === 0 ? (
            <button
              onClick={() => addItem(dish)}
              disabled={!isAvailable}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-600 text-red-700 hover:text-white font-bold text-xs uppercase tracking-wider border border-red-200 hover:border-red-600 transition-all active:scale-95 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-red-700 text-white rounded-xl px-2 py-1 shadow-md">
              <button
                onClick={() => updateQuantity(dish.id, quantity - 1)}
                className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-800 transition-colors active:scale-90"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-extrabold text-sm min-w-[1.25rem] text-center">
                {quantity}
              </span>
              <button
                onClick={() => updateQuantity(dish.id, quantity + 1)}
                className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-800 transition-colors active:scale-90"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodCard;

