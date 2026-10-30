import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { 
  Sparkles, PackagePlus, Search, Compass, Award, ArrowRightLeft, 
  Package, RotateCcw, PackageSearch, PlaneTakeoff, Phone, 
  ShieldAlert, CheckCircle2, ArrowRight, Weight, Zap 
} from 'lucide-react';
import PackageCard from './PackageCard';
import BannerStrip from './BannerStrip';
import { CATEGORIES } from '../data/initialData';
import { getApiUrl, getStorageUrl } from '../lib/api';

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
  onContactPhone
}) {
  const [filterRoute, setFilterRoute] = useState('ALL');
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [realShipments, setRealShipments] = useState([]);
  const [hasLoadedOpenShipments, setHasLoadedOpenShipments] = useState(false);
  const [nextShipmentPage, setNextShipmentPage] = useState(1);
  const [hasMoreShipments, setHasMoreShipments] = useState(true);
  const [isLoadingMoreShipments, setIsLoadingMoreShipments] = useState(false);
  const [urgentShipments, setUrgentShipments] = useState([]);
  const [realTravelers, setRealTravelers] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const shipmentObserver = useRef(null);
  const shipmentRequest = useRef(null);

  // Fetch package categories from GET /api/package-categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch(getApiUrl('/api/package-categories'), {
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
          if (list.length > 0) {
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
                  photo_url: photoSrc,
                  isRealPhoto: hasPhoto,
                  rating: String(t.rating || '5.0'),
                  route: (t.from_city || '').toLowerCase().includes('dubai') ? 'DXB_TO_ADD' : 'ADD_TO_DXB',
                  flightDate: t.date || 'Upcoming trip',
                  airline: 'Verified flight',
                  maxWeight: String(t.available_weight || '10.0'),
                  allowedCategories: ['Other', 'Documents', 'Coffee & Gifts'],
                  phone: t.phone || '251911223344'
                });
              }
            });

            setRealTravelers(Array.from(uniqueMap.values()));
          }
        }
      } catch (err) {
        console.log('Using default travelers on landing page.', err);
      }
    }
    fetchRealTravelers();
  }, []);

  const fetchOpenShipments = useCallback(async (page) => {
    shipmentRequest.current?.abort();
    const controller = new AbortController();
    shipmentRequest.current = controller;
    setIsLoadingMoreShipments(true);
    try {
      const query = new URLSearchParams({
        page: String(page),
        per_page: '20'
      });

      if (activeCategory !== 'ALL') query.set('category_id', activeCategory);
      if (filterRoute === 'ADD_TO_DXB') {
        query.set('from_city', 'Addis Ababa');
        query.set('to_city', 'Dubai');
      }
      if (filterRoute === 'DXB_TO_ADD') {
        query.set('from_city', 'Dubai');
        query.set('to_city', 'Addis Ababa');
      }
      if (urgentOnly) query.set('is_urgent', '1');

      const response = await fetch(getApiUrl(`/api/shipments/open?${query.toString()}`), {
        headers: {
          'Accept': 'application/json'
        },
        signal: controller.signal
      });
      if (!response.ok) {
        throw new Error(`Unable to load open shipments: ${response.status}`);
      }

      const data = await response.json();
      const mapped = Array.isArray(data.shipments) ? data.shipments.map(s => ({
        id: s.id,
        title: s.receiver_name ? `Shipment for ${s.receiver_name}` : `Cargo (${s.from_city || 'ADD'} ➔ ${s.to_city || 'DXB'})`,
        desc: s.description || `Delivery request from ${s.from_city || 'Addis Ababa'} to ${s.to_city || 'Dubai'}.`,
        route: (s.from_city || '').toLowerCase().includes('dubai') ? 'DXB_TO_ADD' : 'ADD_TO_DXB',
        weight: String(s.weight || '1.0'),
        reward: `AED ${(parseFloat(s.weight || 1) * 35).toFixed(0)}`,
        category: s.category_name || s.category || 'Other',
        category_id: s.category_id ?? null,
        deadline: s.travel_date_label || 'Date to be confirmed',
        img: s.cover_image || '/assets/No-Image-Found-400x264.png',
        status: s.status || 'pending',
            is_urgent: Boolean(s.is_urgent),
            phone: s.receiver_phone || '',
            sender: s.sender_display || 'Member',
            sender_avatar: s.sender_photo || null,
            sender_rating: s.sender_rating ?? null,
            sender_review_count: s.sender_review_count ?? 0
      })) : [];

      setRealShipments(previous => {
        if (page === 1) return mapped;

        const seen = new Set(previous.map(shipment => shipment.id));
        return [...previous, ...mapped.filter(shipment => !seen.has(shipment.id))];
      });
      setHasMoreShipments(Boolean(data.meta?.has_more));
      setNextShipmentPage(page + 1);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.log('Unable to load open shipments.', err);
        setHasMoreShipments(false);
      }
    } finally {
      if (shipmentRequest.current === controller) {
        setHasLoadedOpenShipments(true);
        setIsLoadingMoreShipments(false);
        shipmentRequest.current = null;
      }
    }
  }, [activeCategory, filterRoute, urgentOnly]);

  useEffect(() => {
    setHasMoreShipments(true);
    setNextShipmentPage(1);
    fetchOpenShipments(1);
  }, [fetchOpenShipments]);

  const loadMoreShipmentRef = useCallback((node) => {
    if (shipmentObserver.current) shipmentObserver.current.disconnect();
    if (!node || !hasMoreShipments || isLoadingMoreShipments) return;

    shipmentObserver.current = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        fetchOpenShipments(nextShipmentPage);
      }
    }, { rootMargin: '240px' });

    shipmentObserver.current.observe(node);
  }, [fetchOpenShipments, hasMoreShipments, isLoadingMoreShipments, nextShipmentPage]);

  useEffect(() => () => {
    shipmentObserver.current?.disconnect();
    shipmentRequest.current?.abort();
  }, []);

  // Fetch urgent shipments from GET /api/shipments/urgent
  useEffect(() => {
    async function fetchUrgentShipments() {
      try {
        const response = await fetch(getApiUrl('/api/shipments/urgent'), {
          headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.shipments && data.shipments.length > 0) {
            const mapped = data.shipments.map(s => ({
              id: s.id || `urgent_${Date.now()}`,
              title: s.receiver_name ? `Shipment for ${s.receiver_name}` : `Urgent Cargo (${s.from_city || 'ADD'} ➔ ${s.to_city || 'DXB'})`,
              desc: s.description || `Priority delivery request from ${s.from_city || 'Addis Ababa'} to ${s.to_city || 'Dubai'}.`,
              route: (s.from_city || '').toLowerCase().includes('dubai') ? 'DXB_TO_ADD' : 'ADD_TO_DXB',
              weight: String(s.weight || '1.0'),
              reward: s.reward || `AED ${(parseFloat(s.weight || 1) * 45).toFixed(0)}`,
              category: s.category_name || s.category || 'Other',
              category_id: s.category_id ?? null,
              deadline: s.travel_date_label || 'Priority timing requested',
              img: s.cover_image || (s.product_images && s.product_images[0]) || '/assets/No-Image-Found-400x264.png',
              status: s.status || 'pending',
              is_urgent: true,
              phone: s.receiver_phone || '251911223344',
              sender: s.sender_display || 'Member',
              sender_avatar: s.sender_photo || null,
              sender_rating: s.sender_rating ?? null,
              sender_review_count: s.sender_review_count ?? 0
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

  const travelersList = useMemo(() => {
    const rawList = realTravelers.length > 0 ? realTravelers : (DEFAULT_TRAVELERS || []);
    const uniqueMap = new Map();
    rawList.forEach(t => {
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
          ...t,
          photo: photoSrc,
          isRealPhoto: hasPhoto
        });
      }
    });
    return Array.from(uniqueMap.values());
  }, [realTravelers]);
  // Until the API responds, keep the existing request data as a loading fallback.
  // Afterwards, the feed must represent the server's open-shipment inventory,
  // including the valid case where it is empty.
  const allRequestsList = hasLoadedOpenShipments ? realShipments : requests;

  const normalizeCategory = (category) => String(category || '').trim().toLowerCase();
  const getCategoryDisplayName = (category) => {
    if (!category || category === 'ALL') return 'ALL';
    if (typeof category === 'string') return category;
    return String(category);
  };

  const handleResetFilters = () => {
    setFilterRoute('ALL');
    setUrgentOnly(false);
    setActiveCategory('ALL');
    setSearchQuery('');
  };

  // Featured Urgent & High-Reward Packages (Only items with is_urgent = true)
  const featuredRequests = useMemo(() => {
    const parseRewardVal = (rewardStr) => {
      if (!rewardStr) return 0;
      const match = String(rewardStr).replace(/[^0-9.]/g, '');
      return match ? parseFloat(match) : 0;
    };

    const combined = [...urgentShipments, ...allRequestsList];
    const urgentOnly = combined.filter(r => r && Boolean(r.is_urgent));

    const uniqueMap = new Map();
    urgentOnly.forEach(item => {
      if (item && item.id && !uniqueMap.has(item.id)) {
        uniqueMap.set(item.id, item);
      }
    });

    const sorted = Array.from(uniqueMap.values()).sort((a, b) => {
      return parseRewardVal(b.reward) - parseRewardVal(a.reward);
    });

    return sorted.slice(0, 4);
  }, [urgentShipments, allRequestsList]);

  // Main Feed Filtering
  const filteredRequests = useMemo(() => {
    return allRequestsList.filter(r => {
      if (!r) return false;

      // 1. Route match (ALL, ADD_TO_DXB, DXB_TO_ADD, URGENT)
      const routeMatch = filterRoute === 'ALL' ? true 
                       : filterRoute === 'URGENT' ? Boolean(r.is_urgent)
                       : (r.route === filterRoute);

      // 2. Category match strictly by category_id
      let catMatch = true;
      if (activeCategory !== 'ALL') {
        const targetCatId = String(activeCategory);
        catMatch = r.category_id != null && String(r.category_id) === targetCatId;
      }

      // 3. Search match
      const query = searchQuery.toLowerCase().trim();
      const titleText = (r.title || '').toLowerCase();
      const descText = (r.desc || '').toLowerCase();
      const catText = (r.category || '').toLowerCase();
      const senderText = (r.sender || '').toLowerCase();
      const routeText = (r.route || '').toLowerCase();

      const searchMatch = !query || 
        titleText.includes(query) || 
        descText.includes(query) ||
        catText.includes(query) ||
        senderText.includes(query) ||
        routeText.includes(query);

      return routeMatch && catMatch && searchMatch;
    });
  }, [allRequestsList, filterRoute, activeCategory, searchQuery]);

  return (
    <div className="space-y-12">
      {/* ============ HERO SECTION ============ */}
      <section className="relative overflow-hidden bg-[#FBF7F0] py-20 sm:py-28 text-[#1C2B22] border-b border-[#E8DFD0]">
        <div className="relative max-w-7xl mx-auto px-5 lg:px-8 grid lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-7 text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase text-[#14532D] border border-[#E8DFD0] px-3.5 py-1.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-[#C2412D]" />
              Verified Traveler Delivery · Addis Ababa ⇄ Dubai
            </span>
            
            <h1 className="font-display mt-6 text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-[-0.04em] leading-[1.05] text-[#1C2B22]">
              Move what matters with<br className="hidden sm:inline" />
              <span> verified travelers.</span>
            </h1>

            <p className="mt-6 text-[#6B6B6B] text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Connect with verified travelers for package delivery between Ethiopia and the UAE.
            </p>

            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 sm:gap-4">
              <button 
                onClick={onOpenPostModal} 
                className="bg-[#14532D] hover:bg-[#0F3F22] text-white font-semibold px-6 py-3.5 rounded-[10px] transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <PackagePlus className="w-5 h-5" /> Post a Delivery Request
              </button>
              <a 
                href="#requests-section" 
                className="bg-transparent hover:bg-[#E6EFE9] border border-[#14532D] text-[#14532D] font-semibold px-6 py-3.5 rounded-[10px] transition-all flex items-center justify-center gap-2 w-full sm:w-auto text-center"
              >
                <Search className="w-5 h-5" /> Browse Delivery Requests
              </a>
            </div>
          </div>

          {/* ACTIVE AIR CORRIDOR GRAPHIC */}
          <div className="lg:col-span-5 bg-white rounded-[14px] border border-[#E8DFD0] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#C2412D]" />
                <span className="text-sm font-semibold tracking-wide uppercase text-[#1C2B22]">
                  Delivery Corridor
                </span>
              </div>
              <span className="text-xs bg-[#E6EFE9] text-[#14532D] px-2 py-0.5 rounded-full font-medium border border-[#E8DFD0]">
                Addis Ababa ⇄ Dubai
              </span>
            </div>

            <div className="relative w-full h-[180px] bg-[#FBF7F0] rounded-[10px] overflow-hidden border border-[#E8DFD0] flex items-center justify-center">
              <svg className="w-full h-[120px] px-6 z-10" viewBox="0 0 320 120" fill="none">
                {/* Addis Node */}
                <circle cx="50" cy="85" r="12" fill="#C2412D" opacity="0.2" />
                <circle cx="50" cy="85" r="4" fill="#C2412D" />
                <text x="50" y="112" fontFamily="'Inter', sans-serif" fontWeight="600" fontSize="9" fill="#1C2B22" textAnchor="middle">ADDIS ABABA</text>

                {/* Dubai Node */}
                <circle cx="270" cy="35" r="12" fill="#C2412D" opacity="0.2" />
                <circle cx="270" cy="35" r="4" fill="#C2412D" />
                <text x="270" y="15" fontFamily="'Inter', sans-serif" fontWeight="600" fontSize="9" fill="#1C2B22" textAnchor="middle">DUBAI</text>

                {/* Flight Path Curve */}
                <path d="M 50 85 Q 160 25 270 35" fill="none" stroke="#C2412D" strokeWidth="2" strokeDasharray="5 6" />

                {/* Live Flight Traveler Indicator */}
                <circle cx="160" cy="42.5" r="3" fill="#C2412D" />
              </svg>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-center text-xs">
              <div className="bg-white rounded-[10px] p-2.5 border border-[#E5E5E3]">
              <p className="text-[#6B6B6B]">Open Delivery Requests</p>
                <p className="text-lg font-extrabold font-display text-[#0A0A0A] mt-0.5">{allRequestsList.length}</p>
              </div>
              <div className="bg-white rounded-[10px] p-2.5 border border-[#E5E5E3]">
              <p className="text-[#6B6B6B]">Verified Travelers</p>
                <p className="text-lg font-extrabold font-display text-[#2F5BFF] mt-0.5">{travelersList.length}+</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <BannerStrip placement="home" />

      {/* ============ ROW 1: FEATURED OPPORTUNITIES ============ */}
      {featuredRequests.length > 0 && (
        <section className="max-w-7xl mx-auto px-5 lg:px-8 mt-12">
          <div className="flex items-end justify-between mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1.5 mb-1">
                <Zap className="w-4 h-4 text-amber-600 fill-amber-500" /> Featured Opportunities
              </span>
              <h2 className="font-display text-2xl font-extrabold text-[#1C160F]">
                Priority Delivery Requests
              </h2>
              <p className="text-slate-500 text-xs mt-1">
                Browse time-sensitive requests that offer higher delivery rewards.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-semibold hidden sm:inline flex items-center gap-1">
                <ArrowRightLeft className="w-3.5 h-3.5" /> Browse requests
            </span>
          </div>

          {/* Urgent & High-Reward Package Grid (2 columns on mobile) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {featuredRequests.map(item => (
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
        </section>
      )}

      {/* ============ MAIN FEED ============ */}
      <section id="requests-section" className="max-w-7xl mx-auto px-5 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-3 border-b border-amber-100/60">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1 mb-1">
              <Package className="w-3.5 h-3.5" /> Open Delivery Requests
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1C160F]">
              Package delivery requests
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Browse packages from senders and arrange a safe handover.
            </p>
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0">
            {allRequestsList.length} package{allRequestsList.length === 1 ? '' : 's'} available
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-3">
          {[
            { value: 'ALL', label: 'All routes' },
            { value: 'ADD_TO_DXB', label: 'Addis Ababa → Dubai' },
            { value: 'DXB_TO_ADD', label: 'Dubai → Addis Ababa' }
          ].map((route) => (
            <button
              key={route.value}
              type="button"
              onClick={() => setFilterRoute(route.value)}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                filterRoute === route.value
                  ? 'border-[#1C160F] bg-[#1C160F] text-white'
                  : 'border-amber-200 bg-white text-slate-600 hover:bg-amber-50'
              }`}
            >
              {route.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setUrgentOnly((current) => !current)}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-colors ${
              urgentOnly
                ? 'border-red-600 bg-red-600 text-white'
                : 'border-red-200 bg-white text-red-600 hover:bg-red-50'
            }`}
          >
            Urgent only
          </button>
        </div>

        {categoriesList.length > 0 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-5">
            <button
              type="button"
              onClick={() => setActiveCategory('ALL')}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                activeCategory === 'ALL'
                  ? 'border-amber-500 bg-amber-500 text-[#1C160F]'
                  : 'border-amber-200 bg-white text-slate-600 hover:bg-amber-50'
              }`}
            >
              All categories
            </button>
            {categoriesList.map((category) => {
              const categoryId = String(category.id);
              const isActive = activeCategory === categoryId;

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setActiveCategory(categoryId)}
                  className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    isActive
                      ? 'border-amber-500 bg-amber-500 text-[#1C160F]'
                      : 'border-amber-200 bg-white text-slate-600 hover:bg-amber-50'
                  }`}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        )}

        {/* 4-Column Requests Feed Grid (2 columns on mobile) */}
        {allRequestsList.length > 0 ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {allRequestsList.map(item => (
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

            <div
              ref={hasMoreShipments ? loadMoreShipmentRef : undefined}
              className="py-8 text-center text-xs font-semibold text-slate-400"
            >
              {isLoadingMoreShipments
                ? 'Loading more packages…'
                : hasMoreShipments
                  ? 'Scroll to see more packages'
                  : 'You have reached the end'}
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="text-center py-16 bg-white rounded-2xl border border-amber-100/60 p-8 shadow-sm">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <PackageSearch className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="font-display text-lg font-bold text-[#1C160F] mb-1">
              No packages found
            </h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              There are no packages available right now. Please check again soon or post your own request.
            </p>
          </div>
        )}
      </section>

      {/* ============ ROW 3: REAL AVAILABLE TRAVELERS ============ */}
      <section className="max-w-7xl mx-auto px-5 lg:px-8 mt-16 mb-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1.5 mb-1">
              <PlaneTakeoff className="w-3.5 h-3.5" /> Trusted travelers
            </span>
            <h2 className="font-display text-2xl font-extrabold text-[#1C160F]">
              Travelers ready to help
            </h2>
            <p className="text-slate-500 text-xs mt-1">
              Meet verified travelers flying between Addis Ababa and Dubai.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-semibold hidden sm:flex items-center gap-1">
            <ArrowRightLeft className="w-3.5 h-3.5" /> Browse travelers ({travelersList.length})
          </span>
        </div>

        <div className="flex gap-6 overflow-x-auto scrollbar-none pb-4 -mx-5 px-5 lg:mx-0 lg:px-0">
          {travelersList.map((t) => (
            <div key={t.id || t.name} className="min-w-[270px] sm:min-w-[300px] max-w-[300px] shrink-0 bg-white rounded-[14px] border border-[#E8DFD0] p-5 shadow-[0_4px_18px_rgba(28,43,34,0.06)] space-y-3 flex flex-col justify-between hover:-translate-y-0.5 hover:border-[#14532D] hover:shadow-[0_8px_24px_rgba(28,43,34,0.12)] transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-[#14532D] bg-[#E6EFE9] px-2 py-0.5 rounded border border-[#E8DFD0]">
                    {t.route === 'ADD_TO_DXB' ? 'ADD ➔ DXB' : 'DXB ➔ ADD'}
                  </span>
                  <span className="text-xs font-bold text-amber-600">★ {t.rating}</span>
                </div>

                <div 
                  onClick={() => onSelectProfile(t)}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  {t.isRealPhoto ? (
                    <img 
                      src={t.photo} 
                      alt={t.name} 
                      className="w-12 h-12 rounded-full object-cover border border-[#E8DFD0] group-hover:border-[#14532D] transition-colors shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#14532D] text-white font-extrabold text-base flex items-center justify-center border border-[#E8DFD0] group-hover:border-[#14532D] transition-colors shrink-0">
                      {t.name ? t.name.trim().charAt(0).toUpperCase() : 'T'}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-sm text-[#1C2B22] group-hover:text-[#14532D] transition-colors">{t.name}</h4>
                    <p className="text-[10px] text-slate-400">{t.airline} • {t.flightDate}</p>
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-1 bg-[#E6EFE9] border border-[#E8DFD0] p-3 rounded-[10px]">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Luggage Capacity</p>
                  <p className="font-bold text-[#1C2B22] flex items-center gap-1">
                    <Weight className="w-3.5 h-3.5 text-[#14532D]" /> Up to {t.maxWeight} kg
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => onContactPhone && onContactPhone(t)}
                  className="bg-[#14532D] hover:bg-[#0F3F22] text-white text-xs font-semibold px-3 py-2 rounded-[10px] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 text-white" /> Contact
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
            How it works
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            Send your package with a trusted traveler on a planned trip.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl border border-amber-100 p-6 shadow-sm space-y-4 hover:border-amber-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 font-extrabold text-base flex items-center justify-center shadow-xs">
              1
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-[#1C160F]">Post your package</h3>
              <p className="text-slate-500 text-xs leading-relaxed mt-1.5">
                Tell us what you are sending, where it is going, and how much space it needs.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl border border-amber-100 p-6 shadow-sm space-y-4 hover:border-amber-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-extrabold text-base flex items-center justify-center shadow-xs">
              2
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-[#1C160F]">Match with a Traveler</h3>
              <p className="text-slate-500 text-xs leading-relaxed mt-1.5">
                A verified traveler on the relevant route can express interest, allowing you to coordinate securely through the platform.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl border border-amber-100 p-6 shadow-sm space-y-4 hover:border-amber-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 font-extrabold text-base flex items-center justify-center shadow-xs">
              3
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-[#1C160F]">Coordinate and Deliver</h3>
              <p className="text-slate-500 text-xs leading-relaxed mt-1.5">
                Arrange a safe handover, check the package together, and complete the delivery.
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
              Safety and Compliance Guidelines
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 text-xs text-slate-600">
            <div className="space-y-4">
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-[#1C160F] mb-1">Inspect Every Item</h4>
                  <p className="leading-relaxed">Travelers must inspect each item before placing it in their luggage. Do not accept packages whose contents cannot be verified.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-[#1C160F] mb-1">Verify Identity and Travel Details</h4>
                  <p className="leading-relaxed">Use secure messages to confirm the traveler’s trip and the sender’s identification before meeting.</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-[#1C160F] mb-1">Check Airport Restrictions</h4>
                  <p className="leading-relaxed">Confirm that items comply with applicable customs, airline, and baggage requirements for the UAE and Ethiopia, including weight limits.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-[#1C160F] mb-1">Coordinate Safe Handover</h4>
                  <p className="leading-relaxed">For valuable items, meet in a public place such as an airport lobby and use a secure payment method.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
