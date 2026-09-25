import React, { useState, useEffect } from 'react';
import type { RecommendationResponse, RecommendedPropertyItem } from '../types';
import { apiClient } from '../api/client';
import { PropertyCard } from './PropertyCard';
import { Sparkles, TrendingUp, RefreshCw, Compass } from 'lucide-react';

export const RecommendationsSection: React.FC = () => {
  const [data, setData] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const res = await apiClient<{ success: boolean; data: RecommendationResponse }>(
        '/recommendations?limit=6'
      );
      setData(res.data);
    } catch (err) {
      console.warn('Failed to load recommendations, falling back gracefully:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await apiClient('/recommendations/recalculate', { method: 'POST' }).catch(() => null);
      await fetchRecommendations();
    } catch (err) {
      console.warn('Failed to recalculate:', err);
    } finally {
      setRefreshing(false);
    }
  };

  if (!loading && (!data || !data.recommendations || data.recommendations.length === 0)) {
    return null;
  }

  const isPersonalized = data?.strategy === 'personalized_hybrid';

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center space-x-2 mb-1.5">
            <span
              className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase ${
                isPersonalized
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
              }`}
            >
              {isPersonalized ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>AI Personalized For You</span>
                </>
              ) : (
                <>
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Trending Community Picks</span>
                </>
              )}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isPersonalized ? 'Recommended For You' : 'Trending Properties In Demand'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {isPersonalized
              ? 'Tuned to your browsing patterns, saved properties, and inquiry preferences'
              : 'Popular listings with high inquiry frequency and buyer interest'}
          </p>
        </div>

        {/* Action Controls */}
        <button
          onClick={handleRefresh}
          disabled={refreshing || loading}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-xl shadow-sm transition-all disabled:opacity-50"
          title="Refit recommendation feature vectors and recalculate similarity"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refitting Model...' : 'Recalculate Picks'}</span>
        </button>
      </div>

      {/* Grid or Skeletons */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl h-84 animate-pulse border border-slate-200/80" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.recommendations.map((item: RecommendedPropertyItem) => (
            <div key={item.property_id} className="flex flex-col h-full group">
              {/* Property card */}
              <div className="relative flex-1">
                <PropertyCard property={item.property} />

                {/* Match percentage pill badge in top right of card header */}
                <div className="absolute top-3 right-14 z-10">
                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-900/85 backdrop-blur-md text-emerald-400 border border-emerald-500/30 shadow-md">
                    <span>{item.match_percentage}% Match</span>
                  </span>
                </div>
              </div>

              {/* Rationale explanation pill */}
              <div className="mt-2.5 px-3 py-1.5 bg-slate-100/90 rounded-xl text-xs font-medium text-slate-600 flex items-center space-x-1.5 border border-slate-200/60">
                <Compass className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span className="truncate">{item.reason}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
