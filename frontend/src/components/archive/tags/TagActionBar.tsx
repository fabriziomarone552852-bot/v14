// src/components/tags/TagActionBar.tsx
import React from 'react';
import { SegmentedTabs, type TabItem } from '@/components/shared/layout/SegmentedTabs';
import { SearchIcon, UndoIcon, TagIcon, TaskListIcon } from '@/components/shared/utils/Icons';

export type TagViewTab = 'cloud' | 'table';

interface TagActionBarProps {
  activeTab: TagViewTab;
  onTabChange: (tab: TagViewTab) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onResetSearch: () => void;
  panelClass?: string;
}

export const TagActionBar: React.FC<TagActionBarProps> = ({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  onResetSearch,
  panelClass = '',
}) => {
  const tabs: TabItem<TagViewTab>[] = [
    {
      id: 'cloud',
      label: 'Bacheca Tag',
      icon: <TagIcon className="w-3.5 h-3.5" />,
    },
    {
      id: 'table',
      label: 'Tabella Tag',
      icon: <TaskListIcon className="w-3.5 h-3.5" />,
    },
  ];

  const isFiltered = searchQuery.trim().length > 0;

  return (
    <section className={`${panelClass} p-3 sm:p-4 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3`}>
      {/* 1. SLIDER A SINISTRA: BACHECA / TABELLA */}
      <SegmentedTabs<TagViewTab>
        tabs={tabs}
        activeTab={activeTab}
        onChange={onTabChange}
      />

      {/* 2. BARRA DI RICERCA A DESTRA */}
      <div className="relative w-full sm:w-80">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <SearchIcon className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cerca tag..."
          className="w-full pl-9 pr-9 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs font-semibold text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
        />
        {isFiltered && (
          <button
            type="button"
            onClick={onResetSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            title="Azzera ricerca"
          >
            <UndoIcon className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </section>
  );
};

export default TagActionBar;
