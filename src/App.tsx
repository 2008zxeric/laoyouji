import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { TabBar } from './components/TabBar';
import { HomeView } from './components/HomeView';
import { ActivitiesView } from './components/ActivitiesView';
import { EventsView } from './components/EventsView';
import { CommunityView } from './components/CommunityView';
import { AiConciergeView } from './components/AiConciergeView';
import { ProfileView } from './components/ProfileView';
import { ActivityDetailModal } from './components/ActivityDetailModal';
import { EventDetailModal } from './components/EventDetailModal';
import { BookingSheet } from './components/BookingSheet';
import { CheckinModal } from './components/CheckinModal';
import { PointsMallModal } from './components/PointsMallModal';
import { PosterGeneratorModal } from './components/PosterGeneratorModal';
import { MembershipModal } from './components/MembershipModal';
import { PointsGuideModal } from './components/PointsGuideModal';
import { InviteModal } from './components/InviteModal';
import { ReviewModal } from './components/ReviewModal';
import { GlobalAiConciergeModal } from './components/GlobalAiConciergeModal';
import { TgoListModal } from './components/TgoListModal';
import { TgoDetailModal } from './components/TgoDetailModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { FrontPreviewLayer } from './components/FrontPreviewLayer';

const MainApp: React.FC = () => {
  const {
    viewMode,
    activeTab,
    isLargeFont,
    isCareMode,
    deviceMode,
    selectedActivity,
    setSelectedActivity,
    selectedEvent,
    setSelectedEvent,
    selectedTgo,
    setSelectedTgo,
    toastMessage,
  } = useApp();

  // If in Web Admin Mode, render the full-featured Admin Dashboard
  if (viewMode === 'admin') {
    return (
      <>
        <AdminDashboard />
        {selectedActivity && (
          <ActivityDetailModal
            activity={selectedActivity}
            onClose={() => setSelectedActivity(null)}
          />
        )}
        {selectedEvent && (
          <EventDetailModal
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
          />
        )}
        {selectedTgo && (
          <TgoDetailModal
            tgo={selectedTgo}
            onClose={() => setSelectedTgo(null)}
          />
        )}
        <BookingSheet />
        <FrontPreviewLayer />
        {toastMessage && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-70 bg-amber-950/95 text-amber-200 px-4 py-2.5 rounded-2xl shadow-xl border border-amber-500/40 text-xs md:text-sm font-medium animate-fadeIn flex items-center gap-2 max-w-[90%] text-center">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            <span>{toastMessage}</span>
          </div>
        )}
      </>
    );
  }

  return (
    <div
      className={`min-h-screen bg-[#F0EFEB] flex justify-center selection:bg-[#D4AF37]/30 selection:text-[#2C3E50] ${
        isCareMode
          ? 'care-mode text-[18px] sm:text-[19px] leading-[1.75]'
          : isLargeFont
          ? 'text-[17px] leading-relaxed'
          : 'text-[15px]'
      }`}
    >
      {/* Container simulating WeChat Mini Program / Apple App or Full screen */}
      <div
        className={`w-full bg-[#FAF9F6] min-h-screen flex flex-col shadow-2xl relative transition-all duration-300 ${
          deviceMode === 'mobile' ? 'max-w-md md:max-w-xl md:my-4 md:rounded-3xl md:overflow-hidden md:border md:border-[#EAE6DF]' : 'max-w-4xl'
        }`}
      >
        {/* Top Header */}
        <Header />

        {/* Main Content Area with Bottom Padding for TabBar */}
        <main className="flex-1 p-3.5 md:p-4 pb-20 overflow-y-auto">
          {activeTab === 'home' && <HomeView />}
          {activeTab === 'activities' && <ActivitiesView />}
          {activeTab === 'events' && <EventsView />}
          {activeTab === 'community' && <CommunityView />}
          {activeTab === 'ai' && <AiConciergeView />}
          {activeTab === 'profile' && <ProfileView />}
        </main>

        {/* Bottom Tab Bar */}
        <TabBar />

        {/* Global Modals & Sheets */}
        {selectedActivity && (
          <ActivityDetailModal
            activity={selectedActivity}
            onClose={() => setSelectedActivity(null)}
          />
        )}

        {selectedEvent && (
          <EventDetailModal
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
          />
        )}

        <FrontPreviewLayer />
        <TgoListModal />

        {selectedTgo && (
          <TgoDetailModal
            tgo={selectedTgo}
            onClose={() => setSelectedTgo(null)}
          />
        )}

        <BookingSheet />
        <CheckinModal />
        <PointsMallModal />
        <PosterGeneratorModal />
        <MembershipModal />
        <PointsGuideModal />
        <InviteModal />
        <ReviewModal />
        <GlobalAiConciergeModal />

        {/* Global Floating Toast */}
        {toastMessage && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-70 bg-[#2C3E50]/95 backdrop-blur-md text-[#FAF9F6] px-4 py-2.5 rounded-2xl shadow-xl border border-[#D4AF37]/40 text-xs md:text-sm font-medium animate-fadeIn flex items-center gap-2 max-w-[90%] text-center">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-ping"></span>
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}

