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
    <div className="p-3 border-t border-gray-800 bg-gray-900/90 flex flex-col gap-2">

      <Link
        to="/settings"
        onClick={onClose}
        className={getMainLinkClasses(isActive('/settings'))}
      >
        <div className="relative shrink-0 flex">
          <SettingsIcon className="w-6 h-6" />

        </div>
        <span className="font-semibold tracking-wide text-sm flex-1">Impostazioni</span>
      </Link>
    </div>
  );
};
