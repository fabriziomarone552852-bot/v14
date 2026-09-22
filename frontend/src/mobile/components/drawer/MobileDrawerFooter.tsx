import React from 'react';
import { Link } from 'react-router-dom';
import { SettingsIcon } from '@/components/shared/utils/Icons';
import { getMainLinkClasses } from './MobileDrawerNavLinks';
import { useSocial } from '@/hooks/useSocial';

export interface MobileDrawerFooterProps {
  isActive: (path: string) => boolean;
  onClose: () => void;
}

export const MobileDrawerFooter: React.FC<MobileDrawerFooterProps> = ({
  isActive,
  onClose,
}) => {
  const { pendingRequests } = useSocial();
  const pendingCount = pendingRequests.length;

  return (
    <div className="p-3 border-t border-gray-800 bg-gray-900/90">
      <Link
        to="/settings"
        onClick={onClose}
        className={getMainLinkClasses(isActive('/settings'))}
      >
        <div className="relative shrink-0 flex">
          <SettingsIcon className="w-6 h-6" />
          {pendingCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-gray-900 ring-1 ring-red-400/50 shadow-sm" />
          )}
        </div>
        <span className="font-semibold tracking-wide text-sm flex-1">Impostazioni</span>
      </Link>
    </div>
  );
};
