import React, { useState } from 'react';
import { PlaneTakeoff, Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import { useSiteSettings, SITE_LOGO_STORAGE_KEY, SITE_NAME_STORAGE_KEY } from '../context/SiteSettingsContext.jsx';

export default function Footer({ 
  setCurrentView, 
  onOpenPostModal, 
  showToast 
}) {
  const { settings } = useSiteSettings();
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const logoUrl = settings?.logo_url || sessionStorage.getItem(SITE_LOGO_STORAGE_KEY);
  const siteName = settings?.site_name || sessionStorage.getItem(SITE_NAME_STORAGE_KEY) || 'Souq & Sheba';
  const siteDescription = settings?.site_description || 'A trusted delivery platform connecting package senders with verified travelers between Ethiopia and the UAE.';
  const contactEmail = settings?.contact_email || settings?.email || 'support@souqsheba.com';
  const contactPhone = settings?.contact_phone || settings?.phone || '+251 91 122 3344';
  const address = settings?.address || 'Addis Ababa & Dubai';

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) {
      if (showToast) showToast('Please enter a valid email address.');
      return;
    }
    setSubscribed(true);
    if (showToast) showToast(`Subscribed to ${siteName} updates!`);
    setEmailInput('');
  };

  return (
    <footer className="bg-[#0F3F22] text-slate-200 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
        
        {/* Brand Column with Real Logo, Name & Contact from Settings */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt={siteName} 
                className="h-9 w-auto object-contain max-w-[140px]" 
              />
            ) : (
              <span className="w-9 h-9 rounded-[10px] bg-white flex items-center justify-center">
                <PlaneTakeoff className="w-5 h-5 text-[#0A0A0A]" />
              </span>
            )}
            <span className="font-display text-lg font-semibold text-white">
              {siteName.includes(' ') ? (
                <>
                  {siteName.split(' ')[0]}
                  <span className="text-[#14532D]">&amp;</span>
                  {siteName.split(' ').slice(1).join(' ')}
                </>
              ) : (
                siteName
              )}
            </span>
          </div>

          <p className="text-xs leading-relaxed font-normal text-slate-400">
            {siteDescription}
          </p>

          {/* Contact Details from Settings */}
          <div className="pt-2 space-y-1.5 text-xs text-slate-300 font-normal">
            {contactEmail && (
              <div className="flex items-center gap-2 text-slate-400 font-normal hover:text-[#C2412D] transition-colors">
                <Mail className="w-3.5 h-3.5 text-[#C2412D] shrink-0" />
                <a href={`mailto:${contactEmail}`} className="truncate">{contactEmail}</a>
              </div>
            )}
            {contactPhone && (
              <div className="flex items-center gap-2 text-slate-400 font-normal hover:text-[#C2412D] transition-colors">
                <Phone className="w-3.5 h-3.5 text-[#C2412D] shrink-0" />
                <a href={`tel:${contactPhone}`}>{contactPhone}</a>
              </div>
            )}
            {address && (
              <div className="flex items-center gap-2 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-[#C2412D] shrink-0" />
                <span>{address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links Column */}
        <div className="space-y-3">
          <h4 className="text-white font-medium text-xs uppercase tracking-wider">Explore</h4>
          <ul className="space-y-2 text-xs font-normal">
            <li>
              <button onClick={() => setCurrentView('packages')} className="text-slate-400 font-normal hover:text-[#C2412D] transition-colors text-left cursor-pointer">
                Find a package
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentView('travelers')} className="text-slate-400 font-normal hover:text-[#C2412D] transition-colors text-left cursor-pointer">
                Find a traveler
              </button>
            </li>
            <li>
              <button onClick={onOpenPostModal} className="text-slate-400 font-normal hover:text-[#C2412D] transition-colors text-left cursor-pointer">
                Post your package
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentView('dashboard')} className="text-slate-400 font-normal hover:text-[#C2412D] transition-colors text-left cursor-pointer">
                My dashboard
              </button>
            </li>
          </ul>
        </div>

        {/* Legal & Safety Column */}
        <div className="space-y-3">
          <h4 className="text-white font-medium text-xs uppercase tracking-wider">Help &amp; safety</h4>
          <ul className="space-y-2 text-xs font-normal">
            <li>
              <button onClick={() => setCurrentView('safety')} className="text-slate-400 font-normal hover:text-[#C2412D] transition-colors text-left cursor-pointer">
                Package guidelines
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentView('safety')} className="text-slate-400 font-normal hover:text-[#C2412D] transition-colors text-left cursor-pointer">
                Safe handovers
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentView('safety')} className="text-slate-400 font-normal hover:text-[#C2412D] transition-colors text-left cursor-pointer">
                Contact support
              </button>
            </li>
          </ul>
        </div>

        {/* Newsletter Column */}
        <div className="space-y-3">
          <h4 className="text-white font-medium text-xs uppercase tracking-wider">Delivery Updates</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Get route updates and new delivery opportunities.
          </p>
          <form onSubmit={handleSubscribe} className="space-y-2">
            <div className="flex gap-2">
              <input 
                type="email" 
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Enter your email address" 
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-400 outline-none focus:border-[#F5A623] transition-colors min-w-0"
              />
              <button 
                type="submit"
                className="bg-white hover:bg-[#F5F5F4] transition-colors rounded-[10px] px-3.5 font-medium text-[#0A0A0A] text-xs shrink-0 flex items-center gap-1 cursor-pointer"
              >
                <span>Subscribe</span>
                <Send className="w-3 h-3" />
              </button>
            </div>
            {subscribed && (
              <p className="text-[10px] text-emerald-400 font-normal flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> You are subscribed.
              </p>
            )}
          </form>
        </div>

      </div>

      <div className="border-t border-white/10 py-5 text-center text-xs text-slate-500 font-normal px-4">
        © {new Date().getFullYear()} {siteName}. All rights reserved.
      </div>
    </footer>
  );
}
