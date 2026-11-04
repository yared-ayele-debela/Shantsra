import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Bell,
  Calendar,
  LayoutDashboard,
  Mail,
  Plus,
  Star,
} from 'lucide-react';
import EditProfileModal from './EditProfileModal';
import RequestDeliveryModal from './RequestDeliveryModal';
import PackageAlertsModal from './PackageAlertsModal';
import DealConfirmationModal from './DealConfirmationModal';
import ReviewModal from './ReviewModal';
import BannerStrip from './BannerStrip';
import AttentionStrip from './dashboard/AttentionStrip';
import DashboardTabs from './dashboard/DashboardTabs';
import DashboardPackageCard from './dashboard/PackageCard';
import VerificationChecklist from './dashboard/VerificationChecklist';
import { TRANSLATIONS } from '../data/translations';
import { getApiUrl, getStorageUrl } from '../lib/api';

function getLanguage() {
  const pathLanguage = window.location.pathname.match(/^\/(en|am|ar)(?:\/|$)/)?.[1];
  return pathLanguage || localStorage.getItem('ss_selected_language') || 'en';
}

function getCopy() {
  const language = getLanguage();
  return TRANSLATIONS[language]?.dashboard || TRANSLATIONS.en.dashboard;
}

function SkeletonCard() {
  return <div className="h-44 animate-pulse rounded-2xl border border-[#D2DDD8] bg-white p-4 shadow-sm"><div className="h-4 w-2/3 rounded bg-slate-100" /><div className="mt-4 h-3 w-1/3 rounded bg-slate-100" /><div className="mt-5 h-8 rounded bg-slate-100" /><div className="mt-4 h-10 rounded bg-slate-100" /></div>;
}

function EmptyState({ message, cta, onClick }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#B8D5C7] bg-[#F7FBF9] p-8 text-center">
      <LayoutDashboard className="mx-auto h-8 w-8 text-[#B89358]" aria-hidden="true" />
      <p className="mt-3 text-sm font-semibold text-slate-600">{message}</p>
      {cta && onClick ? (
        <button type="button" onClick={onClick} className="mt-4 min-h-11 rounded-xl bg-[#0D3326] px-4 py-2 text-xs font-bold text-white hover:bg-[#144937] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3326]">
          {cta}
        </button>
      ) : null}
    </div>
  );
}

export default function DashboardView({
  requests,
  currentUser,
  onUpdateCurrentUser,
  onOpenPostModal,
  onOpenFlightModal: _onOpenFlightModal,
  onContactPhone,
  onSelectPackage,
  onUpdatePackage,
  onDeletePackage,
}) {
  const copy = getCopy();
  const [activeTab, setActiveTab] = useState('packages');
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [confirmDealPackage, setConfirmDealPackage] = useState(null);
  const [reviewPackage, setReviewPackage] = useState(null);
  const [reviewedIds, setReviewedIds] = useState(new Set());
  const [liveUser, setLiveUser] = useState(currentUser || null);
  const [apiShipments, setApiShipments] = useState([]);
  const [loadingShipments, setLoadingShipments] = useState(true);
  const [shipmentError, setShipmentError] = useState(false);
  const [packageAlerts, setPackageAlerts] = useState([]);
  const [packageNotifications, setPackageNotifications] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [alertError, setAlertError] = useState(false);
  const [alertFromCity, setAlertFromCity] = useState('Addis Ababa');
  const [alertToCity, setAlertToCity] = useState('Dubai');
  const [alertStartDate, setAlertStartDate] = useState('');
  const [alertEndDate, setAlertEndDate] = useState('');
  const [alertEmailNotify, setAlertEmailNotify] = useState(true);
  const [alertSubmitting, setAlertSubmitting] = useState(false);
  const [alertFeedback, setAlertFeedback] = useState({ type: '', msg: '' });

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch(getApiUrl('/api/user'), { credentials: 'include', headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' } });
      if (!response.ok) return;
      const data = await response.json();
      if (data.user) {
        setLiveUser(data.user);
        onUpdateCurrentUser?.(data.user);
      }
    } catch (error) {
      console.warn('Using active user state fallback.', error);
    }
  }, [onUpdateCurrentUser]);

  const fetchShipments = useCallback(async () => {
    setLoadingShipments(true);
    setShipmentError(false);
    try {
      const response = await fetch(getApiUrl('/api/shipments'), { credentials: 'include', headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' } });
      if (!response.ok) throw new Error(`Shipment request failed: ${response.status}`);
      const data = await response.json();
      setApiShipments((data.shipments || []).map((shipment) => ({
        id: shipment.id,
        sender_id: shipment.sender_id,
        title: shipment.receiver_name ? `Shipment for ${shipment.receiver_name}` : `Package (${shipment.from_city || 'Addis Ababa'} → ${shipment.to_city || 'Dubai'})`,
        desc: shipment.description || `Cargo transit from ${shipment.from_city || 'Addis Ababa'} to ${shipment.to_city || 'Dubai'}.`,
        route: (shipment.from_city || '').toLowerCase().includes('dubai') ? 'DXB_TO_ADD' : 'ADD_TO_DXB',
        from_city: shipment.from_city,
        to_city: shipment.to_city,
        weight: String(shipment.weight || '1.0'),
        reward: shipment.reward || `AED ${(parseFloat(shipment.weight || 1) * 35).toFixed(0)}`,
        deadline: shipment.travel_date_label || shipment.travel_date || 'Needed soon',
        img: shipment.cover_image || shipment.product_images?.[0] || '/assets/No-Image-Found-400x264.png',
        status: shipment.status || 'pending',
        approval_status: shipment.approval_status || 'approved',
        deal_status: shipment.deal_status || 'pending',
        inquiry_count: Number(shipment.inquiry_count || 0),
        is_paused_by_inquiries: Boolean(shipment.is_paused_by_inquiries),
        phone: shipment.receiver_phone || '',
        sender: shipment.sender_display || 'You',
        reviewed: Boolean(shipment.reviewed),
      })));
    } catch (error) {
      console.error('Unable to load dashboard shipments:', error);
      setShipmentError(true);
    } finally {
      setLoadingShipments(false);
    }
  }, []);

  const fetchAlerts = useCallback(async () => {
    setLoadingAlerts(true);
    setAlertError(false);
    try {
      const response = await fetch(getApiUrl('/api/package-alerts'), { credentials: 'include', headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' } });
      if (!response.ok) throw new Error(`Alert request failed: ${response.status}`);
      const data = await response.json();
      setPackageAlerts(data.alerts || []);
      setPackageNotifications(data.notifications || []);
    } catch (error) {
      console.error('Unable to load package alerts:', error);
      setAlertError(true);
    } finally {
      setLoadingAlerts(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
    fetchShipments();
    fetchAlerts();
  }, [fetchAlerts, fetchShipments, fetchUser]);

  const activeUser = useMemo(() => liveUser || currentUser || {
    name: 'Alex M. (You)',
    email: 'alex@example.com',
    role: 'sender',
    rating: '5.0',
    deliveriesCount: 0,
  }, [currentUser, liveUser]);

  const displayPackages = useMemo(() => {
    if (apiShipments.length) return apiShipments;
    const currentName = activeUser.name?.trim().toLowerCase() || '';
    return (requests || []).filter((request) => {
      const sender = (request.sender || '').trim().toLowerCase();
      return String(request.sender_id || '') === String(activeUser.id || '') || sender === 'you' || sender.includes('(you)') || (currentName && sender.includes(currentName));
    });
  }, [activeUser, apiShipments, requests]);

  const activePackages = displayPackages.filter((item) => item.status !== 'delivered' && item.status !== 'completed');
  const completedPackages = displayPackages.filter((item) => item.status === 'delivered' || item.status === 'completed');
  const deals = displayPackages.filter((item) => item.inquiry_count > 0 || ['confirmed', 'deal_made'].includes(String(item.deal_status).toLowerCase()));
  const awaitingDeals = displayPackages.filter((item) => item.inquiry_count > 0 && !['confirmed', 'deal_made'].includes(String(item.deal_status).toLowerCase()));
  const reviewItems = completedPackages.filter((item) => !item.reviewed && !reviewedIds.has(item.id));
  const verificationPending = activeUser.id_document_status !== 'approved' || !activeUser.phone;
  const unreadMessages = Number(activeUser.unread_messages || activeUser.unreadMessages || 0);
  const counts = {
    deals: awaitingDeals.length,
    reviews: reviewItems.length,
    verification: verificationPending ? 1 : 0,
    messages: unreadMessages,
    alerts: packageNotifications.length,
  };

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const selectAttention = (key) => {
    const tab = key === 'deals' ? 'deals' : key === 'reviews' ? 'history' : key === 'verification' ? 'packages' : 'packages';
    setActiveTab(tab);
    requestAnimationFrame(() => scrollTo(key === 'verification' ? 'dashboard-verification' : 'dashboard-content'));
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete package request "${item.title}"?`)) return;
    try {
      await fetch(getApiUrl(`/api/shipments/${item.id}`), { method: 'DELETE', credentials: 'include', headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' } });
      setApiShipments((items) => items.filter((entry) => entry.id !== item.id));
      onDeletePackage?.(item.id);
    } catch (error) {
      console.error('Delete package error:', error);
    }
  };

  const handleReactivate = async (item) => {
    try {
      const response = await fetch(getApiUrl(`/api/shipments/${item.id}/reactivate`), { method: 'POST', credentials: 'include', headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' } });
      if (!response.ok) throw new Error(`Reactivate request failed: ${response.status}`);
      setApiShipments((items) => items.map((entry) => entry.id === item.id ? { ...entry, inquiry_count: 0, is_paused_by_inquiries: false, deal_status: 'pending' } : entry));
    } catch (error) {
      console.error('Reactivate package error:', error);
    }
  };

  const handlePackageAction = (action, item) => {
    if (action === 'contact') onContactPhone?.(item);
    if (action === 'confirm') setConfirmDealPackage(item);
    if (action === 'review') setReviewPackage(item);
    if (action === 'delivered') {
      const updated = { ...item, status: 'delivered' };
      setApiShipments((items) => items.map((entry) => entry.id === item.id ? updated : entry));
      onUpdatePackage?.(updated);
    }
  };

  const handleCreateAlert = async (event) => {
    event.preventDefault();
    setAlertSubmitting(true);
    setAlertFeedback({ type: '', msg: '' });
    try {
      const response = await fetch(getApiUrl('/api/package-alerts'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body: JSON.stringify({ from_city: alertFromCity, to_city: alertToCity, start_date: alertStartDate || null, end_date: alertEndDate || null, email_notify: alertEmailNotify }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Alert creation failed.');
      setPackageAlerts((items) => [data.alert, ...items]);
      setAlertFeedback({ type: 'success', msg: data.message || 'Route alert created.' });
      setAlertStartDate('');
      setAlertEndDate('');
    } catch (error) {
      setAlertFeedback({ type: 'error', msg: error.message || 'Network error. Please try again.' });
    } finally {
      setAlertSubmitting(false);
    }
  };

  const handleToggleAlert = async (alert) => {
    try {
      const response = await fetch(getApiUrl(`/api/package-alerts/${alert.id}/toggle`), { method: 'PATCH', credentials: 'include', headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' } });
      if (!response.ok) throw new Error(`Toggle request failed: ${response.status}`);
      const data = await response.json();
      setPackageAlerts((items) => items.map((entry) => entry.id === alert.id ? { ...entry, is_active: data.is_active } : entry));
    } catch (error) {
      console.error('Toggle alert error:', error);
    }
  };

  const handleDeleteAlert = async (alert) => {
    if (!window.confirm('Delete this route notification alert rule?')) return;
    try {
      const response = await fetch(getApiUrl(`/api/package-alerts/${alert.id}`), { method: 'DELETE', credentials: 'include', headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' } });
      if (!response.ok) throw new Error(`Delete alert failed: ${response.status}`);
      setPackageAlerts((items) => items.filter((entry) => entry.id !== alert.id));
    } catch (error) {
      console.error('Delete alert error:', error);
    }
  };

  const handleDismissNotification = async (notification) => {
    try {
      const response = await fetch(getApiUrl(`/api/package-notifications/${notification.id}`), { method: 'DELETE', credentials: 'include', headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' } });
      if (!response.ok) throw new Error(`Dismiss notification failed: ${response.status}`);
      setPackageNotifications((items) => items.filter((entry) => entry.id !== notification.id));
    } catch (error) {
      console.error('Dismiss notification error:', error);
    }
  };

  const profileUpdated = (updatedUser) => {
    setLiveUser(updatedUser);
    onUpdateCurrentUser?.(updatedUser);
  };

  const isTraveler = ['traveler', 'traveller'].includes(String(activeUser.role || '').toLowerCase());
  const identityDocumentUrl = activeUser.id_document_url || activeUser.id_document_path || '';

  return (
    <main className="mx-auto w-full max-w-7xl space-y-5 px-3.5 py-5 sm:space-y-7 sm:px-5 sm:py-8 lg:px-8">
      <header className="flex flex-col gap-4 rounded-2xl border border-[#D2DDD8] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E5F0EB] text-[#0D3326]"><LayoutDashboard className="h-5 w-5" aria-hidden="true" /></div>
          <div>
            <h1 className="font-display text-xl font-extrabold text-[#0D3326] sm:text-2xl">{copy.title}</h1>
            <p className="text-xs text-slate-500">{copy.subtitle}</p>
          </div>
        </div>
        <button type="button" onClick={onOpenPostModal} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0D3326] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#144937] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3326]">
          <Plus className="h-4 w-4" aria-hidden="true" /> {isTraveler ? copy.postTrip : copy.postPackage}
        </button>
      </header>

      <BannerStrip placement="dashboard" />
      <AttentionStrip counts={counts} copy={copy} onSelect={selectAttention} />

      <div className="grid gap-5 md:grid-cols-[260px_minmax(0,1fr)] lg:gap-7">
        <aside className="space-y-4">
          <section className="rounded-2xl border border-[#D2DDD8] bg-white p-4 text-center shadow-sm sm:p-5" aria-labelledby="profile-title">
            <div className="mx-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-[#E5F0EB] text-xl font-extrabold text-[#0D3326]">
              <img
                src={getStorageUrl(activeUser.photo_url || activeUser.photo) || '/assets/No-Image-Found-400x264.png'}
                alt={activeUser.name || 'User'}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/assets/No-Image-Found-400x264.png';
                }}
                className="h-full w-full object-cover"
              />
            </div>
            <h2 id="profile-title" className="mt-3 truncate font-display text-base font-extrabold text-[#0D3326]">{activeUser.name}</h2>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[#8F6C3D]">{activeUser.role || 'Sender'}</p>
            <div className="mt-3 flex items-center justify-center gap-2 text-xs font-semibold text-slate-600">
              <span className="inline-flex items-center gap-1 rounded-lg bg-[#FFF8E8] px-2 py-1 text-[#8F6C3D]"><Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" /> {activeUser.rating || '5.0'}</span>
              <span>{activeUser.deliveriesCount || 0} {copy.deliveries}</span>
            </div>
            <button type="button" onClick={() => setIsEditProfileOpen(true)} className="mt-4 min-h-11 w-full rounded-xl border border-[#D2DDD8] px-3 py-2 text-xs font-bold text-[#0D3326] hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D3326]">{copy.editProfile}</button>
          </section>
          <div id="dashboard-verification">
            <VerificationChecklist user={activeUser} copy={copy} onContinue={() => setIsEditProfileOpen(true)} onEdit={() => setIsEditProfileOpen(true)} />
          </div>
          {identityDocumentUrl ? <a href={getStorageUrl(identityDocumentUrl)} target="_blank" rel="noreferrer" className="sr-only">View identity document</a> : null}
        </aside>

        <section id="dashboard-content" className="min-w-0 rounded-2xl border border-[#D2DDD8] bg-white p-4 shadow-sm sm:p-6">
          <DashboardTabs activeTab={activeTab} onChange={setActiveTab} counts={counts} copy={copy} />

          {activeTab === 'packages' && (
            <div className="mt-5 space-y-4">
              {shipmentError ? <EmptyState message={copy.loadError} cta={copy.retry} onClick={fetchShipments} /> : loadingShipments ? <div className="grid gap-3 sm:grid-cols-2"><SkeletonCard /><SkeletonCard /></div> : activePackages.length ? <div className="grid gap-3 sm:grid-cols-2">{activePackages.map((item) => <DashboardPackageCard key={item.id} item={item} copy={copy} onAction={handlePackageAction} onView={onSelectPackage} onEdit={setEditingPackage} onToggle={item.is_paused_by_inquiries ? handleReactivate : undefined} onDelete={handleDelete} />)}</div> : <EmptyState message={copy.noPackages} cta={copy.noPackagesCta} onClick={onOpenPostModal} />}
            </div>
          )}

          {activeTab === 'deals' && (
            <div className="mt-5 space-y-4">
              {deals.length ? <div className="grid gap-3 sm:grid-cols-2">{deals.map((item) => <DashboardPackageCard key={item.id} item={item} copy={copy} onAction={handlePackageAction} onView={onSelectPackage} onEdit={setEditingPackage} onToggle={item.is_paused_by_inquiries ? handleReactivate : undefined} onDelete={handleDelete} />)}</div> : <EmptyState message={copy.noDeals} />}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="mt-5 space-y-4">
              {reviewItems.length ? <div className="grid gap-3 sm:grid-cols-2">{reviewItems.map((item) => <DashboardPackageCard key={item.id} item={item} copy={copy} onAction={handlePackageAction} onView={onSelectPackage} onEdit={setEditingPackage} onDelete={handleDelete} />)}</div> : completedPackages.length ? <div className="grid gap-3 sm:grid-cols-2">{completedPackages.map((item) => <DashboardPackageCard key={item.id} item={{ ...item, reviewed: true }} copy={copy} onAction={handlePackageAction} onView={onSelectPackage} onEdit={setEditingPackage} onDelete={handleDelete} />)}</div> : <EmptyState message={copy.noHistory} />}
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="mt-5 space-y-6">
              {alertError ? <EmptyState message={copy.loadError} cta={copy.retry} onClick={fetchAlerts} /> : null}
              <form onSubmit={handleCreateAlert} className="space-y-4 rounded-2xl border border-[#B8D5C7] bg-[#F7FBF9] p-4 sm:p-5">
                <div className="flex items-center gap-2"><Bell className="h-5 w-5 text-[#8F6C3D]" aria-hidden="true" /><h2 className="font-display text-base font-extrabold text-[#0D3326]">{copy.createAlert}</h2></div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-xs font-bold text-slate-600">{copy.from}<input value={alertFromCity} onChange={(event) => setAlertFromCity(event.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-[#D2DDD8] bg-white px-3 text-sm text-slate-800" required /></label>
                  <label className="text-xs font-bold text-slate-600">{copy.to}<input value={alertToCity} onChange={(event) => setAlertToCity(event.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-[#D2DDD8] bg-white px-3 text-sm text-slate-800" required /></label>
                  <label className="text-xs font-bold text-slate-600"><Calendar className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />{copy.startDate}<input type="date" value={alertStartDate} onChange={(event) => setAlertStartDate(event.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-[#D2DDD8] bg-white px-3 text-sm text-slate-800" /></label>
                  <label className="text-xs font-bold text-slate-600"><Calendar className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />{copy.endDate}<input type="date" value={alertEndDate} onChange={(event) => setAlertEndDate(event.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-[#D2DDD8] bg-white px-3 text-sm text-slate-800" /></label>
                </div>
                <label className="flex min-h-11 items-center gap-2 text-xs font-bold text-slate-600">
                  <input type="checkbox" checked={alertEmailNotify} onChange={(event) => setAlertEmailNotify(event.target.checked)} className="h-4 w-4 accent-[#0D3326]" />
                  {copy.emailNotifications}
                </label>
                {alertFeedback.msg ? <p className={`rounded-xl p-3 text-xs font-semibold ${alertFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>{alertFeedback.msg}</p> : null}
                <button type="submit" disabled={alertSubmitting} className="min-h-11 w-full rounded-xl bg-[#0D3326] px-4 py-2 text-xs font-bold text-white hover:bg-[#144937] disabled:opacity-60">{alertSubmitting ? copy.loading : copy.createAlert}</button>
              </form>
              {loadingAlerts ? <div className="grid gap-3 sm:grid-cols-2"><SkeletonCard /><SkeletonCard /></div> : packageAlerts.length ? <div className="grid gap-3 sm:grid-cols-2">{packageAlerts.map((alert) => <article key={alert.id} className="rounded-2xl border border-[#D2DDD8] bg-white p-4"><div className="flex items-start justify-between gap-2"><div><p className="text-sm font-extrabold text-[#0D3326]">{alert.from_city} → {alert.to_city}</p><p className="mt-1 text-xs text-slate-500">{alert.start_date || 'Any'} – {alert.end_date || 'Any'}</p></div><button type="button" onClick={() => handleToggleAlert(alert)} className="min-h-11 rounded-lg px-2 text-[10px] font-bold text-[#0D3326] hover:bg-[#E5F0EB]">{alert.is_active ? copy.verified : copy.pending}</button></div><div className="mt-3 flex justify-between border-t border-slate-100 pt-2 text-xs text-slate-500"><span>{alert.email_notify ? copy.emailEnabled : copy.emailOff}</span><button type="button" onClick={() => handleDeleteAlert(alert)} className="font-bold text-rose-700">{copy.delete}</button></div></article>)}</div> : <EmptyState message={copy.noAlerts} cta={copy.createAlert} onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })} />}
              {packageNotifications.length ? <section aria-labelledby="notifications-title"><h2 id="notifications-title" className="mb-3 flex items-center gap-2 text-sm font-extrabold text-[#0D3326]"><Mail className="h-4 w-4" aria-hidden="true" /> {copy.unreadMessages}</h2><div className="space-y-2">{packageNotifications.map((notification) => <article key={notification.id} className="flex items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 p-3"><div><h3 className="text-xs font-bold text-blue-900">{notification.title}</h3><p className="mt-1 text-xs text-blue-800">{notification.message}</p></div><button type="button" onClick={() => handleDismissNotification(notification)} aria-label={copy.dismiss} className="min-h-11 min-w-11 rounded-lg text-blue-800 hover:bg-blue-100">×</button></article>)}</div></section> : null}
            </div>
          )}
        </section>
      </div>

      <EditProfileModal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} user={activeUser} onProfileUpdated={profileUpdated} />
      <PackageAlertsModal isOpen={isAlertModalOpen} onClose={() => setIsAlertModalOpen(false)} initialFrom="Addis Ababa" initialTo="Dubai" onAlertCreated={(alert) => setPackageAlerts((items) => [alert, ...items])} />
      {editingPackage ? <RequestDeliveryModal editingPackage={editingPackage} onClose={() => setEditingPackage(null)} onSubmit={(updatedPackage) => { setApiShipments((items) => items.map((item) => item.id === updatedPackage.id ? updatedPackage : item)); onUpdatePackage?.(updatedPackage); setEditingPackage(null); }} /> : null}
      {confirmDealPackage ? <DealConfirmationModal item={confirmDealPackage} partner={{ name: confirmDealPackage.receiver_name || 'Member' }} onClose={() => setConfirmDealPackage(null)} onSuccess={(deal) => { const updated = { ...confirmDealPackage, deal_status: deal?.status === 'deal_made' ? 'confirmed' : 'declined' }; setApiShipments((items) => items.map((item) => item.id === updated.id ? updated : item)); onUpdatePackage?.(updated); setConfirmDealPackage(null); }} /> : null}
      {reviewPackage ? <ReviewModal item={reviewPackage} partner={{ name: reviewPackage.receiver_name || 'Member' }} onClose={() => setReviewPackage(null)} onSuccess={() => { setReviewedIds((ids) => new Set([...ids, reviewPackage.id])); setReviewPackage(null); }} /> : null}
    </main>
  );
}
