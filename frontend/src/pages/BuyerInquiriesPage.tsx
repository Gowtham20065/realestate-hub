import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Inquiry } from '../types';
import { apiClient } from '../api/client';
import { MessageSquare, Clock, MapPin, Mail, Home } from 'lucide-react';

export const BuyerInquiriesPage: React.FC = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const res = await apiClient<{
          success: boolean;
          data: { inquiries: Inquiry[] };
        }>('/inquiries/my-inquiries');
        setInquiries(res.data.inquiries);
      } catch (err) {
        console.error('Failed to load inquiries:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            Pending Agent Review
          </span>
        );
      case 'CONTACTED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            Agent In Touch
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Resolved / Completed
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          My Inquiries
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Track agent responses and tour requests for properties you've contacted
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-40 bg-white rounded-2xl animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : inquiries.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">No inquiries submitted yet</h2>
          <p className="text-sm text-slate-500">
            When you contact an agent on a property detail page, your inquiry thread and status will appear here.
          </p>
          <div className="pt-2">
            <Link
              to="/properties"
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
            >
              <Home className="w-4 h-4" />
              <span>Browse Properties</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inquiry) => (
            <div
              key={inquiry.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start md:items-center hover:shadow-md transition-shadow"
            >
              {/* Property Details preview */}
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {getStatusBadge(inquiry.status)}
                  <span className="text-xs text-slate-400 flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    {new Date(inquiry.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <Link
                  to={`/properties/${inquiry.propertyId}`}
                  className="block text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors"
                >
                  {inquiry.property?.title || 'Property Listing'}
                </Link>

                <p className="text-xs text-slate-500 flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  <span>{inquiry.property?.city}, {inquiry.property?.state}</span>
                </p>

                {/* Message preview box */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm text-slate-700 italic">
                  "{inquiry.message}"
                </div>
              </div>

              {/* Agent info */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1 w-full md:w-64 shrink-0">
                <p className="font-bold text-slate-800">Assigned Agent</p>
                <p className="text-slate-700 font-medium">{inquiry.property?.agent?.name || 'Agent'}</p>
                <p className="text-slate-500 flex items-center">
                  <Mail className="w-3 h-3 mr-1" />
                  <span>{inquiry.property?.agent?.email}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
