// src/mobile/components/shopping/MobileShoppingListPickerModal.tsx
import React from 'react';
import type { ShoppingGroupSummary, ShoppingListSummary } from '@/types/shopping';
import { ShoppingIcon, CloseIcon } from '@/components/shared/utils/Icons';
import {
  ListItemRow,
  GroupCardHeader,
  PersonalSectionHeader,
  useMobileShoppingListPickerLogic,
} from './picker';

export interface MobileShoppingListPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  lists: ShoppingListSummary[];
  groups: ShoppingGroupSummary[];
  activeListId: number | null;
  onSelectList: (listId: number) => void;
  onOpenGroupDetail: (group: ShoppingGroupSummary) => void;
  onOpenListDetail: (list: ShoppingListSummary) => void;
  onDeleteList?: (list: ShoppingListSummary) => Promise<void> | void;
  onDeleteGroup?: (group: ShoppingGroupSummary) => Promise<void> | void;
  onArchiveGroup?: (group: ShoppingGroupSummary) => Promise<void> | void;
  onArchiveList?: (list: ShoppingListSummary) => Promise<void> | void;
}

export const MobileShoppingListPickerModal: React.FC<MobileShoppingListPickerModalProps> = ({
  isOpen,
  onClose,
  lists,
  groups,
  activeListId,
  onSelectList,
  onOpenGroupDetail,
  onOpenListDetail,
  onDeleteList,
  onDeleteGroup,
  onArchiveGroup,
  onArchiveList,
}) => {
  const {
    expandedGroups,
    toggleGroup,
    personalLists,
    selectionState,
    isShoppingListsSelection,
    handleToggleSelect,
    handleSelect,
    handleCloseModal,
    clearSelection,
  } = useMobileShoppingListPickerLogic({
    lists,
    groups,
    onSelectList,
    onClose,
    onDeleteList,
    onDeleteGroup,
    onArchiveGroup,
    onArchiveList,
  });

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-40 bg-gray-50 flex flex-col p-3 rounded-2xl animate-fadeIn shadow-2xl border border-gray-200 select-none">
      {/* Header del Modale */}
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
          onClick={handleCloseModal}
          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-200 hover:text-red-500 transition-colors cursor-pointer"
          title="Chiudi visualizzazione"
          aria-label="Chiudi"
        >
          <CloseIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Contenuto scorrevole con tutti i gruppi e liste */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-3 pt-3 px-2 pb-3">
        {/* 1. SEZIONE PRIVATE */}
        <div className="bg-white border border-gray-200/90 rounded-2xl shadow-2xs overflow-hidden">
          <PersonalSectionHeader
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
                personalLists.map((list) => {
                  const listKey = `list-${list.id}`;
                  const isSelected =
                    isShoppingListsSelection &&
                    selectionState.selectedIds.includes(listKey);

                  return (
                    <ListItemRow
                      key={list.id}
                      list={list}
                      isCurrent={list.id === activeListId}
                      isSelected={isSelected}
                      isSelectionActive={isShoppingListsSelection}
                      onSelect={handleSelect}
                      onToggleSelect={handleToggleSelect}
                      onOpenDetail={(l) => {
                        clearSelection();
                        onClose();
                        onOpenListDetail(l);
                      }}
                    />
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* 2. GRUPPI CONDIVISI */}
        {groups.map((group) => {
          const groupLists = lists.filter((l) => l.groupId === group.id);
          const groupKey = `group-${group.id}`;
          const isExpanded = Boolean(expandedGroups[groupKey]);
          const isSelected =
            isShoppingListsSelection && selectionState.selectedIds.includes(groupKey);

          return (
            <div
              key={group.id}
              className={`bg-white border rounded-2xl shadow-2xs overflow-hidden transition-all ${
                isSelected
                  ? 'ring-2 ring-blue-400 ring-inset border-blue-400 shadow-[0_0_14px_rgba(59,130,246,0.4)] relative z-10'
                  : 'border-gray-200/90'
              }`}
            >
              <GroupCardHeader
                group={group}
                listsCount={groupLists.length}
                isExpanded={isExpanded}
                isSelected={isSelected}
                isSelectionActive={isShoppingListsSelection}
                onToggle={() => toggleGroup(groupKey)}
                onToggleSelect={handleToggleSelect}
                onOpenDetail={(g) => {
                  clearSelection();
                  onClose();
                  onOpenGroupDetail(g);
                }}
              />

              {isExpanded && (
                <div className="p-2.5 bg-gray-50/60 border-t border-gray-100 space-y-1.5 animate-fadeIn">
                  {groupLists.length === 0 ? (
                    <div className="p-4 text-center text-gray-400 text-xs italic">
                      Nessuna lista presente in questo gruppo
                    </div>
                  ) : (
                    groupLists.map((list) => {
                      const listKey = `list-${list.id}`;
                      const isListSelected =
                        isShoppingListsSelection &&
                        selectionState.selectedIds.includes(listKey);

                      return (
                        <ListItemRow
                          key={list.id}
                          list={list}
                          isCurrent={list.id === activeListId}
                          isSelected={isListSelected}
                          isSelectionActive={isShoppingListsSelection}
                          onSelect={handleSelect}
                          onToggleSelect={handleToggleSelect}
                          onOpenDetail={(l) => {
                            clearSelection();
                            onClose();
                            onOpenListDetail(l);
                          }}
                        />
                      );
                    })
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
