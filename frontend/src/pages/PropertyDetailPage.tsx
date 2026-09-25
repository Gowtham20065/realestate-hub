import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { Property } from '../types';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { AgentReviewsSection } from '../components/AgentReviewsSection';
import {
  Bed,
  Bath,
  Maximize,
  MapPin,
  Heart,
  ChevronLeft,
  Mail,
  Send,
  CheckCircle,
} from 'lucide-react';

export const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [property, setProperty] = useState<Property | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Inquiry form states
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [submittingInquiry, setSubmittingInquiry] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [inquiryError, setInquiryError] = useState('');

  useEffect(() => {
    const fetchPropertyAndSavedStatus = async () => {
      if (!id) return;
      setLoading(true);
      try {
        // 1. Fetch Property (triggers non-blocking backend VIEW logging automatically)
        const res = await apiClient<{ success: boolean; data: { property: Property } }>(
          `/properties/${id}`
        );
        setProperty(res.data.property);

        // 2. Check saved status if user is authenticated
        if (localStorage.getItem('token')) {
          try {
            const savedRes = await apiClient<{ success: boolean; isSaved: boolean }>(
              `/saved-properties/check/${id}`
            );
            setIsSaved(savedRes.isSaved);
          } catch {
            // Ignore if check fails
          }
        }
      } catch (err) {
        console.error('Failed to load property details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyAndSavedStatus();
  }, [id]);

  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!id || saving) return;

    setSaving(true);
    const prev = isSaved;
    setIsSaved(!prev); // Optimistic

    try {
      const res = await apiClient<{ success: boolean; isSaved: boolean }>(
        `/saved-properties/${id}`,
        { method: 'POST' }
      );
      setIsSaved(res.isSaved);
    } catch {
      setIsSaved(prev);
    } finally {
      setSaving(false);
    }
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!id || !inquiryMessage.trim()) return;

    setSubmittingInquiry(true);
    setInquiryError('');
    setInquirySuccess(false);

    try {
      await apiClient('/inquiries', {
        method: 'POST',
        data: {
          propertyId: id,
          message: inquiryMessage,
        },
      });
      setInquirySuccess(true);
      setInquiryMessage('');
    } catch (err: any) {
      setInquiryError(err.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setSubmittingInquiry(false);
    }
  };

  const formatPrice = (val: string | number, listingType: string) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(num);

    return listingType === 'RENT' ? `${formatted}/mo` : formatted;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="h-8 w-40 bg-slate-200 rounded-lg animate-pulse mb-6" />
        <div className="h-96 bg-slate-200 rounded-3xl animate-pulse mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-10 w-3/4 bg-slate-200 rounded animate-pulse" />
            <div className="h-32 bg-slate-200 rounded animate-pulse" />
          </div>
          <div className="h-64 bg-slate-200 rounded-3xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 bg-white border border-slate-200 rounded-3xl text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Property Listing Not Found</h2>
        <p className="text-sm text-slate-500">
          This property may have been removed or does not exist.
        </p>
        <Link
          to="/properties"
          className="inline-block px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl text-sm"
        >
          Browse Listings
        </Link>
      </div>
    );
  }

  const images =
    property.imageUrls && property.imageUrls.length > 0
      ? property.imageUrls
      : ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Link & Action Bar */}
      <div className="flex justify-between items-center">
        <Link
          to="/properties"
          className="inline-flex items-center space-x-1.5 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to all properties</span>
        </Link>

        {/* Favorite Button */}
        <button
          onClick={handleToggleSave}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
            isSaved
              ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-sm'
              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
          }`}
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-current text-rose-500' : ''}`} />
          <span>{isSaved ? 'Saved to Favorites' : 'Save Property'}</span>
        </button>
      </div>

      {/* Image Gallery */}
      <div className="space-y-4">
        <div className="relative aspect-[16/9] sm:aspect-[21/9] rounded-3xl overflow-hidden bg-slate-900 shadow-lg border border-slate-200">
          <img
            src={images[activeImageIndex]}
            alt={property.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 flex gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-md ${
                property.listingType === 'RENT' ? 'bg-emerald-600' : 'bg-blue-600'
              }`}
            >
              For {property.listingType}
            </span>
            <span className="bg-slate-900/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium">
              {property.propertyType}
            </span>
          </div>
        </div>

        {/* Thumbnails if multiple images */}
        {images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative w-24 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                  activeImageIndex === idx ? 'border-blue-600 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`thumbnail ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Details Grid & Inquiry Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Specs & Description */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2">
              {formatPrice(property.price, property.listingType)}
            </div>
            <h1 className="text-2xl font-bold text-slate-800 leading-snug">
              {property.title}
            </h1>
            <p className="flex items-center text-slate-500 mt-2 text-sm">
              <MapPin className="w-4 h-4 mr-1 text-slate-400 shrink-0" />
              <span>{property.address}, {property.city}, {property.state}</span>
            </p>
          </div>

          {/* Quick Specs Pill Cards */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 p-4 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
            <div className="space-y-1">
              <div className="flex justify-center text-blue-600">
                <Bed className="w-5 h-5" />
              </div>
              <p className="text-xl font-bold text-slate-900">{property.bedrooms}</p>
              <p className="text-xs font-medium text-slate-500 uppercase">Bedrooms</p>
            </div>
            <div className="space-y-1 border-x border-slate-100">
              <div className="flex justify-center text-blue-600">
                <Bath className="w-5 h-5" />
              </div>
              <p className="text-xl font-bold text-slate-900">{property.bathrooms}</p>
              <p className="text-xs font-medium text-slate-500 uppercase">Bathrooms</p>
            </div>
            <div className="space-y-1">
              <div className="flex justify-center text-blue-600">
                <Maximize className="w-5 h-5" />
              </div>
              <p className="text-xl font-bold text-slate-900">{property.sqft.toLocaleString()}</p>
              <p className="text-xs font-medium text-slate-500 uppercase">Square Feet</p>
            </div>
          </div>

          {/* About Section */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-slate-900">About this property</h2>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line text-sm sm:text-base">
              {property.description}
            </p>

            <div className="pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Property Type</span>
                <span className="font-semibold text-slate-800">{property.propertyType}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Status</span>
                <span className="font-semibold text-emerald-600">{property.status}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Listed On</span>
                <span className="font-semibold text-slate-800">
                  {new Date(property.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Agent Reviews & Sentiment Section */}
          <AgentReviewsSection
            agentId={property.agentId}
            agentName={property.agent?.name || 'Listing Agent'}
          />
        </div>

        {/* Right Column: Agent Card & Contact Inquiry Form */}
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900">Listing Agent</h3>

            {/* Agent Info */}
            <div className="flex items-center space-x-3.5 pb-6 border-b border-slate-100">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-lg flex items-center justify-center shrink-0">
                {property.agent?.name?.charAt(0) || 'A'}
              </div>
              <div>
                <h4 className="font-bold text-slate-900">{property.agent?.name || 'Licensed Agent'}</h4>
                <p className="text-xs text-slate-500 flex items-center mt-0.5">
                  <Mail className="w-3.5 h-3.5 mr-1" />
                  <span>{property.agent?.email || 'agent@realestatehub.com'}</span>
                </p>
              </div>
            </div>

            {/* Inquiry Form */}
            <div>
              <h4 className="text-sm font-bold text-slate-800 mb-2">Request Information</h4>
              <p className="text-xs text-slate-500 mb-4">
                Send a direct inquiry to schedule a private tour or ask questions.
              </p>

              {inquirySuccess ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start space-x-3 text-emerald-800">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-bold">Inquiry Sent Successfully!</p>
                    <p>The listing agent has received your message and will contact you shortly.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit} className="space-y-3">
                  {inquiryError && (
                    <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-medium">
                      {inquiryError}
                    </div>
                  )}

                  <textarea
                    rows={4}
                    placeholder="Hi, I am interested in this listing and would like to learn more about..."
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none text-slate-800"
                  />

                  {isAuthenticated ? (
                    <button
                      type="submit"
                      disabled={submittingInquiry || !inquiryMessage.trim()}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl flex items-center justify-center space-x-2 shadow-sm transition-all"
                    >
                      <Send className="w-4 h-4" />
                      <span>{submittingInquiry ? 'Sending...' : 'Send Inquiry'}</span>
                    </button>
                  ) : (
                    <div className="text-center pt-2">
                      <Link
                        to="/login"
                        className="inline-block w-full py-3 bg-slate-900 text-white font-semibold text-sm rounded-xl hover:bg-slate-800 transition-colors"
                      >
                        Sign in to Contact Agent
                      </Link>
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
