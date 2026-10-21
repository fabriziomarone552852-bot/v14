import React from 'react';
import { Link } from 'react-router-dom';
import { SettingsIcon, BellIcon } from '@/components/shared/utils/Icons';

export interface MobileDrawerFooterProps {
  isActive: (path: string) => boolean;
  onClose: () => void;
  hasUnread?: boolean;
  onOpenNotifications?: () => void;
}

export const MobileDrawerFooter: React.FC<MobileDrawerFooterProps> = ({
  isActive,
  onClose,
  hasUnread = false,
  onOpenNotifications,
}) => {
  return (
    <div className="p-3 border-t border-gray-800 bg-gray-900/90 grid grid-cols-5 gap-2 items-center">
      {/* 1. 4 Colonne per Impostazioni */}
      <Link
        to="/settings"
        onClick={onClose}
        className={`col-span-4 flex items-center transition-all duration-200 rounded-xl focus:outline-none cursor-pointer px-4 py-3 gap-3 justify-start ${
          isActive('/settings')
            ? 'bg-blue-600 text-white shadow-md font-semibold'
            : 'text-gray-400 hover:bg-gray-700 hover:text-white font-medium'
        }`}
      >
        <div className="relative shrink-0 flex">
          <SettingsIcon className="w-6 h-6" />
        </div>
        <span className="font-semibold tracking-wide text-sm flex-1 truncate">
          Impostazioni
        </span>
      </Link>

      {/* 2. 1 Colonna per Campanella Notifiche */}
      <button
        type="button"
        onClick={() => {
          onClose();
          onOpenNotifications?.();
        }}
        className={`col-span-1 h-full min-h-[48px] rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer focus:outline-none relative active:scale-95 ${
          hasUnread
            ? 'bg-red-600 text-white shadow-md animate-pulse hover:bg-red-500'
            : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
        }`}
        title="Notifiche & Inbox"
        aria-label="Notifiche & Inbox"
      >
        <div className="relative">
          <BellIcon className="w-5 h-5" />
          {hasUnread && (
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
          )}
        </div>
      </button>
    </div>
  );
};

export default MobileDrawerFooter;
