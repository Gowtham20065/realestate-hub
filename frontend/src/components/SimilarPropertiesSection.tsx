import React, { useState, useEffect } from 'react';
import type { RecommendedPropertyItem } from '../types';
import { apiClient } from '../api/client';
import { PropertyCard } from './PropertyCard';
import { Sparkles, Layers } from 'lucide-react';

interface SimilarPropertiesSectionProps {
  propertyId: string;
}

export const SimilarPropertiesSection: React.FC<SimilarPropertiesSectionProps> = ({ propertyId }) => {
  const [similarProperties, setSimilarProperties] = useState<RecommendedPropertyItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSimilar = async () => {
      try {
        setLoading(true);
        const res = await apiClient<{ success: boolean; data: RecommendedPropertyItem[] }>(
          `/recommendations/similar/${propertyId}?limit=3`
        );
        setSimilarProperties(res.data || []);
      } catch (err) {
        console.warn('Failed to load similar properties:', err);
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) {
      fetchSimilar();
    }
  }, [propertyId]);

  if (!loading && (!similarProperties || similarProperties.length === 0)) {
    return null;
  }

  return (
    <section className="pt-10 border-t border-slate-200 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Content-Based Similarity</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Similar Properties You Might Like
          </h2>
          <p className="text-sm text-slate-500">
            Properties with comparable price brackets, bedroom layouts, and geographic neighborhoods.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {similarProperties.map((item: RecommendedPropertyItem) => (
            <div key={item.property_id} className="flex flex-col h-full group">
              <div className="relative flex-1">
                <PropertyCard property={item.property} />

                {/* Similarity Match Badge */}
                <div className="absolute top-3 right-14 z-10">
                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-900/85 backdrop-blur-md text-cyan-400 border border-cyan-500/30 shadow-md">
                    <span>{item.match_percentage}% Match</span>
                  </span>
                </div>
              </div>

              {/* Similarity Rationale */}
              <div className="mt-2.5 px-3 py-1.5 bg-slate-100 rounded-xl text-xs font-medium text-slate-600 flex items-center space-x-1.5 border border-slate-200/60">
                <Layers className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className="truncate">{item.reason}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
