import React, { lazy, Suspense, useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import Header from './components/Header';
const HomeView = lazy(() => import('./components/HomeView'));
const PackagesView = lazy(() => import('./components/PackagesView'));
const TravelersView = lazy(() => import('./components/TravelersView'));
const DashboardView = lazy(() => import('./components/DashboardView'));
const SafetyView = lazy(() => import('./components/SafetyView'));

import PackageDetailModal from './components/PackageDetailModal';
import UserProfileModal from './components/UserProfileModal';
import RequestDeliveryModal from './components/RequestDeliveryModal';
import FlightVerificationModal from './components/FlightVerificationModal';
import AuthModal from './components/AuthModal';
import PhoneContactModal from './components/PhoneContactModal';
import AppLoadingOverlay from './components/AppLoadingOverlay';
import MobileBottomNav from './components/MobileBottomNav';
import Footer from './components/Footer';
import SeoHead from './components/SeoHead';

import { DEFAULT_REQUESTS, DEFAULT_PROFILES } from './data/initialData';
import { getApiUrl, getStorageUrl } from './lib/api';
import { packagePath, packageTitle, slugify, viewPath } from './lib/seo';

const DEFAULT_CHATS = [
  {
    id: 'chat_r1',
    requestId: 'r1',
    participantName: 'Kaleb T. (Sender)',
    participantAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
    messages: [
      { sender: 'them', text: "Hello! Thank you for offering to carry the coffee. When is your flight leaving Addis?", time: "3:40 PM" }
    ],
    replies: [
      "Bole Airport Terminal 2 works well for the handover. I can meet you there.",
      "The bag is clean and securely packed. You are welcome to inspect the contents before handover."
    ],
    replyIndex: 0
  },
  {
    id: 'chat_r2',
    requestId: 'r2',
    participantName: 'Sarah Al-M. (Sender)',
    participantAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
    messages: [
      { sender: 'them', text: "Hi! The iPhone is fully paid and invoice is in the bag. Are you able to pick it up from Al Barsha?", time: "1:20 PM" }
    ],
    replies: [
      "I will coordinate the handover location. Please let me know when you are nearby.",
      "My family in Addis Ababa will be available to receive the item after your arrival."
    ],
    replyIndex: 0
  }
];

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentView = useMemo(() => {
    const path = location.pathname.replace(/^\/(?:en|am|ar)(?=\/|$)/, '') || '/';
    if (path === '/') return 'home';
    if (path.startsWith('/packages')) return 'packages';
    if (path.startsWith('/travelers')) return 'travelers';
    if (path === '/dashboard') return 'dashboard';
    if (path === '/safety') return 'safety';
    return 'home';
  }, [location.pathname]);
  const setCurrentView = (view) => navigate(viewPath(view));
  const [isAppLoading, setIsAppLoading] = useState(true);
  
  // Persistent state in LocalStorage
  const [requests, setRequests] = useState(() => {
    const saved = localStorage.getItem('ss_requests');
    return saved ? JSON.parse(saved) : DEFAULT_REQUESTS;
  });

  const [profiles, setProfiles] = useState(() => {
    const saved = localStorage.getItem('ss_profiles');
    return saved ? JSON.parse(saved) : DEFAULT_PROFILES;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('ss_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [chats, setChats] = useState(DEFAULT_CHATS);

  useEffect(() => {
    localStorage.setItem('ss_requests', JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem('ss_profiles', JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('ss_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('ss_user');
    }
  }, [currentUser]);

  // Synchronize backend auth state on app load
  useEffect(() => {
    async function checkAuthSession() {
      try {
        const response = await fetch(getApiUrl('/api/user'), {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setCurrentUser(data.user);
          }
        } else if (response.status === 401) {
          setCurrentUser(null);
        }
      } catch (err) {
        console.log('Session verification completed.');
      } finally {
        setTimeout(() => {
          setIsAppLoading(false);
        }, 500);
      }
    }
    checkAuthSession();
  }, []);

  // Modal & Drawer States
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedProfileModal, setSelectedProfileModal] = useState(null);
  const [selectedPhoneContact, setSelectedPhoneContact] = useState(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isFlightModalOpen, setIsFlightModalOpen] = useState(false);

  const handleSelectProfile = (target) => {
    if (!target) {
      setSelectedProfileModal(null);
      return;
    }
    if (typeof target === 'object') {
      const rawPhoto = target.photo || target.photo_url || target.avatar || null;
      let photoSrc = '';
      if (rawPhoto && !rawPhoto.includes('unsplash.com')) {
        photoSrc = getStorageUrl(rawPhoto);
      }
      setSelectedProfileModal({
        ...target,
        photo: photoSrc,
        photo_url: photoSrc
      });
      return;
    }
    if (currentUser && (currentUser.name === target || currentUser.email === target)) {
      const rawPhoto = currentUser.photo_url || currentUser.photo || null;
      let photoSrc = '';
      if (rawPhoto && !rawPhoto.includes('unsplash.com')) {
        photoSrc = getStorageUrl(rawPhoto);
      }
      setSelectedProfileModal({
        ...currentUser,
        name: currentUser.name || target,
        photo: photoSrc,
        photo_url: photoSrc,
        rating: '5.0',
        deliveriesCount: 3,
        bio: 'Verified member of the Shantasra delivery network.',
        verifications: { id: Boolean(currentUser.id_document_status === 'approved'), flight: true, phone: Boolean(currentUser.phone) },
        reviews: []
      });
      return;
    }
    const foundProf = profiles[target];
    if (foundProf) {
      const rawPhoto = foundProf.photo || foundProf.photo_url || foundProf.avatar || null;
      let photoSrc = '';
      if (rawPhoto && !rawPhoto.includes('unsplash.com')) {
        photoSrc = getStorageUrl(rawPhoto);
      }
      setSelectedProfileModal({
        ...foundProf,
        photo: photoSrc,
        photo_url: photoSrc
      });
      return;
    }
    setSelectedProfileModal({
      name: target,
      photo: null,
      photo_url: null,
      rating: '4.8',
      deliveriesCount: 5,
      bio: 'Member of the Shantasra delivery network.',
      verifications: { id: true, flight: true, phone: true },
      reviews: []
    });
  };
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState(DEFAULT_CHATS[0].id);

  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenAuth = (mode = 'login') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    showToast(`Welcome back, ${user.name || user.email}!`);
  };

  const handleLogout = async () => {
    try {
      await fetch(getApiUrl('/api/logout'), { method: 'POST' });
    } catch (err) {
      console.log('Logout API call complete.');
    }
    setCurrentUser(null);
    showToast('You have signed out.');
  };

  const handlePostNewRequest = (newReq) => {
    setRequests(prev => [newReq, ...prev]);
    showToast(`Your package request "${newReq.title}" was posted.`);
  };

  const handleUpdatePackage = (updatedReq) => {
    setRequests(prev => prev.map(req => req.id === updatedReq.id ? updatedReq : req));
    showToast(`Your package request "${updatedReq.title}" was updated.`);
  };

  const handleDeletePackage = (packageId) => {
    setRequests(prev => prev.filter(req => req.id !== packageId));
    showToast('Your package request was removed.');
  };

  const handleOfferToCarry = (item) => {
    setSelectedPackage(null);
    setSelectedPhoneContact(item);
  };

  const handleContactPhone = (contact) => {
    setSelectedPhoneContact(contact);
  };

  const handleVerifyFlightSubmit = (flightData) => {
    setProfiles(prev => {
      const myProf = prev['You (Sender)'] || {};
      return {
        ...prev,
        'You (Sender)': {
          ...myProf,
          verifications: {
            ...myProf.verifications,
            flight: true
          },
          upcomingTrip: {
            route: flightData.route,
            date: flightData.departureDate,
            flight: `${flightData.carrier} ${flightData.flightNumber}`
          }
        }
      };
    });
    showToast(`Flight ticket ${flightData.carrier} ${flightData.flightNumber} verified! Badge added to profile.`);
  };

  const handleOpenPackageModal = (pkg) => {
    setSelectedPackage(pkg);
    if (pkg) {
      navigate(packagePath(pkg));
    }
  };

  const handleClosePackageModal = () => {
    setSelectedPackage(null);
    navigate(viewPath(currentView === 'packages' ? 'packages' : 'home'));
  };

  // Keep legacy package links working while moving shared links to canonical paths.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const packageId = params.get('package');
    const pathMatch = window.location.pathname.match(/^\/packages\/([^/-]+)(?:-(.*))?$/);
    const requestedId = packageId || pathMatch?.[1];
    if (!requestedId) return;

    // Search in current requests list first
    const matched = requests.find(r => String(r.id) === String(requestedId));
    if (matched) {
      setSelectedPackage(matched);
      const canonicalPath = packagePath(matched);
      if (window.location.pathname !== canonicalPath || packageId) {
        navigate(canonicalPath, { replace: true });
      } else if (pathMatch?.[2] && pathMatch[2] !== slugify(packageTitle(matched))) {
        navigate(canonicalPath, { replace: true });
      }
    } else {
      // Fetch open shipments from API if not found in local requests state
      fetch(getApiUrl('/api/shipments/open'))
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && data.shipments) {
            const found = data.shipments.find(s => String(s.id) === String(requestedId));
            if (found) {
              const normalized = {
                id: found.id,
                title: found.receiver_name ? `Shipment for ${found.receiver_name}` : `Package (${found.from_city || 'ADD'} ➔ ${found.to_city || 'DXB'})`,
                desc: found.description || `Cargo transit from ${found.from_city || 'Addis Ababa'} to ${found.to_city || 'Dubai'}.`,
                route: (found.from_city || '').toLowerCase().includes('dubai') ? 'DXB_TO_ADD' : 'ADD_TO_DXB',
                weight: String(found.weight || '1.0'),
                reward: found.reward || `AED ${(parseFloat(found.weight || 1) * 35).toFixed(0)}`,
                category: found.category || 'Other',
                deadline: found.travel_date ? `Needed by ${found.travel_date}` : 'Needed soon',
                img: found.cover_image || found.product_images?.[0] || 'photo-1447933601403-0c6688de566e',
                status: found.status || 'pending',
                phone: found.receiver_phone || '251911223344',
                sender: found.sender_display || 'Verified Poster'
              };
              setSelectedPackage(normalized);
              navigate(packagePath(normalized), { replace: true });
            }
          }
        })
        .catch(() => {});
    }
  }, [requests, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-[#EEF3F0] text-[#0D3326] pb-16 lg:pb-0">
      <SeoHead />
      {/* App Initialization Loading Overlay */}
      <AppLoadingOverlay isLoading={isAppLoading} />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-[#0D3326] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-[#B89358]/30 text-xs font-bold animate-bounce">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Header 
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenRequestModal={() => {
          if (!currentUser) {
            handleOpenAuth('login');
            showToast('Please sign in to request a package delivery.');
          } else {
            setIsPostModalOpen(true);
          }
        }}
        onOpenChatDrawer={() => setIsChatDrawerOpen(true)}
        currentUser={currentUser}
        onOpenAuthModal={handleOpenAuth}
        onLogout={handleLogout}
      />

      {/* Main Views */}
      <Suspense fallback={<main className="flex-1 min-h-[50vh] flex items-center justify-center text-sm text-slate-500">Loading Shantasra...</main>}>
      <div className="flex-1">
        {currentView === 'home' && (
          <HomeView 
            requests={requests}
            profiles={profiles}
            onSelectPackage={handleOpenPackageModal}
            onSelectProfile={handleSelectProfile}
            onOfferToCarry={handleOfferToCarry}
            onContactPhone={handleContactPhone}
            onOpenPostModal={() => {
              if (!currentUser) {
                handleOpenAuth('login');
                showToast('Please sign in to request a package delivery.');
              } else {
                setIsPostModalOpen(true);
              }
            }}
          />
        )}

        {currentView === 'packages' && (
          <PackagesView 
            requests={requests}
            profiles={profiles}
            onSelectPackage={handleOpenPackageModal}
            onSelectProfile={handleSelectProfile}
            onOfferToCarry={handleOfferToCarry}
          />
        )}

        {currentView === 'travelers' && (
          <TravelersView 
            profiles={profiles}
            onSelectProfile={handleSelectProfile}
            onContactPhone={handleContactPhone}
          />
        )}

        {currentView === 'dashboard' && (
          currentUser ? (
            <DashboardView 
              requests={requests}
              profiles={profiles}
              currentUser={currentUser}
              onUpdateCurrentUser={setCurrentUser}
              onOpenPostModal={() => setIsPostModalOpen(true)}
              onOpenFlightModal={() => setIsFlightModalOpen(true)}
              onContactPhone={handleContactPhone}
              onSelectPackage={handleOpenPackageModal}
              onUpdatePackage={handleUpdatePackage}
              onDeletePackage={handleDeletePackage}
            />
          ) : (
            <div className="max-w-xl mx-auto px-5 py-24 text-center space-y-6">
              <div className="w-20 h-20 rounded-3xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
                <User className="w-10 h-10 text-amber-600" />
              </div>
              <div className="space-y-2">
                <h2 className="font-display text-2xl font-extrabold text-[#0D3326]">Authentication Required</h2>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                  Please sign in or create an account to view your personal delivery dashboard, track active shipments, and verify flight tickets.
                </p>
              </div>
              <button 
                onClick={() => handleOpenAuth('login')}
                className="inline-flex items-center gap-2 bg-[#0D3326] hover:bg-[#144937] text-white font-bold px-6 py-3.5 rounded-xl transition-all shadow-md text-xs cursor-pointer"
              >
                <User className="w-4 h-4 text-amber-400" />
                <span>Sign In to Access Dashboard</span>
              </button>
            </div>
          )
        )}

        {currentView === 'safety' && (
          <SafetyView />
        )}
      </div>
      </Suspense>

      {/* Dynamic Site Settings Footer */}
      <Footer 
        setCurrentView={setCurrentView} 
        onOpenPostModal={() => setIsPostModalOpen(true)} 
        showToast={showToast} 
      />

      {/* Package Detail Modal */}
      {selectedPackage && (
        <PackageDetailModal 
          item={selectedPackage}
          profile={profiles[selectedPackage.sender]}
          onClose={handleClosePackageModal}
          onOfferToCarry={handleOfferToCarry}
        />
      )}

      {/* User Profile Modal */}
      {selectedProfileModal && (
        <UserProfileModal 
          profile={selectedProfileModal}
          onClose={() => setSelectedProfileModal(null)}
        />
      )}

      {/* Direct Phone Contact Modal */}
      {selectedPhoneContact && (
        <PhoneContactModal 
          contact={selectedPhoneContact}
          onClose={() => setSelectedPhoneContact(null)}
        />
      )}

      {/* Post New Request Modal */}
      {isPostModalOpen && (
        <RequestDeliveryModal 
          onClose={() => setIsPostModalOpen(false)}
          onSubmit={handlePostNewRequest}
        />
      )}

      {/* Flight Verification Modal */}
      <FlightVerificationModal 
        isOpen={isFlightModalOpen}
        onClose={() => setIsFlightModalOpen(false)}
        onSubmit={handleVerifyFlightSubmit}
      />

      {/* Auth Modal (Login / Register / Forgot Password) */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav 
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenRequestModal={() => {
          if (!currentUser) {
            handleOpenAuth('login');
            showToast('Please sign in to request a package delivery.');
          } else {
            setIsPostModalOpen(true);
          }
        }}
        currentUser={currentUser}
        onOpenAuthModal={handleOpenAuth}
      />
    </div>
  );
}
