// src/mobile/context/MobileSelectionContext.tsx
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

export interface SelectionState {
  activeSection: string | null;
  selectedIds: (number | string)[];
  allIds: (number | string)[];
  onDelete?: ((ids: (number | string)[]) => Promise<void> | void) | null;
  onArchive?: ((ids: (number | string)[]) => Promise<void> | void) | null;
}

interface MobileSelectionContextType {
  state: SelectionState;
  isSelectionActive: boolean;
  selectedCount: number;
  isAllSelected: boolean;
  startSelection: (
    section: string,
    initialId: number | string,
    allIds: (number | string)[],
    onDelete?: (ids: (number | string)[]) => Promise<void> | void,
    onArchive?: (ids: (number | string)[]) => Promise<void> | void
  ) => void;
  toggleItem: (id: number | string) => void;
  toggleSelectAll: () => void;
  clearSelection: () => void;
  isItemSelected: (id: number | string) => boolean;
  updateAllIds: (allIds: (number | string)[]) => void;
}

const MobileSelectionContext = createContext<MobileSelectionContextType | undefined>(undefined);

export const MobileSelectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<SelectionState>({
    activeSection: null,
    selectedIds: [],
    allIds: [],
    onDelete: null,
    onArchive: null,
  });

  const isSelectionActive = Boolean(state.activeSection && state.selectedIds.length > 0);
  const selectedCount = state.selectedIds.length;
  const isAllSelected = Boolean(
    state.allIds.length > 0 && state.allIds.length === state.selectedIds.length
  );

  const startSelection = useCallback(
    (
      section: string,
      initialId: number | string,
      allIds: (number | string)[],
      onDelete?: (ids: (number | string)[]) => Promise<void> | void,
      onArchive?: (ids: (number | string)[]) => Promise<void> | void
    ) => {
      setState({
        activeSection: section,
        selectedIds: [initialId],
        allIds,
        onDelete: onDelete ?? null,
        onArchive: onArchive ?? null,
      });
    },
    []
  );

  const toggleItem = useCallback((id: number | string) => {
    setState((prev) => {
      const exists = prev.selectedIds.includes(id);
      const nextSelected = exists
        ? prev.selectedIds.filter((item) => item !== id)
        : [...prev.selectedIds, id];

      if (nextSelected.length === 0) {
        return {
          activeSection: null,
          selectedIds: [],
          allIds: [],
          onDelete: null,
          onArchive: null,
        };
      }

      return {
        ...prev,
        selectedIds: nextSelected,
      };
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setState((prev) => {
      if (prev.selectedIds.length === prev.allIds.length) {
        // Se tutti sono selezionati, azzera la selezione
        return {
          activeSection: null,
          selectedIds: [],
          allIds: [],
          onDelete: null,
          onArchive: null,
        };
      }
      // Altrimenti seleziona tutti
      return {
        ...prev,
        selectedIds: [...prev.allIds],
      };
    });
  }, []);

  const clearSelection = useCallback(() => {
    setState({
      activeSection: null,
      selectedIds: [],
      allIds: [],
      onDelete: null,
      onArchive: null,
    });
  }, []);

  const updateAllIds = useCallback((allIds: (number | string)[]) => {
    setState((prev) => ({
      ...prev,
      allIds,
      selectedIds: prev.selectedIds.filter((id) => allIds.includes(id)),
    }));
  }, []);

  const isItemSelected = useCallback(
    (id: number | string) => state.selectedIds.includes(id),
    [state.selectedIds]
  );

  const value = useMemo(
    () => ({
      state,
      isSelectionActive,
      selectedCount,
      isAllSelected,
      startSelection,
      toggleItem,
      toggleSelectAll,
      clearSelection,
      isItemSelected,
      updateAllIds,
    }),
    [
      state,
      isSelectionActive,
      selectedCount,
      isAllSelected,
      startSelection,
      toggleItem,
      toggleSelectAll,
      clearSelection,
      isItemSelected,
      updateAllIds,
    ]
  );

  return (
    <MobileSelectionContext.Provider value={value}>
      {children}
    </MobileSelectionContext.Provider>
  );
};

export function useMobileSelection() {
  const context = useContext(MobileSelectionContext);
  if (!context) {
    throw new Error('useMobileSelection must be used within a MobileSelectionProvider');
  }
  return context;
}
