// src/mobile/components/settings/MobileSettingsProfileHeader.tsx
import React from 'react';
import { User, ShieldCheck } from 'lucide-react';

interface MobileSettingsProfileHeaderProps {
  displayUsername: string;
  roleName: string;
  isSuperuser?: boolean;
  email?: string;
}

export const MobileSettingsProfileHeader: React.FC<MobileSettingsProfileHeaderProps> = ({
  displayUsername,
  roleName,
  isSuperuser = false,
  email,
}) => {
  return (
    <div className="w-full bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-600 font-extrabold text-lg shadow-2xs shrink-0">
          {displayUsername.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-extrabold text-gray-900 truncate">{displayUsername}</h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            {isSuperuser ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                <ShieldCheck className="w-3 h-3 text-amber-600" /> {roleName}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-700">
                <User className="w-3 h-3 text-gray-500" /> {roleName}
              </span>
            )}
          </div>
          {email && <p className="text-xs text-gray-500 truncate mt-0.5">{email}</p>}
        </div>
      </div>
    </div>
  );
};

export default MobileSettingsProfileHeader;
