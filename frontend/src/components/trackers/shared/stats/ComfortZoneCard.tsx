import { useState } from 'react';
import { StarRating } from '@/components/trackers/SeriesDetailModal/StarRating';
import { EmptyState } from '@/components/shared/utils/EmptyState';

export interface RewatchEntry {
  title: string;
  rewatch_count: number;
  rating?: number | null;
}

export interface ComfortZoneTab<T extends string = string> {
  key: T;
  label: string;
  items: RewatchEntry[];
}

export interface ComfortZoneCardProps<T extends string = string> {
  title?: string;
  items?: RewatchEntry[];
  tabs?: ComfortZoneTab<T>[];
  defaultTabKey?: T;
  emptyMessage?: string;
  className?: string;
}

export function ComfortZoneCard<T extends string = string>({
  title = 'Comfort Zone',
  items = [],
  tabs,
  defaultTabKey,
  emptyMessage = 'Nessun dato.',
  className = '',
}: ComfortZoneCardProps<T>) {
  const [activeTab, setActiveTab] = useState<T | undefined>(
    defaultTabKey ?? (tabs && tabs.length > 0 ? tabs[0].key : undefined)
  );

  const displayItems = tabs
    ? (tabs.find((t) => t.key === activeTab)?.items ?? [])
    : items;

  return (
    <div
      className={`bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col overflow-hidden ${className}`}
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-4 shrink-0">
        <h3 className="text-lg font-extrabold text-slate-800">{title}</h3>
        {tabs && tabs.length > 0 && (
          <div className="flex bg-slate-100 rounded-lg p-0.5 shrink-0">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                    isActive
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
        {displayItems && displayItems.length > 0 ? (
          displayItems.map((r, i) => (
            <div
              key={`${r.title}-${i}`}
              className="flex items-center gap-3 bg-slate-50 p-2 rounded-lg border border-slate-100"
            >
              <span className="text-xl shrink-0">
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🛋️'}
              </span>
              <div className="flex-1 overflow-hidden">
                <span className="text-sm font-bold text-slate-700 truncate block">
                  {r.title}
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  {r.rating !== undefined && r.rating !== null ? (
                    <>
                      <StarRating
                        value={r.rating}
                        readonly
                        hideNumber
                        iconClassName="w-3 h-3"
                      />
                      <span className="text-xs font-bold text-slate-500">
                        {r.rating.toFixed(1)}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs font-bold text-slate-400">---</span>
                  )}
                </div>
              </div>
              <span className="text-sm font-black text-indigo-600 shrink-0">
                x{r.rewatch_count}
              </span>
            </div>
          ))
        ) : (
          <EmptyState message={emptyMessage} />
        )}
      </div>
    </div>
  );
}
