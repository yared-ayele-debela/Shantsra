import React from 'react';
import { X, Phone, Handshake, MessageSquare, Star } from 'lucide-react';

export default function PackageDetailModal({ 
  item, 
  profile, 
  onClose, 
  onOfferToCarry 
}) {
  if (!item) return null;

  const isAccepted = item.status !== 'pending';
  const senderProfile = profile || {
    name: item.sender,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
    rating: '4.8'
  };

  const whatsappMessage = encodeURIComponent(
    `Hi ${item.sender}, I am interested in carrying your package request "${item.title}" on Souq & Sheba.`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-amber-100 flex flex-col max-h-[90vh]">
        {/* Header Hero Image */}
        <div className="relative h-48 bg-slate-100 shrink-0">
          <img 
            src={`https://images.unsplash.com/${item.img}?auto=format&fit=crop&w=600&q=80`} 
            alt={item.title}
            className="w-full h-full object-cover" 
          />
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#1C160F]/80 hover:bg-[#1C160F] text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <span className="absolute bottom-4 left-4 text-xs font-bold bg-amber-500 text-[#1C160F] px-2.5 py-1 rounded-full shadow-sm">
            {item.category}
          </span>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wide text-amber-600">
              {item.route === 'ADD_TO_DXB' ? 'Addis Ababa ➔ Dubai' : 'Dubai ➔ Addis Ababa'}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {item.weight} kg
            </span>
          </div>

          <h2 className="font-display font-extrabold text-xl text-[#1C160F]">
            {item.title}
          </h2>
          
          <p className="text-xs text-slate-600 leading-relaxed bg-[#FAF8F5] border border-amber-100/50 rounded-xl p-4">
            {item.desc}
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="border border-amber-50 rounded-xl p-3.5 bg-slate-50/50">
              <p className="text-[8px] font-bold text-slate-400 uppercase">Payout Reward</p>
              <p className="font-display font-extrabold text-amber-600 text-lg mt-0.5">
                {item.reward}
              </p>
            </div>
            <div className="border border-amber-50 rounded-xl p-3.5 bg-slate-50/50">
              <p className="text-[8px] font-bold text-slate-400 uppercase">Delivery Deadline</p>
              <p className="font-semibold text-slate-700 text-xs mt-1">
                {item.deadline}
              </p>
            </div>
          </div>

          <div className="border-t border-amber-50 pt-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={senderProfile.avatar} 
                alt={senderProfile.name}
                className="w-10 h-10 rounded-full object-cover border border-amber-100" 
              />
              <div>
                <p className="font-bold text-xs text-[#1C160F]">{senderProfile.name}</p>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Package Poster</p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center text-xs font-bold text-amber-600">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500 mr-0.5" /> 
                {senderProfile.rating}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-amber-50 bg-slate-50 flex items-center gap-3 shrink-0">
          <a 
            href={`https://wa.me/${item.phone}?text=${whatsappMessage}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-700 bg-white border border-amber-100 rounded-xl px-4 py-3 hover:bg-emerald-50 transition-colors" 
            title="WhatsApp Contact"
          >
            <Phone className="w-4 h-4" /> WhatsApp
          </a>
          
          {isAccepted ? (
            <button 
              onClick={() => onOfferToCarry(item)}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-[#1C160F] rounded-xl py-3 hover:bg-amber-500 hover:text-[#1C160F] transition-all shadow-sm"
            >
              <MessageSquare className="w-4 h-4" /> Open Chat in Workspace
            </button>
          ) : (
            <button 
              onClick={() => onOfferToCarry(item)}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-[#1C160F] rounded-xl py-3 hover:bg-amber-500 hover:text-[#1C160F] transition-all shadow-sm"
            >
              <Handshake className="w-4 h-4" /> Offer to Carry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
