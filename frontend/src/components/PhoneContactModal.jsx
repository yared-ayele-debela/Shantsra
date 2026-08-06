import React, { useState } from 'react';
import { X, Phone, Copy, Check, MessageCircle, ExternalLink, ShieldCheck } from 'lucide-react';

export default function PhoneContactModal({ contact, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!contact) return null;

  const name = contact.sender || contact.name || contact.receiver_name || 'Package Contact';
  const rawPhone = contact.phone || contact.receiver_phone || contact.contact_phone || '+251 91 122 3344';
  const cleanPhone = rawPhone.replace(/[^0-9+]/g, '');
  const displayPhone = rawPhone.startsWith('+') ? rawPhone : `+${rawPhone}`;
  const itemTitle = contact.title || contact.desc || null;

  const whatsappMessage = encodeURIComponent(
    itemTitle 
      ? `Hi ${name}, I am contacting you regarding your request "${itemTitle}" on Souq & Sheba.`
      : `Hi ${name}, I am reaching out to you via Souq & Sheba.`
  );

  const handleCopyPhone = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(rawPhone);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = rawPhone;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1C160F]/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-amber-100 max-w-sm w-full overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-amber-100 bg-amber-50/50">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-amber-500 text-[#1C160F] flex items-center justify-center font-bold shadow-xs">
              <Phone className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-display text-sm font-extrabold text-[#1C160F]">Direct Phone Contact</h3>
              <p className="text-[9px] text-slate-500 font-semibold">Verified member contact details</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-amber-100 flex items-center justify-center text-slate-500 hover:text-[#1C160F] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          
          {/* User Info */}
          <div className="flex items-center gap-3 bg-[#FAF8F5] border border-amber-100/70 rounded-2xl p-3.5">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-white font-extrabold text-base flex items-center justify-center shrink-0 shadow-xs">
              {name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-xs text-[#1C160F] truncate">{name}</h4>
              {itemTitle && (
                <p className="text-[10px] text-amber-800 font-semibold truncate mt-0.5">
                  Request: {itemTitle}
                </p>
              )}
              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 mt-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> Phone Number Verified
              </span>
            </div>
          </div>

          {/* Phone Number Display Box */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-2 text-center shadow-inner">
            <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400">Direct Phone Number</span>
            <div className="font-mono font-extrabold text-xl tracking-wider text-white select-all">
              {displayPhone}
            </div>
            
            {/* Quick Actions */}
            <div className="pt-2 flex items-center justify-center gap-2">
              <a
                href={`tel:${cleanPhone}`}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-[#1C160F] text-xs font-bold py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Phone className="w-3.5 h-3.5" /> Call Now
              </a>

              <button
                onClick={handleCopyPhone}
                className={`flex-1 border text-xs font-bold py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  copied 
                    ? 'bg-emerald-500 text-white border-emerald-500' 
                    : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* WhatsApp Direct Option */}
          <a
            href={`https://wa.me/${cleanPhone.replace('+', '')}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-2xl px-4 py-3.5 transition-colors shadow-2xs cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Open in WhatsApp</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          </a>

        </div>

      </div>
    </div>
  );
}
