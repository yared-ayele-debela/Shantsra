import React from 'react';
import { PlusCircle, User, LogOut } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import { useSiteSettings, SITE_LOGO_STORAGE_KEY } from '../context/SiteSettingsContext.jsx';
import { getStorageUrl } from '../lib/api';

export default function Header({ 
  currentView, 
  setCurrentView, 
  onOpenRequestModal, 
  onOpenChatDrawer,
  currentUser,
  onOpenAuthModal,
  onLogout
}) {
  const { settings } = useSiteSettings();
  const logoUrl = settings?.logo_url || sessionStorage.getItem(SITE_LOGO_STORAGE_KEY);
  const siteName = settings?.site_name || 'Shantasra';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#D2DDD8]">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-5 lg:px-8 h-[68px] sm:h-[72px] flex items-center justify-between gap-3">
        {/* Brand Logo - Displays ONLY logo on mobile view */}
        <button 
          onClick={() => setCurrentView('home')} 
          className="flex items-center gap-2.5 shrink-0 text-left focus:outline-none group"
        >
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt={siteName} 
              className="h-10 w-auto max-[360px]:h-8 object-contain max-w-[120px] sm:max-w-none group-hover:scale-105 transition-transform" 
            />
          ) : (
            <span className="font-display text-lg font-semibold tracking-tight text-[#0D3326]">
              {siteName}
            </span>
          )}

          {/* Text Title Hidden on Mobile View */}
          {/* <div className="hidden sm:flex flex-col"> */}
            {/* <span className="font-display text-xl font-extrabold tracking-tight leading-none text-[#1C160F]">
              {siteName.includes(' ') ? (
                <>
                  {siteName.split(' ')[0]}
                  <span className="text-amber-600">&amp;</span>
                  {siteName.split(' ').slice(1).join(' ')}
                </>
              ) : (
                siteName
              )}
            </span> */}
            {/* <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-500 mt-0.5">
              Trusted Delivery Network
            </span> */}
          {/* </div> */}
        </button>

        {/* Center Main Navigation */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <button 
            onClick={() => setCurrentView('home')} 
            className={`hover:text-[#14532D] transition-colors ${currentView === 'home' ? 'font-bold text-[#14532D]' : ''}`}
          >
            Home
          </button>
          <button 
            onClick={() => setCurrentView('packages')} 
            className={`hover:text-[#14532D] transition-colors ${currentView === 'packages' ? 'font-bold text-[#14532D]' : ''}`}
          >
             Packages
          </button>
          <button 
            onClick={() => setCurrentView('travelers')} 
            className={`hover:text-[#14532D] transition-colors ${currentView === 'travelers' ? 'font-bold text-[#14532D]' : ''}`}
          >
            Find Travelers
          </button>
          {currentUser && (
            <button 
              onClick={() => setCurrentView('dashboard')} 
              className={`hover:text-[#14532D] transition-colors ${currentView === 'dashboard' ? 'font-bold text-[#14532D]' : ''}`}
            >
              My Dashboard
            </button>
          )}
        </nav>

        {/* Right Side Grouped Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* GROUP 1: Utilities Capsule */}
          <div className="bg-white border border-[#D2DDD8] rounded-[10px] p-1 flex items-center gap-1">
            <LanguageSelector />
          </div>

          {/* GROUP 2: Account & Primary CTA */}
          <div className="flex items-center gap-2">
            {currentUser ? (
              <div className="flex items-center bg-white border border-[#D2DDD8] rounded-[10px] p-1">
                <button 
                  onClick={() => setCurrentView('dashboard')}
                  className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-[#EEF3F0] rounded-[10px] transition-colors text-xs font-bold text-[#0D3326]"
                >
                  <img 
                    src={getStorageUrl(currentUser.photo_url || currentUser.photo) || '/assets/No-Image-Found-400x264.png'} 
                    alt={currentUser.name} 
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/assets/No-Image-Found-400x264.png';
                    }}
                    className="w-6 h-6 rounded-full object-cover border border-amber-300 shadow-2xs shrink-0" 
                  />
                  <span className="hidden md:inline">{currentUser.name ? currentUser.name.split(' ')[0] : 'User'}</span>
                </button>
                <div className="h-4 w-px bg-[#D2DDD8] mx-0.5"></div>
                <button
                  onClick={onLogout}
                  className="p-1.5 text-slate-400 hover:text-[#D92D20] hover:bg-[#EEF3F0] rounded-[10px] transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => onOpenAuthModal('login')}
                className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#0D3326] border border-[#0D3326] rounded-[10px] px-3 py-2 hover:bg-[#144937] transition-colors"
              >
                <User className="w-3.5 h-3.5 text-white" />
                <span>Sign In</span>
              </button>
            )}

            <button 
              onClick={onOpenRequestModal}
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-white bg-[#0D3326] hover:bg-[#144937] px-4 py-2.5 rounded-[10px] transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Post a Request</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
