import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, ShoppingBag, ArrowRight, Filter, Sparkles, X, Check } from 'lucide-react';
import FoodCard from '../components/FoodCard';
import VegBadge from '../components/VegBadge';
import { fetchCustomerMenu, fetchCategories } from '../api/menuApi';
import { useCart } from '../context/CartContext';

const OrderingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialType = searchParams.get('type') || 'ALL';

  const [foodType, setFoodType] = useState(initialType);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const { totalItemsCount, grandTotal } = useCart();

  // Keep searchParams in sync
  useEffect(() => {
    const current = searchParams.get('type');
    if (current && current !== foodType) {
      setFoodType(current);
    }
  }, [searchParams]);

  const handleTypeSelect = (type) => {
    setFoodType(type);
    setSelectedCategory(null);
    if (type === 'ALL') {
      searchParams.delete('type');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ type });
    }
  };

  useEffect(() => {
    const loadMenu = async () => {
      setLoading(true);
      try {
        const [menuData, catData] = await Promise.all([
          fetchCustomerMenu({
            foodType: foodType === 'ALL' ? null : foodType,
            categoryId: selectedCategory,
            search: searchQuery.trim() || null,
          }),
          fetchCategories(foodType === 'ALL' ? null : foodType),
        ]);
        setDishes(menuData);
        setCategories(catData);
      } catch (err) {
        console.error('Failed to load menu data', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      loadMenu();
    }, 200);

    return () => clearTimeout(timer);
  }, [foodType, selectedCategory, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-28">
      
      {/* STEP 1: FOOD TYPE CARDS SELECTOR */}
      <div className="space-y-4">
        <div className="text-center sm:text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
            Step 1
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mt-2">
            Select Food Preference
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Choose your dining category to filter pure vegetarian or non-vegetarian dishes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* ALL FOOD CARD */}
          <button
            type="button"
            onClick={() => handleTypeSelect('ALL')}
            className={`p-5 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${
              foodType === 'ALL'
                ? 'border-stone-900 bg-stone-900 text-white shadow-lg scale-[1.02]'
                : 'border-stone-200 bg-white hover:border-stone-300 text-stone-800'
            }`}
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-wider block opacity-70">
                Complete Menu
              </span>
              <span className="font-serif text-xl font-bold block mt-0.5">
                ALL DISHES
              </span>
              <span className="text-xs opacity-75">Veg &amp; Non-Veg Combined</span>
            </div>
            {foodType === 'ALL' && (
              <div className="w-7 h-7 rounded-full bg-white text-stone-900 flex items-center justify-center font-bold">
                <Check className="w-4 h-4" />
              </div>
            )}
          </button>

          {/* VEG FOOD CARD */}
          <button
            type="button"
            onClick={() => handleTypeSelect('VEG')}
            className={`p-5 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${
              foodType === 'VEG'
                ? 'border-emerald-600 bg-gradient-to-br from-emerald-600 to-green-700 text-white shadow-lg shadow-emerald-900/20 scale-[1.02]'
                : 'border-stone-200 bg-white hover:border-emerald-300 text-stone-800'
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <VegBadge isVeg="VEG" size="sm" />
                <span className="text-xs font-bold uppercase tracking-wider block opacity-90">
                  Pure Vegetarian
                </span>
              </div>
              <span className="font-serif text-xl font-bold block mt-0.5">
                VEG FOOD
              </span>
              <span className="text-xs opacity-85">Paneer, Soups, Hakka, Gravy</span>
            </div>
            {foodType === 'VEG' && (
              <div className="w-7 h-7 rounded-full bg-white text-emerald-700 flex items-center justify-center font-bold">
                <Check className="w-4 h-4" />
              </div>
            )}
          </button>

          {/* NON-VEG FOOD CARD */}
          <button
            type="button"
            onClick={() => handleTypeSelect('NON_VEG')}
            className={`p-5 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${
              foodType === 'NON_VEG'
                ? 'border-red-600 bg-gradient-to-br from-red-600 to-red-800 text-white shadow-lg shadow-red-900/20 scale-[1.02]'
                : 'border-stone-200 bg-white hover:border-red-300 text-stone-800'
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <VegBadge isVeg="NON_VEG" size="sm" />
                <span className="text-xs font-bold uppercase tracking-wider block opacity-90">
                  Non-Vegetarian
                </span>
              </div>
              <span className="font-serif text-xl font-bold block mt-0.5">
                NON-VEG FOOD
              </span>
              <span className="text-xs opacity-85">Chicken, Prawns, Pot Rice</span>
            </div>
            {foodType === 'NON_VEG' && (
              <div className="w-7 h-7 rounded-full bg-white text-red-700 flex items-center justify-center font-bold">
                <Check className="w-4 h-4" />
              </div>
            )}
          </button>

        </div>
      </div>

      {/* STEP 2: SEARCH & CATEGORY FILTERS */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Live Search Bar */}
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes (e.g. Manchow, Chicken Lollipop, Fried Rice)..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="text-xs text-stone-500 font-medium">
            Showing <strong className="text-stone-900">{dishes.length}</strong> delicious dishes
          </div>
        </div>

        {/* Category Pills Slider */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === null
                ? 'bg-red-700 text-white shadow-sm'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-red-700 text-white shadow-sm'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* DISHES GRID */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-stone-200 p-4 h-72 animate-pulse space-y-4">
              <div className="aspect-[16/10] bg-stone-200 rounded-xl" />
              <div className="h-4 bg-stone-200 rounded w-3/4" />
              <div className="h-3 bg-stone-100 rounded w-1/2" />
              <div className="h-8 bg-stone-200 rounded mt-auto" />
            </div>
          ))}
        </div>
      ) : dishes.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-xl font-bold text-stone-900">
            No dishes found
          </h3>
          <p className="text-sm text-stone-500">
            Try adjusting your search terms or switch category filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory(null);
              setFoodType('ALL');
            }}
            className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold uppercase tracking-wider"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {dishes.map((dish) => (
            <FoodCard key={dish.id} dish={dish} />
          ))}
        </div>
      )}

      {/* FLOATING CART BAR FOR EASY CHECKOUT (Appears when items are in cart) */}
      {totalItemsCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-40">
          <div className="bg-stone-900/95 backdrop-blur-md text-white rounded-2xl p-4 shadow-2xl border border-stone-700 flex items-center justify-between gap-4 animate-bounce-short">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-red-600 text-white text-xs font-extrabold px-2 py-0.5 rounded-full">
                  {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
                </span>
                <span className="text-xs text-stone-300">Total Live Bill:</span>
              </div>
              <span className="text-xl font-black text-amber-400 block mt-0.5">
                ₹{grandTotal}
              </span>
            </div>

            <Link
              to="/cart"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-sm shadow-md active:scale-95 transition-all"
            >
              <span>View Cart &amp; Table</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

    </div>
  );
};

export default OrderingPage;

