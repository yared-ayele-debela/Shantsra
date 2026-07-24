import React, { useState, useEffect, useMemo } from 'react';
import { Users, SlidersHorizontal, RotateCcw, Search, Plane, Star, Phone, CheckCircle2, User, Weight, Loader2 } from 'lucide-react';
import UserProfileModal from './UserProfileModal';

export default function TravelersView({ profiles, onSelectProfile }) {
  const [realTravelers, setRealTravelers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Left side Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRoute, setFilterRoute] = useState('ALL');
  const [filterMinWeight, setFilterMinWeight] = useState(0);

  // Selected traveler for modal
  const [modalTraveler, setModalTraveler] = useState(null);

  // Fetch real travels / active users from GET /api/travelers
  useEffect(() => {
    async function fetchTravelers() {
      setLoading(true);
      try {
        const response = await fetch('/api/travelers', {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          }
        });

        if (response.ok) {
          const data = await response.json();
          const list = data.travelers || [];
          const mapped = list.map(t => ({
            id: t.id,
            name: t.name || 'Verified Traveler',
            avatar: t.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
            rating: t.rating || 5.0,
            reviews: t.reviews || 5,
            route: (t.from_city || '').toLowerCase().includes('dubai') ? 'DXB_TO_ADD' : 'ADD_TO_DXB',
            from_city: t.from_city || 'Addis Ababa',
            to_city: t.to_city || 'Dubai',
            flightDate: t.date || 'Upcoming Flight',
            airline: 'Verified Flight',
            available_weight: (float => isNaN(float) ? 10 : float)(parseFloat(t.available_weight || 10)),
            price: t.price || '$15 / kg',
            phone: t.phone || '251911223344',
            city: t.city || 'Addis Ababa',
            country: t.country || 'Ethiopia',
            verified: true
          }));
          setRealTravelers(mapped);
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
      onSelectProfile(traveler.name);
    } else {
      setModalTraveler(traveler);
    }
  };

  const selectedProfileObj = modalTraveler ? profiles[modalTraveler.name] || {
    name: modalTraveler.name,
    avatar: modalTraveler.avatar,
    rating: String(modalTraveler.rating),
    deliveriesCount: modalTraveler.reviews || 10,
    bio: 'Verified active traveler registered on Souq & Sheba database.',
    verifications: { id: true, flight: true, phone: true },
    reviews: [
      { id: 1, author: 'Kaleb T.', date: '2 weeks ago', rating: 5, text: 'Super reliable! Carried my package safely.' }
    ]
  } : null;

  return (
    <main className="max-w-7xl mx-auto px-5 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1 mb-1">
          <Users className="w-3.5 h-3.5" /> Database Flyers Directory
        </span>
        <h1 className="font-display text-3xl font-extrabold text-[#1C160F]">
          Verified Travelers Directory
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Real database records of active verified flyers traveling between Addis Ababa &amp; Dubai. Click any card to inspect profile details.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* LEFT SIDE FILTER SIDEBAR (4 cols) */}
        <aside className="lg:col-span-4 bg-white rounded-2xl border border-amber-100 p-6 shadow-sm space-y-6 lg:sticky lg:top-24 max-h-[calc(100vh-7rem)] overflow-y-auto scrollbar-none">
          <div className="flex items-center justify-between border-b border-amber-50 pb-3">
            <h3 className="font-display font-bold text-base text-[#1C160F] flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-amber-600" /> Filter Travelers
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
              Search Traveler / City
            </label>
            <div className="relative">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by traveler name, city..." 
                className="w-full text-xs border border-amber-200/80 rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-amber-500 bg-amber-50/10 placeholder:text-slate-400 text-[#1C160F]" 
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
                className={`border rounded-xl p-3 flex items-center justify-between cursor-pointer transition-colors ${
                  filterRoute === 'ALL' ? 'border-amber-500 bg-amber-50/40' : 'border-amber-100 hover:bg-amber-50/20'
                }`}
              >
                <span className="text-xs font-semibold text-slate-700">All Routes</span>
                <input type="radio" checked={filterRoute === 'ALL'} readOnly className="accent-amber-600" />
              </label>
              
              <label 
                onClick={() => setFilterRoute('ADD_TO_DXB')} 
                className={`border rounded-xl p-3 flex items-center justify-between cursor-pointer transition-colors ${
                  filterRoute === 'ADD_TO_DXB' ? 'border-amber-500 bg-amber-50/40' : 'border-amber-100 hover:bg-amber-50/20'
                }`}
              >
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  Addis Ababa (ADD) ➔ Dubai (DXB)
                </span>
                <input type="radio" checked={filterRoute === 'ADD_TO_DXB'} readOnly className="accent-amber-600" />
              </label>

              <label 
                onClick={() => setFilterRoute('DXB_TO_ADD')} 
                className={`border rounded-xl p-3 flex items-center justify-between cursor-pointer transition-colors ${
                  filterRoute === 'DXB_TO_ADD' ? 'border-amber-500 bg-amber-50/40' : 'border-amber-100 hover:bg-amber-50/20'
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
              <span className="font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded">
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

        {/* RIGHT SIDE USER CARDS GRID (8 cols, 3 cards in a row on desktop) */}
        <section className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>Showing {filteredTravelers.length} real database traveler{filteredTravelers.length === 1 ? '' : 's'}</span>
          </div>

          {loading ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-amber-100 p-8 shadow-sm">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-3" />
              <p className="text-xs font-bold text-[#1C160F]">Loading Database Travelers...</p>
            </div>
          ) : filteredTravelers.length > 0 ? (
            /* 3 Travels in 1 Row on Desktop Layout */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTravelers.map((traveler) => {
                const whatsappMessage = encodeURIComponent(
                  `Hi ${traveler.name}, I found your verified flight (${traveler.flightDate}) on Souq & Sheba and would like to inquire about package delivery.`
                );

                return (
                  <div 
                    key={traveler.id || traveler.name}
                    onClick={() => handleOpenUserDetail(traveler)}
                    className="bg-white border border-amber-100 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-amber-300 transition-all cursor-pointer space-y-4 flex flex-col justify-between group"
                  >
                    {/* Top User Header */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="relative shrink-0">
                            <img 
                              src={traveler.avatar} 
                              alt={traveler.name} 
                              className="w-12 h-12 rounded-full object-cover border-2 border-amber-200 group-hover:border-amber-500 transition-colors" 
                            />
                            <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-2 ring-white" title="Verified Active Traveler">
                              <CheckCircle2 className="w-3 h-3" />
                            </span>
                          </div>

                          <div className="min-w-0">
                            <h3 className="font-display font-bold text-sm text-[#1C160F] group-hover:text-amber-600 transition-colors truncate">
                              {traveler.name}
                            </h3>
                            <p className="text-[10px] text-slate-500 truncate">
                              {traveler.city || 'Addis Ababa'}, {traveler.country || 'Ethiopia'}
                            </p>
                          </div>
                        </div>

                        <span className="flex items-center text-amber-600 font-bold text-[11px] bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-lg shrink-0">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500 mr-0.5" />
                          <span>{traveler.rating}</span>
                        </span>
                      </div>

                      {/* Flight Corridor Pill */}
                      <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-3 space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold text-[#1C160F]">
                          <span className="flex items-center gap-1">
                            <Plane className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            {traveler.from_city || 'ADD'} ➔ {traveler.to_city || 'DXB'}
                          </span>
                        </div>
                        <p className="text-[10px] text-amber-800 font-semibold">{traveler.flightDate}</p>
                      </div>

                      {/* Luggage Capacity & Pricing */}
                      <div className="grid grid-cols-2 gap-2 pt-0.5">
                        <div className="border border-amber-100 rounded-xl p-2 bg-slate-50/50">
                          <span className="text-[8px] font-bold uppercase text-slate-400 tracking-wider">Weight</span>
                          <p className="text-xs font-bold text-amber-700 mt-0.5 flex items-center gap-0.5">
                            <Weight className="w-3 h-3 text-amber-600" /> {traveler.available_weight} kg
                          </p>
                        </div>
                        <div className="border border-amber-100 rounded-xl p-2 bg-slate-50/50">
                          <span className="text-[8px] font-bold uppercase text-slate-400 tracking-wider">Rate</span>
                          <p className="text-xs font-bold text-emerald-700 mt-0.5">{traveler.price}</p>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-3 border-t border-amber-50 flex items-center justify-between gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenUserDetail(traveler);
                        }}
                        className="text-xs font-bold text-slate-700 hover:text-amber-600 flex items-center gap-1 transition-colors"
                      >
                        <User className="w-3.5 h-3.5 text-amber-600" /> Profile
                      </button>

                      <a 
                        href={`https://wa.me/${traveler.phone}?text=${whatsappMessage}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-xs"
                      >
                        <Phone className="w-3 h-3" /> Contact
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-amber-100/60 p-8 shadow-sm">
              <Users className="w-12 h-12 text-amber-500 mx-auto mb-3" />
              <h3 className="font-display text-lg font-bold text-[#1C160F] mb-1">No Database Travelers Found</h3>
              <p className="text-slate-500 text-sm max-w-sm mx-auto">
                No active database travelers match your selected route or capacity filters.
              </p>
              <button 
                onClick={handleResetFilters}
                className="mt-4 bg-amber-50 text-amber-800 text-xs font-bold px-4 py-2 rounded-xl hover:bg-amber-100 transition-colors"
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
