import React, { useState } from 'react';
import { Bell as BellIcon, X as XIcon, MapPin as MapPinIcon, Calendar as CalendarIcon, Mail as MailIcon, CheckCircle2 as CheckIcon } from 'lucide-react';
import { getApiUrl } from '../lib/api';

export default function PackageAlertsModal({ isOpen, onClose, initialFrom = 'Addis Ababa', initialTo = 'Dubai', onAlertCreated }) {
  const [fromCity, setFromCity] = useState(initialFrom);
  const [toCity, setToCity] = useState(initialTo);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [emailNotify, setEmailNotify] = useState(true);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await fetch(getApiUrl('/api/package-alerts'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          from_city: fromCity,
          to_city: toCity,
          start_date: startDate || null,
          end_date: endDate || null,
          email_notify: emailNotify,
        })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg(`Route alert created! You will get an email when a package from ${fromCity} to ${toCity} is posted.`);
        if (onAlertCreated) {
          onAlertCreated(data.alert);
        }
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setErrorMsg(data.message || 'We could not create the alert. Please try again.');
      }
    } catch (err) {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-amber-100 relative animate-in fade-in zoom-in duration-200">
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
        >
          <XIcon className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
            <BellIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-extrabold text-xl text-[#1C160F]">Set Package Route Alert</h3>
            <p className="text-xs text-slate-500">Get instant email notifications when packages match your route & date range.</p>
          </div>
        </div>

        {successMsg && (
          <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-start gap-2">
            <CheckIcon className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <MapPinIcon className="w-3.5 h-3.5 text-amber-600" /> From City
              </label>
              <input 
                type="text" 
                required
                value={fromCity}
                onChange={(e) => setFromCity(e.target.value)}
                placeholder="e.g. Addis Ababa"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl text-xs text-slate-800 font-medium focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <MapPinIcon className="w-3.5 h-3.5 text-emerald-600" /> To City
              </label>
              <input 
                type="text" 
                required
                value={toCity}
                onChange={(e) => setToCity(e.target.value)}
                placeholder="e.g. Dubai"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl text-xs text-slate-800 font-medium focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5 text-slate-400" /> Start date (optional)
              </label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5 text-slate-400" /> End date (optional)
              </label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-hidden"
              />
            </div>
          </div>

          <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <MailIcon className="w-4 h-4 text-amber-600" />
              <div>
                <p className="text-xs font-bold text-[#1C160F]">Email Instant Notification</p>
                <p className="text-[10px] text-slate-500">Send an email alert as soon as a package is posted.</p>
              </div>
            </div>
            <input 
              type="checkbox"
              checked={emailNotify}
              onChange={(e) => setEmailNotify(e.target.checked)}
              className="w-4 h-4 accent-amber-600 cursor-pointer rounded"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 bg-[#1C160F] hover:bg-amber-600 hover:text-[#1C160F] text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? 'Saving Alert...' : 'Create Route Alert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
