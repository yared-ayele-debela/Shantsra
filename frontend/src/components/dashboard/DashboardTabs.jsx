import React from 'react';

export default function DashboardTabs({ activeTab, onChange, counts, copy }) {
  const tabs = [
    { key: 'packages', label: copy.packages },
    { key: 'deals', label: copy.deals, count: counts.deals },
    { key: 'history', label: copy.history },
    { key: 'alerts', label: copy.alerts, count: counts.alerts },
  ];

  return (
    <nav aria-label="Dashboard sections" className="overflow-x-auto scrollbar-none">
      <div className="flex min-w-max gap-1 border-b border-[#D2DDD8]">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            aria-current={activeTab === tab.key ? 'page' : undefined}
            className={`min-h-11 shrink-0 whitespace-nowrap border-b-2 px-3 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3326] sm:px-4 ${
              activeTab === tab.key
                ? 'border-[#0D3326] text-[#0D3326]'
                : 'border-transparent text-slate-500 hover:border-[#B89358] hover:text-[#0D3326]'
            }`}
          >
            <span className="inline-flex items-center gap-2">
              {tab.label}
              {tab.count ? (
                <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-extrabold text-rose-800">
                  {tab.count}
                </span>
              ) : null}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}
