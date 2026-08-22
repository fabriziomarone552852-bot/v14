// src/components/archive/shopping/ShoppingArchiveGroupsTab.tsx
import React, { useState, useMemo } from 'react';
import { UsersIcon } from '@/components/shared/utils/Icons';
import type { ShoppingGroupSummary, ShoppingListSummary, ShoppingGroupMember } from '@/types/shopping';
import { useShoppingMutations } from '@/hooks/shopping/useShoppingMutations';
import { useConfirm } from '@/context/ConfirmContext';
import { useDynamicPageSize } from '@/hooks/useDynamicPageSize';
import { ArchiveTableContainer } from '@/components/shared/layout/ArchiveTableContainer';
import {
  ShoppingGroupTableHeader,
  type ShoppingGroupSortField,
  type ShoppingGroupSortDirection,
} from './ShoppingGroupTableHeader';
import { ShoppingGroupTableRow } from './ShoppingGroupTableRow';
import { ShoppingGroupFilterModal, type ShoppingGroupFilterState } from './ShoppingGroupFilterModal';
import ShoppingGroupDetailModal from '@/components/shared/shopping/ShoppingGroupDetailModal';

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
  const mutations = useShoppingMutations();
  const { confirm } = useConfirm();

  const [selectedGroupForDetail, setSelectedGroupForDetail] = useState<ShoppingGroupSummary | null>(null);

  // Ordinamento & Paginazione
  const [sortField, setSortField] = useState<ShoppingGroupSortField>('name');
  const [sortDirection, setSortDirection] = useState<ShoppingGroupSortDirection>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Dynamic Page Size
  const { containerRef, pageSize } = useDynamicPageSize({
    rowHeight: 48,
    defaultPageSize: 8,
    minItems: 3,
    maxItems: 25,
  });

  // Mappa liste per groupId
  const listsByGroupId = useMemo(() => {
    const map = new Map<number, ShoppingListSummary[]>();
    for (const list of lists) {
      if (list.groupId != null) {
        const current = map.get(list.groupId) || [];
        current.push(list);
        map.set(list.groupId, current);
      }
    }
    return map;
  }, [lists]);

  // Lista di tutti i membri unici noti per il filtro
  const allKnownMembers = useMemo(() => {
    const set = new Set<string>();
    for (const g of groups) {
      if (g.members) {
        for (const m of g.members) {
          if (m.username) set.add(m.username);
          else if (m.email) set.add(m.email);
        }
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [groups]);

  // Filtraggio dei gruppi
  const filteredGroups = useMemo(() => {
    return groups.filter((g) => {
      const gLists = listsByGroupId.get(g.id) || [];
      const activeListsCount = gLists.filter((l) => !l.isCompleted).length;
      const isArchived = Boolean(g.isArchived || g.archivedAt);
      const isEmpty = activeListsCount === 0;

      if (filterState.status === 'active' && isArchived) return false;
      if (filterState.status === 'archived' && !isArchived) return false;
      if (filterState.status === 'empty' && (!isEmpty || isArchived)) return false;

      if (filterState.keyword.trim()) {
        const q = filterState.keyword.toLowerCase().trim();
        const matchName = g.name.toLowerCase().includes(q);
        const matchDesc = g.description?.toLowerCase().includes(q) ?? false;
        if (!matchName && !matchDesc) return false;
      }

      if (filterState.members.length > 0) {
        const groupMembersSet = new Set(
          (g.members || []).map((m: ShoppingGroupMember) => m.username || m.email || '').filter(Boolean)
        );
        const hasAllSelected = filterState.members.every((sm) => groupMembersSet.has(sm));
        if (!hasAllSelected) return false;
      }

      return true;
    });
  }, [groups, listsByGroupId, filterState]);

  // Ordinamento
  const sortedGroups = useMemo(() => {
    const list = [...filteredGroups];
    list.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'role') {
        comparison = (a.userRole || '').localeCompare(b.userRole || '');
      } else if (sortField === 'members') {
        const aCount = a.members?.length || 1;
        const bCount = b.members?.length || 1;
        comparison = aCount - bCount;
      } else if (sortField === 'activeLists') {
        const aActive = (listsByGroupId.get(a.id) || []).filter((l) => !l.isCompleted).length;
        const bActive = (listsByGroupId.get(b.id) || []).filter((l) => !l.isCompleted).length;
        comparison = aActive - bActive;
      } else if (sortField === 'totalLists') {
        const aTotal = (listsByGroupId.get(a.id) || []).length;
        const bTotal = (listsByGroupId.get(b.id) || []).length;
        comparison = aTotal - bTotal;
      } else if (sortField === 'status') {
        const aArchived = Boolean(a.isArchived || a.archivedAt);
        const bArchived = Boolean(b.isArchived || b.archivedAt);
        comparison = Number(aArchived) - Number(bArchived);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    return list;
  }, [filteredGroups, sortField, sortDirection, listsByGroupId]);

  // Paginazione
  const totalPages = Math.max(1, Math.ceil(sortedGroups.length / pageSize));
  const paginatedGroups = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedGroups.slice(start, start + pageSize);
  }, [sortedGroups, currentPage, pageSize]);

  const handleSort = (field: ShoppingGroupSortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const handleToggleArchive = (group: ShoppingGroupSummary, e: React.MouseEvent) => {
    e.stopPropagation();
    const isArchived = Boolean(group.isArchived || group.archivedAt);
    confirm({
      title: isArchived ? 'Riattiva Gruppo' : 'Archivia Gruppo',
      message: isArchived
        ? `Vuoi riattivare il gruppo "${group.name}"? Tornerà visibile tra i gruppi attivi.`
        : `Vuoi archiviare il gruppo "${group.name}"? Le liste rimarranno salvate ma il gruppo verrà spostato in archivio.`,
      confirmText: isArchived ? 'Riattiva' : 'Archivia',
      isDestructive: !isArchived,
      onConfirm: async () => {
        if (isArchived) {
          await mutations.unarchiveGroup(group.id);
        } else {
          await mutations.archiveGroup(group.id);
        }
      },
    });
  };

  const handleDeleteGroup = (group: ShoppingGroupSummary, e: React.MouseEvent) => {
    e.stopPropagation();
    confirm({
      title: 'Elimina Gruppo Definitivamente',
      message: `Sei sicuro di voler eliminare definitivamente il gruppo "${group.name}"? L'azione non è reversibile.`,
      confirmText: 'Elimina',
      isDestructive: true,
      onConfirm: async () => {
        await mutations.deleteGroup(group.id);
      },
    });
  };

  const hasActiveFilters =
    Boolean(filterState.keyword.trim()) ||
    filterState.status !== 'all' ||
    filterState.members.length > 0;

  return (
    <>
      <ArchiveTableContainer
        header={
          <ShoppingGroupTableHeader
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        }
        loading={loading}
        loadingMessage="Caricamento gruppi spesa in corso..."
        isEmpty={filteredGroups.length === 0}
        emptyIcon={<UsersIcon className="w-8 h-8 text-slate-400" />}
        emptyTitle="Nessun gruppo trovato"
        emptyDescription={
          hasActiveFilters
            ? 'Nessun gruppo corrisponde ai filtri selezionati. Prova ad azzerarli.'
            : 'Non ci sono gruppi spesa registrati in archivio.'
        }
        hasActiveFilters={hasActiveFilters}
        onResetFilters={onResetFilters}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        className={className}
        bodyRef={containerRef}
      >
        {paginatedGroups.map((group) => (
          <ShoppingGroupTableRow
            key={group.id}
            group={group}
            lists={listsByGroupId.get(group.id) || []}
            onSelectGroup={(g) => setSelectedGroupForDetail(g)}
          />
        ))}
      </ArchiveTableContainer>

      {/* Modale Filtri Gruppi */}
      <ShoppingGroupFilterModal
        isOpen={isFilterModalOpen}
        onClose={onCloseFilterModal}
        filters={filterState}
        onFilterChange={(newF) => {
          onFilterChange(newF);
          setCurrentPage(1);
        }}
        onReset={() => {
          onResetFilters();
          setCurrentPage(1);
        }}
        allKnownMembers={allKnownMembers}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Modale Dettagli Gruppo */}
      {selectedGroupForDetail && (
        <ShoppingGroupDetailModal
          group={selectedGroupForDetail}
          lists={lists}
          isOpen={true}
          onClose={() => setSelectedGroupForDetail(null)}
          onDeleteClick={(g) => {
            setSelectedGroupForDetail(null);
            handleDeleteGroup(g, { stopPropagation: () => {} } as React.MouseEvent);
          }}
          onArchiveClick={(g) => {
            setSelectedGroupForDetail(null);
            handleToggleArchive(g, { stopPropagation: () => {} } as React.MouseEvent);
          }}
          onUnarchiveClick={(g) => {
            setSelectedGroupForDetail(null);
            handleToggleArchive(g, { stopPropagation: () => {} } as React.MouseEvent);
          }}
        />
      )}
    </>
  );
};


export default ShoppingArchiveGroupsTab;
