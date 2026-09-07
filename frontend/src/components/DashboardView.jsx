import React, { useState, useEffect, useMemo } from 'react';
import { 
  Layout, ShieldCheck, Star, ShieldAlert, Plane, FileCheck2, 
  ChevronRight, ChevronDown, Phone, CheckCircle2, Package, Clock, MessageSquare,
  Edit3, Trash2, Mail, MapPin, UserCheck, AlertTriangle, Plus, Bell, Calendar,
  ToggleLeft, ToggleRight, Sparkles, Check, Handshake, RotateCcw
} from 'lucide-react';
import EditProfileModal from './EditProfileModal';
import RequestDeliveryModal from './RequestDeliveryModal';
import PackageAlertsModal from './PackageAlertsModal';
import DealConfirmationModal from './DealConfirmationModal';
import ReviewModal from './ReviewModal';

export default function DashboardView({ 
  requests, 
  currentUser,
  onUpdateCurrentUser,
  onOpenPostModal, 
  onOpenFlightModal, 
  onContactPhone,
  onSelectPackage,
  onUpdatePackage,
  onDeletePackage
}) {
  const [dashboardTab, setDashboardTab] = useState('active');
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [confirmDealPackage, setConfirmDealPackage] = useState(null);
  const [reviewPackage, setReviewPackage] = useState(null);
  const [liveUser, setLiveUser] = useState(currentUser || null);
  const [apiShipments, setApiShipments] = useState([]);
  const [loadingShipments, setLoadingShipments] = useState(true);

  // Package Alerts & Notifications state
  const [packageAlerts, setPackageAlerts] = useState([]);
  const [packageNotifications, setPackageNotifications] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [alertFromCity, setAlertFromCity] = useState('Addis Ababa');
  const [alertToCity, setAlertToCity] = useState('Dubai');
  const [alertStartDate, setAlertStartDate] = useState('');
  const [alertEndDate, setAlertEndDate] = useState('');
  const [alertEmailNotify, setAlertEmailNotify] = useState(true);
  const [alertSubmitting, setAlertSubmitting] = useState(false);
  const [alertFeedback, setAlertFeedback] = useState({ type: '', msg: '' });

  const handleDeleteClick = async (packageId, title) => {
    if (!window.confirm(`Are you sure you want to delete package request "${title}"?`)) {
      return;
    }
    try {
      await fetch(`/api/shipments/${packageId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
    } catch (err) {
      console.log('Delete API call complete.');
    }
    setApiShipments(prev => prev.filter(p => p.id !== packageId));
    if (onDeletePackage) {
      onDeletePackage(packageId);
    }
  };

  const handleReactivatePackage = async (packageId, title) => {
    try {
      const response = await fetch(`/api/shipments/${packageId}/reactivate`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      if (response.ok) {
        setApiShipments(prev => prev.map(p => p.id === packageId ? { ...p, inquiry_count: 0, is_paused_by_inquiries: false, deal_status: 'pending' } : p));
        alert(`Package listing "${title || 'Package'}" has been reactivated on the public directory!`);
      }
    } catch (err) {
      console.error('Reactivation error:', err);
    }
  };

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
        const response = await fetch('/api/shipments', {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          }
        });

        if (response.ok) {
          const data = await response.json();
          const items = data.shipments || [];
          const mapped = items.map(s => ({
            id: s.id || `ship_${Date.now()}`,
            sender_id: s.sender_id,
            title: s.receiver_name ? `Shipment for ${s.receiver_name}` : `Package (${s.from_city || 'ADD'} ➔ ${s.to_city || 'DXB'})`,
            desc: s.description || `Cargo transit from ${s.from_city || 'Addis Ababa'} to ${s.to_city || 'Dubai'}.`,
            route: (s.from_city || '').toLowerCase().includes('dubai') ? 'DXB_TO_ADD' : 'ADD_TO_DXB',
            weight: String(s.weight || '1.0'),
            reward: s.reward || `AED ${(parseFloat(s.weight || 1) * 35).toFixed(0)}`,
            category: s.category_name || s.category || 'General Cargo',
            deadline: s.travel_date_label || (s.travel_date ? `Needed by ${s.travel_date}` : 'Needed soon'),
            img: s.cover_image || s.product_images?.[0] || '/assets/No-Image-Found-400x264.png',
            status: s.status || 'pending',
            approval_status: s.approval_status || 'approved',
            deal_status: s.deal_status || 'pending',
            inquiry_count: Number(s.inquiry_count || 0),
            is_paused_by_inquiries: Boolean(s.is_paused_by_inquiries),
            phone: s.receiver_phone || '251911223344',
            sender: s.sender_display || 'You'
          }));
          setApiShipments(mapped);
        }
      } catch (err) {
        console.log('Using requests fallback for active shipments.');
      } finally {
        setLoadingShipments(false);
      }
    }
    fetchRealShipments();
  }, []);

  // Fetch package notification alerts & history
  const fetchPackageAlerts = async () => {
    setLoadingAlerts(true);
    try {
      const res = await fetch('/api/package-alerts', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setPackageAlerts(data.alerts || []);
        setPackageNotifications(data.notifications || []);
      }
    } catch (e) {
      console.log('Package alerts fetch error', e);
    } finally {
      setLoadingAlerts(false);
    }
  };

  useEffect(() => {
    fetchPackageAlerts();
  }, []);

  const handleCreateInlineAlert = async (e) => {
    e.preventDefault();
    setAlertSubmitting(true);
    setAlertFeedback({ type: '', msg: '' });

    try {
      const res = await fetch('/api/package-alerts', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          from_city: alertFromCity,
          to_city: alertToCity,
          start_date: alertStartDate || null,
          end_date: alertEndDate || null,
          email_notify: alertEmailNotify,
        })
      });

      const data = await res.json();
      if (res.ok) {
        setAlertFeedback({
          type: 'success',
          msg: `Alert created! We'll email you when packages are posted from ${alertFromCity} to ${alertToCity}.`
        });
        setPackageAlerts(prev => [data.alert, ...prev]);
        setAlertStartDate('');
        setAlertEndDate('');
      } else {
        setAlertFeedback({ type: 'error', msg: data.message || 'Error creating alert.' });
      }
    } catch (err) {
      setAlertFeedback({ type: 'error', msg: 'Network error. Please try again.' });
    } finally {
      setAlertSubmitting(false);
    }
  };

  const handleToggleAlert = async (alertId) => {
    try {
      const res = await fetch(`/api/package-alerts/${alertId}/toggle`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setPackageAlerts(prev => prev.map(a => a.id === alertId ? { ...a, is_active: data.is_active } : a));
      }
    } catch (err) {
      console.log('Toggle alert error', err);
    }
  };

  const handleDeleteAlert = async (alertId) => {
    if (!window.confirm('Delete this route notification alert rule?')) return;
    try {
      const res = await fetch(`/api/package-alerts/${alertId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      if (res.ok) {
        setPackageAlerts(prev => prev.filter(a => a.id !== alertId));
      }
    } catch (err) {
      console.log('Delete alert error', err);
    }
  };

  const handleDismissNotification = async (notifId) => {
    try {
      await fetch(`/api/package-notifications/${notifId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      setPackageNotifications(prev => prev.filter(n => n.id !== notifId));
    } catch (err) {
      console.log('Dismiss notification error', err);
    }
  };

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

  // Display only active packages created by or belonging to the logged-in user
  const displayPackages = useMemo(() => {
    if (apiShipments && apiShipments.length > 0) {
      return apiShipments;
    }

    const currentName = activeUser?.name ? activeUser.name.trim().toLowerCase() : '';
    return requests.filter(r => {
      if (!r) return false;
      if (r.sender_id && activeUser?.id && String(r.sender_id) === String(activeUser.id)) {
        return true;
      }
      const s = (r.sender || '').trim().toLowerCase();
      if (s === 'you' || s.includes('(you)') || s.includes('current user')) {
        return true;
      }
      if (currentName && (s === currentName || s.includes(currentName))) {
        return true;
      }
      return false;
    });
  }, [apiShipments, requests, activeUser]);

  const activeRequests = useMemo(() => {
    const list = displayPackages.filter(r => r && r.status !== 'delivered');
    return [...list].sort((a, b) => {
      const aPaused = Boolean(a.is_paused_by_inquiries || (a.inquiry_count >= 5 && a.deal_status !== 'confirmed'));
      const bPaused = Boolean(b.is_paused_by_inquiries || (b.inquiry_count >= 5 && b.deal_status !== 'confirmed'));
      if (aPaused && !bPaused) return -1;
      if (!aPaused && bPaused) return 1;
      return 0;
    });
  }, [displayPackages]);

  const pausedRequests = useMemo(() => {
    return activeRequests.filter(r => Boolean(r.is_paused_by_inquiries || (r.inquiry_count >= 5 && r.deal_status !== 'confirmed')));
  }, [activeRequests]);

  const historyRequests = displayPackages.filter(r => r && r.status === 'delivered');

  // Progressive scroll loading ("display little by little when users scroll down")
  useEffect(() => {
    function handleScroll() {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 450) {
        if (dashboardTab === 'active') {
          setActiveVisibleCount(prev => (prev < activeRequests.length ? prev + 3 : prev));
        } else if (dashboardTab === 'history') {
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
            <p className="text-[11px] sm:text-xs text-slate-500">Manage your profile, verification status, active delivery requests, and route notification alerts.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
          <button 
            onClick={() => setIsAlertModalOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-[#1C160F] px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-extrabold transition-all shadow-xs cursor-pointer"
            title="Create a route alert to receive email notifications when matching packages are posted"
          >
            <Bell className="w-3.5 h-3.5 text-[#1C160F]" />
            <span className="truncate">Set Route Alert</span>
          </button>
          <button 
            onClick={onOpenPostModal}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-[#1C160F] text-white hover:bg-amber-600 hover:text-[#1C160F] px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="truncate">Post Request</span>
          </button>
          <button 
            onClick={() => setIsEditProfileOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-amber-50 border border-amber-300 text-[#1C160F] hover:bg-amber-100 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
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
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account Details</h4>
              
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
                <span className="text-slate-500 shrink-0">Route Alerts:</span>
                <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-[10px]">
                  {packageAlerts.filter(a => a.is_active).length} Active
                </span>
              </div>
            </div>

            {/* VERIFICATION BADGES STATUS */}
            <div className="border-t border-amber-50 pt-3.5">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Verification Status</h4>
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

                {activeUser.id_document_comment && (
                  <div className={`p-2.5 rounded-xl text-xs border font-medium ${
                    activeUser.id_document_status === 'rejected' 
                      ? 'bg-rose-50 text-rose-800 border-rose-200 bg-green-300' 
                      : 'bg-amber-50 text-amber-900 border-amber-200'
                  }`}>
                    <span className="font-extrabold flex items-center gap-1.5 mb-0.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" /> Admin Note / Reason:
                    </span>
                    <span>{activeUser.id_document_comment}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Route Notification Setup Banner Card */}
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-4 sm:p-5 text-[#1C160F] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#1C160F]" />
                <h4 className="font-display font-extrabold text-xs sm:text-sm">Package Route Notification</h4>
              </div>
              <span className="bg-white/40 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase">Instant Email</span>
            </div>
            <p className="text-xs leading-relaxed font-medium">
              Want to get notified when packages are posted from <strong>Addis Ababa</strong> to <strong>Dubai</strong> within a date range?
            </p>
            <button
              onClick={() => {
                setDashboardTab('alerts');
                setIsAlertModalOpen(true);
              }}
              className="w-full bg-[#1C160F] hover:bg-amber-950 text-white rounded-xl py-2 px-3 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5 text-amber-400" /> Subscribe to Route Alerts
            </button>
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
            <div className="flex border-b-0 overflow-x-auto scrollbar-none gap-1">
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
              <button 
                onClick={() => setDashboardTab('alerts')}
                className={`pb-2 px-2.5 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors shrink-0 flex items-center gap-1.5 ${
                  dashboardTab === 'alerts' ? 'border-amber-500 text-amber-600 font-bold' : 'border-transparent text-slate-500 hover:text-amber-600'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Route Alerts & Emails ({packageAlerts.length})</span>
                {packageNotifications.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center">
                    {packageNotifications.length}
                  </span>
                )}
              </button>
            </div>

            <span className="text-[10px] sm:text-xs font-bold text-slate-400 flex items-center gap-1 shrink-0">
              <Package className="w-3.5 h-3.5 text-amber-600" /> Delivery Console
            </span>
          </div>

          {/* Active Tab */}
          {dashboardTab === 'active' && (
            <div className="space-y-4">
              {loadingShipments && activeRequests.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400">Loading delivery requests...</div>
              ) : activeRequests.length > 0 ? (
                <>
                  {/* Top Pinned Alert Section: Auto-Paused Packages Requiring Action */}
                  {pausedRequests.length > 0 && (
                    <div className="bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-amber-500/20 border-2 border-amber-500/60 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-sm animate-in fade-in duration-200">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="w-9 h-9 rounded-2xl bg-amber-500 text-[#1C160F] flex items-center justify-center font-black text-base shadow-xs shrink-0">
                            ⏸️
                          </span>
                          <div>
                            <h4 className="font-display text-sm sm:text-base font-extrabold text-[#1C160F] flex items-center gap-2 flex-wrap">
                              <span>Action Required: {pausedRequests.length} Package {pausedRequests.length === 1 ? 'Listing' : 'Listings'} Auto-Paused</span>
                              <span className="bg-amber-500 text-[#1C160F] px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-2xs">
                                5+ Traveler Inquiries
                              </span>
                            </h4>
                            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                              These packages reached 5 traveler inquiries and were automatically paused on the public website to protect you from too many calls. Please confirm if a deal was made, or relist to receive more calls.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2.5 pt-1">
                        {pausedRequests.map(pkg => (
                          <div key={`pinned_pause_${pkg.id}`} className="bg-white rounded-xl border border-amber-200/80 p-3 sm:p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-2xs">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-extrabold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                  {pkg.route === 'ADD_TO_DXB' ? 'Addis ➔ Dubai' : 'Dubai ➔ Addis'}
                                </span>
                                <h5 className="font-bold text-xs sm:text-sm text-[#1C160F] truncate">{pkg.title}</h5>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-1">
                                Reward: <span className="font-bold text-amber-800">{pkg.reward}</span> • Inquiries: <span className="font-bold text-amber-800">{pkg.inquiry_count || 5} travelers</span>
                              </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => setConfirmDealPackage(pkg)}
                                className="flex-1 sm:flex-none px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                              >
                                <Handshake className="w-3.5 h-3.5" />
                                <span>Yes, Deal Made</span>
                              </button>
                              <button
                                onClick={() => handleReactivatePackage(pkg.id, pkg.title)}
                                className="flex-1 sm:flex-none px-3.5 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                                <span>No Deal - Relist (+5)</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeRequests.slice(0, activeVisibleCount).map((req) => (
                    <div key={req.id} className="border border-amber-100/80 hover:border-amber-300 bg-white rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-2xs transition-all">
                      
                      {/* Top Header Row: Image, Title, Badges & Reward */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3.5 min-w-0">
                          <img 
                            src={
                              (req.img && typeof req.img === 'string' && !req.img.includes('unsplash.com') && !req.img.startsWith('photo-') && (req.img.startsWith('http://') || req.img.startsWith('https://') || req.img.startsWith('/') || req.img.startsWith('data:') || req.img.startsWith('storage/') || req.img.startsWith('shipments/')))
                                ? (req.img.startsWith('storage/') || req.img.startsWith('shipments/') ? `/${req.img}` : req.img)
                                : '/assets/No-Image-Found-400x264.png'
                            } 
                            alt={req.title} 
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = '/assets/No-Image-Found-400x264.png';
                            }}
                            className="w-14 h-14 rounded-2xl object-cover border border-amber-100/80 shrink-0 shadow-xs" 
                          />
                          <div className="min-w-0">
                            <h4 className="font-bold text-sm sm:text-base text-[#1C160F] cursor-pointer hover:text-amber-600 truncate" onClick={() => onSelectPackage(req)}>
                              {req.title}
                            </h4>

                            {/* Status & Meta Badges */}
                            <div className="flex items-center gap-1.5 flex-wrap mt-1">
                              <span className="font-extrabold text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/80">
                                {req.route === 'ADD_TO_DXB' ? 'Addis ➔ Dubai' : 'Dubai ➔ Addis'}
                              </span>

                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                req.approval_status === 'approved' 
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                  : req.approval_status === 'rejected'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}>
                                {req.approval_status === 'approved' ? '✓ Approved' : req.approval_status === 'rejected' ? '✕ Rejected' : '⏳ Pending Admin Approval'}
                              </span>

                              {(req.deal_status === 'confirmed' || req.status === 'deal_made') && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-600 text-white border border-emerald-700 inline-flex items-center gap-1 shadow-2xs">
                                  <Handshake className="w-3 h-3" /> Deal Confirmed
                                </span>
                              )}

                              {req.deal_status === 'declined' && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-300 inline-flex items-center gap-1">
                                  No Deal
                                </span>
                              )}

                              {req.is_paused_by_inquiries ? (
                                <span className="text-[10px] font-extrabold text-amber-900 bg-amber-200/90 border border-amber-300 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                                  ⏸️ Paused (5 Inquiries)
                                </span>
                              ) : req.inquiry_count > 0 ? (
                                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-amber-600" /> {req.inquiry_count} {req.inquiry_count === 1 ? 'Inquiry' : 'Inquiries'}
                                </span>
                              ) : null}

                              <span className="text-[10px] font-semibold text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded-md border border-slate-200/60">
                                {req.weight} kg
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Delivery Reward Badge */}
                        <div className="shrink-0 text-right">
                          <span className="inline-block text-xs sm:text-sm font-extrabold text-amber-900 bg-gradient-to-r from-amber-100 to-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl shadow-2xs">
                            {req.reward}
                          </span>
                        </div>
                      </div>

                      {/* Inquiries / Auto-Pause Banner for Sender */}
                      {(req.is_paused_by_inquiries || (req.inquiry_count >= 5 && req.deal_status !== 'confirmed')) && (
                        <div className="bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-amber-500/5 border-2 border-amber-500/40 rounded-2xl p-3.5 space-y-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="w-7 h-7 rounded-xl bg-amber-500 text-[#1C160F] flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                                ⏸️
                              </span>
                              <div>
                                <h5 className="font-display text-xs font-extrabold text-[#1C160F]">
                                  Listing Auto-Paused ({req.inquiry_count || 5}+ Travelers Contacted You)
                                </h5>
                                <p className="text-[11px] text-slate-600">
                                  We temporarily paused this listing on the public website to protect you from too many calls.
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white border border-amber-200/80 rounded-xl p-2.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shadow-2xs">
                            <span className="text-xs font-bold text-[#1C160F]">Did you make a delivery deal?</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setConfirmDealPackage(req)}
                                className="flex-1 sm:flex-none px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                              >
                                <Handshake className="w-3.5 h-3.5" />
                                <span>Yes, Deal Made</span>
                              </button>
                              <button
                                onClick={() => handleReactivatePackage(req.id, req.title)}
                                className="flex-1 sm:flex-none px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                                <span>No Deal - Relist (+5 Contacts)</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Package Description */}
                      <p className="text-xs text-slate-600 bg-[#FAF8F5] border border-amber-100/60 rounded-xl p-3 leading-relaxed line-clamp-2">
                        {req.desc}
                      </p>

                      {/* Bottom Action Bar: Professional UI Alignment */}
                      <div className="pt-2 border-t border-amber-100/60 flex flex-wrap items-center justify-between gap-2">
                        {/* Primary Deal & Contact Actions */}
                        <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                          <button 
                            onClick={() => setConfirmDealPackage(req)}
                            className="flex-1 sm:flex-none px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                            title="Confirm deal agreement status"
                          >
                            <Handshake className="w-3.5 h-3.5" />
                            <span>Confirm Deal</span>
                          </button>

                          {(String(req.deal_status || '').toLowerCase() === 'confirmed' || String(req.deal_status || '').toLowerCase() === 'deal_made' || String(req.status || '').toLowerCase() === 'deal_made') && (
                            <button 
                              onClick={() => setReviewPackage(req)}
                              className="flex-1 sm:flex-none px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-[#1C160F] text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                              title="Leave a star rating and review for this deal"
                            >
                              <Star className="w-3.5 h-3.5 fill-[#1C160F]" />
                              <span>Leave Review</span>
                            </button>
                          )}

                          <button 
                            onClick={() => onContactPhone && onContactPhone(req)}
                            className="flex-1 sm:flex-none px-3.5 py-2 bg-[#1C160F] hover:bg-amber-500 hover:text-[#1C160F] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                            title="View phone contact details"
                          >
                            <Phone className="w-3.5 h-3.5 text-amber-400" />
                            <span>Contact</span>
                          </button>
                        </div>

                        {/* Edit & Delete Utilities */}
                        <div className="flex items-center gap-1.5">
                          <button 
                            onClick={() => setEditingPackage(req)}
                            className="px-3 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                            title="Edit package details"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                            <span>Edit</span>
                          </button>

                          <button 
                            onClick={() => handleDeleteClick(req.id, req.title)}
                            className="px-3 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                            title="Delete package request"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            <span>Delete</span>
                          </button>
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
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Post a delivery request to connect with travelers flying your route.</p>
                  <button 
                    onClick={onOpenPostModal}
                    className="mt-3 inline-flex items-center gap-1.5 bg-[#1C160F] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-amber-600 hover:text-[#1C160F] transition-all cursor-pointer"
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

          {/* ROUTE NOTIFICATION ALERTS TAB */}
          {dashboardTab === 'alerts' && (
            <div className="space-y-6">
              {/* Create Route Alert Form Box */}
              <div className="bg-gradient-to-br from-amber-50/70 via-white to-amber-50/30 border border-amber-200/80 rounded-2xl p-4 sm:p-6 shadow-2xs space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-[#1C160F] flex items-center justify-center font-bold shrink-0">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-sm sm:text-base text-[#1C160F]">Create Package Route Alert</h3>
                    <p className="text-[11px] sm:text-xs text-slate-500">
                      e.g., Get an automated email whenever a package is posted from <strong>Addis Ababa</strong> to <strong>Dubai</strong> within your target dates.
                    </p>
                  </div>
                </div>

                {alertFeedback.msg && (
                  <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    alertFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}>
                    {alertFeedback.type === 'success' ? <Check className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
                    <span>{alertFeedback.msg}</span>
                  </div>
                )}

                <form onSubmit={handleCreateInlineAlert} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-600" /> Departure (From City)
                      </label>
                      <input 
                        type="text" 
                        required
                        value={alertFromCity}
                        onChange={(e) => setAlertFromCity(e.target.value)}
                        placeholder="e.g. Addis Ababa"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-amber-500 rounded-xl text-xs text-slate-800 font-semibold focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Destination (To City)
                      </label>
                      <input 
                        type="text" 
                        required
                        value={alertToCity}
                        onChange={(e) => setAlertToCity(e.target.value)}
                        placeholder="e.g. Dubai"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-amber-500 rounded-xl text-xs text-slate-800 font-semibold focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> Start Date (Optional)
                      </label>
                      <input 
                        type="date" 
                        value={alertStartDate}
                        onChange={(e) => setAlertStartDate(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-amber-500 rounded-xl text-xs text-slate-800 font-semibold focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> End Date (Optional)
                      </label>
                      <input 
                        type="date" 
                        value={alertEndDate}
                        onChange={(e) => setAlertEndDate(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-amber-500 rounded-xl text-xs text-slate-800 font-semibold focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-white border border-amber-100 rounded-xl p-3">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-bold text-[#1C160F]">Send Instant Email Notification</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={alertEmailNotify} 
                        onChange={(e) => setAlertEmailNotify(e.target.checked)} 
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={alertSubmitting}
                    className="w-full py-2.5 bg-[#1C160F] hover:bg-amber-600 hover:text-[#1C160F] text-white text-xs font-extrabold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{alertSubmitting ? 'Creating Route Alert...' : 'Subscribe to Package Route Alerts'}</span>
                  </button>
                </form>
              </div>

              {/* Subscribed Active Alerts Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-display font-extrabold text-xs sm:text-sm text-[#1C160F] flex items-center gap-2">
                    <span>Active Saved Route Subscriptions</span>
                    <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {packageAlerts.length}
                    </span>
                  </h4>
                  <button 
                    onClick={fetchPackageAlerts}
                    className="text-[11px] font-bold text-amber-600 hover:text-amber-700 cursor-pointer"
                  >
                    Refresh
                  </button>
                </div>

                {packageAlerts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {packageAlerts.map(alert => (
                      <div 
                        key={alert.id} 
                        className={`border rounded-2xl p-4 space-y-2.5 transition-all ${
                          alert.is_active ? 'bg-white border-amber-200/90 shadow-2xs' : 'bg-slate-50 border-slate-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-extrabold text-xs text-[#1C160F] flex items-center gap-1.5">
                              <span>{alert.from_city}</span>
                              <span className="text-amber-600">➔</span>
                              <span>{alert.to_city}</span>
                            </span>
                            <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>
                                {alert.start_date || alert.end_date 
                                  ? `${alert.start_date || 'Any'} to ${alert.end_date || 'Any'}`
                                  : 'All Date Ranges'
                                }
                              </span>
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleToggleAlert(alert.id)}
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                alert.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                              }`}
                              title={alert.is_active ? 'Click to pause alert' : 'Click to enable alert'}
                            >
                              {alert.is_active ? 'Active' : 'Paused'}
                            </button>
                            <button
                              onClick={() => handleDeleteAlert(alert.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                              title="Delete alert subscription"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[10px]">
                          <span className="text-slate-500 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-amber-600" /> Email: {alert.email_notify ? 'Enabled' : 'Off'}
                          </span>
                          <span className="text-slate-400">ID #{alert.id}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-slate-50/60 border border-slate-100 rounded-2xl p-4 text-xs text-slate-500">
                    No active route alerts saved. Create one above to get email notifications when matching packages are posted!
                  </div>
                )}
              </div>

              {/* Triggered Alerts Inbox / History */}
              <div className="space-y-3 pt-2">
                <h4 className="font-display font-extrabold text-xs sm:text-sm text-[#1C160F] flex items-center gap-2">
                  <span>Triggered Package Notifications History</span>
                  <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {packageNotifications.length}
                  </span>
                </h4>

                {packageNotifications.length > 0 ? (
                  <div className="space-y-2.5">
                    {packageNotifications.map(notif => (
                      <div key={notif.id} className="bg-amber-50/40 border border-amber-100 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 font-bold mt-0.5">
                            📦
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className="font-bold text-xs text-[#1C160F]">{notif.title}</h5>
                              {notif.email_sent && (
                                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                                  <Mail className="w-2.5 h-2.5" /> Email Sent
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 mt-0.5">{notif.message}</p>
                            <p className="text-[10px] text-slate-400 mt-1">
                              Received {new Date(notif.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          {notif.shipment && (
                            <button
                              onClick={() => onSelectPackage && onSelectPackage({
                                id: notif.shipment.id,
                                title: `Shipment for ${notif.shipment.receiver_name}`,
                                desc: notif.shipment.description || `Package from ${notif.shipment.from_city} to ${notif.shipment.to_city}`,
                                weight: String(notif.shipment.weight),
                                reward: `AED ${(notif.shipment.weight * 35).toFixed(0)}`,
                                category: 'General Cargo',
                                status: 'pending',
                              })}
                              className="px-3 py-1.5 bg-[#1C160F] hover:bg-amber-600 hover:text-[#1C160F] text-white text-[11px] font-bold rounded-xl transition-all"
                            >
                              View Package
                            </button>
                          )}
                          <button
                            onClick={() => handleDismissNotification(notif.id)}
                            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                            title="Dismiss notification"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-slate-50/40 border border-slate-100 rounded-2xl text-xs text-slate-400 italic">
                    No triggered route alert notifications yet.
                  </div>
                )}
              </div>
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

      {/* Package Route Alerts Modal */}
      <PackageAlertsModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        initialFrom="Addis Ababa"
        initialTo="Dubai"
        onAlertCreated={(newAlert) => {
          setPackageAlerts(prev => [newAlert, ...prev]);
        }}
      />

      {/* Edit Active Package Modal */}
      {editingPackage && (
        <RequestDeliveryModal 
          editingPackage={editingPackage}
          onClose={() => setEditingPackage(null)}
          onSubmit={(updatedPackage) => {
            setApiShipments(prev => {
              if (prev && prev.length > 0) {
                return prev.map(p => p.id === updatedPackage.id ? updatedPackage : p);
              }
              return [updatedPackage];
            });
            if (onUpdatePackage) {
              onUpdatePackage(updatedPackage);
            }
            setEditingPackage(null);
          }}
        />
      )}

      {/* Confirm Deal Modal */}
      {confirmDealPackage && (
        <DealConfirmationModal
          item={confirmDealPackage}
          partner={{ name: confirmDealPackage.receiver_name || 'Member' }}
          onClose={() => setConfirmDealPackage(null)}
          onSuccess={(deal) => {
            setConfirmDealPackage(null);
            const newDealStatus = deal?.status === 'deal_made' ? 'confirmed' : 'declined';
            setApiShipments(prev => {
              if (prev && prev.length > 0) {
                return prev.map(p => p.id === confirmDealPackage.id ? { ...p, deal_status: newDealStatus } : p);
              }
              return prev;
            });
            if (onUpdatePackage) {
              onUpdatePackage({ ...confirmDealPackage, deal_status: newDealStatus });
            }
          }}
        />
      )}

      {/* Package Review Modal */}
      {reviewPackage && (
        <ReviewModal
          item={reviewPackage}
          partner={{ name: reviewPackage.receiver_name || 'Member' }}
          onClose={() => setReviewPackage(null)}
          onSuccess={() => {
            setReviewPackage(null);
          }}
        />
      )}
    </main>
  );
}
