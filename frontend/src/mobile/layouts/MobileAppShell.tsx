import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { App as CapApp } from '@capacitor/app';
import MobileHeader from '../components/MobileHeader';
import MobileDrawer from '../components/MobileDrawer';
import { initCapacitorBackButton } from '@/utils/backButtonManager';

import { MobileSelectionProvider } from '../context/MobileSelectionContext';

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

  return (
    <MobileSelectionProvider>
      <div className="h-[100dvh] flex flex-col overflow-hidden bg-gray-50 text-gray-900 selection:bg-blue-600 selection:text-white font-sans relative">
        
        {/* 1. HEADER MOBILE (Stile Google Calendar con Hamburger, Selettore 4 viste & Impostazioni) */}
        <MobileHeader
          onOpenDrawer={() => setIsDrawerOpen(true)}
        />

        {/* 2. MENU LATERALE A SCOMPARSA (Drawer) */}
        <MobileDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
        />

        {/* 3. MAIN CONTENT AREA (Occupa tutto lo spazio residuo senza scrollbar esterne) */}
        <main className="flex-1 min-h-0 w-full max-w-lg mx-auto px-2 py-1.5 overflow-y-auto custom-scrollbar flex flex-col">
          <Outlet />
        </main>

      </div>
    </MobileSelectionProvider>
  );
};

export default MobileAppShell;
