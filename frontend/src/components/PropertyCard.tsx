import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Property } from '../types';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { Bed, Bath, Maximize, MapPin, Heart } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  initialSaved?: boolean;
  onToggleSave?: (propertyId: string, isSaved: boolean) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  initialSaved = false,
  onToggleSave,
}) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState<boolean>(initialSaved);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const formatPrice = (val: string | number, listingType: string) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(num);

    return listingType === 'RENT' ? `${formatted}/mo` : formatted;
  };

  const handleHeartClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (isSaving) return;

    setIsSaving(true);
    const prevSaved = isSaved;
    setIsSaved(!prevSaved); // Optimistic UI

    try {
      const res = await apiClient<{ success: boolean; isSaved: boolean }>(
        `/saved-properties/${property.id}`,
        { method: 'POST' }
      );
      setIsSaved(res.isSaved);
      if (onToggleSave) {
        onToggleSave(property.id, res.isSaved);
      }
    } catch (err) {
      setIsSaved(prevSaved); // Revert on failure
      console.error('Failed to toggle save:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const coverImage =
    property.imageUrls && property.imageUrls.length > 0
      ? property.imageUrls[0]
      : 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=80';

  return (
    <article className="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
      <Link to={`/properties/${property.id}`} className="block relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={coverImage}
          alt={property.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Listing Type & Status Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide uppercase shadow-sm ${
              property.listingType === 'RENT'
                ? 'bg-emerald-600 text-white'
                : 'bg-blue-600 text-white'
            }`}
          >
            For {property.listingType}
          </span>
          <span className="bg-slate-900/70 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-xs font-medium">
            {property.propertyType}
          </span>
        </div>

        {/* Save / Heart Button */}
        <button
          onClick={handleHeartClick}
          aria-label={isSaved ? 'Remove from favorites' : 'Save to favorites'}
          className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all ${
            isSaved
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
              : 'bg-white/80 hover:bg-white text-slate-700 hover:text-rose-500'
          }`}
        >
          <Heart className={`w-4 h-4 transition-transform ${isSaved ? 'fill-current scale-110' : ''}`} />
        </button>
      </Link>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-baseline mb-1.5">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {formatPrice(property.price, property.listingType)}
            </span>
          </div>

          <Link to={`/properties/${property.id}`} className="block">
            <h3 className="font-semibold text-slate-800 text-lg hover:text-blue-600 transition-colors line-clamp-1 mb-2">
              {property.title}
            </h3>
          </Link>

          <p className="flex items-center text-sm text-slate-500 mb-4 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
            <span>{property.address}, {property.city}, {property.state}</span>
          </p>
        </div>

        {/* Specs footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
          <div className="flex items-center space-x-1">
            <Bed className="w-4 h-4 text-slate-400" />
            <span>{property.bedrooms} Beds</span>
          </div>
          <div className="flex items-center space-x-1">
            <Bath className="w-4 h-4 text-slate-400" />
            <span>{property.bathrooms} Baths</span>
          </div>
          <div className="flex items-center space-x-1">
            <Maximize className="w-4 h-4 text-slate-400" />
            <span>{property.sqft.toLocaleString()} sqft</span>
          </div>
        </div>
      </div>
    </article>
  );
};
