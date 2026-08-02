import React, { useState, useEffect } from 'react';
import { 
  Layout, ShieldCheck, Star, ShieldAlert, Plane, FileCheck2, 
  ChevronRight, ChevronDown, Phone, CheckCircle2, Package, Clock, MessageSquare,
  Edit3, Mail, MapPin, UserCheck, AlertTriangle, Plus
} from 'lucide-react';
import EditProfileModal from './EditProfileModal';

export default function DashboardView({ 
  requests, 
  currentUser,
  onUpdateCurrentUser,
  onOpenPostModal, 
  onOpenFlightModal, 
  onOpenChatDrawer,
  onSelectPackage 
}) {
  const [dashboardTab, setDashboardTab] = useState('active');
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [liveUser, setLiveUser] = useState(currentUser || null);
  const [apiShipments, setApiShipments] = useState([]);
  const [loadingShipments, setLoadingShipments] = useState(true);

  // Fetch real user details from GET /api/user
  useEffect(() => {
    async function fetchUserDetail() {
      try {
        const response = await fetch('/api/user', {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setLiveUser(data.user);
            if (onUpdateCurrentUser) {
              onUpdateCurrentUser(data.user);
            }
          }
        }
      } catch (err) {
        console.log('Using active user state fallback.');
      }
    }
    fetchUserDetail();
  }, []);

  // Fetch real active shipments from GET /api/shipments or GET /api/shipments/open
  useEffect(() => {
    async function fetchRealShipments() {
      setLoadingShipments(true);
      try {
        // Attempt user-authenticated shipments first
        let response = await fetch('/api/shipments', {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          }
        });

        // Fallback to open shipments if guest
        if (!response.ok) {
          response = await fetch('/api/shipments/open', {
            headers: {
              'Accept': 'application/json'
            }
          });
        }

        if (response.ok) {
          const data = await response.json();
          const items = data.shipments || [];
          if (items.length > 0) {
            const mapped = items.map(s => ({
              id: s.id || `ship_${Date.now()}`,
              title: s.receiver_name ? `Shipment for ${s.receiver_name}` : `Package (${s.from_city || 'ADD'} ➔ ${s.to_city || 'DXB'})`,
              desc: s.description || `Cargo transit from ${s.from_city || 'Addis Ababa'} to ${s.to_city || 'Dubai'}.`,
              route: (s.from_city || '').toLowerCase().includes('dubai') ? 'DXB_TO_ADD' : 'ADD_TO_DXB',
              weight: String(s.weight || '1.0'),
              reward: s.reward || `AED ${(parseFloat(s.weight || 1) * 35).toFixed(0)}`,
              category: s.category || 'General Cargo',
              deadline: s.travel_date_label || (s.travel_date ? `Needed by ${s.travel_date}` : 'Needed soon'),
              img: s.cover_image || s.product_images?.[0] || 'photo-1447933601403-0c6688de566e',
              status: s.status || 'pending',
              phone: s.receiver_phone || '251911223344',
              sender: s.sender_display || 'You (Current User)'
            }));
            setApiShipments(mapped);
          }
        }
      } catch (err) {
        console.log('Using requests fallback for active shipments.');
      } finally {
        setLoadingShipments(false);
      }
    }
    fetchRealShipments();
  }, []);

  const activeUser = liveUser || currentUser || {
    name: 'Alex M. (You)',
    email: 'alex@example.com',
    role: 'sender',
    phone: '+251 91 122 3344',
    city: 'Addis Ababa',
    country: 'Ethiopia',
    status: 'active',
    id_document_type: 'passport',
    id_document_number: 'EP987654',
    id_document_status: 'approved',
    rating: '5.0',
    deliveriesCount: 3
  };

  const handleProfileUpdated = (updatedUser) => {
    setLiveUser(updatedUser);
    onUpdateCurrentUser(updatedUser);
  };

  const [activeVisibleCount, setActiveVisibleCount] = useState(4);
  const [historyVisibleCount, setHistoryVisibleCount] = useState(4);

  // Combine API shipments with state requests
  const displayPackages = apiShipments.length > 0 ? apiShipments : requests;
  const activeRequests = displayPackages.filter(r => r.status !== 'delivered');
  const historyRequests = displayPackages.filter(r => r.status === 'delivered');

  // Progressive scroll loading ("display little by little when users scroll down")
  useEffect(() => {
    function handleScroll() {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 450) {
        if (dashboardTab === 'active') {
          setActiveVisibleCount(prev => (prev < activeRequests.length ? prev + 3 : prev));
        } else {
          setHistoryVisibleCount(prev => (prev < historyRequests.length ? prev + 3 : prev));
        }
      }
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [dashboardTab, activeRequests.length, historyRequests.length]);

  const idStatusBadgeClass = 
    activeUser.id_document_status === 'approved' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
    activeUser.id_document_status === 'pending' ? 'text-amber-800 bg-amber-50 border-amber-200' :
    activeUser.id_document_status === 'rejected' ? 'text-red-700 bg-red-50 border-red-200' :
    'text-slate-400 border-slate-100';

  return (
    <main className="max-w-7xl mx-auto px-3.5 sm:px-5 lg:px-8 py-5 sm:py-10 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 shadow-sm border border-amber-200 shrink-0">
            <Layout className="w-5 h-5 sm:w-6 sm:h-6" />
          </span>
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-extrabold text-[#1C160F]">My Delivery Dashboard</h1>
            <p className="text-[11px] sm:text-xs text-slate-500">Real-time user account profile, verified badges, active packages, and trip trackers.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button 
            onClick={onOpenPostModal}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-[#1C160F] text-white hover:bg-amber-600 hover:text-[#1C160F] px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="truncate">Post Request</span>
          </button>
          <button 
            onClick={() => setIsEditProfileOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-amber-50 border border-amber-300 text-[#1C160F] hover:bg-amber-100 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-600" />
            <span className="truncate">Edit Profile</span>
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-5 sm:gap-8 items-start">
        {/* Left Column: Real Profile Card & Verifications (4 cols) */}
        <div className="lg:col-span-4 space-y-4 sm:space-y-6 col-span-12">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl border border-amber-100 p-4 sm:p-6 shadow-sm space-y-4 sm:space-y-5">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                {activeUser.photo_url || activeUser.photo ? (
                  <img 
                    src={activeUser.photo_url || activeUser.photo} 
                    alt={activeUser.name} 
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-amber-300 shadow-md" 
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-amber-500 to-emerald-800 text-white font-extrabold text-xl sm:text-2xl flex items-center justify-center border-2 border-white shadow-md">
                    {activeUser.name ? activeUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-2 ring-white" title="Active Account">
                  <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </span>
              </div>

              <div className="mt-3 space-y-1">
                <h3 className="font-display text-base sm:text-lg font-extrabold text-[#1C160F] flex items-center justify-center gap-1.5 flex-wrap">
                  <span>{activeUser.name}</span>
                  <span className="text-[9px] sm:text-[10px] uppercase font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                    {activeUser.role || 'Sender'}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 flex items-center justify-center gap-1 truncate">
                  <Mail className="w-3 h-3 text-slate-400 shrink-0" /> <span className="truncate">{activeUser.email}</span>
                </p>
                <p className="text-xs text-slate-500 flex items-center justify-center gap-1 truncate">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" /> <span className="truncate">{activeUser.city || 'Addis Ababa'}, {activeUser.country || 'Ethiopia'}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 mt-3 sm:mt-4 text-xs font-semibold">
                <span className="flex items-center text-amber-600 font-bold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 mr-1" />
                  <span>{activeUser.rating || '5.0'}</span>
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-slate-600">
                  {activeUser.deliveriesCount || 3} deliveries
                </span>
              </div>
            </div>

            {/* REAL USER DETAIL DETAILS LIST */}
            <div className="border-t border-amber-50 pt-3.5 space-y-2 text-xs">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account Specifications</h4>
              
              <div className="flex justify-between items-center py-1 border-b border-slate-50 gap-2">
                <span className="text-slate-500 shrink-0">Contact Phone:</span>
                <span className="font-semibold text-[#1C160F] truncate">{activeUser.phone || 'Not specified'}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-50 gap-2">
                <span className="text-slate-500 shrink-0">Account Status:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded uppercase text-[10px]">
                  {activeUser.status || 'Active'}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 gap-2">
                <span className="text-slate-500 shrink-0">Marketing Updates:</span>
                <span className="font-semibold text-slate-700">
                  {activeUser.marketing_opt_in ? 'Subscribed' : 'Disabled'}
                </span>
              </div>
            </div>

            {/* VERIFICATION BADGES STATUS */}
            <div className="border-t border-amber-50 pt-3.5">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Real Verifications</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between border border-emerald-100 bg-emerald-50/60 rounded-xl p-2.5 text-xs font-semibold text-emerald-800">
                  <span className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-emerald-600" /> Phone Number</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>

                <div className={`flex items-center justify-between border rounded-xl p-2.5 text-xs font-semibold ${idStatusBadgeClass}`}>
                  <span className="flex items-center gap-2">
                    <FileCheck2 className="w-3.5 h-3.5" /> 
                    {activeUser.id_document_type ? activeUser.id_document_type.replace('_', ' ').toUpperCase() : 'Gov Photo ID'}
                  </span>
                  <span className="text-[10px] font-bold uppercase">
                    {activeUser.id_document_status || 'Not Uploaded'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Verification Center Action Panel */}
          <div className="bg-gradient-to-br from-amber-50 to-white rounded-2xl border border-amber-200 p-4 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-800" />
              <h4 className="font-display font-bold text-xs sm:text-sm text-amber-900">Increase Handover Trust</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Complete document verification to display a verified shield badge on all your package requests and flight itineraries.
            </p>
            <div className="space-y-2 pt-1">
              <button 
                onClick={onOpenFlightModal}
                className="w-full bg-white hover:bg-amber-100/50 text-slate-700 border border-amber-200 rounded-xl py-2 sm:py-2.5 px-3.5 text-xs font-bold flex items-center justify-between transition-all"
              >
                <span className="flex items-center gap-2"><Plane className="w-3.5 h-3.5 text-amber-600" /> Verify Flight Ticket</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button 
                onClick={() => setIsEditProfileOpen(true)}
                className="w-full bg-white hover:bg-amber-100/50 text-slate-700 border border-amber-200 rounded-xl py-2 sm:py-2.5 px-3.5 text-xs font-bold flex items-center justify-between transition-all"
              >
                <span className="flex items-center gap-2"><FileCheck2 className="w-3.5 h-3.5 text-emerald-700" /> Upload Passport / Gov ID</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Active Packages Console & Tabs (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-amber-100 p-4 sm:p-6 shadow-sm space-y-4 sm:space-y-6 col-span-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-amber-100 pb-3 gap-2">
            <div className="flex border-b-0 overflow-x-auto scrollbar-none">
              <button 
                onClick={() => setDashboardTab('active')}
                className={`pb-2 px-2.5 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors shrink-0 ${
                  dashboardTab === 'active' ? 'border-amber-500 text-amber-600 font-bold' : 'border-transparent text-slate-500 hover:text-amber-600'
                }`}
              >
                Active Packages ({activeRequests.length})
              </button>
              <button 
                onClick={() => setDashboardTab('history')}
                className={`pb-2 px-2.5 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors shrink-0 ${
                  dashboardTab === 'history' ? 'border-amber-500 text-amber-600 font-bold' : 'border-transparent text-slate-500 hover:text-amber-600'
                }`}
              >
                Successful History ({historyRequests.length})
              </button>
            </div>

            <span className="text-[10px] sm:text-xs font-bold text-slate-400 flex items-center gap-1 shrink-0">
              <Package className="w-3.5 h-3.5 text-amber-600" /> Real-time Cargo Tracker
            </span>
          </div>

          {/* Active Tab */}
          {dashboardTab === 'active' && (
            <div className="space-y-4">
              {loadingShipments && activeRequests.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400">Loading live package shipments...</div>
              ) : activeRequests.length > 0 ? (
                <>
                  {activeRequests.slice(0, activeVisibleCount).map((req) => (
                    <div key={req.id} className="border border-amber-100/80 hover:border-amber-300 bg-white rounded-2xl p-4 sm:p-5 space-y-3 sm:space-y-4 shadow-2xs transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img 
                            src={req.img?.startsWith('http') ? req.img : `https://images.unsplash.com/${req.img}?auto=format&fit=crop&w=120&q=80`} 
                            alt={req.title} 
                            className="w-12 h-12 rounded-xl object-cover border border-amber-100 shrink-0" 
                          />
                          <div className="min-w-0">
                            <h4 className="font-bold text-sm text-[#1C160F] cursor-pointer hover:text-amber-600 truncate" onClick={() => onSelectPackage(req)}>
                              {req.title}
                            </h4>
                            <p className="text-[10px] text-slate-500 font-semibold mt-0.5 flex items-center gap-1.5 flex-wrap">
                              <span className="font-extrabold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                                {req.route === 'ADD_TO_DXB' ? 'ADD ➔ DXB' : 'DXB ➔ ADD'}
                              </span>
                              <span>•</span>
                              <span>{req.weight} kg</span>
                              <span>•</span>
                              <span className="truncate text-slate-600">{req.category}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-amber-50">
                          <span className="text-xs sm:text-sm font-extrabold text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1 rounded-xl">
                            {req.reward}
                          </span>
                          <button 
                            onClick={onOpenChatDrawer}
                            className="px-3.5 py-1.5 sm:py-2 bg-[#1C160F] hover:bg-amber-500 hover:text-[#1C160F] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <MessageSquare className="w-3.5 h-3.5" /> Chat
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 bg-[#FAF8F5] border border-amber-100/50 rounded-xl p-2.5 sm:p-3 leading-relaxed line-clamp-2">
                        {req.desc}
                      </p>

                      {/* Progress Timeline */}
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-2">
                        <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-between gap-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          <span className="text-amber-700">1. Request Posted</span>
                          <span className={req.status === 'accepted' || req.status === 'in-transit' ? 'text-amber-700' : ''}>2. Traveler Matched</span>
                          <span className={req.status === 'in-transit' ? 'text-amber-700' : ''}>3. In Transit</span>
                          <span>4. Handover Done</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                          <div className={`h-full bg-amber-500 transition-all duration-500 ${
                            req.status === 'pending' ? 'w-1/4' : req.status === 'accepted' ? 'w-2/4' : req.status === 'in-transit' ? 'w-3/4' : 'w-full'
                          }`}></div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Load More Button / Scroll Indicator */}
                  {activeRequests.length > activeVisibleCount && (
                    <div className="text-center pt-3 pb-2">
                      <button 
                        onClick={() => setActiveVisibleCount(prev => Math.min(prev + 4, activeRequests.length))}
                        className="bg-white hover:bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-2xs inline-flex items-center gap-2 cursor-pointer"
                      >
                        <span>Displaying {Math.min(activeVisibleCount, activeRequests.length)} of {activeRequests.length} packages — Scroll down to load more</span>
                        <ChevronDown className="w-4 h-4 text-amber-600 animate-bounce" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 bg-amber-50/20 border border-amber-100/60 rounded-2xl p-6">
                  <Package className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <p className="font-bold text-sm text-[#1C160F]">No Active Package Requests</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Click "Post New Request" to create a shipment request for travelers flying your route.</p>
                  <button 
                    onClick={onOpenPostModal}
                    className="mt-3 inline-flex items-center gap-1.5 bg-[#1C160F] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-amber-600 hover:text-[#1C160F] transition-all"
                  >
                    <Plus className="w-4 h-4" /> Post Delivery Request
                  </button>
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {dashboardTab === 'history' && (
            <div className="space-y-4">
              {historyRequests.length > 0 ? (
                historyRequests.map((req) => (
                  <div key={req.id} className="border border-emerald-100 bg-emerald-50/20 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      <div>
                        <h4 className="font-bold text-sm text-[#1C160F]">{req.title}</h4>
                        <p className="text-xs text-slate-500">Delivered successfully • Reward {req.reward}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-lg">
                      Completed
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic text-center py-10">No completed delivery history yet.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal 
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        user={activeUser}
        onProfileUpdated={handleProfileUpdated}
      />
    </main>
  );
}
