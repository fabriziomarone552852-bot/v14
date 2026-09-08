// src/mobile/components/MobileDrawer.tsx
import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  CloseIcon,
  CountdownIcon,
  CalendarDayIcon,
  CalendarWeekIcon,
  CalendarMonthIcon,
  CalendarYearIcon,
  FreeTimeIcon,
  UniversityIcon,
  ShoppingIcon,
  SettingsIcon,
} from '@/components/shared/utils/Icons';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user } = useAuth();

  const displayUsername = user?.username ? user.username.toUpperCase() : 'OSPITE';
  const isActive = (path: string) => location.pathname === path;
  
  const isAgendaActive =
    isActive('/') ||
    isActive('/giorno') ||
    isActive('/settimana') ||
    isActive('/mese') ||
    isActive('/anno');

  // Chiudi drawer premendo Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Stile unificato con AppShellLayout per le voci principali
  const getMainLinkClasses = (active: boolean) => {
    const base = "flex items-center transition-all duration-200 rounded-xl focus:outline-none cursor-pointer px-4 py-3 gap-4 mx-2 justify-start";
    const colors = active
      ? "bg-blue-600 text-white shadow-md font-semibold"
      : "text-gray-400 hover:bg-gray-700 hover:text-white font-medium";
    return `${base} ${colors}`;
  };

  // Stile unificato con AppShellLayout per i sottomenu
  const getSubLinkClasses = (active: boolean) => {
    const base = "flex items-center gap-3 rounded-lg transition-colors focus:outline-none py-1.5 px-3 text-sm";
    const colors = active
      ? "bg-gray-700 text-white font-bold"
      : "text-gray-400 hover:bg-gray-700 hover:text-white";
    return `${base} ${colors}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* 1. Backdrop oscurato */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 2. Pannello Drawer laterale */}
      <div className="relative w-4/5 max-w-xs bg-gray-900 text-gray-100 h-full flex flex-col shadow-2xl z-10 animate-slideRight">
        
        {/* Drawer Header con Avatar e Username */}
        <div className="px-5 pt-6 pb-5 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 font-extrabold text-base shrink-0 shadow-xs">
              {displayUsername.charAt(0)}
            </div>
            <div className="truncate">
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                Benvenuto
              </span>
              <h2 className="text-base font-extrabold text-white truncate leading-tight">
                {displayUsername}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors focus:outline-none cursor-pointer"
            aria-label="Chiudi menu"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Voci di Navigazione */}
        <nav className="flex-1 overflow-y-auto px-1 py-4 space-y-1 custom-scrollbar">
          
          {/* Sezione: Agenda */}
          <div className="flex flex-col">
            <Link
              to="/"
              onClick={onClose}
              className={getMainLinkClasses(isAgendaActive && isActive('/'))}
            >
              <CountdownIcon className="w-6 h-6 shrink-0" />
              <span className="font-semibold tracking-wide text-sm">Agenda</span>
            </Link>

            {/* Sottomenu Viste Agenda: mostrato SOLO quando ci si trova in una pagina Agenda */}
            {isAgendaActive && (
              <div className="flex flex-col mt-1 mb-2 animate-fadeIn pl-6 pr-2 space-y-1">
                <Link
                  to="/giorno"
                  onClick={onClose}
                  className={getSubLinkClasses(isActive('/giorno'))}
                >
                  <CalendarDayIcon className="w-4 h-4 shrink-0" />
                  <span className="text-sm">Giorno</span>
                </Link>

                <Link
                  to="/settimana"
                  onClick={onClose}
                  className={getSubLinkClasses(isActive('/settimana'))}
                >
                  <CalendarWeekIcon className="w-4 h-4 shrink-0" />
                  <span className="text-sm">Settimana</span>
                </Link>

                <Link
                  to="/mese"
                  onClick={onClose}
                  className={getSubLinkClasses(isActive('/mese'))}
                >
                  <CalendarMonthIcon className="w-4 h-4 shrink-0" />
                  <span className="text-sm">Mese</span>
                </Link>

                <Link
                  to="/anno"
                  onClick={onClose}
                  className={getSubLinkClasses(isActive('/anno'))}
                >
                  <CalendarYearIcon className="w-4 h-4 shrink-0" />
                  <span className="text-sm">Anno</span>
                </Link>
              </div>
            )}
          </div>

          {/* Voci Principali: Free Time, Università, Shopping */}
          <Link
            to="/free-time"
            onClick={onClose}
            className={getMainLinkClasses(isActive('/free-time'))}
          >
            <FreeTimeIcon className="w-6 h-6 shrink-0" />
            <span className="font-semibold tracking-wide text-sm">Free Time</span>
          </Link>

          <Link
            to="/universita"
            onClick={onClose}
            className={getMainLinkClasses(isActive('/universita'))}
          >
            <UniversityIcon className="w-6 h-6 shrink-0" />
            <span className="font-semibold tracking-wide text-sm">Università</span>
          </Link>

          <Link
            to="/shopping"
            onClick={onClose}
            className={getMainLinkClasses(isActive('/shopping'))}
          >
            <ShoppingIcon className="w-6 h-6 shrink-0" />
            <span className="font-semibold tracking-wide text-sm">Shopping</span>
          </Link>

          {/* Superuser Section (se admin) */}
          {user?.is_superuser && (
            <div className="pt-3 mt-1 border-t border-gray-800 flex flex-col gap-1">
              <p className="px-6 text-[9px] font-bold text-amber-500 uppercase tracking-wider mb-1">
                Pannello SU
              </p>
              <Link
                to="/admin"
                onClick={onClose}
                className={getMainLinkClasses(isActive('/admin'))}
              >
                <span className="text-base leading-none">🛡️</span>
                <span className="font-semibold tracking-wide text-sm">Amministrazione SU</span>
              </Link>
            </div>
          )}

        </nav>

        {/* Drawer Footer: Solo Tasto Impostazioni */}
        <div className="p-3 border-t border-gray-800 bg-gray-900/90">
          <Link
            to="/settings"
            onClick={onClose}
            className={getMainLinkClasses(isActive('/settings'))}
          >
            <SettingsIcon className="w-6 h-6 shrink-0" />
            <span className="font-semibold tracking-wide text-sm">Impostazioni</span>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default MobileDrawer;
