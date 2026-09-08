// src/mobile/components/shopping/MobileShoppingListPickerModal.tsx
import React, { useState, useRef, useCallback } from 'react';
import type {
  ShoppingGroupSummary,
  ShoppingListSummary,
} from '@/types/shopping';
import {
  ShoppingIcon,
  ChevronDownIcon,
  CloseIcon,
} from '@/components/shared/utils/Icons';
import { getRoleBadgeClass } from '@/components/shared/shopping/shoppingUi';

interface MobileShoppingListPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  lists: ShoppingListSummary[];
  groups: ShoppingGroupSummary[];
  activeListId: number | null;
  onSelectList: (listId: number) => void;
  onOpenGroupDetail: (group: ShoppingGroupSummary) => void;
  onOpenListDetail: (list: ShoppingListSummary) => void;
}

// Hook Touch-Hold (Long-Press)
function useLongPress(
  onLongPress: () => void,
  onClick?: () => void,
  delay = 500
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressRef = useRef(false);

  const start = useCallback(() => {
    isLongPressRef.current = false;
    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(40);
      }
      onLongPress();
    }, delay);
  }, [onLongPress, delay]);

  const clear = useCallback(
    (shouldTriggerClick = true) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (shouldTriggerClick && !isLongPressRef.current && onClick) {
        onClick();
      }
    },
    [onClick]
  );

  return {
    onTouchStart: start,
    onTouchEnd: () => clear(true),
    onTouchMove: () => clear(false),
    onMouseDown: start,
    onMouseUp: () => clear(true),
    onMouseLeave: () => clear(false),
  };
}

// Sub-componente Riga Lista con supporto Long-Press
const ListItemRow: React.FC<{
  list: ShoppingListSummary;
  isCurrent: boolean;
  onSelect: (listId: number) => void;
  onLongPress: (list: ShoppingListSummary) => void;
}> = ({ list, isCurrent, onSelect, onLongPress }) => {
  const longPressHandlers = useLongPress(
    () => onLongPress(list),
    () => onSelect(list.id)
  );

  const isEmpty =
    (list.openItemsCount ?? 0) === 0 && (list.purchasedItemsCount ?? 0) === 0;

  return (
    <div
      {...longPressHandlers}
      className={`w-full p-3 rounded-xl text-left flex items-center justify-between transition-all cursor-pointer select-none active:scale-[0.98] ${
        isCurrent
          ? 'bg-blue-600 text-white shadow-xs font-bold'
          : 'bg-white text-gray-800 border border-gray-200/90 hover:border-blue-300 font-medium'
      }`}
    >
      <div className="min-w-0 flex-1 truncate pr-2">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{list.name}</span>
          {list.isCompleted && (
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                isCurrent ? 'bg-blue-500 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              ✓ Completata
            </span>
          )}
        </div>
        <p
          className={`text-[11px] mt-0.5 ${
            isCurrent ? 'text-blue-100' : 'text-gray-400'
          }`}
        >
          {isEmpty
            ? 'Vuota'
            : `${list.openItemsCount} da comprare • ${list.purchasedItemsCount} presi`}
        </p>
      </div>
    </div>
  );
};

// Sub-componente Header Gruppo con supporto Long-Press
const GroupCardHeader: React.FC<{
  groupName: string;
  groupIcon: string;
  listsCount: number;
  userRole?: string | null;
  isExpanded: boolean;
  onToggle: () => void;
  onLongPress?: () => void;
}> = ({
  groupName,
  groupIcon,
  listsCount,
  userRole,
  isExpanded,
  onToggle,
  onLongPress,
}) => {
  const longPressHandlers = useLongPress(
    () => {
      if (onLongPress) onLongPress();
    },
    () => onToggle()
  );

  return (
    <div className="flex items-center justify-between gap-2 p-3 bg-gray-50 hover:bg-gray-100/80 transition-colors cursor-pointer select-none">
      <div {...longPressHandlers} className="flex-1 min-w-0 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white border border-gray-200/80 flex items-center justify-center text-xl shrink-0 shadow-2xs">
          {groupIcon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-extrabold text-gray-900 truncate">
              {groupName}
            </h3>
            {userRole && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded border uppercase ${getRoleBadgeClass(
                  userRole
                )}`}
              >
                {userRole}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            {listsCount} {listsCount === 1 ? 'lista' : 'liste'}
          </p>
        </div>
      </div>

      <div
        onClick={onToggle}
        className={`p-1.5 text-gray-400 transition-transform duration-200 shrink-0 ${
          isExpanded ? 'rotate-180 text-blue-600' : ''
        }`}
      >
        <ChevronDownIcon className="w-5 h-5" />
      </div>
    </div>
  );
};

export const MobileShoppingListPickerModal: React.FC<MobileShoppingListPickerModalProps> = ({
  isOpen,
  onClose,
  lists,
  groups,
  activeListId,
  onSelectList,
  onOpenGroupDetail,
  onOpenListDetail,
}) => {
  // Gestione stato aperto/chiuso dei singoli gruppi nell'accordion
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    personal: true, // Private aperto di default
  });

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const personalLists = lists.filter((l) => !l.groupId);

  const handleSelect = (listId: number) => {
    onSelectList(listId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-40 bg-gray-50 flex flex-col p-3 rounded-2xl animate-fadeIn shadow-2xl border border-gray-200">
      {/* 1. Header dell'Area Espansa */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600">
            <ShoppingIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
              Scegli Gruppo & Lista
            </h3>
            <p className="text-xs text-gray-500 font-medium">
              {personalLists.length} private • {groups.length} gruppi condivisi
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-200 hover:text-red-500 transition-colors cursor-pointer"
          title="Chiudi visualizzazione"
          aria-label="Chiudi"
        >
          <CloseIcon className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Contenuto scorrevole con tutti i gruppi e liste */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-3 pt-3 pr-1">
        
        {/* ========================================================================= */}
        {/* 1. GRUPPO 1: PRIVATE                                                      */}
        {/* ========================================================================= */}
        <div className="bg-white border border-gray-200/90 rounded-2xl shadow-2xs overflow-hidden">
          <GroupCardHeader
            groupName="Private"
            groupIcon="👤"
            listsCount={personalLists.length}
            isExpanded={Boolean(expandedGroups['personal'])}
            onToggle={() => toggleGroup('personal')}
          />

          {expandedGroups['personal'] && (
            <div className="p-2.5 bg-gray-50/60 border-t border-gray-100 space-y-1.5 animate-fadeIn">
              {personalLists.length === 0 ? (
                <div className="p-4 text-center text-gray-400 text-xs italic">
                  Nessuna lista creata in Private
                </div>
              ) : (
                personalLists.map((list) => (
                  <ListItemRow
                    key={list.id}
                    list={list}
                    isCurrent={list.id === activeListId}
                    onSelect={handleSelect}
                    onLongPress={(l) => {
                      onClose();
                      onOpenListDetail(l);
                    }}
                  />
                ))
              )}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 2. GRUPPI CONDIVISI                                                       */}
        {/* ========================================================================= */}
        {groups.map((group) => {
          const groupLists = lists.filter((l) => l.groupId === group.id);
          const groupKey = `group-${group.id}`;
          const isExpanded = Boolean(expandedGroups[groupKey]);

          return (
            <div
              key={group.id}
              className="bg-white border border-gray-200/90 rounded-2xl shadow-2xs overflow-hidden"
            >
              <GroupCardHeader
                groupName={group.name}
                groupIcon={group.icon || '👥'}
                listsCount={groupLists.length}
                userRole={group.userRole}
                isExpanded={isExpanded}
                onToggle={() => toggleGroup(groupKey)}
                onLongPress={() => {
                  onClose();
                  onOpenGroupDetail(group);
                }}
              />

              {isExpanded && (
                <div className="p-2.5 bg-gray-50/60 border-t border-gray-100 space-y-1.5 animate-fadeIn">
                  {groupLists.length === 0 ? (
                    <div className="p-4 text-center text-gray-400 text-xs italic">
                      Nessuna lista presente in questo gruppo
                    </div>
                  ) : (
                    groupLists.map((list) => (
                      <ListItemRow
                        key={list.id}
                        list={list}
                        isCurrent={list.id === activeListId}
                        onSelect={handleSelect}
                        onLongPress={(l) => {
                          onClose();
                          onOpenListDetail(l);
                        }}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}

      </div>
    </div>
  );
};

export default MobileShoppingListPickerModal;
