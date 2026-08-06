import React, { useState, useMemo, useEffect } from 'react';
import { Search, PackageSearch, Loader2, ArrowDown, SlidersHorizontal } from 'lucide-react';
import FilterSidebar from './FilterSidebar';
import PackageCard from './PackageCard';

export default function PackagesView({ 
  requests, 
  profiles, 
  onSelectPackage, 
  onSelectProfile, 
  onOfferToCarry 
}) {
  const [filterRoute, setFilterRoute] = useState('ALL');
  const [filterCategories, setFilterCategories] = useState([]);
  const [filterMaxWeight, setFilterMaxWeight] = useState(10);
  const [filterMinReward, setFilterMinReward] = useState(0);
  const [filterSearchText, setFilterSearchText] = useState('');
  const [activeSort, setActiveSort] = useState('latest');
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [apiRequests, setApiRequests] = useState([]);

  // Progressive scroll / Infinite loading batch size
  const BATCH_SIZE = 6;
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const normalizeCategory = (category) => String(category || '')
    .trim()
    .toLocaleLowerCase();

  useEffect(() => {
    let isCurrent = true;

    async function fetchOpenShipments() {
      try {
        const response = await fetch('/api/shipments/open', {
          headers: { Accept: 'application/json' }
        });
        if (!response.ok) return;

        const data = await response.json();
        if (!isCurrent || !Array.isArray(data.shipments)) return;

        setApiRequests(data.shipments.map((shipment) => ({
          id: shipment.id,
          category_id: shipment.category_id,
          category: shipment.category_name || 'Uncategorized',
          title: shipment.receiver_name
            ? `Shipment for ${shipment.receiver_name}`
            : `Delivery request (${shipment.from_city || 'Addis Ababa'} → ${shipment.to_city || 'Dubai'})`,
          desc: shipment.description || `Delivery request from ${shipment.from_city || 'Addis Ababa'} to ${shipment.to_city || 'Dubai'}.`,
          sender: shipment.sender_display || 'Member',
          route: (shipment.from_city || '').toLowerCase().includes('dubai') ? 'DXB_TO_ADD' : 'ADD_TO_DXB',
          weight: String(shipment.weight || 0),
          reward: shipment.reward || `AED ${(parseFloat(shipment.weight || 1) * 35).toFixed(0)}`,
          deadline: shipment.travel_date_label || 'Date to be confirmed',
          img: shipment.cover_image || '/assets/No-Image-Found-400x264.png',
          status: 'pending',
          is_urgent: Boolean(shipment.is_urgent),
          phone: shipment.receiver_phone || '',
          createdAt: shipment.posted_at ? Date.parse(shipment.posted_at) : 0
        })));
      } catch {
        // The local request state remains available if the directory API is unavailable.
      }
    }

    fetchOpenShipments();
    return () => { isCurrent = false; };
  }, []);

  const directoryRequests = useMemo(() => {
    const merged = [...apiRequests, ...requests];
    return Array.from(new Map(merged.map((request) => [String(request.id), request])).values());
  }, [apiRequests, requests]);

  // Convert reward string (e.g. AED 120 or ETB 4,000) to numeric for sorting/filtering
  const parseRewardVal = (rewardStr) => {
    if (!rewardStr) return 0;
    const match = rewardStr.replace(/[^0-9]/g, '');
    return match ? parseFloat(match) : 0;
  };

  const handleResetFilters = () => {
    setFilterRoute('ALL');
    setFilterCategories([]);
    setFilterMaxWeight(10);
    setFilterMinReward(0);
    setFilterSearchText('');
    setActiveSort('latest');
    setVisibleCount(BATCH_SIZE);
  };

  // Reset pagination count whenever filter criteria change
  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [filterRoute, filterCategories, filterMaxWeight, filterMinReward, filterSearchText, activeSort]);

  // Filter & Sort Logic
  const filteredPackages = useMemo(() => {
    let result = directoryRequests.filter(r => {
      const routeMatch = filterRoute === 'ALL' || r.route === filterRoute;
      const requestCategoryId = r.category_id == null ? null : String(r.category_id);
      const requestCategoryName = normalizeCategory(r.category || r.category_name);
      const catMatch = filterCategories.length === 0 || filterCategories.some((category) => {
        const normalizedCategory = normalizeCategory(category);
        const categoryMatchesById = requestCategoryId !== null && category === requestCategoryId;
        const categoryMatchesByName = normalizedCategory === requestCategoryName;
        return categoryMatchesById || categoryMatchesByName;
      });
      const weightMatch = parseFloat(r.weight) <= filterMaxWeight;
      
      const numReward = parseRewardVal(r.reward);
      const rewardMatch = numReward >= filterMinReward;

      const query = filterSearchText.toLowerCase().trim();
      const searchMatch = !query || 
                          r.title.toLowerCase().includes(query) || 
                          r.desc.toLowerCase().includes(query) ||
                          String(r.category || r.category_name || '').toLowerCase().includes(query) ||
                          String(r.sender || '').toLowerCase().includes(query);

      return routeMatch && catMatch && weightMatch && rewardMatch && searchMatch;
    });

    if (activeSort === 'reward_desc') {
      result.sort((a, b) => parseRewardVal(b.reward) - parseRewardVal(a.reward));
    } else if (activeSort === 'weight_asc') {
      result.sort((a, b) => parseFloat(a.weight) - parseFloat(b.weight));
    } else {
      // Default 'latest'
      result.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }

    return result;
  }, [
    directoryRequests,
    filterRoute, 
    filterCategories, 
    filterMaxWeight, 
    filterMinReward, 
    filterSearchText, 
    activeSort
  ]);

  // Slice displayed items based on scroll pagination
  const displayedPackages = useMemo(() => {
    return filteredPackages.slice(0, visibleCount);
  }, [filteredPackages, visibleCount]);

  const hasMore = visibleCount < filteredPackages.length;

  const loadMoreItems = () => {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + BATCH_SIZE, filteredPackages.length));
      setIsLoadingMore(false);
    }, 400);
  };

  // Scroll listener for auto infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 350) {
        if (hasMore && !isLoadingMore) {
          loadMoreItems();
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoadingMore, filteredPackages.length]);

  return (
    <main className="max-w-7xl mx-auto px-3.5 sm:px-5 lg:px-8 py-5 sm:py-8">
      {/* Header Banner */}
      <div className="mb-6 sm:mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1 mb-1">
          <Search className="w-3.5 h-3.5" /> Directory Search
        </span>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1C160F]">
          Package Request Directory
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          Refine filters to match lightweight shipment tasks aligning with your travel schedule.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-5 sm:gap-8 items-start">
        {/* Mobile Filter Toggle Button */}
        <div className="lg:hidden col-span-12">
          <button 
            onClick={() => setShowMobileFilter(!showMobileFilter)}
            className="w-full bg-white border border-amber-200 text-[#1C160F] font-bold text-xs py-3 px-4 rounded-2xl flex items-center justify-between shadow-xs mb-2 cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-amber-600" />
              <span>Filter Delivery Requests</span>
            </span>
            <span className="text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-extrabold border border-amber-200">
              {showMobileFilter ? 'Hide Filters ▲' : 'Show Filters ▼'}
            </span>
          </button>
        </div>

        {/* FILTER SIDEBAR (4 cols) */}
        <div className={`${showMobileFilter ? 'block' : 'hidden'} lg:block lg:col-span-4 col-span-12`}>
          <FilterSidebar 
            filterRoute={filterRoute}
            setFilterRoute={setFilterRoute}
            filterCategories={filterCategories}
            setFilterCategories={setFilterCategories}
            filterMaxWeight={filterMaxWeight}
            setFilterMaxWeight={setFilterMaxWeight}
            filterMinReward={filterMinReward}
            setFilterMinReward={setFilterMinReward}
            onResetFilters={handleResetFilters}
          />
        </div>

        {/* CARD GRID FEED (8 cols) */}
        <section className="lg:col-span-8 space-y-4 sm:space-y-6 col-span-12">
          {/* Search & Sort Top Toolbar */}
          <div className="bg-white border border-amber-100 rounded-2xl p-3.5 sm:p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Text Search */}
            <div className="relative flex items-center bg-[#FAF9F6] border border-amber-200/40 rounded-xl px-3.5 py-2.5 max-w-sm w-full">
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input 
                type="text" 
                value={filterSearchText}
                onChange={(e) => setFilterSearchText(e.target.value)}
                placeholder="Search delivery requests" 
                className="text-xs outline-none text-slate-700 bg-transparent w-full" 
              />
            </div>

            {/* Sort dropdown */}
            <div className="flex items-center justify-between sm:justify-start gap-2 shrink-0 w-full sm:w-auto">
              <span className="text-xs text-slate-400 font-semibold">Sort by:</span>
              <select 
                value={activeSort}
                onChange={(e) => setActiveSort(e.target.value)}
                className="border border-amber-200/80 bg-white rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-amber-500 cursor-pointer flex-1 sm:flex-initial"
              >
                <option value="latest">Latest Posted</option>
                <option value="reward_desc">Reward: High to Low</option>
                <option value="weight_asc">Weight: Lightest first</option>
              </select>
            </div>
          </div>

          {/* Results Meta */}
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider pb-1">
            <span>
              Showing {displayedPackages.length} of {filteredPackages.length} package{filteredPackages.length === 1 ? '' : 's'}
            </span>
          </div>

          {/* Grid Feed: 2 columns on mobile, 3 columns on desktop */}
          {displayedPackages.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {displayedPackages.map(item => (
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
                No requests match these filters
              </h3>
              <p className="text-slate-500 text-sm max-w-sm mx-auto">
                Try loosening your weight boundaries, clearing selected categories, or lowering your reward limits.
              </p>
              <button 
                onClick={handleResetFilters}
                className="mt-4 bg-amber-50 hover:bg-amber-100 text-amber-800 text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* Infinite Scroll / Load More Action Control */}
          {filteredPackages.length > 0 && (
            <div className="pt-6 text-center space-y-2">
              {hasMore ? (
                <button 
                  onClick={loadMoreItems}
                  disabled={isLoadingMore}
                  className="inline-flex items-center gap-2 bg-white hover:bg-amber-50 border border-amber-200 text-[#1C160F] px-6 py-3 rounded-xl font-bold text-xs shadow-xs transition-all disabled:opacity-50"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
                      <span>Loading more delivery requests...</span>
                    </>
                  ) : (
                    <>
                      <span>Load More Packages ({filteredPackages.length - visibleCount} remaining)</span>
                      <ArrowDown className="w-4 h-4 text-amber-600" />
                    </>
                  )}
                </button>
              ) : (
                <p className="text-xs text-slate-400 font-semibold italic bg-amber-50/40 rounded-xl py-3 border border-amber-100/50">
                  ✓ All {filteredPackages.length} package requests loaded
                </p>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
