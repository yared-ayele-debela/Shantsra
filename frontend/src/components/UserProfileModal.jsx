import React from 'react';
import { X, Phone, FileCheck2, Plane, CheckCircle2, XCircle, Star } from 'lucide-react';

export default function UserProfileModal({ profile, onClose }) {
  if (!profile) return null;

  const rawPhoto = profile.photo || profile.photo_url || null;
  const hasPhoto = Boolean(
    rawPhoto && 
    typeof rawPhoto === 'string' && 
    rawPhoto.trim().length > 0 && 
    !rawPhoto.toLowerCase().includes('unsplash.com')
  );

  let photoSrc = '';
  if (hasPhoto) {
    photoSrc = rawPhoto.trim();
    if (!photoSrc.startsWith('http://') && !photoSrc.startsWith('https://') && !photoSrc.startsWith('/') && !photoSrc.startsWith('data:')) {
      photoSrc = `/storage/${photoSrc}`;
    }
  }

  const verifications = [
    { key: 'phone', label: 'Mobile Number Verified', icon: Phone },
    { key: 'id', label: 'Passport ID Document Confirmed', icon: FileCheck2 },
    { key: 'flight', label: 'Boarding Pass/Itinerary Checked', icon: Plane }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#1C160F]/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-amber-100 max-w-lg w-full max-h-[85vh] overflow-y-auto flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-100 shrink-0">
          <h3 className="font-display text-base font-bold text-[#1C160F]">Member Profile</h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-amber-50 flex items-center justify-center text-slate-500 hover:text-[#1C160F] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Profile Header */}
          <div className="flex items-center gap-4">
            {hasPhoto ? (
              <img 
                src={photoSrc} 
                alt={profile.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-amber-200 shadow-sm shrink-0" 
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-emerald-800 text-white font-extrabold text-xl flex items-center justify-center border-2 border-amber-200 shadow-sm shrink-0">
                {profile.name ? profile.name.trim().charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <div>
              <h4 className="font-display text-base font-bold text-[#1C160F]">{profile.name}</h4>
              <div className="flex items-center gap-1.5 text-xs font-semibold mt-1">
                <span className="flex items-center text-amber-600 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 mr-0.5" /> 
                  {profile.rating || '5.0'}
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-slate-500">{profile.deliveriesCount || 5} successful deliveries</span>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-1">
            <h5 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">About</h5>
            <p className="text-xs text-slate-500 leading-relaxed">{profile.bio || 'No bio provided.'}</p>
          </div>

          {/* Travel Schedule */}
          <div className="space-y-1.5">
            <h5 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Travel Schedule</h5>
            {profile.upcomingTrip ? (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <p className="text-[9px] font-bold text-amber-800 uppercase tracking-wider mb-2">Upcoming travel itinerary</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#1C160F]">{profile.upcomingTrip.route}</p>
                    <p className="text-[10px] text-slate-500">{profile.upcomingTrip.flight}</p>
                  </div>
                  <span className="text-xs font-semibold text-amber-600 bg-white border border-amber-200 px-2.5 py-1 rounded-lg">
                    {profile.upcomingTrip.date}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic bg-slate-50/50 rounded-xl p-3 border border-slate-100 text-center">
                No upcoming verified flight trips scheduled.
              </p>
            )}
          </div>

          {/* Verifications */}
          <div className="space-y-2">
            <h5 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Verification Status</h5>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {verifications.map(b => {
                const IconComponent = b.icon;
                const hasBadge = profile.verifications && profile.verifications[b.key];
                return (
                  <div 
                    key={b.key} 
                    className={`flex items-center justify-between border rounded-xl p-2 text-[11px] font-semibold ${
                      hasBadge ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-slate-300 border-slate-100 opacity-50'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <IconComponent className="w-3.5 h-3.5" /> {b.label}
                    </span>
                    {hasBadge ? (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-700" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 shrink-0 text-slate-300" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Community Feedback */}
          <div className="space-y-2">
            <h5 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Member Reviews</h5>
            <div className="space-y-2">
              {profile.reviews && profile.reviews.length > 0 ? (
                profile.reviews.map((r, idx) => (
                  <div key={idx} className="border border-amber-50 bg-amber-50/20 rounded-xl p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1C160F]">{r.reviewer}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">{r.date}</span>
                    </div>
                    <div className="flex items-center text-amber-500 mb-1">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed italic">"{r.comment}"</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic text-center py-4">No member reviews have been received yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
