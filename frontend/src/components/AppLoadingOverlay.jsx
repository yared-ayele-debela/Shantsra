import React from 'react';
import { PlaneTakeoff, Loader2, Sparkles } from 'lucide-react';

export default function AppLoadingOverlay({ isLoading, message = 'Initializing P2P Flight & Package Network...' }) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#1C160F]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white transition-opacity duration-300 animate-in fade-in">
      <div className="relative flex flex-col items-center max-w-sm w-full text-center space-y-6">
        
        {/* Ambient Glow */}
        <div className="absolute -top-20 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Animated Brand Logo Icon */}
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500 to-emerald-800 flex items-center justify-center shadow-2xl shadow-amber-500/30 animate-pulse">
            <PlaneTakeoff className="w-10 h-10 text-white" />
          </div>
          <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-400 text-[#1C160F] flex items-center justify-center shadow-md">
            <Sparkles className="w-3.5 h-3.5 fill-[#1C160F]" />
          </span>
        </div>

        {/* App Title */}
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-white">
            Souq<span className="text-amber-400">&amp;</span>Sheba
          </h1>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300/80">
            Peer-to-Peer Delivery Network
          </p>
        </div>

        {/* Spinner & Loading Message */}
        <div className="space-y-3 w-full">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-300">
            <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
            <span>{message}</span>
          </div>

          {/* Animated Loading Bar */}
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-400 via-amber-500 to-emerald-500 rounded-full animate-[pulse_1.5s_infinite]"></div>
          </div>
        </div>

      </div>
    </div>
  );
}
