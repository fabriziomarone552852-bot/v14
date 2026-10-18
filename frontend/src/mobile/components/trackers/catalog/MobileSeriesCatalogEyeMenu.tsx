// src/mobile/components/trackers/catalog/MobileSeriesCatalogEyeMenu.tsx
import React from 'react';
import {
  EyeIcon,
  EyePlayIcon,
  EyeHalfOpenIcon,
  EyeClosedIcon,
} from '@/components/shared/utils/Icons';
import type { CatalogStatusTab } from './MobileSeriesCatalogHeader';

export interface MobileSeriesCatalogEyeMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: CatalogStatusTab;
  onSelectTab: (tab: CatalogStatusTab) => void;
}

export const MobileSeriesCatalogEyeMenu: React.FC<MobileSeriesCatalogEyeMenuProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
}) => {
  if (!isOpen) return null;

  const menuOptions: {
    tab: CatalogStatusTab;
    label: string;
    icon: React.ReactNode;
    iconBgClass: string;
  }[] = [
    {
      tab: 'all',
      label: 'Tutte le serie',
      icon: <EyeHalfOpenIcon className="w-4 h-4 text-blue-600" />,
      iconBgClass: 'bg-blue-100 text-blue-600',
    },
    {
      tab: 'watching',
      label: 'In corso',
      icon: <EyePlayIcon className="w-4 h-4 text-blue-600" />,
      iconBgClass: 'bg-blue-100 text-blue-600',
    },
    {
      tab: 'completed',
      label: 'Serie viste',
      icon: <EyeIcon className="w-4 h-4 text-emerald-600" />,
      iconBgClass: 'bg-emerald-100 text-emerald-600',
    },
    {
      tab: 'to_watch',
      label: 'Non viste',
      icon: <EyeClosedIcon className="w-4 h-4 text-amber-600" />,
      iconBgClass: 'bg-amber-100 text-amber-600',
    },
  ];

  return (
    <>
      {/* 1. Backdrop oscurato semi-trasparente */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-2xs transition-opacity animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 2. Menu Fluttuante Speed-Dial che si apre in basso a destra */}
      <div className="fixed top-16 right-3 z-50 flex flex-col items-end gap-2.5 animate-fadeIn select-none">
        {menuOptions.map((opt) => {
          const isSelected = activeTab === opt.tab;

          return (
            <button
              key={opt.tab}
              type="button"
              onClick={() => {
                onSelectTab(opt.tab);
                onClose();
              }}
              className={`flex items-center gap-3 bg-white text-gray-800 px-4 py-2.5 rounded-full shadow-2xl border active:scale-95 transition-all cursor-pointer group ${
                isSelected
                  ? 'border-blue-500 bg-blue-50/90 ring-2 ring-blue-500/20 shadow-blue-500/10'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span
                className={`text-xs font-bold ${
                  isSelected ? 'text-blue-700' : 'text-gray-700 group-hover:text-gray-900'
                }`}
              >
                {opt.label}
              </span>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shadow-xs shrink-0 ${opt.iconBgClass}`}
              >
                {opt.icon}
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
};

export default MobileSeriesCatalogEyeMenu;
