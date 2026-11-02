'use client';

import React, { useState } from 'react';
import { IReview } from '@bizpockethub/shared';
import { Star, MessageSquarePlus, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '@/lib/authContext';
import { fetchApi } from '@/lib/api';
import Link from 'next/link';

interface ReviewSectionProps {
  businessId: string;
  initialReviews: IReview[];
  ratingAverage: number;
  reviewCount: number;
}

function formatReviewDate(dateStr: string | Date | undefined): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

export function ReviewSection({
  businessId,
  initialReviews,
  ratingAverage,
  reviewCount,
}: ReviewSectionProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<IReview[]>(initialReviews);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [guestName, setGuestName] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (title.trim().length < 3) {
      setErrorMsg('Please provide a descriptive review headline (at least 3 characters).');
      return;
    }

    if (content.trim().length < 15) {
      setErrorMsg('Review details must be at least 15 characters.');
      return;
    }

    setLoading(true);
    const payload: { rating: number; title: string; content: string; authorName?: string } = {
      rating,
      title: title.trim(),
      content: content.trim(),
    };

    if (user?.name) {
      payload.authorName = user.name;
    } else if (guestName.trim()) {
      payload.authorName = guestName.trim();
    }

    const res = await fetchApi(`/businesses/${businessId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setLoading(false);

    if (res.success && res.data) {
      setSuccessMsg('Your review has been successfully submitted and published! Thank you for your feedback.');
      setReviews([res.data, ...reviews]);
      setTitle('');
      setContent('');
      setGuestName('');
    } else {
      setErrorMsg(res.message || 'Unable to submit review. Please try again.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Rating Summary Header */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            {ratingAverage > 0 ? ratingAverage.toFixed(1) : '—'}
          </div>
          <div>
            <div className="flex items-center text-amber-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(ratingAverage)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Based on {reviewCount} authentic {reviewCount === 1 ? 'review' : 'reviews'}
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-500 text-center sm:text-right max-w-xs">
          Open to all real customers. All reviews are checked for authenticity and quality guidelines.
        </div>
      </div>

      {/* Review Submission Form - Always accessible without requiring login */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MessageSquarePlus className="w-5 h-5 text-teal-600" />
              Write a Customer Review
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Anyone can rate and share their authentic experience. No account required.
            </p>
          </div>

          {user ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Logged in as {user.name}
            </div>
          ) : (
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <span>Posting as Guest.</span>
              <Link href="/login" className="text-teal-600 hover:text-teal-700 font-semibold underline">
                Sign In
              </Link>
              <span>to link to your profile</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmitReview} className="space-y-4">
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              {errorMsg}
            </div>
          )}

          {/* Star Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Overall Rating
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 focus:outline-none transition-transform hover:scale-110"
                  aria-label={`Rate ${star} stars`}
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= (hoverRating || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-semibold text-slate-700 ml-2">
                {rating} of 5 Stars
              </span>
            </div>
          </div>

          {/* Guest Display Name (if not logged in) */}
          {!user && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Name / Display Name <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="e.g. Sarah J. or leave blank to review as 'Customer'"
                maxLength={80}
                className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          )}

          {/* Headline */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Review Headline <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience (e.g. Prompt delivery, high build quality)"
              maxLength={100}
              required
              className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Your Review Details <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              required
              placeholder="Describe your collaboration, communication quality, pricing transparency, and service reliability..."
              className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <Button type="submit" variant="primary" size="md" loading={loading}>
              Post Review
            </Button>
            <span className="text-[11px] text-slate-400">
              No account or registration required
            </span>
          </div>
        </form>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">
          Published Customer Feedback ({reviews.length})
        </h4>

        {reviews.length === 0 ? (
          <div className="text-center py-10 bg-white border border-slate-200 rounded-xl text-slate-500 text-sm">
            No published reviews yet. Be the first to share your experience with this company!
          </div>
        ) : (
          reviews.map((rev) => {
            const reviewerName =
              rev.authorName ||
              (typeof rev.userId === 'object' && rev.userId !== null && (rev.userId as any).name) ||
              'Customer';
            const isRegistered = Boolean(rev.userId);

            return (
              <div
                key={rev._id}
                className="bg-white border border-slate-200 rounded-xl p-5 space-y-2 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold text-slate-800 ml-1.5">{rev.rating}/5</span>
                  </div>
                  <span suppressHydrationWarning className="text-xs text-slate-400">
                    {formatReviewDate(rev.createdAt)}
                  </span>
                </div>

                <h5 className="text-sm font-bold text-slate-900">{rev.title}</h5>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{rev.content}</p>

                <div className="text-[11px] text-slate-500 pt-1 font-medium flex items-center gap-2">
                  <span>Review by <strong className="text-slate-700">{reviewerName}</strong></span>
                  {isRegistered ? (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Verified Member
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                      Guest Reviewer
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
