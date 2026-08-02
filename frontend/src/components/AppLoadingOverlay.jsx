import React from 'react';
import { PlaneTakeoff, Loader2, Sparkles } from 'lucide-react';
import { useSiteSettings, SITE_LOGO_STORAGE_KEY, SITE_NAME_STORAGE_KEY } from '../context/SiteSettingsContext.jsx';

export default function AppLoadingOverlay({ isLoading, message = 'Initializing P2P Flight & Package Network...' }) {
  const { settings } = useSiteSettings();
  const logoUrl = settings?.logo_url || sessionStorage.getItem(SITE_LOGO_STORAGE_KEY);
  const siteName = settings?.site_name || sessionStorage.getItem(SITE_NAME_STORAGE_KEY) || 'Souq & Sheba';
  const siteDescription = settings?.site_description || 'Peer-to-Peer Delivery Network';

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#1C160F]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white transition-opacity duration-300 animate-in fade-in">
      <div className="relative flex flex-col items-center max-w-sm w-full text-center space-y-6">
        
        {/* Ambient Glow */}
        <div className="absolute -top-10 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Circular Brand Logo with Outer Animated Spinner Rings */}
        <div className="relative flex items-center justify-center my-2">
          {/* Outer Pulsing Radar Ring */}
          <div className="absolute w-36 h-36 rounded-full border border-amber-500/20 animate-ping opacity-75"></div>
          
          {/* Outer Fast Spinning Ring */}
          <div className="absolute w-32 h-32 rounded-full border-2 border-transparent border-t-amber-400 border-r-amber-500/60 animate-[spin_1.5s_linear_infinite]"></div>

          {/* Counter-rotating Inner Ring */}
          <div className="absolute w-28 h-28 rounded-full border-2 border-transparent border-b-emerald-400 border-l-amber-300 animate-[spin_2.5s_linear_infinite_reverse]"></div>

          {/* Main Circle Logo */}
          <div className="w-22 h-22 rounded-full bg-gradient-to-br from-amber-500 via-amber-600 to-emerald-800 flex items-center justify-center shadow-[0_0_35px_rgba(245,158,11,0.35)] z-10 border-2 border-amber-300/40 p-3 overflow-hidden">
            {logoUrl ? (
              <img src={logoUrl} alt={siteName} className="w-full h-full object-contain rounded-full" />
            ) : (
              <PlaneTakeoff className="w-10 h-10 text-white animate-pulse" />
            )}
          </div>

          {/* Circular Sparkle Badge */}
          <span className="absolute -top-1 -right-1 z-20 w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-amber-300 text-[#1C160F] flex items-center justify-center shadow-lg border-2 border-[#1C160F]">
            <Sparkles className="w-4 h-4 fill-[#1C160F]" />
          </span>
        </div>

        {/* App Title */}
        <div className="space-y-1">
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {siteName.includes(' & ') ? (
              <>
                {siteName.split(' & ')[0]}
                <span className="text-amber-400">&amp;</span>
                {siteName.split(' & ')[1]}
              </>
            ) : (
              siteName
            )}
          </h1>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300/80">
            {siteDescription}
          </p>
        </div>

        {/* Circular Progress & Loading Message */}
        <div className="flex flex-col items-center justify-center space-y-3 w-full">
          {/* Dual Circle Loader */}
          <div className="relative w-10 h-10 flex items-center justify-center">
            <div className="absolute w-full h-full rounded-full border-2 border-white/10"></div>
            <div className="absolute w-full h-full rounded-full border-2 border-amber-400 border-t-transparent animate-spin"></div>
            <Loader2 className="w-4 h-4 text-amber-300 animate-spin" />
          </div>

          <span className="text-xs font-semibold text-slate-300 max-w-[260px] leading-relaxed">
            {message}
          </span>
        </div>

      </div>
    </div>
  );
}
