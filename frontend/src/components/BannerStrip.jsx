import { useEffect, useState } from 'react';
import { ArrowUpRight, X } from 'lucide-react';
import { api, getStorageUrl } from '../lib/api.js';

export default function BannerStrip({ placement, single = false }) {
  const [banners, setBanners] = useState([]);
  const [dismissed, setDismissed] = useState(() => new Set());

  useEffect(() => {
    let cancelled = false;

    async function loadBanners() {
      try {
        const { data } = await api.get(`/api/banners?placement=${encodeURIComponent(placement)}`);
        if (!cancelled) {
          setBanners(Array.isArray(data.banners) ? data.banners : []);
        }
      } catch (error) {
        console.warn('Unable to load frontend banners:', error);
        if (!cancelled) {
          setBanners([]);
        }
      }
    }

    loadBanners();

    return () => {
      cancelled = true;
    };
  }, [placement]);

  const visibleBanners = banners
    .filter((banner) => !dismissed.has(banner.id))
    .filter((banner) => !single || banner.placement === placement)
    .slice(0, single ? 1 : undefined);

  if (visibleBanners.length === 0) {
    return null;
  }

  return (
    <aside aria-label="Offers and announcements" className="mx-auto w-full max-w-7xl px-0 pb-5 sm:px-5 lg:px-0">
      <div className={`grid gap-4 ${single ? 'grid-cols-1' : 'sm:grid-cols-2'}`}>
        {visibleBanners.map((banner) => (
          <article
            key={banner.id}
            className="group relative flex min-h-[260px] flex-col overflow-hidden rounded-[14px] border border-[#E8DFD0] bg-white text-[#1C2B22] shadow-[0_4px_18px_rgba(28,43,34,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#14532D]/40 hover:shadow-[0_8px_24px_rgba(20,83,45,0.12)]"
          >
            {banner.image_url && (
              <div className="relative h-40 shrink-0 overflow-hidden bg-[#F7F8F5] sm:h-48">
                <img
                  src={getStorageUrl(banner.image_url)}
                  alt={banner.title || 'Promotion'}
                  className="h-full w-full object-contain object-center transition-transform duration-500 group-hover:scale-[1.03]"
                  loading="lazy"
                />
              </div>
            )}
            <div
              className="flex flex-1 flex-col justify-between p-5 sm:p-6"
              style={!banner.image_url ? { background: banner.bg_gradient } : undefined}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  {banner.badge && (
                    <span className="mb-1.5 inline-flex rounded-full bg-[#E6EFE9] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#14532D]">
                      {banner.badge}
                    </span>
                  )}
                  <h2 className="font-display text-base font-semibold leading-tight text-[#1C2B22] sm:text-lg">{banner.title}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setDismissed((current) => new Set([...current, banner.id]))}
                  className="shrink-0 rounded-full p-1.5 text-[#5E6B62] transition-colors hover:bg-[#E6EFE9] hover:text-[#14532D]"
                  aria-label="Dismiss card"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              {banner.description && (
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#5E6B62] sm:text-sm">
                  {banner.description}
                </p>
              )}
              <div className="pt-4">
                {banner.cta_text && banner.cta_link && (
                  <a
                    href={banner.cta_link}
                    className="inline-flex items-center gap-1 rounded-[10px] bg-[#14532D] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#0F3F22]"
                  >
                    {banner.cta_text}
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </aside>
  );
}
