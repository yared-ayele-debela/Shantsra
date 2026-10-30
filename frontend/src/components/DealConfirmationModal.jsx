import React, { useState } from 'react';
import { X, Handshake, Check, AlertCircle, DollarSign, FileText, Sparkles } from 'lucide-react';
import api from '../lib/api';

export default function DealConfirmationModal({ item, partner, onClose, onSuccess }) {
  const [agreedPrice, setAgreedPrice] = useState(item?.price || '');
  const [status, setStatus] = useState('deal_made');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  if (!item) return null;

  const shipmentId = item.id || item.shipment_id;
  const partnerName = partner?.name || partner?.sender || item?.receiver_name || 'Member';
  const itemTitle = item.title || item.receiver_name || `${item.from_city} to ${item.to_city}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const response = await api.post('/api/deals/confirm', {
        shipment_id: shipmentId,
        partner_id: partner?.id || null,
        travel_id: item?.travel_id || null,
        agreed_price: agreedPrice ? parseFloat(agreedPrice) : null,
        status: status,
        notes: notes || null,
      });

      setSuccessMsg(response.data.message || 'Your delivery agreement was saved.');
      setTimeout(() => {
        if (onSuccess) onSuccess(response.data.deal);
        if (onClose) onClose();
      }, 1500);
    } catch (err) {
      console.error('Deal confirmation error:', err);
      setError(err.response?.data?.message || 'We could not save the agreement. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1C160F]/65 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-amber-100 max-w-md w-full overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-amber-100 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-2xl bg-amber-500 text-[#1C160F] flex items-center justify-center font-bold shadow-xs">
              <Handshake className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-display text-base font-extrabold text-[#1C160F]">Confirm delivery agreement</h3>
              <p className="text-[10px] text-slate-500 font-semibold">Record what you agreed after speaking with the sender</p>
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
              <span>Package</span>
              <span>{item.from_city} ➔ {item.to_city}</span>
            </div>
            <h4 className="font-bold text-xs text-[#1C160F] truncate">{itemTitle}</h4>
            <p className="text-[11px] text-slate-600 font-medium">Partner: <span className="font-semibold text-[#1C160F]">{partnerName}</span></p>
          </div>

          {/* Deal Outcome Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#1C160F]">
              Did you agree on the delivery with {partnerName}?
            </label>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setStatus('deal_made')}
                className={`py-3 px-3.5 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  status === 'deal_made'
                    ? 'bg-amber-500 text-[#1C160F] border-amber-500 shadow-sm ring-2 ring-amber-400/30'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>Yes, we agreed</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('no_deal')}
                className={`py-3 px-3.5 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  status === 'no_deal'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <X className="w-4 h-4" />
                <span>Not yet</span>
              </button>
            </div>
          </div>

          {/* Inputs for Deal Made */}
          {status === 'deal_made' && (
            <div className="space-y-3 pt-1 animate-in fade-in duration-150">
              {/* Price Offer */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Agreed price or fee ($ USD) <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 35.00"
                    value={agreedPrice}
                    onChange={(e) => setAgreedPrice(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-xs font-semibold rounded-2xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Notes or meeting place <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3.5 pointer-events-none text-slate-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <textarea
                    rows="2"
                    placeholder="e.g. Pickup at Dubai Mall on Friday 10 AM"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-xs font-medium rounded-2xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  ></textarea>
                </div>
              </div>
            </div>
          )}

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
              className="flex-1 py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-[#1C160F] text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-[#1C160F] border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Save agreement</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
