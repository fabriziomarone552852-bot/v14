import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useBackHandler } from '@/utils/backButtonManager';
import {
  MobileDrawerHeader,
  MobileDrawerNavLinks,
  MobileDrawerFooter,
} from './drawer';

export interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  useBackHandler(isOpen, onClose, 8);
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
        <MobileDrawerHeader displayUsername={displayUsername} onClose={onClose} />
        <MobileDrawerNavLinks
          isAgendaActive={isAgendaActive}
          isActive={isActive}
          onClose={onClose}
          isSuperuser={user?.is_superuser}
        />
        <MobileDrawerFooter isActive={isActive} onClose={onClose} />
      </div>
    </div>
  );
};

export default MobileDrawer;
