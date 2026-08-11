import React, { useState } from 'react';
import { X, Phone, Copy, Check, MessageCircle, ExternalLink, ShieldCheck, Handshake } from 'lucide-react';
import DealConfirmationModal from './DealConfirmationModal';

export default function PhoneContactModal({ contact, onClose }) {
  const [copied, setCopied] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  if (!contact) return null;

  const name = contact.sender || contact.name || contact.receiver_name || 'Package Contact';
  const rawPhone = contact.phone || contact.receiver_phone || contact.contact_phone || '+251 91 122 3344';
  const cleanPhone = rawPhone.replace(/[^0-9+]/g, '');
  const displayPhone = rawPhone.startsWith('+') ? rawPhone : `+${rawPhone}`;
  const itemTitle = contact.title || contact.desc || null;

  const whatsappMessage = encodeURIComponent(
    itemTitle 
      ? `Hi ${name}, I am contacting you regarding your request "${itemTitle}" on PeerBridge.`
      : `Hi ${name}, I am reaching out to you via PeerBridge.`
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
    <>
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
            
            {/* User Info & Direct Phone Card */}
            <div className="bg-[#FAF8F5] border border-amber-100/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-500 text-[#1C160F] font-extrabold text-lg flex items-center justify-center shrink-0 shadow-xs">
                  {name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-sm text-[#1C160F] truncate">{name}</h4>
                  {itemTitle && (
                    <p className="text-[11px] text-slate-500 font-semibold truncate mt-0.5">
                      Request: <span className="text-amber-900 font-bold">{itemTitle}</span>
                    </p>
                  )}
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Phone Number Verified
                  </span>
                </div>
              </div>

              {/* Phone Number Display */}
              <div className="bg-white border border-amber-200/80 rounded-xl p-3 text-center space-y-1.5 shadow-2xs">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Direct Phone Number</span>
                <div className="font-mono font-extrabold text-xl tracking-wider text-[#1C160F] select-all">
                  {displayPhone}
                </div>
              </div>

              {/* Primary Call & Copy Actions */}
              <div className="flex items-center gap-2 pt-0.5">
                <a
                  href={`tel:${cleanPhone}`}
                  className="flex-1 bg-[#1C160F] hover:bg-amber-500 hover:text-[#1C160F] text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-400" /> Call Now
                </a>

                <button
                  onClick={handleCopyPhone}
                  className={`flex-1 border text-xs font-bold py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    copied 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                      : 'bg-white hover:bg-amber-50/60 text-slate-700 border-amber-200/80'
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* WhatsApp Direct Option */}
            <a
              href={`https://wa.me/${cleanPhone.replace('+', '')}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between gap-2 text-xs font-bold text-emerald-900 bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-200/80 rounded-2xl px-4 py-3 transition-colors shadow-2xs cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Open in WhatsApp</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            </a>

            {/* Deal Confirmation Action Button */}
            <div className="pt-1">
              <button
                onClick={() => setShowConfirmModal(true)}
                className="w-full py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-[#1C160F] text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Handshake className="w-4 h-4 text-[#1C160F]" />
                <span>Did you make a deal? Confirm Deal</span>
              </button>
            </div>

          </div>

        </div>
      </div>

      {showConfirmModal && (
        <DealConfirmationModal
          item={contact}
          partner={{ name, phone: rawPhone, id: contact.user_id || contact.partner_id }}
          onClose={() => setShowConfirmModal(false)}
          onSuccess={() => {
            setShowConfirmModal(false);
            if (onClose) onClose();
          }}
        />
      )}
    </>
  );
}
