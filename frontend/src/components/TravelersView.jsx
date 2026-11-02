import React, { useState, useEffect, useMemo } from 'react';
import { Users, SlidersHorizontal, RotateCcw, Search, Plane, Star, Phone, CheckCircle2, User, Loader2 } from 'lucide-react';
import UserProfileModal from './UserProfileModal';
import BannerStrip from './BannerStrip';
import { getApiUrl, getStorageUrl } from '../lib/api';

export default function TravelersView({ profiles, onSelectProfile, onContactPhone }) {
  const [realTravelers, setRealTravelers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Left side Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRoute, setFilterRoute] = useState('ALL');
  const [filterMinWeight, setFilterMinWeight] = useState(0);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  // Selected traveler for modal
  const [modalTraveler, setModalTraveler] = useState(null);

  // Fetch real travels / active users from GET /api/travelers
  useEffect(() => {
    async function fetchTravelers() {
      setLoading(true);
      try {
        const response = await fetch(getApiUrl('/api/travelers'), {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          }
        });

        if (response.ok) {
          const data = await response.json();
          const list = data.travelers || [];
          const uniqueMap = new Map();

          list.forEach(t => {
            const key = t.traveler_id || t.id || t.email || t.name;
            if (!uniqueMap.has(key)) {
              const rawPhoto = t.photo || t.photo_url || null;
              const hasPhoto = Boolean(
                rawPhoto &&
                typeof rawPhoto === 'string' &&
                rawPhoto.trim().length > 0 &&
                !rawPhoto.toLowerCase().includes('unsplash.com')
              );
              let photoSrc = '';
              if (hasPhoto) {
                photoSrc = getStorageUrl(rawPhoto);
              }

              uniqueMap.set(key, {
                id: t.id,
                name: t.name || 'Verified Traveler',
                photo: photoSrc,
                isRealPhoto: hasPhoto,
                rating: t.rating || 5.0,
                reviews: t.reviews || 5,
                route: (t.from_city || '').toLowerCase().includes('dubai') ? 'DXB_TO_ADD' : 'ADD_TO_DXB',
                from_city: t.from_city || 'Addis Ababa',
                to_city: t.to_city || 'Dubai',
                flightDate: t.date || 'Upcoming trip',
                airline: 'Verified Flight',
                available_weight: (float => isNaN(float) ? 10 : float)(parseFloat(t.available_weight || 10)),
                price: t.price || '$15 / kg',
                phone: t.phone || '251911223344',
                city: t.city || 'Addis Ababa',
                country: t.country || 'Ethiopia',
                verified: true
              });
            }
          });

          setRealTravelers(Array.from(uniqueMap.values()));
        }
      } catch (err) {
        console.error('Error fetching database travelers:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTravelers();
  }, []);

  // Filter Logic - Only real database travelers
  const filteredTravelers = useMemo(() => {
    return realTravelers.filter(t => {
      const routeMatch = filterRoute === 'ALL' || t.route === filterRoute;
      const itemWeight = parseFloat(t.available_weight ?? 10);
      const weightMatch = isNaN(itemWeight) ? true : itemWeight >= filterMinWeight;

      const q = searchQuery.toLowerCase().trim();
      const searchMatch = !q ||
        (t.name || '').toLowerCase().includes(q) ||
        (t.city || '').toLowerCase().includes(q) ||
        (t.airline || '').toLowerCase().includes(q) ||
        (t.from_city || '').toLowerCase().includes(q) ||
        (t.to_city || '').toLowerCase().includes(q);

      return routeMatch && weightMatch && searchMatch;
    });
  }, [realTravelers, filterRoute, filterMinWeight, searchQuery]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterRoute('ALL');
    setFilterMinWeight(0);
  };

  const handleOpenUserDetail = (traveler) => {
    if (onSelectProfile) {
      onSelectProfile(traveler);
    } else {
      setModalTraveler(traveler);
    }
  };

  const selectedProfileObj = modalTraveler ? profiles[modalTraveler.name] || {
    name: modalTraveler.name,
    avatar: modalTraveler.avatar,
    rating: String(modalTraveler.rating),
    deliveriesCount: modalTraveler.reviews || 10,
    bio: 'Verified traveler registered with the Souq & Sheba delivery network.',
    verifications: { id: true, flight: true, phone: true },
    reviews: [
      { id: 1, author: 'Kaleb T.', date: '2 weeks ago', rating: 5, text: 'Super reliable! Carried my package safely.' }
    ]
  } : null;

  return (
    <main className="max-w-7xl mx-auto px-3.5 sm:px-5 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8">
      {/* Header Banner */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1 mb-1">
          <Users className="w-3.5 h-3.5" /> Trusted travelers
        </span>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1C160F]">
          Find a trusted traveler
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          Browse verified travelers heading between Addis Ababa and Dubai. Open a profile to view their trip details.
        </p>
      </div>

      <BannerStrip placement="travelers" />

      <div className="grid lg:grid-cols-12 gap-5 sm:gap-8 items-start">
        {/* Mobile Filter Toggle Button */}
        <div className="lg:hidden col-span-12">
          <button
            onClick={() => setShowMobileFilter(!showMobileFilter)}
            className="w-full bg-white border border-amber-200 text-[#1C160F] font-bold text-xs py-3 px-4 rounded-2xl flex items-center justify-between shadow-xs mb-2 cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-amber-600" />
              <span>Filter travelers</span>
            </span>
            <span className="text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-extrabold border border-amber-200">
            {showMobileFilter ? 'Hide filters ▲' : 'Show filters ▼'}
            </span>
          </button>
        </div>

        {/* LEFT SIDE FILTER SIDEBAR (4 cols) */}
        <div className={`${showMobileFilter ? 'block' : 'hidden'} lg:block lg:col-span-4 col-span-12`}>
          <aside className="bg-white rounded-2xl border border-amber-100 p-4 sm:p-6 shadow-sm space-y-5 sm:space-y-6 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] overflow-y-auto scrollbar-none">
            <div className="flex items-center justify-between border-b border-amber-50 pb-3">
              <h3 className="font-display font-bold text-sm sm:text-base text-[#1C160F] flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-amber-600" /> Filter travelers
              </h3>
              <button
                onClick={handleResetFilters}
                className="text-xs font-semibold text-slate-400 hover:text-amber-600 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" /> Clear all
              </button>
            </div>

            {/* Search Input */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Search by name or city
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or city"
                  className="w-full text-xs border border-[#E8DFD0] rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-[#14532D] bg-[#E6EFE9] placeholder:text-slate-400 text-[#1C2B22]"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Flight Route Filter */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Flight Corridor
              </label>
              <div className="flex flex-col gap-2">
                <label
                  onClick={() => setFilterRoute('ALL')}
                  className={`border rounded-xl p-2.5 sm:p-3 flex items-center justify-between cursor-pointer transition-colors ${
                    filterRoute === 'ALL' ? 'border-[#14532D] bg-[#E6EFE9]' : 'border-amber-100 hover:bg-[#E6EFE9]'
                  }`}
                >
                  <span className="text-xs font-semibold text-slate-700">All Routes</span>
                  <input type="radio" checked={filterRoute === 'ALL'} readOnly className="accent-amber-600" />
                </label>

                <label
                  onClick={() => setFilterRoute('ADD_TO_DXB')}
                  className={`border rounded-xl p-2.5 sm:p-3 flex items-center justify-between cursor-pointer transition-colors ${
                    filterRoute === 'ADD_TO_DXB' ? 'border-[#14532D] bg-[#E6EFE9]' : 'border-amber-100 hover:bg-[#E6EFE9]'
                  }`}
                >
                  <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    Addis Ababa (ADD) ➔ Dubai (DXB)
                  </span>
                  <input type="radio" checked={filterRoute === 'ADD_TO_DXB'} readOnly className="accent-amber-600" />
                </label>

                <label
                  onClick={() => setFilterRoute('DXB_TO_ADD')}
                  className={`border rounded-xl p-2.5 sm:p-3 flex items-center justify-between cursor-pointer transition-colors ${
                    filterRoute === 'DXB_TO_ADD' ? 'border-[#14532D] bg-[#E6EFE9]' : 'border-amber-100 hover:bg-[#E6EFE9]'
                  }`}
                >
                  <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    Dubai (DXB) ➔ Addis Ababa (ADD)
                  </span>
                  <input type="radio" checked={filterRoute === 'DXB_TO_ADD'} readOnly className="accent-amber-600" />
                </label>
              </div>
            </div>

            {/* Available Capacity Slider */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Min Available Capacity
                </label>
                <span className="font-bold text-[#14532D] bg-[#E6EFE9] border border-[#E8DFD0] px-2 py-0.5 rounded">
                  {filterMinWeight} kg
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                step="1"
                value={filterMinWeight}
                onChange={(e) => setFilterMinWeight(parseFloat(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-semibold">
                <span>0 kg</span>
                <span>10 kg</span>
                <span>20 kg</span>
              </div>
            </div>
          </aside>
        </div>

        {/* RIGHT SIDE USER CARDS GRID (8 cols, 2 columns on mobile, 3 columns on desktop) */}
        <section className="lg:col-span-8 space-y-4 sm:space-y-6 col-span-12">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>Showing {filteredTravelers.length} verified traveler{filteredTravelers.length === 1 ? '' : 's'}</span>
          </div>

          {loading ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-amber-100 p-8 shadow-sm">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-3" />
              <p className="text-xs font-bold text-[#1C160F]">Loading verified travelers...</p>
            </div>
          ) : filteredTravelers.length > 0 ? (
            /* 2 columns on mobile, 3 columns on desktop */
            <div className="overflow-x-auto pb-2">
            <div className="grid grid-flow-col auto-cols-[minmax(520px,1fr)] lg:grid-flow-row lg:grid-cols-2 gap-3 sm:gap-4">
              {filteredTravelers.map((traveler) => {
                const whatsappMessage = encodeURIComponent(
                  `Hi ${traveler.name}, I found your verified trip (${traveler.flightDate}) on Souq & Sheba and would like to discuss sending a package.`
                );

                return (
                  <div
                    key={traveler.id || traveler.name}
                    onClick={() => handleOpenUserDetail(traveler)}
                    className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-[0_4px_18px_rgba(15,23,42,0.05)] hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(15,23,42,0.1)] hover:border-[#0D3326] transition-all cursor-pointer flex flex-row items-center gap-4 sm:gap-6 group"
                  >
                    {/* Top User Header */}
                    <div className="flex items-center gap-3 sm:gap-4 w-44 sm:w-56 shrink-0">
                      <div className="relative shrink-0">
                        {traveler.isRealPhoto ? (
                          <img
                            src={traveler.photo}
                            alt={traveler.name}
                            className="w-14 h-14 sm:w-20 sm:h-20 rounded-full object-cover border border-slate-200 shadow-sm"
                          />
                        ) : (
                          <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-[#0D3326] text-white font-extrabold text-xl sm:text-2xl flex items-center justify-center border border-slate-200 shadow-sm">
                            {traveler.name ? traveler.name.trim().charAt(0).toUpperCase() : 'T'}
                          </div>
                        )}
                        <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#0D3326] text-white flex items-center justify-center ring-2 ring-white" title="Verified Active Traveler">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                        </span>
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-display font-bold text-sm sm:text-base text-slate-900 group-hover:text-[#0D3326] transition-colors truncate">
                          {traveler.name}
                        </h3>
                        <p className="text-[10px] sm:text-xs text-slate-500 truncate">
                          {traveler.city || 'Addis Ababa'}
                        </p>
                        <span className="mt-1 inline-flex items-center gap-1 text-slate-700 font-bold text-[10px] sm:text-xs">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          {traveler.rating}
                        </span>
                      </div>
                    </div>

                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800">
                        <Plane className="w-4 h-4 text-[#0D3326] shrink-0" />
                        <span className="truncate">{traveler.from_city || 'Addis Ababa'} <span className="text-slate-400 px-1">to</span> {traveler.to_city || 'Dubai'}</span>
                      </div>
                      <p className="text-[10px] sm:text-xs text-slate-500 font-semibold truncate">{traveler.flightDate}</p>
                      <div className="flex items-center gap-4 text-[10px] sm:text-xs text-slate-600">
                        <span><strong className="text-slate-800">{traveler.available_weight}kg</strong> capacity</span>
                        <span><strong className="text-slate-800">{traveler.price}</strong></span>
                      </div>
                    </div>

                    {/* Profile actions */}
                    <div className="w-24 sm:w-32 shrink-0 border-l border-slate-200 pl-3 sm:pl-5 flex flex-col items-stretch justify-center gap-2 sm:gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenUserDetail(traveler);
                        }}
                        className="text-[10px] sm:text-xs font-bold text-slate-600 hover:text-[#0D3326] flex items-center gap-1 transition-colors"
                      >
                        <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#0D3326]" />
                        <span>Profile</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onContactPhone) onContactPhone(traveler);
                        }}
                        aria-label="Show traveler phone"
                        title="Show traveler phone"
                        className="flex items-center justify-center gap-1 bg-[#0D3326] hover:bg-[#144937] text-white text-[10px] sm:text-xs font-semibold px-3 py-2 rounded-xl transition-all cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Contact</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-amber-100/60 p-8 shadow-sm">
              <Users className="w-12 h-12 text-amber-500 mx-auto mb-3" />
              <h3 className="font-display text-lg font-bold text-[#1C160F] mb-1">No Travelers Found</h3>
              <p className="text-slate-500 text-sm max-w-sm mx-auto">
                No verified travelers match the selected route or capacity filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-4 bg-[#E6EFE9] text-[#14532D] text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#D5E6DA] transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}
        </section>
      </div>

      {/* User Detail Profile Modal */}
      {modalTraveler && selectedProfileObj && (
        <UserProfileModal
          profile={selectedProfileObj}
          onClose={() => setModalTraveler(null)}
        />
      )}
    </main>
  );
}
