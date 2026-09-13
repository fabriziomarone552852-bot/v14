// src/mobile/components/shopping/picker/GroupCardHeader.tsx
import React from 'react';
import type { ShoppingGroupSummary } from '@/types/shopping';
import { ChevronDownIcon, InfoIcon } from '@/components/shared/utils/Icons';
import { getRoleBadgeClass } from '@/components/shared/shopping/shoppingUi';
import { useLongPress } from '@/mobile/hooks/useLongPress';

export interface GroupCardHeaderProps {
  group: ShoppingGroupSummary;
  listsCount: number;
  isExpanded: boolean;
  isSelected: boolean;
  isSelectionActive: boolean;
  onToggle: () => void;
  onToggleSelect: (groupKey: string) => void;
  onOpenDetail: (group: ShoppingGroupSummary) => void;
}

export const GroupCardHeader: React.FC<GroupCardHeaderProps> = ({
  group,
  listsCount,
  isExpanded,
  isSelected,
  isSelectionActive,
  onToggle,
  onToggleSelect,
  onOpenDetail,
}) => {
  const groupKey = `group-${group.id}`;
  const longPressHandlers = useLongPress({
    onLongPress: () => onToggleSelect(groupKey),
    onClick: () => {
      if (isSelectionActive) {
        onToggleSelect(groupKey);
      } else {
        onToggle();
      }
    },
  });

  return (
    <div
      {...longPressHandlers}
      className={`flex items-center justify-between gap-2 p-3 transition-colors cursor-pointer select-none ${
        isSelected ? 'bg-blue-50/90' : 'bg-gray-50 hover:bg-gray-100/80'
      }`}
    >
      <div className="flex-1 min-w-0 flex items-center gap-3 pointer-events-none">
        <div className="w-10 h-10 rounded-xl bg-white border border-gray-200/80 flex items-center justify-center text-xl shrink-0 shadow-2xs">
          {group.icon || '👥'}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <h3
              className="text-sm font-extrabold text-gray-900 truncate min-w-0 flex-1"
              title={group.name}
            >
              {group.name}
            </h3>
            {group.userRole && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded border uppercase shrink-0 ${getRoleBadgeClass(
                  group.userRole
                )}`}
              >
                {group.userRole}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 font-medium mt-0.5 truncate">
            {listsCount} {listsCount === 1 ? 'lista' : 'liste'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0 ml-1">
        {/* Tasto icon-only per aprire il dettaglio gruppo */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetail(group);
          }}
          className="w-7 h-7 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-gray-200/70 flex items-center justify-center transition-colors cursor-pointer"
          title="Dettagli gruppo e collaboratori"
          aria-label={`Dettagli ${group.name}`}
        >
          <InfoIcon className="w-4 h-4" />
        </button>

        {/* Tasto freccia per comprimere/espandere */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className={`p-1.5 text-gray-400 hover:text-blue-600 transition-transform duration-200 cursor-pointer ${
            isExpanded ? 'rotate-180 text-blue-600' : ''
          }`}
          title={isExpanded ? 'Comprimi' : 'Espandi'}
          aria-label={isExpanded ? 'Comprimi' : 'Espandi'}
        >
          <ChevronDownIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
