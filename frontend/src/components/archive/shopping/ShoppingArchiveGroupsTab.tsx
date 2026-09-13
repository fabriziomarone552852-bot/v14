// src/components/archive/shopping/ShoppingArchiveGroupsTab.tsx
import React from 'react';
import { UsersIcon } from '@/components/shared/utils/Icons';
import type { ShoppingGroupSummary, ShoppingListSummary } from '@/types/shopping';
import { ArchiveTableContainer } from '@/components/shared/layout/ArchiveTableContainer';
import { ShoppingGroupTableHeader } from './ShoppingGroupTableHeader';
import { ShoppingGroupTableRow } from './ShoppingGroupTableRow';
import type { ShoppingGroupFilterState } from './ShoppingGroupFilterModal';
import { useShoppingArchiveGroupsLogic } from './groups/useShoppingArchiveGroupsLogic';
import { ShoppingArchiveGroupsModals } from './groups/ShoppingArchiveGroupsModals';

interface ShoppingArchiveGroupsTabProps {
  groups: ShoppingGroupSummary[];
  lists: ShoppingListSummary[];
  loading?: boolean;
  isFilterModalOpen: boolean;
  onCloseFilterModal: () => void;
  onOpenCreateModal: () => void;
  activeFiltersCount: number;
  filterState: ShoppingGroupFilterState;
  onFilterChange: (filters: ShoppingGroupFilterState) => void;
  onResetFilters: () => void;
  className?: string;
}

export const ShoppingArchiveGroupsTab: React.FC<ShoppingArchiveGroupsTabProps> = ({
  groups,
  lists,
  loading = false,
  isFilterModalOpen,
  onCloseFilterModal,
  filterState,
  onFilterChange,
  onResetFilters,
  className = '',
}) => {
  const logic = useShoppingArchiveGroupsLogic({
    groups,
    lists,
    filterState,
    onFilterChange,
    onResetFilters,
  });

  return (
    <>
      <ArchiveTableContainer
        header={
          <ShoppingGroupTableHeader
            sortField={logic.sortField}
            sortDirection={logic.sortDirection}
            onSort={logic.handleSort}
          />
        }
        loading={loading}
        loadingMessage="Caricamento gruppi spesa in corso..."
        isEmpty={logic.filteredGroups.length === 0}
        emptyIcon={<UsersIcon className="w-8 h-8 text-slate-400" />}
        emptyTitle="Nessun gruppo trovato"
        emptyDescription={
          logic.hasActiveFilters
            ? 'Nessun gruppo corrisponde ai filtri selezionati. Prova ad azzerarli.'
            : 'Non ci sono gruppi spesa registrati in archivio.'
        }
        hasActiveFilters={logic.hasActiveFilters}
        onResetFilters={logic.onResetFilters}
        currentPage={logic.currentPage}
        totalPages={logic.totalPages}
        onPageChange={logic.setCurrentPage}
        className={className}
        bodyRef={logic.containerRef}
      >
        {logic.paginatedGroups.map((group: ShoppingGroupSummary) => (
          <ShoppingGroupTableRow
            key={group.id}
            group={group}
            lists={logic.listsByGroupId.get(group.id) || []}
            onSelectGroup={(g) => logic.setSelectedGroupForDetail(g)}
          />
        ))}
      </ArchiveTableContainer>

      {/* MODALI (FILTRI, DETTAGLI, MODIFICA, INVITO) */}
      <ShoppingArchiveGroupsModals
        isMobile={logic.isMobile}
        lists={lists}
        isFilterModalOpen={isFilterModalOpen}
        onCloseFilterModal={onCloseFilterModal}
        filterState={filterState}
        onFilterChange={logic.onFilterChange}
        onResetFilters={logic.onResetFilters}
        onPageReset={() => logic.setCurrentPage(1)}
        allKnownMembers={logic.allKnownMembers}
        hasActiveFilters={logic.hasActiveFilters}
        selectedGroupForDetail={logic.selectedGroupForDetail}
        onCloseDetail={() => logic.setSelectedGroupForDetail(null)}
        onDeleteGroup={logic.handleDeleteGroup}
        onToggleArchive={logic.handleToggleArchive}
        onEditClickFromDetail={(g) => logic.setSelectedGroupForEdit(g)}
        onOpenInvite={(g) => logic.setSelectedGroupForInvite(g)}
        onSelectList={(listId) => logic.navigate(`/shopping?listId=${listId}`)}
        onCreateListInGroup={(groupId) => logic.navigate(`/shopping?new=true&groupId=${groupId}`)}
        selectedGroupForEdit={logic.selectedGroupForEdit}
        onCloseEdit={() => logic.setSelectedGroupForEdit(null)}
        onUpdateGroup={logic.handleUpdateGroup}
        selectedGroupForInvite={logic.selectedGroupForInvite}
        onCloseInvite={() => logic.setSelectedGroupForInvite(null)}
        onInviteMembers={logic.handleInviteMembers}
      />
    </>
  );
};

export default ShoppingArchiveGroupsTab;
