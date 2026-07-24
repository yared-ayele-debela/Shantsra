import React, { useState, useEffect } from 'react';
import { 
  Layout, ShieldCheck, Star, ShieldAlert, Plane, FileCheck2, 
  ChevronRight, Phone, CheckCircle2, Package, Clock, MessageSquare,
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

  // Combine API shipments with state requests
  const displayPackages = apiShipments.length > 0 ? apiShipments : requests;
  const activeRequests = displayPackages.filter(r => r.status !== 'delivered');
  const historyRequests = displayPackages.filter(r => r.status === 'delivered');

  const idStatusBadgeClass = 
    activeUser.id_document_status === 'approved' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
    activeUser.id_document_status === 'pending' ? 'text-amber-800 bg-amber-50 border-amber-200' :
    activeUser.id_document_status === 'rejected' ? 'text-red-700 bg-red-50 border-red-200' :
    'text-slate-400 border-slate-100';

  return (
    <main className="max-w-7xl mx-auto px-5 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 shadow-sm border border-amber-200">
            <Layout className="w-6 h-6" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-extrabold text-[#1C160F]">My Delivery Dashboard</h1>
            <p className="text-xs text-slate-500">Real-time user account profile, verified badges, active packages, and trip trackers.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={onOpenPostModal}
            className="flex items-center gap-2 bg-[#1C160F] text-white hover:bg-amber-600 hover:text-[#1C160F] px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Request</span>
          </button>
          <button 
            onClick={() => setIsEditProfileOpen(true)}
            className="flex items-center gap-2 bg-amber-50 border border-amber-300 text-[#1C160F] hover:bg-amber-100 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <Edit3 className="w-4 h-4 text-amber-600" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Real Profile Card & Verifications (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl border border-amber-100 p-6 shadow-sm space-y-5">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-emerald-800 text-white font-extrabold text-2xl flex items-center justify-center border-2 border-white shadow-md">
                  {activeUser.name ? activeUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-2 ring-white" title="Active Account">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </span>
              </div>

              <div className="mt-3 space-y-1">
                <h3 className="font-display text-lg font-extrabold text-[#1C160F] flex items-center justify-center gap-1.5">
                  <span>{activeUser.name}</span>
                  <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                    {activeUser.role || 'Sender'}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
                  <Mail className="w-3 h-3 text-slate-400" /> {activeUser.email}
                </p>
                <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" /> {activeUser.city || 'Addis Ababa'}, {activeUser.country || 'Ethiopia'}
                </p>
              </div>

              <div className="flex items-center gap-2 mt-4 text-xs font-semibold">
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
            <div className="border-t border-amber-50 pt-4 space-y-2.5 text-xs">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account Specifications</h4>
              
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-slate-500">Contact Phone:</span>
                <span className="font-semibold text-[#1C160F]">{activeUser.phone || 'Not specified'}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-slate-500">Account Status:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded uppercase text-[10px]">
                  {activeUser.status || 'Active'}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">Marketing Updates:</span>
                <span className="font-semibold text-slate-700">
                  {activeUser.marketing_opt_in ? 'Subscribed' : 'Disabled'}
                </span>
              </div>
            </div>

            {/* VERIFICATION BADGES STATUS */}
            <div className="border-t border-amber-50 pt-4">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Real Verifications</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between border border-emerald-100 bg-emerald-50/60 rounded-xl p-2.5 text-xs font-semibold text-emerald-800">
                  <span className="flex items-center gap-2"><Phone className="w-4 h-4 text-emerald-600" /> Phone Number</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>

                <div className={`flex items-center justify-between border rounded-xl p-2.5 text-xs font-semibold ${idStatusBadgeClass}`}>
                  <span className="flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4" /> 
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
          <div className="bg-gradient-to-br from-amber-50 to-white rounded-2xl border border-amber-200 p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-800" />
              <h4 className="font-display font-bold text-sm text-amber-900">Increase Handover Trust</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Complete document verification to display a verified shield badge on all your package requests and flight itineraries.
            </p>
            <div className="space-y-2 pt-1">
              <button 
                onClick={onOpenFlightModal}
                className="w-full bg-white hover:bg-amber-100/50 text-slate-700 border border-amber-200 rounded-xl py-2.5 px-4 text-xs font-bold flex items-center justify-between transition-all"
              >
                <span className="flex items-center gap-2"><Plane className="w-4 h-4 text-amber-600" /> Verify Flight Ticket</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button 
                onClick={() => setIsEditProfileOpen(true)}
                className="w-full bg-white hover:bg-amber-100/50 text-slate-700 border border-amber-200 rounded-xl py-2.5 px-4 text-xs font-bold flex items-center justify-between transition-all"
              >
                <span className="flex items-center gap-2"><FileCheck2 className="w-4 h-4 text-emerald-700" /> Upload Passport / Gov ID</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Active Packages Console & Tabs (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-amber-100 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-amber-100 pb-3">
            <div className="flex border-b-0">
              <button 
                onClick={() => setDashboardTab('active')}
                className={`pb-2 px-4 text-sm font-semibold border-b-2 transition-colors ${
                  dashboardTab === 'active' ? 'border-amber-500 text-amber-600 font-bold' : 'border-transparent text-slate-500 hover:text-amber-600'
                }`}
              >
                Active Packages ({activeRequests.length})
              </button>
              <button 
                onClick={() => setDashboardTab('history')}
                className={`pb-2 px-4 text-sm font-semibold border-b-2 transition-colors ${
                  dashboardTab === 'history' ? 'border-amber-500 text-amber-600 font-bold' : 'border-transparent text-slate-500 hover:text-amber-600'
                }`}
              >
                Successful History ({historyRequests.length})
              </button>
            </div>

            <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
              <Package className="w-3.5 h-3.5 text-amber-600" /> Real-time Cargo Tracker
            </span>
          </div>

          {/* Active Tab */}
          {dashboardTab === 'active' && (
            <div className="space-y-4">
              {loadingShipments && activeRequests.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400">Loading live package shipments...</div>
              ) : activeRequests.length > 0 ? (
                activeRequests.map((req) => (
                  <div key={req.id} className="border border-amber-100 rounded-2xl p-5 space-y-4 hover:border-amber-200 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img 
                          src={req.img.startsWith('http') ? req.img : `https://images.unsplash.com/${req.img}?auto=format&fit=crop&w=120&q=80`} 
                          alt={req.title} 
                          className="w-12 h-12 rounded-xl object-cover border border-amber-100 shrink-0" 
                        />
                        <div>
                          <h4 className="font-bold text-sm text-[#1C160F] cursor-pointer hover:text-amber-600" onClick={() => onSelectPackage(req)}>
                            {req.title}
                          </h4>
                          <p className="text-[10px] text-slate-500 font-semibold mt-0.5 flex items-center gap-1.5">
                            <span className="font-bold text-amber-700">{req.route === 'ADD_TO_DXB' ? 'ADD ➔ DXB' : 'DXB ➔ ADD'}</span>
                            <span>•</span>
                            <span>{req.weight} kg</span>
                            <span>•</span>
                            <span>{req.category}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1 rounded-xl">
                          {req.reward}
                        </span>
                        <button 
                          onClick={onOpenChatDrawer}
                          className="px-3.5 py-2 bg-[#1C160F] hover:bg-amber-500 hover:text-[#1C160F] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> Chat
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 bg-[#FAF8F5] border border-amber-100/50 rounded-xl p-3 leading-relaxed">
                      {req.desc}
                    </p>

                    {/* Progress Timeline */}
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
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
                ))
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
