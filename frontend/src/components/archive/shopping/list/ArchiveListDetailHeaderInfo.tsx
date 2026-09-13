// src/components/archive/shopping/list/ArchiveListDetailHeaderInfo.tsx
import React from 'react';
import type { ShoppingListSummary } from '@/types/shopping';
import { UsersIcon, LockIcon } from '@/components/shared/utils/Icons';

export interface ArchiveListDetailHeaderInfoProps {
  list: ShoppingListSummary;
  completedCount: number;
  totalCount: number;
  progressPercent: number;
}

export const ArchiveListDetailHeaderInfo: React.FC<ArchiveListDetailHeaderInfoProps> = ({
  list,
  completedCount,
  totalCount,
  progressPercent,
}) => {
  const isGroup = Boolean(list.groupId || list.groupName);

  return (
    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl shrink-0">📝</span>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-gray-900 truncate" title={list.name}>
              {list.name}
            </h3>
            {list.description && (
              <p className="text-xs text-gray-400 truncate">{list.description}</p>
            )}
          </div>
        </div>

        {isGroup ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
            <UsersIcon className="w-3.5 h-3.5" />
            <span className="truncate max-w-[120px]">{list.groupName || 'Gruppo'}</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 border border-gray-200 shrink-0">
            <LockIcon className="w-3.5 h-3.5" />
            <span>Personale</span>
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex items-center justify-between text-xs font-semibold text-gray-500 mb-1">
          <span>Progresso spesa</span>
          <span>
            {completedCount}/{totalCount} acquistati ({progressPercent}%)
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
