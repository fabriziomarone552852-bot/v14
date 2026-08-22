// src/components/archive/shopping/ShoppingArchiveListsTab.tsx
import React, { useState, useMemo } from 'react';
import { ShoppingIcon } from '@/components/shared/utils/Icons';
import type { ShoppingListSummary, ShoppingProductOption } from '@/types/shopping';
import { useDynamicPageSize } from '@/hooks/useDynamicPageSize';
import { ArchiveTableContainer } from '@/components/shared/layout/ArchiveTableContainer';
import {
  ShoppingListTableHeader,
  type ShoppingListSortField,
  type ShoppingListSortDirection,
} from './ShoppingListTableHeader';
import { ShoppingListTableRow } from './ShoppingListTableRow';
import { ShoppingListFilterModal, type ShoppingListFilterState } from './ShoppingListFilterModal';
import { ShoppingListDetailModal } from './ShoppingListDetailModal';

interface ShoppingArchiveListsTabProps {
  lists: ShoppingListSummary[];
  products: ShoppingProductOption[];
  loading?: boolean;
  isFilterModalOpen: boolean;
  onCloseFilterModal: () => void;
  filterState: ShoppingListFilterState;
  onFilterChange: (filters: ShoppingListFilterState) => void;
  onResetFilters: () => void;
  className?: string;
}

export const ShoppingArchiveListsTab: React.FC<ShoppingArchiveListsTabProps> = ({
  lists,
  products,
  loading = false,
  isFilterModalOpen,
  onCloseFilterModal,
  filterState,
  onFilterChange,
  onResetFilters,
  className = '',
}) => {
  const [selectedListForDetail, setSelectedListForDetail] = useState<ShoppingListSummary | null>(null);

  // Ordinamento & Paginazione
  const [sortField, setSortField] = useState<ShoppingListSortField>('name');
  const [sortDirection, setSortDirection] = useState<ShoppingListSortDirection>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Dynamic Page Size
  const { containerRef, pageSize } = useDynamicPageSize({
    rowHeight: 48,
    defaultPageSize: 8,
    minItems: 3,
    maxItems: 25,
  });

  // Lista di tutti i prodotti noti
  const allKnownProducts = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) {
      if (p.displayName) set.add(p.displayName);
      else if (p.nameNormalized) set.add(p.nameNormalized);
    }
    for (const l of lists) {
      if (l.items) {
        for (const item of l.items) {
          if (item.productName) set.add(item.productName);
        }
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [products, lists]);

  // Filtraggio delle liste
  const filteredLists = useMemo(() => {
    return lists.filter((list) => {
      if (filterState.status === 'active' && list.isCompleted) return false;
      if (filterState.status === 'completed' && !list.isCompleted) return false;

      if (filterState.keyword.trim()) {
        const q = filterState.keyword.toLowerCase().trim();
        const matchName = list.name.toLowerCase().includes(q);
        const matchDesc = list.description?.toLowerCase().includes(q) ?? false;
        const matchGroup = list.groupName?.toLowerCase().includes(q) ?? false;
        if (!matchName && !matchDesc && !matchGroup) return false;
      }

      if (filterState.products.length > 0) {
        const listItemsSet = new Set(
          (list.items || []).map((it) => it.productName.toLowerCase().trim())
        );
        const hasAll = filterState.products.every((pf) =>
          listItemsSet.has(pf.toLowerCase().trim())
        );
        if (!hasAll) return false;
      }

      return true;
    });
  }, [lists, filterState]);

  // Ordinamento
  const sortedLists = useMemo(() => {
    const list = [...filteredLists];
    list.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'destination') {
        const aDest = a.groupName || 'Privata';
        const bDest = b.groupName || 'Privata';
        comparison = aDest.localeCompare(bDest);
      } else if (sortField === 'itemsCount') {
        const aCount = a.totalItemsCount || (a.items?.length ?? 0);
        const bCount = b.totalItemsCount || (b.items?.length ?? 0);
        comparison = aCount - bCount;
      } else if (sortField === 'status') {
        comparison = Number(a.isCompleted) - Number(b.isCompleted);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    return list;
  }, [filteredLists, sortField, sortDirection]);

  // Paginazione
  const totalPages = Math.max(1, Math.ceil(sortedLists.length / pageSize));
  const paginatedLists = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedLists.slice(start, start + pageSize);
  }, [sortedLists, currentPage, pageSize]);

  const handleSort = (field: ShoppingListSortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const hasActiveFilters =
    Boolean(filterState.keyword.trim()) ||
    filterState.status !== 'all' ||
    filterState.products.length > 0;

  return (
    <>
      <ArchiveTableContainer
        header={
          <ShoppingListTableHeader
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        }
        loading={loading}
        loadingMessage="Caricamento liste spesa in corso..."
        isEmpty={filteredLists.length === 0}
        emptyIcon={<ShoppingIcon className="w-8 h-8 text-slate-400" />}
        emptyTitle="Nessuna lista trovata"
        emptyDescription={
          hasActiveFilters
            ? 'Nessuna lista corrisponde ai filtri selezionati. Prova ad azzerarli.'
            : 'Non ci sono liste della spesa registrate in archivio.'
        }
        hasActiveFilters={hasActiveFilters}
        onResetFilters={onResetFilters}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        className={className}
        bodyRef={containerRef}
      >
        {paginatedLists.map((list) => (
          <ShoppingListTableRow
            key={list.id}
            list={list}
            onSelectList={(l) => setSelectedListForDetail(l)}
          />
        ))}
      </ArchiveTableContainer>

      {/* Modale Dettagli Lista Spesa */}
      {selectedListForDetail && (
        <ShoppingListDetailModal
          isOpen={true}
          onClose={() => setSelectedListForDetail(null)}
          list={selectedListForDetail}
        />
      )}

      {/* Modale Filtri Liste */}
      <ShoppingListFilterModal
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
        allKnownProducts={allKnownProducts}
        hasActiveFilters={hasActiveFilters}
      />
    </>
  );
};

export default ShoppingArchiveListsTab;
