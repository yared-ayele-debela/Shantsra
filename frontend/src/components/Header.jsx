import React from 'react';
import { PlaneTakeoff, MessageSquare, PlusCircle, User, LogOut } from 'lucide-react';

export default function Header({ 
  currentView, 
  setCurrentView, 
  onOpenRequestModal, 
  onOpenChatDrawer,
  currentUser,
  onOpenAuthModal,
  onLogout
}) {
  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/80 backdrop-blur-md border-b border-amber-100/40">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 h-[72px] flex items-center justify-between gap-6">
        <button 
          onClick={() => setCurrentView('home')} 
          className="flex items-center gap-2 shrink-0 text-left focus:outline-none"
        >
          <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-emerald-800 flex items-center justify-center shadow-md">
            <PlaneTakeoff className="w-5 h-5 text-white" />
          </span>
          <div className="flex flex-col">
            <span className="font-display text-xl font-extrabold tracking-tight leading-none text-[#1C160F]">
              Souq<span className="text-amber-600">&amp;</span>Sheba
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-500 mt-0.5">
              P2P Delivery
            </span>
          </div>
        </button>

        <nav className="hidden lg:flex items-center gap-8 text-[15px] font-medium text-slate-600">
          <button 
            onClick={() => setCurrentView('home')} 
            className={`hover:text-amber-600 transition-colors ${currentView === 'home' ? 'font-semibold text-amber-600' : ''}`}
          >
            Home
          </button>
          <button 
            onClick={() => setCurrentView('packages')} 
            className={`hover:text-amber-600 transition-colors ${currentView === 'packages' ? 'font-semibold text-amber-600' : ''}`}
          >
            Search Packages
          </button>
          <button 
            onClick={() => setCurrentView('travelers')} 
            className={`hover:text-amber-600 transition-colors ${currentView === 'travelers' ? 'font-semibold text-amber-600' : ''}`}
          >
            Find Travelers
          </button>
          {currentUser && (
            <button 
              onClick={() => setCurrentView('dashboard')} 
              className={`hover:text-amber-600 transition-colors ${currentView === 'dashboard' ? 'font-semibold text-amber-600' : ''}`}
            >
              My Dashboard
            </button>
          )}
         
        </nav>

        <div className="flex items-center gap-3">
          <button 
            onClick={onOpenChatDrawer}
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-amber-600 px-3 py-2 rounded-xl hover:bg-amber-50/50 transition-colors relative"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Chat</span>
            <span className="w-4 h-4 rounded-full bg-amber-500 text-[#1C160F] text-[9px] font-bold flex items-center justify-center">2</span>
          </button>

          {currentUser ? (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentView('dashboard')}
                className="flex items-center gap-2 bg-amber-50 border border-amber-200/80 rounded-xl px-3 py-1.5 hover:bg-amber-100 transition-colors text-xs font-bold text-[#1C160F]"
              >
                <div className="w-6 h-6 rounded-full bg-amber-500 text-[#1C160F] flex items-center justify-center font-extrabold text-[10px]">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="hidden md:inline">{currentUser.name}</span>
              </button>
              <button
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => onOpenAuthModal('login')}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-amber-50 border border-amber-200/80 rounded-xl px-3.5 py-2.5 hover:bg-amber-100 transition-colors"
            >
              <User className="w-3.5 h-3.5 text-amber-600" />
              <span>Sign In</span>
            </button>
          )}

          <button 
            onClick={onOpenRequestModal}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white bg-[#1C160F] px-4 py-2.5 rounded-xl hover:bg-amber-600 hover:text-[#1C160F] transition-all duration-200 shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Request Delivery</span>
            <span className="sm:hidden">Request</span>
          </button>
        </div>
      </div>
    </header>
  );
}
