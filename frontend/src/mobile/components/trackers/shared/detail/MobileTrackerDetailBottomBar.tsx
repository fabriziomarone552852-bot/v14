// src/mobile/components/trackers/detail/MobileTrackerDetailBottomBar.tsx
import React from 'react';

export interface MobileTrackerBottomBarTab<T extends string = string> {
  id: T;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
}

export interface MobileTrackerDetailBottomBarProps<T extends string = string> {
  activeTab: T;
  tabs: MobileTrackerBottomBarTab<T>[];
  onTabChange: (tab: T) => void;
}

export function MobileTrackerDetailBottomBar<T extends string = string>({
  activeTab,
  tabs,
  onTabChange,
}: MobileTrackerDetailBottomBarProps<T>) {
  const gridColsClass =
    tabs.length === 2
      ? 'grid-cols-2'
      : tabs.length === 4
      ? 'grid-cols-4'
      : 'grid-cols-3';

  return (
    <div
      className={`grid ${gridColsClass} gap-2.5 p-2.5 bg-white border-t border-gray-200 shrink-0 pb-[max(env(safe-area-inset-bottom,0px),10px)] select-none`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`relative flex items-center justify-center h-11 rounded-2xl border active:scale-95 transition-all shadow-xs cursor-pointer ${
              isActive
                ? 'border-blue-400 bg-blue-50 text-blue-600 ring-2 ring-blue-400/20'
                : 'border-gray-200 bg-gray-50/70 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
            }`}
            title={tab.label}
            aria-label={tab.label}
          >
            <div
              className={`transition-transform flex items-center justify-center ${
                isActive ? 'scale-110' : ''
              }`}
            >
              {tab.icon}
            </div>
            {Boolean(tab.badge) && (
              <span className="absolute top-1 right-2 bg-blue-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full shadow-xs">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default MobileTrackerDetailBottomBar;
