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
      <div className="grid grid-cols-1 gap-4">
        {visibleBanners.map((banner) => (
          <article
            key={banner.id}
            className="group relative overflow-hidden rounded-[14px] border border-[#D2DDD8] bg-white shadow-[0_4px_18px_rgba(13,51,38,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#0D3326]/40 hover:shadow-[0_8px_24px_rgba(13,51,38,0.12)]"
          >
            {banner.image_url && (
              <>
                <a href={banner.cta_link || '/signup'} aria-label={banner.title || 'Open promotion'}>
                  <img
                    src={getStorageUrl(banner.image_url)}
                    alt={banner.description || banner.title || 'Promotion'}
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                    width="1024"
                    height="434"
                    fetchPriority="high"
                  />
                </a>
                <button
                  type="button"
                  onClick={() => setDismissed((current) => new Set([...current, banner.id]))}
                  className="absolute right-3 top-3 rounded-full bg-white/90 p-1.5 text-[#647B72] shadow-sm transition-colors hover:bg-white hover:text-[#0D3326]"
                  aria-label="Dismiss banner"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </>
            )}
            {!banner.image_url && (
              <div
                className="flex min-h-[260px] flex-col justify-between p-5 sm:p-6"
                style={{ background: banner.bg_gradient }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    {banner.badge && (
                      <span className="mb-1.5 inline-flex rounded-full bg-[#E5F0EB] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#0D3326]">
                        {banner.badge}
                      </span>
                    )}
                    <h2 className="font-display text-base font-semibold leading-tight text-[#0D3326] sm:text-lg">{banner.title}</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDismissed((current) => new Set([...current, banner.id]))}
                    className="shrink-0 rounded-full p-1.5 text-[#647B72] transition-colors hover:bg-[#E5F0EB] hover:text-[#0D3326]"
                    aria-label="Dismiss banner"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
                {banner.description && (
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#647B72] sm:text-sm">
                    {banner.description}
                  </p>
                )}
                <div className="pt-4">
                  {banner.cta_text && banner.cta_link && (
                  <a
                    href={banner.cta_link}
                    className="inline-flex items-center gap-1 rounded-[10px] bg-[#0D3326] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#144937]"
                  >
                    {banner.cta_text}
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                  )}
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
    </aside>
  );
}
