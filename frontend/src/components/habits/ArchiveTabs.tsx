// src/components/habits/ArchiveTabs.tsx
import React from 'react';

export type HabitTabType = 'routines' | 'habits';

interface ArchiveTabsProps {
  activeTab: HabitTabType;
  onTabChange: (tab: HabitTabType) => void;
  routinesCount: number;
  habitsCount: number;
  className?: string;
}

export const ArchiveTabs: React.FC<ArchiveTabsProps> = ({
  activeTab,
  onTabChange,
  routinesCount,
  habitsCount,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100/80 border border-slate-200/80 w-fit shrink-0 ${className}`}>
      {/* 1. TAB ROUTINES */}
      <button
        type="button"
        onClick={() => onTabChange('routines')}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer select-none ${
          activeTab === 'routines'
            ? 'bg-white text-slate-900 shadow-xs border border-slate-200/90'
            : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
        }`}
      >
        <span className="text-sm">🔄</span>
        <span>Routines</span>
        <span
          className={`ml-0.5 px-2 py-0.5 rounded-full text-[10px] font-black ${
            activeTab === 'routines'
              ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
              : 'bg-slate-200/80 text-slate-600'
          }`}
        >
          {routinesCount}
        </span>
      </button>

      {/* 2. TAB HABITS */}
      <button
        type="button"
        onClick={() => onTabChange('habits')}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer select-none ${
          activeTab === 'habits'
            ? 'bg-white text-slate-900 shadow-xs border border-slate-200/90'
            : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
        }`}
      >
        <span className="text-sm">✨</span>
        <span>Habits</span>
        <span
          className={`ml-0.5 px-2 py-0.5 rounded-full text-[10px] font-black ${
            activeTab === 'habits'
              ? 'bg-purple-50 text-purple-700 border border-purple-200/60'
              : 'bg-slate-200/80 text-slate-600'
          }`}
        >
          {habitsCount}
        </span>
      </button>
    </div>
  );
};

export default ArchiveTabs;
