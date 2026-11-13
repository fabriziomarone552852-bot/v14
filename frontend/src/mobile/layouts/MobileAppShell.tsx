import React, { useState, useEffect, Suspense } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { App as CapApp } from '@capacitor/app';
import MobileHeader from '../components/MobileHeader';
import MobileDrawer from '../components/MobileDrawer';
import { initCapacitorBackButton } from '@/utils/backButtonManager';

import { MobileSelectionProvider } from '../context/MobileSelectionContext';
import { TrackerHeaderProvider } from '@/context/TrackerHeaderContext';
import { TrackerToast } from '@/components/trackers/shared/TrackerToast';
import { MobileNotificationsSheet } from '../components/notifications/MobileNotificationsSheet';
import { useNotificationsInbox } from '@/hooks/useNotificationsInbox';
import { WeatherBadge } from '@/components/weather/WeatherBadge';

const ARCHIVE_PATHS = [
  '/tasks',
  '/events',
  '/categories',
  '/countdowns',
  '/habits',
  '/notes',
  '/reviews',
  '/tags',
  '/fornitori',
  '/shopping-archive',
];

export const MobileAppShell: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { hasUnread } = useNotificationsInbox();
  const location = useLocation();
  const navigate = useNavigate();

  // Inizializza gestione globale tasto Indietro per la piattaforma nativa (Android)
  useEffect(() => {
    return initCapacitorBackButton(() => {
      const path = location.pathname;
      const isSettingsSubpage = path.startsWith('/settings/') || path === '/archivio' || path === '/admin';
      const isArchivePage = ARCHIVE_PATHS.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));

      if (isArchivePage) {
        navigate('/settings/archive');
      } else if (isSettingsSubpage) {
        navigate('/settings');
      } else if (path !== '/') {
        navigate('/');
      } else {
        CapApp.exitApp();
      }
    });
  }, [location.pathname, navigate]);

  const isSettings = location.pathname.startsWith('/settings') || location.pathname === '/archivio';

  return (
    <MobileSelectionProvider>
      <TrackerHeaderProvider>
        <div className="h-[100dvh] flex flex-col overflow-hidden bg-gray-50 text-gray-900 selection:bg-blue-600 selection:text-white font-sans relative">
          
          {/* 1. HEADER MOBILE (Stile Google Calendar con Hamburger, Selettore 4 viste & Impostazioni) */}
          <MobileHeader
            onOpenDrawer={() => setIsDrawerOpen(true)}
            hasUnread={hasUnread}
          />

          {/* 2. MENU LATERALE A SCOMPARSA (Drawer) */}
          <MobileDrawer
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            hasUnread={hasUnread}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
          />

          {/* 3. MAIN CONTENT AREA (Occupa tutto lo spazio residuo senza scrollbar esterne) */}
          <main className={`flex-1 min-h-0 w-full max-w-lg mx-auto px-2 py-1.5 pb-20 overflow-y-auto flex flex-col ${isSettings ? 'no-scrollbar' : 'custom-scrollbar'}`}>
            <Suspense
              fallback={
                <div className="flex flex-1 items-center justify-center">
                  <div className="w-7 h-7 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </main>

          {/* 4. CASSETTO NOTIFICHE E MESSAGGI TOUCH-FRIENDLY (Apertura dal basso) */}
          <MobileNotificationsSheet
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
          />

          {/* 5. ADESIVO METEO FLUTTUANTE MOBILE (Angolo in Basso a Destra - Tocco Prolungato 600ms) */}
          <div className="fixed bottom-4 right-4 z-40 pointer-events-auto select-none">
            <WeatherBadge
              isToday={true}
              compact={true}
              requireLongPress={true}
              className="shadow-md bg-white/95 backdrop-blur-md border-slate-300/80 active:shadow-sm"
            />
          </div>

          {/* Notifiche / Avvisi Tracker in-app non bloccanti */}
          <TrackerToast />
        </div>
      </TrackerHeaderProvider>
    </MobileSelectionProvider>
  );
};

export default MobileAppShell;
