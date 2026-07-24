import React, { useState, useMemo, useEffect } from 'react';
import { 
  Sparkles, PackagePlus, Search, Compass, Award, ArrowRightLeft, 
  Package, RotateCcw, PackageSearch, PlaneTakeoff, Phone, 
  ShieldAlert, CheckCircle2, ArrowRight, Weight, Zap 
} from 'lucide-react';
import PackageCard from './PackageCard';
import { CATEGORIES } from '../data/initialData';

const DEFAULT_TRAVELERS = [
  {
    id: 1,
    name: 'Kaleb T.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
    rating: '4.8',
    route: 'ADD_TO_DXB',
    flightDate: 'July 28, 2026',
    airline: 'Emirates EK724',
    maxWeight: '8.0',
    allowedCategories: ['Documents', 'Coffee & Spices', 'Clothing'],
    phone: '251911223344'
  },
  {
    id: 2,
    name: 'Sarah Al-M.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
    rating: '5.0',
    route: 'DXB_TO_ADD',
    flightDate: 'August 2, 2026',
    airline: 'FlyDubai FZ803',
    maxWeight: '12.0',
    allowedCategories: ['Electronics', 'Cosmetics', 'Documents'],
    phone: '971501234567'
  },
  {
    id: 3,
    name: 'Marta W.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
    rating: '4.7',
    route: 'ADD_TO_DXB',
    flightDate: 'August 5, 2026',
    airline: 'Ethiopian ET602',
    maxWeight: '5.0',
    allowedCategories: ['Clothing & Textiles', 'Gifts'],
    phone: '251911555444'
  },
  {
    id: 4,
    name: 'Fatima H.',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=100&q=80',
    rating: '4.9',
    route: 'DXB_TO_ADD',
    flightDate: 'August 10, 2026',
    airline: 'Emirates EK723',
    maxWeight: '15.0',
    allowedCategories: ['Cosmetics', 'Gifts', 'Coffee'],
    phone: '971505556667'
  }
];

export default function HomeView({
  requests,
  profiles,
  onSelectPackage,
  onSelectProfile,
  onOfferToCarry,
  onOpenPostModal,
  onOpenChatDrawer
}) {
  const [filterRoute, setFilterRoute] = useState('ALL');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [realShipments, setRealShipments] = useState([]);
  const [urgentShipments, setUrgentShipments] = useState([]);
  const [realTravelers, setRealTravelers] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);

  // Fetch package categories from GET /api/package-categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/package-categories', {
          headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.categories && data.categories.length > 0) {
            setCategoriesList(data.categories);
          }
        }
      } catch (err) {
        console.log('Categories API fetch complete.');
      }
    }
    fetchCategories();
  }, []);

  // Fetch real travels data from GET /api/travelers
  useEffect(() => {
    async function fetchRealTravelers() {
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
          if (data.travelers && data.travelers.length > 0) {
            const mapped = data.travelers.map(t => ({
              id: t.id,
              name: t.name || 'Verified Traveler',
              avatar: t.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
              rating: String(t.rating || '5.0'),
              route: (t.from_city || '').toLowerCase().includes('dubai') ? 'DXB_TO_ADD' : 'ADD_TO_DXB',
              flightDate: t.date || 'Upcoming Flight',
              airline: 'Verified Airline Flight',
              maxWeight: String(t.available_weight || '10.0'),
              allowedCategories: ['General Cargo', 'Documents', 'Coffee & Gifts'],
              phone: t.phone || '251911223344'
            }));
            setRealTravelers(mapped);
          }
        }
      } catch (err) {
        console.log('Using default travelers on landing page.');
      }
    }
    fetchRealTravelers();
  }, []);

  // Fetch real shipments data from GET /api/shipments/open
  useEffect(() => {
    async function fetchRealShipments() {
      try {
        const response = await fetch('/api/shipments/open', {
          headers: {
            'Accept': 'application/json'
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.shipments && data.shipments.length > 0) {
            const mapped = data.shipments.map(s => ({
              id: s.id || `ship_${Date.now()}`,
              title: s.receiver_name ? `Shipment for ${s.receiver_name}` : `Cargo (${s.from_city || 'ADD'} ➔ ${s.to_city || 'DXB'})`,
              desc: s.description || `P2P cargo transit from ${s.from_city || 'Addis Ababa'} to ${s.to_city || 'Dubai'}.`,
              route: (s.from_city || '').toLowerCase().includes('dubai') ? 'DXB_TO_ADD' : 'ADD_TO_DXB',
              weight: String(s.weight || '1.0'),
              reward: `AED ${(parseFloat(s.weight || 1) * 35).toFixed(0)}`,
              category: 'General Cargo',
              deadline: s.travel_date_label || 'Needed soon',
              img: s.cover_image || 'photo-1447933601403-0c6688de566e',
              status: 'pending',
              is_urgent: Boolean(s.is_urgent),
              phone: '251911223344',
              sender: s.sender_display || 'You'
            }));
            setRealShipments(mapped);
          }
        }
      } catch (err) {
        console.log('Using default requests on landing page.');
      }
    }
    fetchRealShipments();
  }, []);

  // Fetch urgent shipments from GET /api/shipments/urgent
  useEffect(() => {
    async function fetchUrgentShipments() {
      try {
        const response = await fetch('/api/shipments/urgent', {
          headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.shipments && data.shipments.length > 0) {
            const mapped = data.shipments.map(s => ({
              id: s.id || `urgent_${Date.now()}`,
              title: s.receiver_name ? `Shipment for ${s.receiver_name}` : `Urgent Cargo (${s.from_city || 'ADD'} ➔ ${s.to_city || 'DXB'})`,
              desc: s.description || `Urgent P2P cargo transit from ${s.from_city || 'Addis Ababa'} to ${s.to_city || 'Dubai'}.`,
              route: (s.from_city || '').toLowerCase().includes('dubai') ? 'DXB_TO_ADD' : 'ADD_TO_DXB',
              weight: String(s.weight || '1.0'),
              reward: `AED ${(parseFloat(s.weight || 1) * 45).toFixed(0)}`,
              category: 'Urgent Package',
              deadline: s.travel_date_label || 'Needed ASAP',
              img: s.cover_image || 'photo-1586528116311-ad8dd3c8310d',
              status: 'pending',
              is_urgent: true,
              phone: '251911223344',
              sender: s.sender_display || 'Member'
            }));
            setUrgentShipments(mapped);
          }
        }
      } catch (err) {
        console.log('Using default urgent shipments fallback.');
      }
    }
    fetchUrgentShipments();
  }, []);

  const travelersList = realTravelers.length > 0 ? realTravelers : DEFAULT_TRAVELERS;
  const allRequestsList = realShipments.length > 0 ? [...realShipments, ...requests] : requests;

  const handleResetFilters = () => {
    setFilterRoute('ALL');
    setActiveCategory('ALL');
    setSearchQuery('');
  };

  // Featured Urgent Packages (horizontal slider)
  const featuredRequests = useMemo(() => {
    if (urgentShipments.length > 0) return urgentShipments;
    return allRequestsList.filter(r => r.is_urgent).concat(allRequestsList.filter(r => !r.is_urgent)).slice(0, 6);
  }, [urgentShipments, allRequestsList]);

  // Main Feed Filtering
  const filteredRequests = useMemo(() => {
    return allRequestsList.filter(r => {
      const routeMatch = filterRoute === 'ALL' ? true 
                       : filterRoute === 'URGENT' ? Boolean(r.is_urgent)
                       : r.route === filterRoute;
      const catMatch = activeCategory === 'ALL' || r.category === activeCategory;
      const query = searchQuery.toLowerCase().trim();
      const searchMatch = !query || 
        r.title.toLowerCase().includes(query) || 
        r.desc.toLowerCase().includes(query) ||
        r.category.toLowerCase().includes(query);
      return routeMatch && catMatch && searchMatch;
    });
  }, [allRequestsList, filterRoute, activeCategory, searchQuery]);

  return (
    <div className="space-y-12">
      {/* ============ HERO SECTION ============ */}
      <section className="relative overflow-hidden bg-[#1C160F] py-16 sm:py-24 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-[#1C160F] to-[#1C160F] opacity-95"></div>
        <div className="absolute -top-24 -right-24 w-[450px] h-[450px] bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-24 w-[420px] h-[420px] bg-emerald-500/10 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-5 lg:px-8 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase text-amber-300 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Peer-to-Peer Shipping (Addis Ababa ⇄ Dubai)
            </span>
            
            <h1 className="font-display mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
              Send packages via travelers,<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-emerald-300">
                fly and earn rewards.
              </span>
            </h1>

            <p className="mt-6 text-slate-300 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Got flight tickets? Deliver local packages between Ethiopia and UAE to subsidize your trip. Need something shipped quickly? Find a verified traveler heading your way.
            </p>

            <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-4">
              <button 
                onClick={onOpenPostModal} 
                className="bg-amber-500 hover:bg-amber-400 text-[#1C160F] font-bold px-6 py-3.5 rounded-xl transition-all shadow-lg flex items-center gap-2"
              >
                <PackagePlus className="w-5 h-5" /> Send a Package
              </button>
              <a 
                href="#requests-section" 
                className="bg-white/10 hover:bg-white/20 border border-white/10 text-white font-semibold px-6 py-3.5 rounded-xl transition-all flex items-center gap-2"
              >
                <Search className="w-5 h-5" /> Browse Requests
              </a>
            </div>
          </div>

          {/* ACTIVE AIR CORRIDOR GRAPHIC */}
          <div className="lg:col-span-5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber-400" />
                <span className="text-sm font-semibold tracking-wide uppercase text-slate-200">
                  Active Air Corridor
                </span>
              </div>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-medium">
                Live flight status
              </span>
            </div>

            <div className="relative w-full h-[180px] bg-slate-900/40 rounded-xl overflow-hidden border border-white/5 flex items-center justify-center">
              <svg className="w-full h-[120px] px-6 z-10" viewBox="0 0 320 120" fill="none">
                <defs>
                  <linearGradient id="flight-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#1F8F55" stopOpacity="0.2" />
                    <stop offset="50%" stopColor="#DBAE3E" stopOpacity="1" />
                    <stop offset="100%" stopColor="#C6952A" stopOpacity="0.2" />
                  </linearGradient>
                </defs>

                {/* Addis Node */}
                <circle cx="50" cy="85" r="16" fill="#1F8F55" opacity="0.2" />
                <circle cx="50" cy="85" r="5" fill="#1F8F55" />
                <circle cx="50" cy="85" r="10" stroke="#1F8F55" strokeWidth="1.5" className="animate-ping origin-center" />
                <text x="50" y="112" fontFamily="'Manrope', sans-serif" fontWeight="bold" fontSize="9" fill="#ffffff" textAnchor="middle">ADD (Addis)</text>

                {/* Dubai Node */}
                <circle cx="270" cy="35" r="16" fill="#C6952A" opacity="0.2" />
                <circle cx="270" cy="35" r="5" fill="#C6952A" />
                <circle cx="270" cy="35" r="10" stroke="#C6952A" strokeWidth="1.5" className="animate-ping origin-center" />
                <text x="270" y="15" fontFamily="'Manrope', sans-serif" fontWeight="bold" fontSize="9" fill="#ffffff" textAnchor="middle">DXB (Dubai)</text>

                {/* Flight Path Curve */}
                <path d="M 50 85 Q 160 25 270 35" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="4 4" />
                <path d="M 50 85 Q 160 25 270 35" fill="none" stroke="url(#flight-gradient)" strokeWidth="2.5" />

                {/* Live Flight Traveler Indicator */}
                <circle cx="160" cy="42.5" r="4" fill="#DBAE3E" className="animate-ping" />
                <circle cx="160" cy="42.5" r="3" fill="#ffffff" />
              </svg>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-center text-xs">
              <div className="bg-white/5 rounded-lg p-2.5 border border-white/5">
                <p className="text-slate-400">Total Active Requests</p>
                <p className="text-lg font-extrabold font-display text-amber-300 mt-0.5">{allRequestsList.length}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-2.5 border border-white/5">
                <p className="text-slate-400">Active Verified Flyers</p>
                <p className="text-lg font-extrabold font-display text-emerald-300 mt-0.5">{travelersList.length}+</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ ROW 1: FEATURED OPPORTUNITIES ============ */}
      <section className="max-w-7xl mx-auto px-5 lg:px-8 mt-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-red-600 flex items-center gap-1.5 mb-1">
              <Zap className="w-4 h-4 text-red-600 fill-red-600 animate-pulse" /> Featured Opportunities
            </span>
            <h2 className="font-display text-2xl font-extrabold text-[#1C160F]">
              Urgent &amp; High-Reward Packages
            </h2>
            <p className="text-slate-500 text-xs mt-1">
              Directly carry these packages on your flight to earn premium payout rewards.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-semibold hidden sm:inline flex items-center gap-1">
            <ArrowRightLeft className="w-3.5 h-3.5" /> Scroll to browse
          </span>
        </div>

        <div className="flex gap-6 overflow-x-auto scrollbar-none pb-4 -mx-5 px-5 lg:mx-0 lg:px-0">
          {featuredRequests.map(item => (
            <div key={item.id} className="min-w-[280px] sm:min-w-[320px] max-w-[320px] shrink-0">
              <PackageCard 
                item={item} 
                profile={profiles[item.sender]}
                onSelectPackage={onSelectPackage}
                onSelectProfile={onSelectProfile}
                onOfferToCarry={onOfferToCarry}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ============ MAIN SEARCH & FEED ============ */}
      <section id="requests-section" className="max-w-7xl mx-auto px-5 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1 mb-1">
              <Package className="w-3.5 h-3.5" /> Live Cargo List
            </span>
            <h2 className="font-display text-3xl font-extrabold text-[#1C160F]">
              Package delivery requests
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Browse requests from senders. Click user avatars to inspect profiles and verification histories.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Route Filter Pills */}
            <div className="inline-flex bg-white border border-amber-200/60 rounded-xl p-1 shadow-sm shrink-0">
              <button 
                onClick={() => setFilterRoute('ALL')}
                className={`text-xs font-semibold px-4 py-2 rounded-lg transition-all ${
                  filterRoute === 'ALL' ? 'bg-[#1C160F] text-white' : 'text-slate-600 hover:bg-amber-50'
                }`}
              >
                All Routes
              </button>
              <button 
                onClick={() => setFilterRoute('ADD_TO_DXB')}
                className={`text-xs font-semibold px-4 py-2 rounded-lg transition-all ${
                  filterRoute === 'ADD_TO_DXB' ? 'bg-[#1C160F] text-white' : 'text-slate-600 hover:bg-amber-50'
                }`}
              >
                ADD ➔ DXB
              </button>
              <button 
                onClick={() => setFilterRoute('DXB_TO_ADD')}
                className={`text-xs font-semibold px-4 py-2 rounded-lg transition-all ${
                  filterRoute === 'DXB_TO_ADD' ? 'bg-[#1C160F] text-white' : 'text-slate-600 hover:bg-amber-50'
                }`}
              >
                DXB ➔ ADD
              </button>
              <button 
                onClick={() => setFilterRoute('URGENT')}
                className={`text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1 ${
                  filterRoute === 'URGENT' ? 'bg-red-600 text-white shadow-sm' : 'text-red-600 hover:bg-red-50'
                }`}
              >
                <Zap className="w-3.5 h-3.5 fill-current" /> Urgent Only
              </button>
            </div>

            {/* Search Input Box */}
            <div className="relative flex items-center bg-white border border-amber-200/60 rounded-xl px-3.5 py-2 shadow-sm max-w-xs flex-1">
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search (e.g. coffee, phone)" 
                className="text-xs outline-none text-slate-700 bg-transparent w-full" 
              />
            </div>
          </div>
        </div>

        {/* Category Chips Horizontal Scrollbar */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-4 mb-6">
          <button
            onClick={() => setActiveCategory('ALL')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 border transition-all ${
              activeCategory === 'ALL'
                ? 'bg-amber-500 text-[#1C160F] border-amber-500 shadow-xs'
                : 'bg-white text-slate-600 border-amber-200/60 hover:bg-amber-50'
            }`}
          >
            All Items
          </button>
          {(categoriesList.length > 0 ? categoriesList : CATEGORIES).map(cat => (
            <button
              key={cat.id || cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 border transition-all cursor-pointer ${
                activeCategory === cat.name
                  ? 'bg-amber-500 text-[#1C160F] border-amber-500 shadow-xs'
                  : 'bg-white text-slate-600 border-amber-200/60 hover:bg-amber-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Results Count Meta */}
        <div className="flex items-center justify-between border-b border-amber-100/50 pb-3 mb-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {filteredRequests.length} package{filteredRequests.length === 1 ? '' : 's'} waiting
          </p>
          <button 
            onClick={handleResetFilters}
            className="flex items-center gap-1.5 text-xs text-amber-600 font-semibold cursor-pointer hover:underline"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
          </button>
        </div>

        {/* 4-Column Requests Feed Grid */}
        {filteredRequests.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredRequests.map(item => (
              <PackageCard 
                key={item.id} 
                item={item} 
                profile={profiles[item.sender]}
                onSelectPackage={onSelectPackage}
                onSelectProfile={onSelectProfile}
                onOfferToCarry={onOfferToCarry}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16 bg-white rounded-2xl border border-amber-100/60 p-8 shadow-sm">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <PackageSearch className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="font-display text-lg font-bold text-[#1C160F] mb-1">
              No delivery requests found
            </h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              Try resetting your search, checking another route, or post a new request if you are a sender.
            </p>
            <button 
              onClick={handleResetFilters}
              className="mt-4 bg-amber-50 hover:bg-amber-100 text-amber-800 text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </section>

      {/* ============ ROW 3: REAL AVAILABLE TRAVELERS ============ */}
      <section className="max-w-7xl mx-auto px-5 lg:px-8 mt-16 mb-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1.5 mb-1">
              <PlaneTakeoff className="w-3.5 h-3.5" /> Verified Flyers Directory
            </span>
            <h2 className="font-display text-2xl font-extrabold text-[#1C160F]">
              Available Travelers &amp; Transit Agents
            </h2>
            <p className="text-slate-500 text-xs mt-1">
              Directly chat with real verified flyers scheduled on upcoming flights between Addis and Dubai.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-semibold hidden sm:flex items-center gap-1">
            <ArrowRightLeft className="w-3.5 h-3.5" /> Scroll to browse flyers ({travelersList.length})
          </span>
        </div>

        <div className="flex gap-6 overflow-x-auto scrollbar-none pb-4 -mx-5 px-5 lg:mx-0 lg:px-0">
          {travelersList.map((t) => (
            <div key={t.id || t.name} className="min-w-[270px] sm:min-w-[300px] max-w-[300px] shrink-0 bg-white rounded-2xl border border-amber-100 p-5 shadow-sm space-y-3 flex flex-col justify-between hover:border-amber-300 transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                    {t.route === 'ADD_TO_DXB' ? 'ADD ➔ DXB' : 'DXB ➔ ADD'}
                  </span>
                  <span className="text-xs font-bold text-amber-600">★ {t.rating}</span>
                </div>

                <div 
                  onClick={() => onSelectProfile(t.name)}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover border border-amber-200 group-hover:border-amber-500 transition-colors" />
                  <div>
                    <h4 className="font-bold text-sm text-[#1C160F] group-hover:text-amber-600 transition-colors">{t.name}</h4>
                    <p className="text-[10px] text-slate-400">{t.airline} • {t.flightDate}</p>
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Luggage Capacity</p>
                  <p className="font-bold text-[#1C160F] flex items-center gap-1">
                    <Weight className="w-3.5 h-3.5 text-amber-600" /> Up to {t.maxWeight} kg
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <a 
                  href={`https://wa.me/${t.phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-emerald-50 hover:bg-emerald-100 flex items-center justify-center text-emerald-700 border border-emerald-100 transition-colors shrink-0"
                  title="WhatsApp Contact"
                >
                  <Phone className="w-4 h-4" />
                </a>
                <button 
                  onClick={onOpenChatDrawer}
                  className="flex-1 bg-[#1C160F] hover:bg-amber-500 hover:text-[#1C160F] text-white text-xs font-bold py-2 rounded-xl transition-all"
                >
                  Chat &amp; Negotiate
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ HOW IT WORKS SECTION ============ */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-5 lg:px-8 mt-12 mb-16">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <h2 className="font-display text-3xl font-extrabold text-[#1C160F]">
            Simple &amp; Trust-Based P2P Shipping
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            Connecting travelers and package senders directly to avoid high courier fees and long transit delays.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl border border-amber-100 p-6 shadow-sm space-y-4 hover:border-amber-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 font-extrabold text-base flex items-center justify-center shadow-xs">
              1
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-[#1C160F]">Sender Posts Package</h3>
              <p className="text-slate-500 text-xs leading-relaxed mt-1.5">
                Post what you need shipped, which route direction, its weight, and the cash reward offered for the delivery.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl border border-amber-100 p-6 shadow-sm space-y-4 hover:border-amber-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-extrabold text-base flex items-center justify-center shadow-xs">
              2
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-[#1C160F]">Traveler Offers to Carry</h3>
              <p className="text-slate-500 text-xs leading-relaxed mt-1.5">
                An airline traveler on that route accepts the request, prompting a direct secure P2P chat room connection.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl border border-amber-100 p-6 shadow-sm space-y-4 hover:border-amber-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 font-extrabold text-base flex items-center justify-center shadow-xs">
              3
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-[#1C160F]">Chat, Handover &amp; Deliver</h3>
              <p className="text-slate-500 text-xs leading-relaxed mt-1.5">
                Coordinate pickup at airports, inspect contents together, hand over the package, and deliver to release rewards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ SAFETY & COMPLIANCE RULES ============ */}
      <section id="safety" className="max-w-7xl mx-auto px-5 lg:px-8 mb-24">
        <div className="bg-white rounded-3xl border border-amber-100 p-8 sm:p-10 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600 border border-red-100 shadow-sm">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <h2 className="font-display text-2xl font-extrabold text-[#1C160F]">
              Important Safety Guidelines
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 text-xs text-slate-600">
            <div className="space-y-4">
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-[#1C160F] mb-1">Inspect All Content</h4>
                  <p className="leading-relaxed">Travelers must physically inspect all packages before checking them into their luggage. Never accept closed, gift-wrapped, or mystery items.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-[#1C160F] mb-1">Verify Government ID</h4>
                  <p className="leading-relaxed">Use the chat interface to request a verification of the passenger's boarding pass / passport and the sender's local government ID.</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-[#1C160F] mb-1">Check Airport Restrictions</h4>
                  <p className="leading-relaxed">Ensure that the goods do not violate customs regulations of Dubai (UAE) or Addis Ababa (Ethiopia). Strictly observe weight limitations.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-[#1C160F] mb-1">Coordinate Safe Handover</h4>
                  <p className="leading-relaxed">For high-value items, perform handovers in public places (e.g. airport lobbies, registered hotels) and use digital payment escrow systems.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
