import React, { useState } from 'react';
import { X, Star, Check, AlertCircle, Sparkles, MessageSquare } from 'lucide-react';
import api from '../lib/api';

export default function ReviewModal({ item, partner, onClose, onSuccess }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  if (!item) return null;

  const shipmentId = item.id || item.shipment_id;
  const partnerName = partner?.name || partner?.sender || item?.receiver_name || 'Member';
  const itemTitle = item.title || item.receiver_name || `${item.from_city} to ${item.to_city}`;

  const ratingLabels = {
    1: 'Poor Experience',
    2: 'Below Expectation',
    3: 'Good / Satisfactory',
    4: 'Very Good Deal',
    5: '⭐ Excellent Deal & Communication!'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const response = await api.post('/api/reviews', {
        shipment_id: shipmentId,
        reviewed_user_id: partner?.id || null,
        rating: rating,
        comment: comment || null,
      });

      setSuccessMsg(response.data.message || 'Thank you! Review submitted successfully.');
      setTimeout(() => {
        if (onSuccess) onSuccess(response.data.review);
        if (onClose) onClose();
      }, 1500);
    } catch (err) {
      console.error('Review submission error:', err);
      setError(err.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentActiveRating = hoverRating || rating;

  return (
    <div className="fixed inset-0 z-50 bg-[#1C160F]/65 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-amber-100 max-w-md w-full overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-amber-100 bg-amber-50/50">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-2xl bg-amber-500 text-[#1C160F] flex items-center justify-center font-bold shadow-xs">
              <Star className="w-5 h-5 fill-[#1C160F]" />
            </span>
            <div>
              <h3 className="font-display text-base font-extrabold text-[#1C160F]">Package Deal Review</h3>
              <p className="text-[10px] text-slate-500 font-semibold">Leave feedback for your confirmed deal</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-amber-100 flex items-center justify-center text-slate-500 hover:text-[#1C160F] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Context Item Summary */}
          <div className="bg-[#FAF8F5] border border-amber-100/80 rounded-2xl p-3.5 space-y-1">
            <div className="flex justify-between items-center text-[10px] uppercase tracking-wider font-extrabold text-amber-800">
              <span>Confirmed Package Deal</span>
              <span>{item.from_city || 'Addis'} ➔ {item.to_city || 'Dubai'}</span>
            </div>
            <h4 className="font-bold text-xs text-[#1C160F] truncate">{itemTitle}</h4>
            <p className="text-[11px] text-slate-600 font-medium">Reviewing deal with: <span className="font-bold text-[#1C160F]">{partnerName}</span></p>
          </div>

          {/* Star Rating Control */}
          <div className="space-y-2 text-center bg-amber-50/40 border border-amber-100/60 rounded-2xl p-4">
            <label className="block text-xs font-bold text-[#1C160F]">
              How was your experience dealing with {partnerName}?
            </label>

            <div className="flex items-center justify-center gap-2 py-1">
              {[1, 2, 3, 4, 5].map((starVal) => (
                <button
                  key={starVal}
                  type="button"
                  onClick={() => setRating(starVal)}
                  onMouseEnter={() => setHoverRating(starVal)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                >
                  <Star 
                    className={`w-7 h-7 transition-colors ${
                      starVal <= currentActiveRating
                        ? 'fill-amber-400 text-amber-500 drop-shadow-xs'
                        : 'fill-slate-100 text-slate-300'
                    }`} 
                  />
                </button>
              ))}
            </div>

            <p className="text-xs font-bold text-amber-900 h-4">
              {ratingLabels[currentActiveRating] || ''}
            </p>
          </div>

          {/* Review Comment */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Review Comment <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3.5 pointer-events-none text-slate-400">
                <MessageSquare className="w-4 h-4" />
              </div>
              <textarea
                rows="3"
                placeholder="Share your experience (e.g. Great communication, prompt response and trustworthy partner!)..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-xs font-medium rounded-2xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              ></textarea>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-[#1C160F] text-xs font-extrabold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-[#1C160F] border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Submit Review</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
