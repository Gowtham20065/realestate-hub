import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Inquiry, InquiryStatus } from '../types';
import { apiClient } from '../api/client';
import { MessageSquare, Mail, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export const AgentInquiriesPage: React.FC = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgentInquiries = async () => {
      try {
        const res = await apiClient<{
          success: boolean;
          data: { inquiries: Inquiry[] };
        }>('/inquiries/agent/received');
        setInquiries(res.data.inquiries);
      } catch (err) {
        console.error('Failed to load agent inquiries:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAgentInquiries();
  }, []);

  const handleStatusChange = async (inquiryId: string, newStatus: InquiryStatus) => {
    setUpdatingId(inquiryId);
    try {
      await apiClient(`/inquiries/${inquiryId}/status`, {
        method: 'PATCH',
        data: { status: newStatus },
      });

      // Update local state
      setInquiries((prev) =>
        prev.map((inq) => (inq.id === inquiryId ? { ...inq, status: newStatus } : inq))
      );
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const pendingCount = inquiries.filter((i) => i.status === 'PENDING').length;
  const contactedCount = inquiries.filter((i) => i.status === 'CONTACTED').length;
  const resolvedCount = inquiries.filter((i) => i.status === 'RESOLVED').length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header & Metrics */}
      <div className="space-y-6 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold tracking-wide uppercase mb-2">
            <span>Agent CRM Portal</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Client Inquiries & Leads
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage prospective buyer inquiries across your active real estate listings
          </p>
        </div>

        {/* Lead Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Requires Action</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{pendingCount}</p>
              <p className="text-xs text-slate-500 mt-0.5">Pending leads</p>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">In Progress</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{contactedCount}</p>
              <p className="text-xs text-slate-500 mt-0.5">Contacted clients</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <MessageSquare className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Completed</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{resolvedCount}</p>
              <p className="text-xs text-slate-500 mt-0.5">Resolved inquiries</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Leads List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-44 bg-white rounded-2xl animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : inquiries.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">No client inquiries yet</h2>
          <p className="text-sm text-slate-500">
            When buyers submit inquiry forms on your properties, their contact info and tour requests will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inq) => (
            <div
              key={inq.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                    {inq.user?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{inq.user?.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center">
                      <Mail className="w-3 h-3 mr-1" />
                      <span>{inq.user?.email}</span>
                    </p>
                  </div>
                </div>

                {/* Status Dropdown */}
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <span className="text-xs font-semibold text-slate-500">Status:</span>
                  <select
                    value={inq.status}
                    disabled={updatingId === inq.id}
                    onChange={(e) => handleStatusChange(inq.id, e.target.value as InquiryStatus)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl border focus:outline-none transition-all ${
                      inq.status === 'PENDING'
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : inq.status === 'CONTACTED'
                        ? 'bg-blue-50 text-blue-800 border-blue-300'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    }`}
                  >
                    <option value="PENDING">Pending Review</option>
                    <option value="CONTACTED">Client Contacted</option>
                    <option value="RESOLVED">Resolved / Tour Done</option>
                  </select>
                </div>
              </div>

              {/* Inquiry message and Property info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Client Message
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    "{inq.message}"
                  </p>
                  <p className="text-xs text-slate-400 flex items-center mt-3">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    <span>Received on {new Date(inq.createdAt).toLocaleString()}</span>
                  </p>
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Inquired Property
                  </p>
                  <Link
                    to={`/properties/${inq.propertyId}`}
                    className="font-bold text-sm text-slate-900 hover:text-blue-600 block line-clamp-1"
                  >
                    {inq.property?.title}
                  </Link>
                  <p className="text-xs text-slate-500">
                    {inq.property?.city}, {inq.property?.state}
                  </p>
                  {inq.property?.price && (
                    <p className="text-sm font-extrabold text-blue-600 pt-1">
                      ${Number(inq.property.price).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
