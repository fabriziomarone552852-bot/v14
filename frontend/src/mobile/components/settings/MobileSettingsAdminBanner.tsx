// src/mobile/components/settings/MobileSettingsAdminBanner.tsx
import React from 'react';
import { Shield, ChevronRight } from 'lucide-react';

interface MobileSettingsAdminBannerProps {
  onOpenAdmin: () => void;
}

export const MobileSettingsAdminBanner: React.FC<MobileSettingsAdminBannerProps> = ({
  onOpenAdmin,
}) => {
  return (
    <div className="w-full bg-gradient-to-r from-amber-50 to-orange-50/60 border border-amber-200 rounded-2xl p-3.5 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              Pannello Amministrazione
            </h3>
            <p className="text-[11px] text-amber-700">Gestione utenti, codici e server</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenAdmin}
          className="py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
        >
          <span>Apri</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default MobileSettingsAdminBanner;
