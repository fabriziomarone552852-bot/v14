// src/mobile/components/MobileBottomNav.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, ShoppingBag, Settings } from 'lucide-react';
import { useSocial } from '@/hooks/useSocial';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;
  const { pendingRequests } = useSocial();

  // Active state detection
  const isAgendaActive =
    path === '/' ||
    path === '/giorno' ||
    path === '/settimana' ||
    path === '/mese' ||
    path === '/anno';

  const isShoppingActive = path === '/shopping' || path === '/shopping-archive';

  const isSettingsActive =
    path === '/settings' ||
    path.startsWith('/settings/') ||
    path === '/archivio' ||
    path === '/admin' ||
    path === '/tasks' ||
    path === '/events' ||
    path === '/categories' ||
    path.startsWith('/categories/') ||
    path === '/countdowns' ||
    path === '/habits' ||
    path === '/notes' ||
    path === '/reviews' ||
    path === '/tags' ||
    path === '/fornitori';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 pb-[env(safe-area-inset-bottom,8px)] pt-2 shadow-lg">
      <div className="max-w-md mx-auto grid grid-cols-3 gap-2 px-4">
        
        {/* 1. AGENDA (Punta a '/' Dashboard) */}
        <Link
          to="/"
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 ${
            isAgendaActive
              ? 'text-blue-600 font-bold bg-blue-50/80 shadow-xs'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <div className="relative">
            <Calendar className={`w-5 h-5 transition-transform ${isAgendaActive ? 'scale-110 stroke-[2.5]' : 'stroke-2'}`} />
            {isAgendaActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full" />
            )}
          </div>
          <span className="text-[11px] tracking-tight mt-1">Agenda</span>
        </Link>

        {/* 2. SHOPPING */}
        <Link
          to="/shopping"
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 ${
            isShoppingActive
              ? 'text-emerald-600 font-bold bg-emerald-50/80 shadow-xs'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <div className="relative">
            <ShoppingBag className={`w-5 h-5 transition-transform ${isShoppingActive ? 'scale-110 stroke-[2.5]' : 'stroke-2'}`} />
            {isShoppingActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-emerald-600 rounded-full" />
            )}
          </div>
          <span className="text-[11px] tracking-tight mt-1">Spesa</span>
        </Link>

        {/* 3. IMPOSTAZIONI & ALTRO */}
        <Link
          to="/settings"
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 ${
            isSettingsActive
              ? 'text-purple-600 font-bold bg-purple-50/80 shadow-xs'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <div className="relative">
            <Settings className={`w-5 h-5 transition-transform ${isSettingsActive ? 'scale-110 stroke-[2.5]' : 'stroke-2'}`} />
            {isSettingsActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-purple-600 rounded-full" />
            )}
            {pendingRequests.length > 0 && (
              <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white ring-1 ring-red-200 shadow-sm" />
            )}
          </div>
          <span className="text-[11px] tracking-tight mt-1">Impostazioni</span>
        </Link>

      </div>
    </nav>
  );
};

export default MobileBottomNav;
