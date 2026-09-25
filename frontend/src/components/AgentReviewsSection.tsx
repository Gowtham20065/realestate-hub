import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import {
  Star,
  Sparkles,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Minus,
  CheckCircle,
  AlertCircle,
  Send,
} from 'lucide-react';

interface Review {
  _id: string;
  agentId: string;
  userId: string;
  userName: string;
  rating: number;
  reviewText: string;
  sentimentScore: number;
  sentimentLabel: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  createdAt: string;
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  averageSentiment: number;
  positivePercentage: number;
  breakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

interface AgentReviewsSectionProps {
  agentId: string;
  agentName: string;
}

export const AgentReviewsSection: React.FC<AgentReviewsSectionProps> = ({
  agentId,
  agentName,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const res = await apiClient<{
          success: boolean;
          data: { reviews: Review[]; stats: ReviewStats };
        }>(`/reviews/${agentId}`);
        setReviews(res.data.reviews);
        setStats(res.data.stats);
      } catch (err) {
        console.error('Failed to load reviews:', err);
      } finally {
        setLoading(false);
      }
    };

    if (agentId) {
      fetchReviews();
    }
  }, [agentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    setError('');
    setSuccess(false);

    if (user?.id === agentId) {
      setError('Agents cannot review their own profile.');
      return;
    }

    if (reviewText.trim().length < 10) {
      setError('Please provide at least 10 characters in your review.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiClient<{
        success: boolean;
        message: string;
        data: { review: Review };
      }>(`/reviews/${agentId}`, {
        method: 'POST',
        data: { rating, reviewText },
      });

      // Add new review to list
      setReviews((prev) => [res.data.review, ...prev]);
      setSuccess(true);
      setReviewText('');
      setRating(5);

      // Refresh stats
      const statsRes = await apiClient<{
        success: boolean;
        data: { reviews: Review[]; stats: ReviewStats };
      }>(`/reviews/${agentId}`);
      setStats(statsRes.data.stats);
    } catch (err: any) {
      setError(err.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  const getSentimentPill = (label: string, score: number) => {
    if (label === 'POSITIVE') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <ThumbsUp className="w-3 h-3" />
          <span>Positive ({score > 0 ? `+${score}` : score})</span>
        </span>
      );
    }
    if (label === 'NEGATIVE') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <ThumbsDown className="w-3 h-3" />
          <span>Negative ({score})</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
        <Minus className="w-3 h-3" />
        <span>Neutral</span>
      </span>
    );
  };

  return (
    <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold tracking-wide uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>MongoDB & Sentiment Engine</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            Reviews & Ratings for {agentName}
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Verified client feedback with real-time NLP sentiment analysis
          </p>
        </div>

        {/* Aggregate Ratings & Sentiment Badge */}
        {stats && stats.totalReviews > 0 && (
          <div className="flex items-center space-x-4 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
            <div className="text-center">
              <div className="flex items-center justify-center text-amber-500">
                <Star className="w-5 h-5 fill-current" />
                <span className="text-xl font-black text-slate-900 ml-1.5">
                  {stats.averageRating}
                </span>
              </div>
              <p className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">
                {stats.totalReviews} Reviews
              </p>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-center">
              <p className="text-xl font-black text-emerald-600">
                {stats.positivePercentage}%
              </p>
              <p className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">
                Positive Sentiment
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-28 bg-slate-50 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
          <MessageSquare className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-sm font-bold text-slate-700">No client reviews yet</p>
          <p className="text-xs text-slate-500">Be the first client to leave feedback for {agentName}!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div
              key={rev._id}
              className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-2.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center">
                    {rev.userName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{rev.userName}</h4>
                    <p className="text-[11px] text-slate-400">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Stars */}
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= rev.rating ? 'fill-current' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Sentiment Pill */}
                  {getSentimentPill(rev.sentimentLabel, rev.sentimentScore)}
                </div>
              </div>

              <p className="text-sm text-slate-700 leading-relaxed pl-10">
                "{rev.reviewText}"
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Review Submission Form */}
      <div className="pt-6 border-t border-slate-100 space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          Leave a Review for {agentName}
        </h3>

        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Thank you! Your review and sentiment score have been published.</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isAuthenticated ? (
          <form onSubmit={handleSubmit} className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
            {/* Star Rating Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Rating
              </label>
              <div className="flex items-center space-x-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform focus:outline-none"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating ? 'fill-current text-amber-400' : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-slate-600 ml-2">
                  {rating} of 5 Stars
                </span>
              </div>
            </div>

            {/* Review text */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Feedback & Experience (min 10 characters)
              </label>
              <textarea
                required
                rows={3}
                placeholder="Share your experience working with this agent (e.g. responsiveness, negotiation, market knowledge)..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || reviewText.trim().length < 10}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center space-x-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Analyzing & Publishing...' : 'Submit Review'}</span>
            </button>
          </form>
        ) : (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs text-slate-600">
            Please{' '}
            <a href="/login" className="font-bold text-blue-600 hover:underline">
              sign in
            </a>{' '}
            to submit a verified agent review.
          </div>
        )}
      </div>
    </section>
  );
};
