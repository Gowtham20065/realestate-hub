import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { SavedProperty } from '../types';
import { apiClient } from '../api/client';
import { PropertyCard } from '../components/PropertyCard';
import { Heart, Home, ArrowRight } from 'lucide-react';

export const SavedPropertiesPage: React.FC = () => {
  const [savedItems, setSavedItems] = useState<SavedProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const res = await apiClient<{
          success: boolean;
          data: { savedProperties: SavedProperty[] };
        }>('/saved-properties');
        setSavedItems(res.data.savedProperties);
      } catch (err) {
        console.error('Failed to load saved properties:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSaved();
  }, []);

  const handleToggleSave = (propertyId: string, isSaved: boolean) => {
    if (!isSaved) {
      // Optimistically remove from list when unsaved
      setSavedItems((prev) => prev.filter((item) => item.propertyId !== propertyId));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2 text-rose-500 font-bold text-sm tracking-wide uppercase mb-1">
            <Heart className="w-4 h-4 fill-current" />
            <span>My Favorites</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Saved Properties
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {savedItems.length} properties saved to your personal collection
          </p>
        </div>

        <Link
          to="/properties"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-sm font-semibold transition-colors"
        >
          <span>Find More Listings</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-2xl h-80 animate-pulse border border-slate-200/80" />
          ))}
        </div>
      ) : savedItems.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">No saved properties yet</h2>
          <p className="text-sm text-slate-500">
            Click the heart icon on any property listing while browsing to save it here for quick access later.
          </p>
          <div className="pt-2">
            <Link
              to="/properties"
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
            >
              <Home className="w-4 h-4" />
              <span>Explore Properties</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedItems.map((item) => (
            <PropertyCard
              key={item.id}
              property={item.property}
              initialSaved={true}
              onToggleSave={handleToggleSave}
            />
          ))}
        </div>
      )}
    </div>
  );
};
