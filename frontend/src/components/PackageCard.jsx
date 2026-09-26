import React from 'react';
import { Weight, Phone, Star, Zap } from 'lucide-react';
import { getStorageUrl } from '../lib/api';

export default function PackageCard({ 
  item, 
  profile, 
  onSelectPackage, 
  onSelectProfile, 
  onOfferToCarry 
}) {
  const isUrgent = Boolean(item.is_urgent);
  const isAccepted = item.status !== 'pending';
  const statusText = item.status === 'accepted' ? 'Matched Traveler' 
                   : item.status === 'in-transit' ? 'In Transit'
                   : item.status === 'delivered' ? 'Delivered' 
                   : 'Waiting for Traveler';

  let statusBadgeClass = 'bg-amber-100 text-amber-900';
  if (item.status === 'accepted') statusBadgeClass = 'bg-emerald-100 text-emerald-800';
  if (item.status === 'in-transit') statusBadgeClass = 'bg-amber-100 text-amber-800';
  if (item.status === 'delivered') statusBadgeClass = 'bg-slate-200 text-slate-700';

  const senderProfile = profile || {
    name: item.sender,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
    rating: '4.8'
  };

  const whatsappMessage = encodeURIComponent(
    `Hi ${item.sender}, I am interested in carrying your package request "${item.title}" on Souq & Sheba.`
  );

  return (
    <div className="group rounded-2xl transition-all flex flex-col overflow-hidden bg-white border border-amber-100 shadow-[0_1px_3px_rgba(28,22,15,0.04),0_10px_30px_-15px_rgba(28,22,15,0.08)] hover:shadow-[0_10px_20px_-8px_rgba(28,22,15,0.08),0_24px_48px_-12px_rgba(198,149,42,0.22)]">
      
      {/* Clickable Card Body */}
      <div 
        onClick={() => onSelectPackage(item)} 
        className="cursor-pointer flex flex-col flex-1"
      >
        <div className="relative h-28 sm:h-36 overflow-hidden shrink-0">
          <img 
            src={getStorageUrl(item.img) || '/assets/No-Image-Found-400x264.png'} 
            alt={item.title} 
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/assets/No-Image-Found-400x264.png';
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
          <span className={`absolute top-2 left-2 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider ${statusBadgeClass} px-1.5 sm:px-2 py-0.5 rounded-full shadow-xs`}>
            {statusText}
          </span>
          
          {isUrgent && (
            <span className="absolute top-2 right-2 text-[8px] sm:text-[9px] font-extrabold uppercase tracking-wider bg-red-600 text-white px-2 py-0.5 sm:py-1 rounded-full shadow-md flex items-center gap-1">
              <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-yellow-300 text-yellow-300" /> URGENT
            </span>
          )}

          <span className="absolute bottom-2 right-2 text-[9px] sm:text-[10px] font-bold bg-white/90 backdrop-blur text-[#1C160F] px-1.5 sm:px-2 py-0.5 rounded flex items-center gap-1 shadow-xs">
            <Weight className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-500" /> {item.weight} kg
          </span>
        </div>

        <div className="p-3 sm:p-4 pb-0 flex flex-col flex-1">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-[10px] sm:text-xs font-bold flex items-center gap-1 text-[#1C160F]">
              {item.route === 'ADD_TO_DXB' ? 'ADD ➔ DXB' : 'DXB ➔ ADD'}
            </span>
          </div>

          <h3 className="text-xs sm:text-sm font-bold text-[#1C160F] leading-snug truncate" title={item.title}>
            {item.title}
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 line-clamp-2 leading-relaxed flex-1">
            {item.desc}
          </p>

          <div className="border-t border-amber-50 pt-2 sm:pt-3 mt-2 sm:mt-3 flex flex-col justify-between">
            <p className="text-[8px] sm:text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Reward Offered</p>
            <p className="font-display font-extrabold text-sm sm:text-base leading-tight text-amber-600">
              {item.reward}
            </p>
          </div>
        </div>
      </div>

      {/* Non-clickable Action Bar */}
      <div className="p-3 sm:p-4 pt-0">
        <div className="pt-2 flex items-center justify-between gap-1.5 sm:gap-3">
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 w-full">
            <button 
              onClick={() => onOfferToCarry(item)}
              className={`w-full text-center rounded-xl py-2 text-[10px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                isUrgent 
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-xs' 
                  : 'bg-[#1C160F] hover:bg-amber-500 hover:text-[#1C160F] text-white shadow-xs'
              }`}
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span className="truncate">Contact Poster (Show Phone)</span>
            </button>
          </div>
        </div>

        {/* Profile Info Clickable */}
        <div 
          onClick={() => onSelectProfile(senderProfile.name)} 
          className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-amber-50/50 cursor-pointer group/prof"
        >
          {senderProfile.photo || senderProfile.photo_url || (senderProfile.avatar && !senderProfile.avatar.includes('unsplash.com') && (senderProfile.avatar.startsWith('http') || senderProfile.avatar.startsWith('/storage') || senderProfile.avatar.startsWith('storage/'))) ? (
            <img 
              src={getStorageUrl(senderProfile.photo || senderProfile.photo_url || senderProfile.avatar)} 
              alt={senderProfile.name}
              className="w-5 h-5 rounded-full object-cover shrink-0" 
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-amber-500 text-white font-extrabold text-[9px] flex items-center justify-center shrink-0">
              {senderProfile.name ? senderProfile.name.trim().charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          <div className="text-[10px] font-semibold text-slate-500 flex items-center gap-1 group-hover/prof:text-amber-600 transition-colors">
            <span>By {senderProfile.name}</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            <span className="flex items-center text-amber-600 font-bold">
              <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500 mr-0.5" /> 
              {senderProfile.rating}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
