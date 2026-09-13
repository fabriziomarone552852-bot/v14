// src/components/archive/suppliers/SuppliersTabTable.tsx
import React from 'react';
import { StoreIcon } from '@/components/shared/utils/Icons';
import { ArchiveTableContainer } from '@/components/shared/layout/ArchiveTableContainer';
import { SupplierTableHeader } from './SupplierTableHeader';
import { SupplierTableRow } from './SupplierTableRow';
import { ERROR_MESSAGES } from '@/data/loadingMessages';
import type { EnrichedSupplier, SupplierSortField, SupplierSortDirection } from '@/hooks/useSupplierArchiveData';

interface SuppliersTabTableProps {
  filteredSuppliers: EnrichedSupplier[];
  paginatedSuppliers: EnrichedSupplier[];
  sortField: SupplierSortField;
  sortDirection: SupplierSortDirection;
  onSort: (field: SupplierSortField) => void;
  isSuperuser: boolean;
  loading: boolean;
  isError: boolean;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  onRetry: () => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  containerRef: React.Ref<HTMLDivElement>;
  onSelectSupplier: (supplier: EnrichedSupplier) => void;
  panelClass: string;
}

export const SuppliersTabTable: React.FC<SuppliersTabTableProps> = ({
  filteredSuppliers,
  paginatedSuppliers,
  sortField,
  sortDirection,
  onSort,
  isSuperuser,
  loading,
  isError,
  hasActiveFilters,
  onResetFilters,
  onRetry,
  currentPage,
  totalPages,
  onPageChange,
  containerRef,
  onSelectSupplier,
  panelClass,
}) => {
  return (
    <ArchiveTableContainer
      header={
        <SupplierTableHeader
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={onSort}
          isSuperuser={isSuperuser}
        />
      }
      loading={loading}
      loadingMessage="Caricamento negozi e brand in corso..."
      isError={isError}
      errorMessage={ERROR_MESSAGES.archive}
      onRetry={onRetry}
      isEmpty={filteredSuppliers.length === 0}
      emptyIcon={<StoreIcon className="w-8 h-8 text-slate-400" />}
      emptyTitle="Nessun negozio trovato"
      emptyDescription={
        hasActiveFilters
          ? 'Nessun negozio corrisponde ai filtri selezionati. Prova ad azzerarli.'
          : 'Non ci sono negozi registrati in archivio.'
      }
      hasActiveFilters={hasActiveFilters}
      onResetFilters={onResetFilters}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={onPageChange}
      className={panelClass}
      bodyRef={containerRef}
    >
      {paginatedSuppliers.map((supplier) => (
        <SupplierTableRow
          key={supplier.id}
          supplier={supplier}
          onSelect={onSelectSupplier}
          isSuperuser={isSuperuser}
        />
      ))}
    </ArchiveTableContainer>
  );
};
