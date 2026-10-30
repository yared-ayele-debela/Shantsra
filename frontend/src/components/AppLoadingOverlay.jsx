import React from 'react';
import { PlaneTakeoff, Loader2 } from 'lucide-react';
import { useSiteSettings, SITE_LOGO_STORAGE_KEY, SITE_NAME_STORAGE_KEY } from '../context/SiteSettingsContext.jsx';

export default function AppLoadingOverlay({ isLoading, message = 'Preparing your delivery network...' }) {
  const { settings } = useSiteSettings();
  const logoUrl = settings?.logo_url || sessionStorage.getItem(SITE_LOGO_STORAGE_KEY);
  const siteName = settings?.site_name || sessionStorage.getItem(SITE_NAME_STORAGE_KEY) || 'Souq & Sheba';

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FBF7F0]/95 p-6 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in">
      <div className="flex w-full max-w-xs flex-col items-center space-y-4 text-center">
        {logoUrl ? (
          <img src={logoUrl} alt={siteName} className="h-12 w-auto max-w-[150px] object-contain" />
        ) : (
          <PlaneTakeoff className="h-8 w-8 text-[#14532D]" aria-hidden="true" />
        )}
        <Loader2 className="h-8 w-8 animate-spin text-[#14532D]" aria-label="Loading" />
        <div className="space-y-1">
          <h1 className="font-display text-lg font-semibold text-[#1C2B22]">{siteName}</h1>
          <p className="text-xs leading-relaxed text-[#5E6B62]">{message}</p>
        </div>
      </div>
    </div>
  );
}
