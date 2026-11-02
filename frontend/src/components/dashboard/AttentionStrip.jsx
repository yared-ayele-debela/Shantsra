import React from 'react';
import { Bell, FileCheck2, MessageSquare, Star } from 'lucide-react';

const items = [
  { key: 'deals', icon: Bell, tone: 'amber' },
  { key: 'reviews', icon: Star, tone: 'gold' },
  { key: 'verification', icon: FileCheck2, tone: 'emerald' },
  { key: 'messages', icon: MessageSquare, tone: 'blue' },
];

const tones = {
  amber: 'border-amber-200 bg-amber-50 text-amber-900',
  gold: 'border-[#D8C39C] bg-[#FFF8E8] text-[#6C4D24]',
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  blue: 'border-blue-200 bg-blue-50 text-blue-900',
};

export default function AttentionStrip({ counts, copy, onSelect }) {
  if (!Object.values(counts).some(Boolean)) return null;
  const labels = {
    deals: copy.dealsAwaiting,
    reviews: copy.reviewsToLeave,
    verification: copy.pendingVerification,
    messages: copy.unreadMessages,
  };

  return (
    <section aria-labelledby="dashboard-attention" className="space-y-2">
      <h2 id="dashboard-attention" className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
        {copy.attention}
      </h2>
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {items.map(({ key, icon: Icon, tone }) => {
          const count = counts[key];
          if (!count) return null;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(key)}
              className={`flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-bold transition-colors hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3326] ${tones[tone]}`}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="min-w-0 flex-1">{labels[key]}</span>
              <strong className="text-sm">{count}</strong>
            </button>
          );
        })}
      </div>
    </section>
  );
}
