import React from 'react';
import { Weight, Phone, Star } from 'lucide-react';
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
    avatar: item.sender_avatar || '/assets/No-Image-Found-400x264.png',
    rating: item.sender_rating || '4.8'
  };

  const whatsappMessage = encodeURIComponent(
    `Hi ${item.sender}, I am interested in carrying your package request "${item.title}" on Shantasra.`
  );

  return (
    <article className="group min-w-0 rounded-[14px] transition-all flex flex-col overflow-hidden bg-white border border-[#D2DDD8] shadow-[0_4px_18px_rgba(13,51,38,0.06)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(13,51,38,0.12)]">
      
      {/* Clickable Card Body */}
      <div 
        onClick={() => onSelectPackage(item)} 
        className="cursor-pointer flex flex-col flex-1"
      >
        <div className="relative h-20 sm:h-28 overflow-hidden shrink-0">
          <img 
            src={getStorageUrl(item.img) || '/assets/No-Image-Found-400x264.png'} 
            alt={item.title} 
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/assets/No-Image-Found-400x264.png';
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
          <span className={`absolute top-1.5 left-1.5 sm:top-2 sm:left-2 max-w-[calc(100%-3rem)] truncate text-[7px] sm:text-[9px] font-bold uppercase tracking-wider ${statusBadgeClass} px-1.5 sm:px-2 py-0.5 rounded-full shadow-xs`}>
            {statusText}
          </span>
          
          {isUrgent && (
            <span
              className="absolute top-1.5 right-1.5 inline-flex items-center gap-1 rounded-full bg-white/90 px-1.5 py-0.5 text-[7px] font-extrabold uppercase tracking-wider text-red-700 shadow-sm backdrop-blur sm:top-2 sm:right-2 sm:text-[9px]"
              title="Urgent delivery"
              aria-label="Urgent delivery"
            >
              <span className="relative inline-flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-600 ring-1 ring-white" />
              </span>
              Urgent
            </span>
          )}

          <span className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 text-[8px] sm:text-[10px] font-bold bg-white/90 backdrop-blur text-[#0D3326] px-1.5 sm:px-2 py-0.5 rounded flex items-center gap-1 shadow-xs">
            <Weight className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-500" /> {item.weight} kg
          </span>
        </div>

        <div className="p-2.5 sm:p-3.5 pb-0 flex flex-col flex-1">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-[9px] sm:text-xs font-semibold tracking-wide flex items-center gap-1 text-[#0D3326]">
              {item.route === 'ADD_TO_DXB' ? 'ADD ➔ DXB' : 'DXB ➔ ADD'}
            </span>
          </div>

          <h3 className="text-xs sm:text-base font-semibold text-[#0D3326] leading-snug line-clamp-2" title={item.title}>
            {item.title}
          </h3>
          <p className="text-[10px] sm:text-xs text-[#647B72] mt-1 line-clamp-2 leading-snug flex-1">
            {item.desc}
          </p>

          <div className="border-t border-[#D2DDD8] pt-2 sm:pt-3 mt-3 sm:mt-4 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[8px] sm:text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Price</p>
              <p className="font-display font-semibold text-sm sm:text-lg leading-tight text-[#0D3326]">
              {item.reward}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Non-clickable Action Bar */}
      <div className="p-2.5 sm:p-3.5 pt-2 sm:pt-2.5">
        <div className="flex items-center justify-between gap-1.5 sm:gap-3 border-t border-[#D2DDD8] pt-2 sm:pt-3">
          {/* Profile Info Clickable */}
          <div
            onClick={() => onSelectProfile(senderProfile.name)}
            className="flex min-w-0 items-center gap-1.5 sm:gap-2 cursor-pointer group/prof"
          >
            <img
              src={getStorageUrl(senderProfile.photo || senderProfile.photo_url || item.sender_avatar || senderProfile.avatar) || '/assets/No-Image-Found-400x264.png'}
              alt={senderProfile.name}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/assets/No-Image-Found-400x264.png';
              }}
              className="w-4 h-4 sm:w-5 sm:h-5 rounded-full object-cover shrink-0"
            />
            <div className="min-w-0 text-[9px] sm:text-[11px] font-semibold text-slate-600 flex items-center gap-1 group-hover/prof:text-amber-600 transition-colors">
              <span className="truncate">Posted by {senderProfile.name}</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <span className="flex shrink-0 items-center text-amber-600 font-bold">
                <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500 mr-0.5" />
                {senderProfile.rating}
              </span>
            </div>
          </div>

          <button
            onClick={() => onOfferToCarry(item)}
            aria-label="Contact poster and show phone"
            title="Contact the sender"
            className="shrink-0 rounded-lg bg-[#0D3326] p-1.5 sm:rounded-[10px] sm:px-3 sm:py-2 text-[10px] sm:text-xs font-semibold text-white transition-colors hover:bg-[#144937] flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Phone className="h-3.5 w-3.5 text-white" aria-hidden="true" />
            <span className="hidden sm:inline">Contact</span>
          </button>
        </div>
      </div>
    </article>
  );
}
