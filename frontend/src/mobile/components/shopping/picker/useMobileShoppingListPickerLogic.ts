// src/mobile/components/shopping/picker/useMobileShoppingListPickerLogic.ts
import { useState, useMemo, useEffect, useCallback } from 'react';
import type { ShoppingGroupSummary, ShoppingListSummary } from '@/types/shopping';
import { useMobileSelection } from '@/mobile/context/MobileSelectionContext';

export interface UseMobileShoppingListPickerLogicProps {
  lists: ShoppingListSummary[];
  groups: ShoppingGroupSummary[];
  onSelectList: (listId: number) => void;
  onClose: () => void;
  onDeleteList?: (list: ShoppingListSummary) => Promise<void> | void;
  onDeleteGroup?: (group: ShoppingGroupSummary) => Promise<void> | void;
  onArchiveGroup?: (group: ShoppingGroupSummary) => Promise<void> | void;
  onArchiveList?: (list: ShoppingListSummary) => Promise<void> | void;
}

export function useMobileShoppingListPickerLogic({
  lists,
  groups,
  onSelectList,
  onClose,
  onDeleteList,
  onDeleteGroup,
  onArchiveGroup,
  onArchiveList,
}: UseMobileShoppingListPickerLogicProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    personal: true,
  });

  const {
    state: selectionState,
    isSelectionActive,
    startSelection,
    toggleItem,
    clearSelection,
    updateAllIds,
  } = useMobileSelection();

  const isShoppingListsSelection =
    isSelectionActive && selectionState.activeSection === 'shopping-lists';

  const toggleGroup = useCallback((key: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  const personalLists = useMemo(() => lists.filter((l) => !l.groupId), [lists]);

  const allSelectableKeys = useMemo(() => {
    const listKeys = lists.map((l) => `list-${l.id}`);
    const groupKeys = groups.map((g) => `group-${g.id}`);
    return [...listKeys, ...groupKeys];
  }, [lists, groups]);

  useEffect(() => {
    if (isShoppingListsSelection) {
      updateAllIds(allSelectableKeys);
    }
  }, [allSelectableKeys, isShoppingListsSelection, updateAllIds]);

  const handleBulkDelete = useCallback(
    async (keys?: (number | string)[]) => {
      const targetKeys =
        keys && keys.length > 0
          ? (keys as string[])
          : (selectionState.selectedIds as string[]);
      if (targetKeys.length === 0) return;

      const listsToDelete = lists.filter((l) => targetKeys.includes(`list-${l.id}`));
      const groupsToDelete = groups.filter((g) => targetKeys.includes(`group-${g.id}`));

      if (listsToDelete.length === 0 && groupsToDelete.length === 0) return;
      if (!window.confirm(`Vuoi eliminare ${targetKeys.length} elementi selezionati?`)) return;

      if (onDeleteList) {
        for (const list of listsToDelete) {
          await onDeleteList(list);
        }
      }
      if (onDeleteGroup) {
        for (const group of groupsToDelete) {
          await onDeleteGroup(group);
        }
      }
      clearSelection();
    },
    [lists, groups, selectionState.selectedIds, onDeleteList, onDeleteGroup, clearSelection]
  );

  const handleBulkArchive = useCallback(
    async (keys?: (number | string)[]) => {
      const targetKeys =
        keys && keys.length > 0
          ? (keys as string[])
          : (selectionState.selectedIds as string[]);
      if (targetKeys.length === 0) return;

      const listsToArchive = lists.filter((l) => targetKeys.includes(`list-${l.id}`));
      const groupsToArchive = groups.filter((g) => targetKeys.includes(`group-${g.id}`));

      if (listsToArchive.length === 0 && groupsToArchive.length === 0) return;

      if (onArchiveList) {
        for (const list of listsToArchive) {
          await onArchiveList(list);
        }
      }
      if (onArchiveGroup) {
        for (const group of groupsToArchive) {
          await onArchiveGroup(group);
        }
      }
      clearSelection();
    },
    [lists, groups, selectionState.selectedIds, onArchiveList, onArchiveGroup, clearSelection]
  );

  const handleToggleSelect = useCallback(
    (key: string) => {
      if (isShoppingListsSelection) {
        toggleItem(key);
      } else {
        startSelection(
          'shopping-lists',
          key,
          allSelectableKeys,
          handleBulkDelete,
          handleBulkArchive
        );
      }
    },
    [
      isShoppingListsSelection,
      toggleItem,
      startSelection,
      allSelectableKeys,
      handleBulkDelete,
      handleBulkArchive,
    ]
  );

  const handleSelect = useCallback(
    (listId: number) => {
      clearSelection();
      onSelectList(listId);
      onClose();
    },
    [clearSelection, onSelectList, onClose]
  );

  const handleCloseModal = useCallback(() => {
    clearSelection();
    onClose();
  }, [clearSelection, onClose]);

  return {
    expandedGroups,
    toggleGroup,
    personalLists,
    selectionState,
    isShoppingListsSelection,
    handleToggleSelect,
    handleSelect,
    handleCloseModal,
    clearSelection,
  };
}
