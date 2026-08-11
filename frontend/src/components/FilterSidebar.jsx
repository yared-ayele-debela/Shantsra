import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, RotateCcw, CircleDollarSign } from 'lucide-react';
import { CATEGORIES } from '../data/initialData';

export default function FilterSidebar({
  filterRoute,
  setFilterRoute,
  filterCategories,
  setFilterCategories,
  filterMaxWeight,
  setFilterMaxWeight,
  filterMinReward,
  setFilterMinReward,
  filterUrgent,
  setFilterUrgent,
  onResetFilters
}) {
  const [dbCategories, setDbCategories] = useState([]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/package-categories', {
          headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.categories && data.categories.length > 0) {
            setDbCategories(data.categories);
          }
        }
      } catch (err) {
        console.log('FilterSidebar categories fetch complete.');
      }
    }
    fetchCategories();
  }, []);

  const categoriesList = dbCategories.length > 0 ? dbCategories : CATEGORIES;
  const getCategoryName = (category) => typeof category === 'string' ? category : category?.name || '';
  const getCategoryValue = (category) => getCategoryName(category).trim().toLocaleLowerCase();
  const handleCategoryToggle = (categoryValue) => {
    setFilterCategories((currentCategories) => {
      const isSelected = currentCategories.includes(categoryValue);
      if (isSelected) {
        return currentCategories.filter((catId) => catId !== categoryValue);
      }
      return [...currentCategories, categoryValue];
    });
  };

  return (
    <aside className="lg:col-span-4 bg-white rounded-2xl border border-amber-100 p-4 sm:p-6 shadow-[0_1px_3px_rgba(28,22,15,0.04),0_10px_30px_-15px_rgba(28,22,15,0.08)] space-y-5 sm:space-y-6 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] overflow-y-auto scrollbar-none">
      <div className="flex items-center justify-between border-b border-amber-50 pb-3">
        <h3 className="font-display font-bold text-sm sm:text-base text-[#1C160F] flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-amber-600" /> Refine Search
        </h3>
        <button 
          onClick={onResetFilters}
          className="text-xs font-semibold text-slate-400 hover:text-amber-600 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" /> Clear all
        </button>
      </div>

      {/* Flight Route Corridor */}
      <div className="space-y-2">
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Flight Route Corridor
        </label>
        <div className="grid grid-cols-1 gap-2">
          <label className={`border rounded-xl p-2.5 sm:p-3 flex items-center justify-between cursor-pointer transition-colors ${filterRoute === 'ALL' ? 'border-amber-500 bg-amber-50/40' : 'border-amber-100 hover:bg-amber-50/20'}`}>
            <span className="text-xs font-semibold text-slate-700">All Routes</span>
            <input 
              type="radio" 
              name="route-filter" 
              value="ALL" 
              checked={filterRoute === 'ALL'}
              onChange={() => setFilterRoute('ALL')}
              className="accent-amber-600 h-4 w-4" 
            />
          </label>
          <label className={`border rounded-xl p-2.5 sm:p-3 flex items-center justify-between cursor-pointer transition-colors ${filterRoute === 'ADD_TO_DXB' ? 'border-amber-500 bg-amber-50/40' : 'border-amber-100 hover:bg-amber-50/20'}`}>
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              Addis (ADD) ➔ Dubai (DXB)
            </span>
            <input 
              type="radio" 
              name="route-filter" 
              value="ADD_TO_DXB"
              checked={filterRoute === 'ADD_TO_DXB'}
              onChange={() => setFilterRoute('ADD_TO_DXB')}
              className="accent-amber-600 h-4 w-4" 
            />
          </label>
          <label className={`border rounded-xl p-2.5 sm:p-3 flex items-center justify-between cursor-pointer transition-colors ${filterRoute === 'DXB_TO_ADD' ? 'border-amber-500 bg-amber-50/40' : 'border-amber-100 hover:bg-amber-50/20'}`}>
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              Dubai (DXB) ➔ Addis (ADD)
            </span>
            <input 
              type="radio" 
              name="route-filter" 
              value="DXB_TO_ADD"
              checked={filterRoute === 'DXB_TO_ADD'}
              onChange={() => setFilterRoute('DXB_TO_ADD')}
              className="accent-amber-600 h-4 w-4" 
            />
          </label>
        </div>
      </div>

      {/* Categories Checklist */}
      <div className="space-y-2">
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Categories
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-1 gap-1.5 max-h-[220px] overflow-y-auto pr-1">
          {categoriesList.map(cat => {
            const categoryName = getCategoryName(cat);
            const categoryValue = getCategoryValue(cat);
            const isSelected = filterCategories.includes(categoryValue);

            return (
            <label 
              key={cat.id || categoryName} 
              className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer hover:text-amber-600 transition-colors py-1"
            >
              <input 
                type="checkbox" 
                value={categoryValue} 
                checked={isSelected}
                onChange={() => handleCategoryToggle(categoryValue, categoryName)}
                className="accent-amber-600 rounded h-4 w-4" 
              />
              <span className="truncate">{categoryName}</span>
            </label>
            );
          })}
        </div>
      </div>

      {/* Weight Slider */}
      <div className="space-y-2.5">
        <div className="flex justify-between items-center text-xs">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Max Package Weight
          </label>
          <span className="font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded">
            {filterMaxWeight.toFixed(1)} kg
          </span>
        </div>
        <input 
          type="range" 
          min="0.2" 
          max="500" 
          step="0.2" 
          value={filterMaxWeight}
          onChange={(e) => setFilterMaxWeight(parseFloat(e.target.value))}
          className="w-full accent-amber-500 h-1.5 bg-slate-100 rounded-lg cursor-pointer" 
        />
        <div className="flex justify-between text-[9px] text-slate-400 font-semibold">
          <span>0.2 kg</span>
          <span>25.0 kg</span>
          <span>50.0 kg</span>
        </div>
      </div>

      {/* Urgency */}
      <label className="flex items-center justify-between gap-3 border border-red-100 rounded-xl p-3 cursor-pointer hover:bg-red-50/40 transition-colors">
        <span>
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Urgency</span>
          <span className="block mt-0.5 text-xs font-semibold text-slate-700">Urgent requests only</span>
        </span>
        <input
          type="checkbox"
          checked={filterUrgent}
          onChange={(event) => setFilterUrgent(event.target.checked)}
          className="h-4 w-4 rounded accent-red-600"
        />
      </label>

      {/* Reward Threshold */}
      <div className="space-y-2">
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Minimum Reward (AED / ETB equivalent)
        </label>
        <div className="relative flex items-center">
          <CircleDollarSign className="w-4 h-4 text-slate-400 absolute left-3" />
          <input 
            type="number" 
            value={filterMinReward || ''} 
            onChange={(e) => setFilterMinReward(e.target.value ? parseFloat(e.target.value) : 0)}
            placeholder="e.g. 100" 
            className="w-full border border-amber-200/80 rounded-xl pl-9 pr-3 py-2 text-xs outline-none focus:border-amber-500 transition-colors" 
          />
        </div>
        <p className="text-[9px] text-slate-400">
          Filters out requests with cash rewards below this numeric threshold.
        </p>
      </div>
    </aside>
  );
}
