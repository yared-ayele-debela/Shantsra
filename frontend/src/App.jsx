import React, { useState, useEffect, useMemo } from 'react';
import { User } from 'lucide-react';
import Header from './components/Header';
import HomeView from './components/HomeView';
import PackagesView from './components/PackagesView';
import TravelersView from './components/TravelersView';
import DashboardView from './components/DashboardView';
import SafetyView from './components/SafetyView';

import PackageDetailModal from './components/PackageDetailModal';
import UserProfileModal from './components/UserProfileModal';
import RequestDeliveryModal from './components/RequestDeliveryModal';
import FlightVerificationModal from './components/FlightVerificationModal';
import AuthModal from './components/AuthModal';
import ChatDrawer from './components/ChatDrawer';
import AppLoadingOverlay from './components/AppLoadingOverlay';
import MobileBottomNav from './components/MobileBottomNav';
import Footer from './components/Footer';

import { DEFAULT_REQUESTS, DEFAULT_PROFILES } from './data/initialData';

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
      "Awesome! Bole Airport T2 works perfectly for handover. I can meet you there.",
      "Sure, the bag is clean and tightly sealed. No issues with inspection! Looking forward to it."
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
      "That is perfect! I will coordinate the handover address. Let me know when you are nearby.",
      "Thanks so much! My family in Addis will meet you immediately upon your flight arrival."
    ],
    replyIndex: 0
  }
];

export default function App() {
  const [currentView, setCurrentView] = useState('home');
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
        photoSrc = rawPhoto.trim();
        if (!photoSrc.startsWith('http://') && !photoSrc.startsWith('https://') && !photoSrc.startsWith('/') && !photoSrc.startsWith('data:')) {
          photoSrc = `/storage/${photoSrc}`;
        }
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
        photoSrc = rawPhoto.trim();
        if (!photoSrc.startsWith('http://') && !photoSrc.startsWith('https://') && !photoSrc.startsWith('/') && !photoSrc.startsWith('data:')) {
          photoSrc = `/storage/${photoSrc}`;
        }
      }
      setSelectedProfileModal({
        ...currentUser,
        name: currentUser.name || target,
        photo: photoSrc,
        photo_url: photoSrc,
        rating: '5.0',
        deliveriesCount: 3,
        bio: 'Verified active user on Souq & Sheba platform.',
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
        photoSrc = rawPhoto.trim();
        if (!photoSrc.startsWith('http://') && !photoSrc.startsWith('https://') && !photoSrc.startsWith('/') && !photoSrc.startsWith('data:')) {
          photoSrc = `/storage/${photoSrc}`;
        }
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
      bio: 'Member of Souq & Sheba delivery community.',
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
      await fetch('/api/logout', { method: 'POST' });
    } catch (err) {
      console.log('Logout API call complete.');
    }
    setCurrentUser(null);
    showToast('Logged out successfully.');
  };

  const handlePostNewRequest = (newReq) => {
    setRequests(prev => [newReq, ...prev]);
    showToast(`Package request "${newReq.title}" posted successfully!`);
  };

  const handleOfferToCarry = (item) => {
    if (!currentUser) {
      handleOpenAuth('login');
      showToast('Please sign in to offer package carriage.');
      return;
    }
    setSelectedPackage(null);
    setIsChatDrawerOpen(true);
    showToast(`Negotiation chat room opened for "${item.title}".`);
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



  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1C160F] pb-16 lg:pb-0">
      {/* App Initialization Loading Overlay */}
      <AppLoadingOverlay isLoading={isAppLoading} />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-[#1C160F] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-amber-400/20 text-xs font-bold animate-bounce">
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
      <div className="flex-1">
        {currentView === 'home' && (
          <HomeView 
            requests={requests}
            profiles={profiles}
            onSelectPackage={setSelectedPackage}
            onSelectProfile={handleSelectProfile}
            onOfferToCarry={handleOfferToCarry}
            onOpenPostModal={() => {
              if (!currentUser) {
                handleOpenAuth('login');
                showToast('Please sign in to request a package delivery.');
              } else {
                setIsPostModalOpen(true);
              }
            }}
            onOpenChatDrawer={() => setIsChatDrawerOpen(true)}
          />
        )}

        {currentView === 'packages' && (
          <PackagesView 
            requests={requests}
            profiles={profiles}
            onSelectPackage={setSelectedPackage}
            onSelectProfile={handleSelectProfile}
            onOfferToCarry={handleOfferToCarry}
          />
        )}

        {currentView === 'travelers' && (
          <TravelersView 
            profiles={profiles}
            onSelectProfile={handleSelectProfile}
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
              onOpenChatDrawer={() => setIsChatDrawerOpen(true)}
              onSelectPackage={setSelectedPackage}
            />
          ) : (
            <div className="max-w-xl mx-auto px-5 py-24 text-center space-y-6">
              <div className="w-20 h-20 rounded-3xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
                <User className="w-10 h-10 text-amber-600" />
              </div>
              <div className="space-y-2">
                <h2 className="font-display text-2xl font-extrabold text-[#1C160F]">Authentication Required</h2>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                  Please sign in or create an account to view your personal delivery dashboard, track active shipments, and verify flight tickets.
                </p>
              </div>
              <button 
                onClick={() => handleOpenAuth('login')}
                className="inline-flex items-center gap-2 bg-[#1C160F] hover:bg-amber-600 text-white hover:text-[#1C160F] font-bold px-6 py-3.5 rounded-xl transition-all shadow-md text-xs cursor-pointer"
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
          onClose={() => setSelectedPackage(null)}
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

      {/* Interactive Chat Drawer */}
      <ChatDrawer 
        isOpen={isChatDrawerOpen}
        onClose={() => setIsChatDrawerOpen(false)}
        chats={chats}
        setChats={setChats}
        activeChatId={activeChatId}
        setActiveChatId={setActiveChatId}
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
        onOpenChatDrawer={() => setIsChatDrawerOpen(true)}
        currentUser={currentUser}
        onOpenAuthModal={handleOpenAuth}
      />
    </div>
  );
}
