// src/components/settings/UserSettingsTabsNav.tsx
import React from 'react';
import type { SettingsTabId } from '@/types/settings';

interface UserSettingsTabsNavProps {
  activeTab: SettingsTabId;
  onTabChange: (tab: SettingsTabId) => void;
}

const TABS: { id: SettingsTabId; label: string; icon: string }[] = [
  { id: 'profile', label: 'Profilo', icon: '👤' },
  { id: 'tasks', label: 'Gerarchia Task', icon: '📋' },
  { id: 'integrations', label: 'Integrazioni', icon: '🔗' },
  { id: 'memory', label: 'Memoria', icon: '⚡' },
  { id: 'danger', label: 'Zona Pericolo', icon: '⚠️' },
];

export const UserSettingsTabsNav: React.FC<UserSettingsTabsNavProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 w-full">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold transition focus:outline-none cursor-pointer ${
              isActive
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white/90 border border-slate-200/80 text-slate-600 hover:bg-white hover:text-slate-900 shadow-sm'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
