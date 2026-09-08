// src/mobile/layouts/MobileAppShell.tsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import MobileHeader from '../components/MobileHeader';
import MobileDrawer from '../components/MobileDrawer';

export const MobileAppShell: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
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
  );
};

export default MobileAppShell;
