import React from "react";
import {
  MapPin,
  Star,
  CalendarDays,
  Luggage,
  ArrowRight,
  MessageCircle,
  ShieldCheck,
  Plane,
} from "lucide-react";
import { getStorageUrl } from "../lib/api";

export default function TravelerCard({
  traveler = {},
  onSelectProfile,
  onContact,
}) {
  const name = traveler.name || "Verified Traveler";
  const location =
    traveler.city ||
    traveler.location ||
    (traveler.route === "DXB_TO_ADD" ? "Dubai" : "Addis Ababa");
  const rating = traveler.rating ?? 4.8;

  const rawImage =
    traveler.photo ||
    traveler.photo_url ||
    traveler.image ||
    "/assets/No-Image-Found-400x264.png";
  const imageSrc =
    getStorageUrl(rawImage) || "/assets/No-Image-Found-400x264.png";

  const fromCity =
    traveler.from_city ||
    traveler.from ||
    (traveler.route === "DXB_TO_ADD" ? "Dubai" : "Addis Ababa");
  const toCity =
    traveler.to_city ||
    traveler.to ||
    (traveler.route === "DXB_TO_ADD" ? "Addis Ababa" : "Dubai");

  const departure =
    traveler.flightDate ||
    traveler.departure ||
    traveler.date ||
    "Upcoming Flight";

  const rawCapacity =
    traveler.available_weight ?? traveler.maxWeight ?? traveler.capacity ?? 10;
  const capacity =
    typeof rawCapacity === "string" && rawCapacity.toLowerCase().includes("kg")
      ? rawCapacity
      : `${rawCapacity} kg`;

  const rawRate =
    traveler.price_per_kg ??
    traveler.rate ??
    (typeof traveler.price === "string"
      ? traveler.price.replace(/[^0-9.]/g, "")
      : traveler.price) ??
    15;
  const rateDisplay = rawRate || 15;

  return (
    <div
      onClick={() => onSelectProfile && onSelectProfile(traveler)}
      className="group w-full h-full flex flex-col justify-between overflow-hidden rounded-2xl border border-[#D2DDD8] bg-white shadow-[0_4px_18px_rgba(13,51,38,0.06)] hover:-translate-y-0.5 hover:border-[#0D3326] hover:shadow-[0_8px_24px_rgba(13,51,38,0.12)] transition-all duration-300 cursor-pointer"
    >
      {/* Top section */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Profile */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={imageSrc}
                alt={name}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/assets/No-Image-Found-400x264.png";
                }}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-[#E6EFE9] shadow-2xs shrink-0"
              />

              <div className="min-w-0">
                <div className="flex items-center gap-1 flex-wrap">
                  <h2 className="font-display text-sm sm:text-base font-bold text-[#1C160F] group-hover:text-[#0D3326] transition-colors truncate">
                    {name}
                  </h2>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0D3326] shrink-0" />
                </div>

                <p className="flex items-center gap-1 text-[11px] sm:text-xs text-[#647B72] mt-0.5 truncate">
                  <MapPin size={13} className="text-amber-600 shrink-0" />
                  <span className="truncate">{location}</span>
                </p>

                <div className="flex items-center gap-1 mt-1 flex-wrap">
                  <Star
                    size={13}
                    className="fill-amber-500 text-amber-500 shrink-0"
                  />
                  <span className="font-bold text-xs text-[#1C160F]">
                    {rating}
                  </span>
                  <span className="text-[10px] text-[#647B72]">
                    Rating
                  </span>
                </div>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 rounded-full bg-[#E6EFE9] border border-[#D2DDD8] px-2 py-0.5 text-[10px] font-semibold text-[#0D3326] shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#14532D]" />
              Available
            </span>
          </div>

          {/* Route */}
          <div className="mt-3.5 sm:mt-4 rounded-xl bg-[#FAF8F5] border border-[#E8DFD0] p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Plane size={14} className="text-amber-600 shrink-0" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#647B72]">
                Travel Route
              </span>
            </div>

            <div className="flex items-center justify-between gap-1.5">
              <div className="min-w-0">
                <p className="font-display text-xs sm:text-sm font-extrabold text-[#0D3326] truncate">
                  {fromCity}
                </p>
                <p className="text-[9px] text-[#647B72] mt-0.5">Departure</p>
              </div>

              <div className="flex flex-1 items-center px-1 min-w-[32px]">
                <div className="h-px flex-1 border-t-2 border-dashed border-[#D2DDD8]" />
                <Plane size={14} className="mx-1 text-[#0D3326] shrink-0" />
                <div className="h-px flex-1 border-t-2 border-dashed border-[#D2DDD8]" />
              </div>

              <div className="text-right min-w-0">
                <p className="font-display text-xs sm:text-sm font-extrabold text-[#0D3326] truncate">
                  {toCity}
                </p>
                <p className="text-[9px] text-[#647B72] mt-0.5">Destination</p>
              </div>
            </div>
          </div>
        </div>

        {/* Travel details */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="rounded-xl border border-[#E8DFD0] bg-[#FAF8F5]/50 p-2.5">
            <div className="flex items-center gap-1 text-[#647B72] mb-1">
              <CalendarDays size={13} className="text-amber-600 shrink-0" />
              <span className="text-[9px] font-semibold uppercase tracking-wide truncate">
                Departure
              </span>
            </div>
            <p className="font-bold text-xs text-[#1C160F] truncate">
              {departure}
            </p>
          </div>

          <div className="rounded-xl border border-[#E8DFD0] bg-[#FAF8F5]/50 p-2.5">
            <div className="flex items-center gap-1 text-[#647B72] mb-1">
              <Luggage size={13} className="text-[#0D3326] shrink-0" />
              <span className="text-[9px] font-semibold uppercase tracking-wide truncate">
                Capacity
              </span>
            </div>
            <p className="font-bold text-xs text-[#1C160F] truncate">
              {capacity}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[#D2DDD8] bg-white p-3 sm:p-3.5 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-[#647B72] truncate">
            Rate
          </p>
          <div className="flex items-baseline gap-0.5">
            <span className="font-display text-base sm:text-lg font-extrabold text-[#0D3326]">
              ${rateDisplay}
            </span>
            <span className="text-[11px] text-[#647B72]">/kg</span>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onContact) {
              onContact(traveler);
            } else if (onSelectProfile) {
              onSelectProfile(traveler);
            }
          }}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0D3326] px-3 py-2 text-xs font-semibold text-white hover:bg-[#144937] active:scale-95 transition-all cursor-pointer shrink-0 shadow-xs"
        >
          <MessageCircle size={14} />
          <span>Contact</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}
