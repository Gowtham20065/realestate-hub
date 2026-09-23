import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

export interface FilterState {
  city: string;
  listingType: string;
  propertyType: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  sortBy: string;
}

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
  onReset: () => void;
}

const CITIES = ['All Cities', 'Austin', 'New York', 'Seattle', 'Miami'];
const PROPERTY_TYPES = ['All Types', 'HOUSE', 'APARTMENT', 'CONDO', 'TOWNHOUSE'];

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onChange,
  onReset,
}) => {
  const update = (key: keyof FilterState, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <aside className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-2 text-slate-900 font-bold">
          <Filter className="w-5 h-5 text-blue-600" />
          <span>Filters</span>
        </div>
        <button
          onClick={onReset}
          className="flex items-center space-x-1 text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Listing Type Toggle */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Listing Purpose
        </label>
        <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
          {[
            { label: 'All', val: '' },
            { label: 'Buy', val: 'SALE' },
            { label: 'Rent', val: 'RENT' },
          ].map((tab) => (
            <button
              key={tab.label}
              type="button"
              onClick={() => update('listingType', tab.val)}
              className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                filters.listingType === tab.val
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* City Filter */}
      <div>
        <label htmlFor="city-select" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          City
        </label>
        <select
          id="city-select"
          value={filters.city}
          onChange={(e) => update('city', e.target.value === 'All Cities' ? '' : e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        >
          {CITIES.map((c) => (
            <option key={c} value={c === 'All Cities' ? '' : c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Property Type */}
      <div>
        <label htmlFor="property-type-select" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Property Type
        </label>
        <select
          id="property-type-select"
          value={filters.propertyType}
          onChange={(e) => update('propertyType', e.target.value === 'All Types' ? '' : e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        >
          {PROPERTY_TYPES.map((pt) => (
            <option key={pt} value={pt === 'All Types' ? '' : pt}>
              {pt === 'All Types' ? 'All Property Types' : pt.charAt(0) + pt.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Price Range ($)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => update('minPrice', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => update('maxPrice', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Bedrooms */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Bedrooms
        </label>
        <div className="flex gap-1.5">
          {['', '1', '2', '3', '4'].map((bed) => (
            <button
              key={bed || 'any'}
              type="button"
              onClick={() => update('bedrooms', bed)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                filters.bedrooms === bed
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              {bed ? `${bed}+` : 'Any'}
            </button>
          ))}
        </div>
      </div>

      {/* Sorting */}
      <div>
        <label htmlFor="sort-select" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Sort By
        </label>
        <select
          id="sort-select"
          value={filters.sortBy}
          onChange={(e) => update('sortBy', e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        >
          <option value="newest">Newest Listed</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="sqft_desc">Size: Largest First</option>
        </select>
      </div>
    </aside>
  );
};
