import React, { useState } from 'react';
import { X, Phone, Handshake, MessageSquare, Star, Share2, Copy, Check } from 'lucide-react';
import { getStorageUrl } from '../lib/api';

// Social Media Icons (SVGs for clean platform branding)
const WhatsAppIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.105 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.572-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
  </svg>
);

const TelegramIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.562 8.161c-.18.717-.962 4.084-1.362 5.752-.169.706-.431.942-.683.966-.549.052-.966-.361-1.498-.71-.832-.546-1.301-.886-2.108-1.418-.933-.615-.328-.953.204-1.506.139-.145 2.551-2.338 2.598-2.538.006-.025.011-.119-.044-.168s-.136-.032-.195-.019c-.083.018-1.41.897-3.98 2.632-.376.258-.717.386-1.022.379-.338-.007-.988-.19-1.471-.347-.593-.193-1.064-.295-1.023-.623.021-.171.258-.347.711-.527 2.784-1.211 4.642-2.012 5.574-2.401 2.657-1.107 3.209-1.3 3.569-1.306.079-.001.256.018.371.112.097.079.124.186.136.262.011.077.026.251.015.39z"/>
  </svg>
);

const FacebookIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const XTwitterIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const LinkedInIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.77a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24z"/>
  </svg>
);

export default function PackageDetailModal({ 
  item, 
  onClose, 
  onOfferToCarry 
}) {
  const [copied, setCopied] = useState(false);

  if (!item) return null;

  const senderName = item.sender || 'Sender details unavailable';
  const senderAvatar = item.sender_avatar || null;
  const senderRating = Number(item.sender_rating);
  const hasSenderRating = Number.isFinite(senderRating) && Number(item.sender_review_count) > 0;
  const hasPhone = Boolean(item.phone && String(item.phone).trim());
  const routeText = item.route === 'ADD_TO_DXB' ? 'Addis Ababa to Dubai' : 'Dubai to Addis Ababa';
  
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://souqsheba.com';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  const packageShareUrl = `${origin}${pathname}?package=${encodeURIComponent(item.id)}`;

  const shareTitle = `Delivery Request: ${item.title} (${routeText}, Reward: ${item.reward})`;
  const shareText = `View this delivery request on Souq & Sheba: "${item.title}" (${routeText}). Delivery reward: ${item.reward}.`;
  
  const encodedUrl = encodeURIComponent(packageShareUrl);
  const encodedShareText = encodeURIComponent(shareText);

  const handleCopyLink = () => {
    const textToCopy = packageShareUrl;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = textToCopy;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-amber-100 flex flex-col max-h-[90vh]">
        {/* Header Hero Image */}
        <div className="relative h-48 bg-slate-100 shrink-0">
          <img 
            src={getStorageUrl(item.img) || '/assets/No-Image-Found-400x264.png'} 
            alt={item.title}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/assets/No-Image-Found-400x264.png';
            }}
            className="w-full h-full object-cover" 
          />
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#1C160F]/80 hover:bg-[#1C160F] text-white flex items-center justify-center transition-colors cursor-pointer"
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
              <p className="text-[8px] font-bold text-slate-400 uppercase">Delivery Reward</p>
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

          {/* Sender Profile */}
          <div className="border-t border-amber-50 pt-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {senderAvatar ? (
                <img 
                  src={getStorageUrl(senderAvatar)} 
                  alt={senderName}
                  onError={(event) => { event.currentTarget.style.display = 'none'; }}
                  className="w-10 h-10 rounded-full object-cover border border-amber-100" 
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 font-extrabold text-sm flex items-center justify-center border border-amber-200">
                  {senderName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-bold text-xs text-[#1C160F]">{senderName}</p>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Request Sender</p>
              </div>
            </div>
            {hasSenderRating && (
              <div className="text-right">
                <span className="inline-flex items-center text-xs font-bold text-amber-600">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 mr-0.5" /> 
                  {senderRating.toFixed(1)} ({item.sender_review_count})
                </span>
              </div>
            )}
          </div>

          {/* Social Media Sharing Section */}
          <div className="border-t border-amber-100/70 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-amber-500" /> Share Package Listing
              </span>
              {copied && (
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse border border-emerald-200">
                  <Check className="w-3 h-3" /> Link copied!
                </span>
              )}
            </div>

            {/* Social Sharing Buttons Bar */}
            <div className="bg-[#FAF8F5] border border-amber-100/60 rounded-xl p-3 space-y-2">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Share this delivery request:</p>
              <div className="flex items-center justify-between gap-1.5 pt-0.5">
                {/* WhatsApp Share */}
                <a
                  href={`https://api.whatsapp.com/send?text=${encodedShareText}%20${encodedUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg text-emerald-600 hover:bg-emerald-50 border border-emerald-100/50 transition-all hover:scale-105"
                  title="Share on WhatsApp"
                >
                  <WhatsAppIcon className="w-4 h-4 mb-1" />
                  <span className="text-[9px] font-semibold">WhatsApp</span>
                </a>

                {/* Telegram Share */}
                <a
                  href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedShareText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg text-sky-600 hover:bg-sky-50 border border-sky-100/50 transition-all hover:scale-105"
                  title="Share on Telegram"
                >
                  <TelegramIcon className="w-4 h-4 mb-1" />
                  <span className="text-[9px] font-semibold">Telegram</span>
                </a>

                {/* Facebook Share */}
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg text-blue-600 hover:bg-blue-50 border border-blue-100/50 transition-all hover:scale-105"
                  title="Share on Facebook"
                >
                  <FacebookIcon className="w-4 h-4 mb-1" />
                  <span className="text-[9px] font-semibold">Facebook</span>
                </a>

                {/* X / Twitter Share */}
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodedShareText}&url=${encodedUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg text-slate-800 hover:bg-slate-100 border border-slate-200/50 transition-all hover:scale-105"
                  title="Share on X (Twitter)"
                >
                  <XTwitterIcon className="w-4 h-4 mb-1" />
                  <span className="text-[9px] font-semibold">X / Twitter</span>
                </a>

                {/* LinkedIn Share */}
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg text-blue-700 hover:bg-blue-50 border border-blue-100/50 transition-all hover:scale-105"
                  title="Share on LinkedIn"
                >
                  <LinkedInIcon className="w-4 h-4 mb-1" />
                  <span className="text-[9px] font-semibold">LinkedIn</span>
                </a>

                {/* Copy Link Button */}
                <button
                  onClick={handleCopyLink}
                  className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg border transition-all hover:scale-105 cursor-pointer ${
                    copied 
                      ? 'bg-emerald-500 text-white border-emerald-500' 
                      : 'text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200/70'
                  }`}
                  title="Copy Package Link"
                >
                  {copied ? (
                    <Check className="w-4 h-4 mb-1 animate-bounce" />
                  ) : (
                    <Copy className="w-4 h-4 mb-1" />
                  )}
                  <span className="text-[9px] font-semibold">{copied ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-amber-50 bg-slate-50 flex items-center gap-3 shrink-0">
          <button 
            onClick={() => hasPhone && onOfferToCarry(item)}
            disabled={!hasPhone}
            className="w-full flex items-center justify-center gap-2 text-xs font-extrabold text-white bg-[#1C160F] rounded-xl py-3.5 hover:bg-amber-500 hover:text-[#1C160F] transition-all shadow-sm cursor-pointer disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
          >
            <Phone className="w-4 h-4 text-amber-400" /> {hasPhone ? 'Contact the sender' : 'Contact details unavailable'}
          </button>
        </div>
      </div>
    </div>
  );
}
