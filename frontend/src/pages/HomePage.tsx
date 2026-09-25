import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Property } from '../types';
import { apiClient } from '../api/client';
import { PropertyCard } from '../components/PropertyCard';
import { RecommendationsSection } from '../components/RecommendationsSection';
import { Search, Sparkles, ShieldCheck, ArrowRight, Building2 } from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchCity, setSearchCity] = useState('');
  const [searchType, setSearchType] = useState('SALE');
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await apiClient<{ success: boolean; data: { properties: Property[] } }>(
          '/properties?limit=6'
        );
        setFeaturedProperties(res.data.properties);
      } catch (err) {
        console.error('Failed to load featured properties:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchCity) params.set('city', searchCity);
    if (searchType) params.set('listingType', searchType);
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-slate-900 to-slate-950 text-white py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>AI-Driven Real Estate Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Find Your Dream Home With{' '}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Smart Recommendations
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal">
            Discover curated properties across premier metropolitan areas. Powered by collaborative filtering that learns your preferences as you browse.
          </p>

          {/* Hero Search Box */}
          <form
            onSubmit={handleSearchSubmit}
            className="bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-2xl max-w-3xl mx-auto text-slate-800 flex flex-col sm:flex-row gap-3 items-center border border-slate-200"
          >
            {/* Rent / Sale Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto shrink-0">
              <button
                type="button"
                onClick={() => setSearchType('SALE')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  searchType === 'SALE' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'
                }`}
              >
                Buy
              </button>
              <button
                type="button"
                onClick={() => setSearchType('RENT')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  searchType === 'RENT' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'
                }`}
              >
                Rent
              </button>
            </div>

            {/* City Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by city (e.g. Austin, New York, Seattle, Miami)..."
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all shadow-md shadow-blue-600/30 shrink-0"
            >
              Search
            </button>
          </form>

          {/* Quick city pills */}
          <div className="flex flex-wrap justify-center items-center gap-2 pt-2 text-xs text-slate-400">
            <span className="font-medium">Popular Cities:</span>
            {['Austin', 'New York', 'Seattle', 'Miami'].map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => {
                  setSearchCity(city);
                  navigate(`/properties?city=${city}`);
                }}
                className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* AI Recommendations Section */}
      <RecommendationsSection />

      {/* Featured Properties Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Featured Properties
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Hand-picked homes and luxury spaces from verified agents
            </p>
          </div>
          <Link
            to="/properties"
            className="inline-flex items-center space-x-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 group"
          >
            <span>View All Listings</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-80 animate-pulse border border-slate-200/80" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
        )}
      </section>

      {/* Value Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-y border-slate-200/80">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Curated Urban Listings</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Filter by neighborhood, price range, property style, and specific room requirements effortlessly.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Collaborative AI Recommendations</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Our machine learning engine learns what you like based on listings you view, save, and inquire about.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Direct Agent Inquiries</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Connect directly with licensed listing agents to schedule private tours and request home disclosures.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
