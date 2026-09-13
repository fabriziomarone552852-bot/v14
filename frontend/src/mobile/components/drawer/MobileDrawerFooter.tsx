// src/mobile/components/drawer/MobileDrawerFooter.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { SettingsIcon } from '@/components/shared/utils/Icons';
import { getMainLinkClasses } from './MobileDrawerNavLinks';

export interface MobileDrawerFooterProps {
  isActive: (path: string) => boolean;
  onClose: () => void;
}

export const MobileDrawerFooter: React.FC<MobileDrawerFooterProps> = ({
  isActive,
  onClose,
}) => {
  return (
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
  );
};
