import React from 'react';
import { ShieldCheck, AlertTriangle, Eye, CheckCircle2 } from 'lucide-react';

export default function SafetyView() {
  return (
    <main className="max-w-4xl mx-auto px-5 lg:px-8 py-10 space-y-8">
      <div className="text-center space-y-3">
        <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
          <ShieldCheck className="w-3.5 h-3.5" /> Safety Guidelines & Protocols
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#1C160F]">
          Delivery Safety Standards
        </h1>
        <p className="text-slate-500 text-sm max-w-xl mx-auto">
          Essential safety and compliance requirements for every delivery between Addis Ababa and Dubai.
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-white border border-amber-100 rounded-2xl p-6 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
            <Eye className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-bold text-base text-[#1C160F]">1. Mandatory Item Inspection</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Travelers must inspect the contents of every item before airport check-in. Do not accept packages when the contents cannot be verified.
            </p>
          </div>
        </div>

        <div className="bg-white border border-amber-100 rounded-2xl p-6 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-bold text-base text-[#1C160F]">2. Prohibited Goods & Restricted Items</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Do not carry items that exceed airline liquid limits, are illegal, unverified, restricted, or hazardous. Electronics must be available for inspection and comply with airline requirements.
            </p>
          </div>
        </div>

        <div className="bg-white border border-amber-100 rounded-2xl p-6 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-bold text-base text-[#1C160F]">3. Airport Meeting Point Handovers</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Arrange handovers in public, well-monitored airport lobbies or designated meeting areas at Bole International Airport (ADD) or Dubai International Airport (DXB).
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
