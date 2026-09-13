// src/mobile/components/chips/MobilePriorityChipItem.tsx
import React from 'react';
import { CloseIcon } from '@/components/shared/utils/Icons';
import type { LocalPriorityItem } from '@/mobile/hooks/useMobileGoalsAndPrioritiesLogic';

interface MobilePriorityChipItemProps {
  item: LocalPriorityItem;
  isCurrentlyEditing: boolean;
  isExpanded: boolean;
  hasAnyExpanded: boolean;
  editingText: string;
  onEditingTextChange: (text: string) => void;
  onSaveEdit: (index: number, id: number | undefined, text: string) => void;
  onCancelEdit: () => void;
  onStartLongPress: (item: LocalPriorityItem) => void;
  onEndLongPress: (item: LocalPriorityItem) => void;
  onCancelLongPress: () => void;
  onDelete: (index: number, id: number | undefined, e?: React.MouseEvent) => void;
}

export const MobilePriorityChipItem: React.FC<MobilePriorityChipItemProps> = ({
  item,
  isCurrentlyEditing,
  isExpanded,
  hasAnyExpanded,
  editingText,
  onEditingTextChange,
  onSaveEdit,
  onCancelEdit,
  onStartLongPress,
  onEndLongPress,
  onCancelLongPress,
  onDelete,
}) => {
  // 1. MODALITÀ MODIFICA INLINE
  if (isCurrentlyEditing) {
    return (
      <div className="flex-[3] min-w-0 flex items-center gap-1 px-2 py-1 rounded-xl bg-amber-100/90 border border-amber-300 shadow-2xs animate-fadeIn">
        <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-black shrink-0">
          {item.index + 1}
        </span>
        <input
          type="text"
          autoFocus
          value={editingText}
          onChange={(e) => onEditingTextChange(e.target.value)}
          onBlur={() => onSaveEdit(item.index, item.id, editingText)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onSaveEdit(item.index, item.id, editingText);
            } else if (e.key === 'Escape') {
              onCancelEdit();
            }
          }}
          className="bg-transparent border-none p-0 text-xs font-bold text-gray-900 focus:ring-0 focus:outline-none flex-1 min-w-0"
          placeholder="Scrivi..."
        />
      </div>
    );
  }

  // 2. MODALITÀ ESPANSA (PRIMO TOCCO)
  if (isExpanded) {
    return (
      <div
        onTouchStart={() => onStartLongPress(item)}
        onTouchEnd={() => onEndLongPress(item)}
        onTouchMove={onCancelLongPress}
        onMouseDown={() => onStartLongPress(item)}
        onMouseUp={() => onEndLongPress(item)}
        onMouseLeave={onCancelLongPress}
        className="flex-[3] min-w-0 group flex items-center justify-between gap-1.5 px-2.5 py-1 rounded-xl bg-amber-100 border border-amber-300 shadow-xs ring-2 ring-amber-400/20 active:scale-[0.99] transition-all cursor-pointer animate-fadeIn"
        title="Tocca di nuovo per modificare • Tieni premuto per modificare"
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-black shrink-0">
            {item.index + 1}
          </span>
          <span className="text-xs font-bold text-gray-900 break-words leading-tight flex-1 min-w-0 select-none">
            {item.text}
          </span>
        </div>
        <button
          type="button"
          onClick={(e) => onDelete(item.index, item.id, e)}
          className="p-0.5 rounded text-gray-400 hover:text-red-500 hover:bg-amber-200/60 transition-colors shrink-0 cursor-pointer ml-1"
          title="Rimuovi priorità"
        >
          <CloseIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // 3. CHIP NORMALE / COMPATTA
  return (
    <div
      onTouchStart={() => onStartLongPress(item)}
      onTouchEnd={() => onEndLongPress(item)}
      onTouchMove={onCancelLongPress}
      onMouseDown={() => onStartLongPress(item)}
      onMouseUp={() => onEndLongPress(item)}
      onMouseLeave={onCancelLongPress}
      className={`min-w-0 group flex items-center justify-between gap-1 px-2 py-1 rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200/90 text-gray-900 shadow-2xs active:scale-95 transition-all cursor-pointer overflow-hidden ${
        hasAnyExpanded ? 'flex-initial shrink-0 max-w-[2.2rem]' : 'flex-1'
      }`}
      title="Tocca per allargare • Tieni premuto per modificare"
    >
      <div className="flex items-center gap-1 min-w-0 flex-1 overflow-hidden">
        <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-black shrink-0">
          {item.index + 1}
        </span>
        {!hasAnyExpanded && (
          <span className="text-xs font-bold truncate flex-1 min-w-0 leading-tight select-none">
            {item.text}
          </span>
        )}
      </div>
      {!hasAnyExpanded && (
        <button
          type="button"
          onClick={(e) => onDelete(item.index, item.id, e)}
          className="p-0.5 rounded text-gray-400 hover:text-red-500 hover:bg-amber-200/60 transition-colors shrink-0 cursor-pointer"
          title="Rimuovi"
        >
          <CloseIcon className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export default MobilePriorityChipItem;
