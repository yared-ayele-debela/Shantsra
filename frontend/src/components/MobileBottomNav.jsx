import React from 'react';
import { House, Package, Plane, LayoutDashboard, MessageSquare, PlusCircle, User } from 'lucide-react';

export default function MobileBottomNav({
  currentView,
  setCurrentView,
  onOpenRequestModal,
  onOpenChatDrawer,
  currentUser,
  onOpenAuthModal
}) {
  return (
    <nav 
      aria-label="Mobile Navigation Bar"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-md border-t border-white/10 text-slate-300 px-2 py-1.5 shadow-[0_-8px_30px_rgba(10,10,10,0.18)] flex items-center justify-around"
    >
      {/* Home Tab */}
      <button
        onClick={() => setCurrentView('home')}
        className={`flex-1 flex flex-col items-center justify-center py-1 gap-1 transition-all ${
          currentView === 'home' 
            ? 'text-[#D9A441] font-bold scale-105'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <House className={`w-5 h-5 ${currentView === 'home' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
        <span className="text-[10px] tracking-tight">Home</span>
      </button>

      {/* Packages Tab */}
      <button
        onClick={() => setCurrentView('packages')}
        className={`flex-1 flex flex-col items-center justify-center py-1 gap-1 transition-all ${
          currentView === 'packages' 
            ? 'text-[#D9A441] font-bold scale-105'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Package className={`w-5 h-5 ${currentView === 'packages' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
        <span className="text-[10px] tracking-tight">Packages</span>
      </button>

      {/* Center Action: Request Delivery */}
      <button
        onClick={onOpenRequestModal}
        className="flex flex-col items-center justify-center -mt-5"
        title="Post a Delivery Request"
      >
        <div className="w-12 h-12 rounded-full bg-[#D9A441] text-[#1C2B22] flex items-center justify-center shadow-lg shadow-amber-500/20 border-2 border-[#14532D] active:scale-95 transition-transform">
          <PlusCircle className="w-6 h-6 stroke-[2.5px]" />
        </div>
        <span className="text-[10px] font-bold text-[#D9A441] mt-0.5">Post</span>
      </button>

      {/* Travelers Tab */}
      <button
        onClick={() => setCurrentView('travelers')}
        className={`flex-1 flex flex-col items-center justify-center py-1 gap-1 transition-all ${
          currentView === 'travelers' 
            ? 'text-[#D9A441] font-bold scale-105'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Plane className={`w-5 h-5 ${currentView === 'travelers' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
        <span className="text-[10px] tracking-tight">Travelers</span>
      </button>

      {/* Dashboard Tab */}
      <button
        onClick={() => setCurrentView('dashboard')}
        className={`flex-1 flex flex-col items-center justify-center py-1 gap-1 transition-all ${
          currentView === 'dashboard'
            ? 'text-[#D9A441] font-bold scale-105'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <LayoutDashboard className={`w-5 h-5 ${currentView === 'dashboard' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
        <span className="text-[10px] tracking-tight">Dashboard</span>
      </button>
    </nav>
  );
}
