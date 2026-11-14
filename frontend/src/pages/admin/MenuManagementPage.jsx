import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit3, Trash2, Check, X, 
  Eye, EyeOff, AlertCircle, Sparkles, Filter, RefreshCw 
} from 'lucide-react';
import VegBadge from '../../components/VegBadge';
import { 
  fetchAdminMenu, fetchCategories, createDish, updateDish, 
  deleteDish, toggleAvailability, togglePublish, createCategory 
} from '../../api/menuApi';

const MenuManagementPage = () => {
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');
  const [search, setSearch] = useState('');
  const [showUnpublishedOnly, setShowUnpublishedOnly] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState(null);

  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formImg, setFormImg] = useState('');
  const [formType, setFormType] = useState('VEG');
  const [formCatId, setFormCatId] = useState('');
  const [formAvailable, setFormAvailable] = useState(true);
  const [formPublished, setFormPublished] = useState(true);

  const loadMenu = async () => {
    try {
      const [menuData, catData] = await Promise.all([
        fetchAdminMenu({
          foodType: filterType === 'ALL' ? null : filterType,
          published: showUnpublishedOnly ? false : null,
          search: search.trim() || null,
        }),
        fetchCategories(),
      ]);
      setDishes(menuData);
      setCategories(catData);
    } catch (err) {
      console.error('Failed to load admin menu', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenu();
  }, [filterType, showUnpublishedOnly, search]);

  const openAddModal = () => {
    setEditingDish(null);
    setFormName('');
    setFormPrice('');
    setFormDesc('');
    setFormImg('');
    setFormType('VEG');
    setFormCatId(categories[0]?.id || '');
    setFormAvailable(true);
    setFormPublished(true);
    setIsModalOpen(true);
  };

  const openEditModal = (dish) => {
    setEditingDish(dish);
    setFormName(dish.name);
    setFormPrice(dish.price);
    setFormDesc(dish.description || '');
    setFormImg(dish.imageUrl || '');
    setFormType(dish.foodType);
    setFormCatId(dish.categoryId || '');
    setFormAvailable(dish.available);
    setFormPublished(dish.published);
    setIsModalOpen(true);
  };

  const handleSaveDish = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formName.trim(),
        price: parseFloat(formPrice),
        description: formDesc.trim(),
        imageUrl: formImg.trim() || null,
        foodType: formType,
        categoryId: formCatId ? Number(formCatId) : null,
        available: formAvailable,
        published: formType === 'UNASSIGNED' ? false : formPublished,
      };

      if (editingDish) {
        await updateDish(editingDish.id, payload);
      } else {
        await createDish(payload);
      }

      setIsModalOpen(false);
      loadMenu();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving dish');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete dish "${name}" from menu?`)) return;
    try {
      await deleteDish(id);
      loadMenu();
    } catch (err) {
      alert('Error deleting dish');
    }
  };

  const handleToggleAvail = async (id) => {
    try {
      await toggleAvailability(id);
      loadMenu();
    } catch (err) {
      alert('Error toggling availability');
    }
  };

  const handleTogglePub = async (id) => {
    try {
      await togglePublish(id);
      loadMenu();
    } catch (err) {
      alert('Error toggling publish status');
    }
  };

  const unpublishedCount = dishes.filter((d) => !d.published || d.foodType === 'UNASSIGNED').length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            Menu Management &amp; Dishes
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Update prices, add new items, toggle stock availability, and classify ambiguous dishes.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Dish</span>
        </button>
      </div>

      {/* UNPUBLISHED DISHES NOTIFICATION BANNER */}
      {unpublishedCount > 0 && !showUnpublishedOnly && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="text-xs">
              <strong className="font-bold block">
                {unpublishedCount} dishes requiring Veg/Non-Veg classification
              </strong>
              <span>
                Dishes with ambiguous dietary classification are kept unpublished until assigned by Admin.
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowUnpublishedOnly(true)}
            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm shrink-0"
          >
            Review Dishes
          </button>
        </div>
      )}

      {/* FILTERS & SEARCH */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Type pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto scrollbar-none">
          <button
            onClick={() => {
              setFilterType('ALL');
              setShowUnpublishedOnly(false);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              filterType === 'ALL' && !showUnpublishedOnly
                ? 'bg-stone-900 text-white'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            All Dishes
          </button>
          <button
            onClick={() => {
              setFilterType('VEG');
              setShowUnpublishedOnly(false);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              filterType === 'VEG' && !showUnpublishedOnly
                ? 'bg-emerald-600 text-white'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            Veg Only
          </button>
          <button
            onClick={() => {
              setFilterType('NON_VEG');
              setShowUnpublishedOnly(false);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              filterType === 'NON_VEG' && !showUnpublishedOnly
                ? 'bg-red-700 text-white'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            Non-Veg Only
          </button>
          <button
            onClick={() => setShowUnpublishedOnly(!showUnpublishedOnly)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              showUnpublishedOnly
                ? 'bg-amber-600 text-white'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            Unpublished ({unpublishedCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search menu items..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-red-600 shadow-sm"
          />
        </div>

      </div>

      {/* DISHES TABLE */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">Dish</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Stock Status</th>
                <th className="py-3.5 px-4">Published</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {dishes.map((dish) => (
                <tr key={dish.id} className="hover:bg-stone-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-100 shrink-0">
                        <img
                          src={dish.imageUrl || "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=100&q=80"}
                          alt={dish.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-bold text-stone-900 text-sm">{dish.name}</div>
                        {dish.description && (
                          <div className="text-[11px] text-stone-400 line-clamp-1 max-w-xs">
                            {dish.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <VegBadge isVeg={dish.foodType} size="sm" />
                      <span className="font-medium text-[11px]">{dish.foodType}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4 font-medium text-stone-600">
                    {dish.categoryName || '—'}
                  </td>

                  <td className="py-3 px-4 font-bold text-stone-900 text-sm">
                    ₹{dish.price}
                  </td>

                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggleAvail(dish.id)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors ${
                        dish.available
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                      }`}
                    >
                      {dish.available ? 'In Stock' : 'Sold Out'}
                    </button>
                  </td>

                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleTogglePub(dish.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors ${
                        dish.published
                          ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                          : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                      }`}
                    >
                      {dish.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {dish.published ? 'Live' : 'Hidden'}
                    </button>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(dish)}
                        className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-600 hover:text-stone-900"
                        title="Edit Dish & Price"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(dish.id, dish.name)}
                        className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600"
                        title="Delete Dish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DISH CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-serif text-xl font-bold text-stone-900">
                {editingDish ? 'Edit Dish & Price' : 'Add New Food Item'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 text-stone-500 hover:text-stone-900 flex items-center justify-center font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveDish} className="space-y-4">
              
              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-700 uppercase">
                  Dish Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Chicken Lollipop"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-stone-700 uppercase">
                    Price (₹ INR) *
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="270"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-stone-700 uppercase">
                    Food Classification *
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 font-medium"
                  >
                    <option value="VEG">VEG (Green)</option>
                    <option value="NON_VEG">NON-VEG (Red)</option>
                    <option value="UNASSIGNED">UNASSIGNED (Hidden)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-700 uppercase">
                  Menu Category
                </label>
                <select
                  value={formCatId}
                  onChange={(e) => setFormCatId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="">Select Category...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-700 uppercase">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Ingredients and culinary style..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-700 uppercase">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formImg}
                  onChange={(e) => setFormImg(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formAvailable}
                    onChange={(e) => setFormAvailable(e.target.checked)}
                    className="w-4 h-4 rounded text-red-600"
                  />
                  <span>Available (In Stock)</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formPublished}
                    onChange={(e) => setFormPublished(e.target.checked)}
                    className="w-4 h-4 rounded text-red-600"
                  />
                  <span>Publish to Customer Menu</span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 text-xs font-semibold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs uppercase tracking-wider shadow"
                >
                  Save Dish
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default MenuManagementPage;

