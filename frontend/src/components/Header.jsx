import React from 'react';
import { PlaneTakeoff, MessageSquare, PlusCircle, User, LogOut } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import { useSiteSettings, SITE_LOGO_STORAGE_KEY } from '../context/SiteSettingsContext.jsx';

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
  const siteName = settings?.site_name || 'Souq & Sheba';

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-amber-100/40">
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
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-emerald-800 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <PlaneTakeoff className="w-5 h-5 text-white" />
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
              P2P Delivery
            </span> */}
          {/* </div> */}
        </button>

        {/* Center Main Navigation */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <button 
            onClick={() => setCurrentView('home')} 
            className={`hover:text-amber-600 transition-colors ${currentView === 'home' ? 'font-bold text-amber-600' : ''}`}
          >
            Home
          </button>
          <button 
            onClick={() => setCurrentView('packages')} 
            className={`hover:text-amber-600 transition-colors ${currentView === 'packages' ? 'font-bold text-amber-600' : ''}`}
          >
            Search Packages
          </button>
          <button 
            onClick={() => setCurrentView('travelers')} 
            className={`hover:text-amber-600 transition-colors ${currentView === 'travelers' ? 'font-bold text-amber-600' : ''}`}
          >
            Find Travelers
          </button>
          {currentUser && (
            <button 
              onClick={() => setCurrentView('dashboard')} 
              className={`hover:text-amber-600 transition-colors ${currentView === 'dashboard' ? 'font-bold text-amber-600' : ''}`}
            >
              My Dashboard
            </button>
          )}
        </nav>

        {/* Right Side Grouped Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* GROUP 1: Utilities Capsule (Language & Chat) */}
          <div className="bg-white/80 border border-amber-200/60 rounded-2xl p-1 shadow-2xs flex items-center gap-1">
            <LanguageSelector />
            <button 
              onClick={onOpenChatDrawer}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-amber-600 px-2.5 py-1.5 rounded-xl hover:bg-amber-50 transition-colors relative"
              title="Open Chat Drawer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline text-[11px]">Chat</span>
              <span className="w-4 h-4 rounded-full bg-amber-500 text-[#1C160F] text-[9px] font-extrabold flex items-center justify-center">2</span>
            </button>
          </div>

          {/* GROUP 2: Account & Primary CTA */}
          <div className="flex items-center gap-2">
            {currentUser ? (
              <div className="flex items-center bg-white/80 border border-amber-200/60 rounded-2xl p-1 shadow-2xs">
                <button 
                  onClick={() => setCurrentView('dashboard')}
                  className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-amber-50 rounded-xl transition-colors text-xs font-bold text-[#1C160F]"
                >
                  {currentUser.photo_url || currentUser.photo ? (
                    <img 
                      src={currentUser.photo_url || currentUser.photo} 
                      alt={currentUser.name} 
                      className="w-6 h-6 rounded-full object-cover border border-amber-300 shadow-2xs shrink-0" 
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-emerald-700 text-white flex items-center justify-center font-extrabold text-[10px] shadow-2xs shrink-0">
                      {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <span className="hidden md:inline">{currentUser.name ? currentUser.name.split(' ')[0] : 'User'}</span>
                </button>
                <div className="h-4 w-px bg-amber-200/60 mx-0.5"></div>
                <button
                  onClick={onLogout}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => onOpenAuthModal('login')}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white/80 border border-amber-200/60 rounded-2xl px-3 py-2 hover:bg-amber-50 transition-colors shadow-2xs"
              >
                <User className="w-3.5 h-3.5 text-amber-600" />
                <span>Sign In</span>
              </button>
            )}

            <button 
              onClick={onOpenRequestModal}
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-white bg-[#1C160F] hover:bg-amber-500 hover:text-[#1C160F] px-4 py-2.5 rounded-2xl transition-all shadow-2xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Request Delivery</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
