// src/components/archive/suppliers/BrandsTabTable.tsx
import React from 'react';
import { TagIcon } from '@/components/shared/utils/Icons';
import { ArchiveTableContainer } from '@/components/shared/layout/ArchiveTableContainer';
import { BrandTableHeader } from './BrandTableHeader';
import { BrandTableRow } from './BrandTableRow';
import { ERROR_MESSAGES } from '@/data/loadingMessages';
import type { EnrichedBrand, BrandSortField } from '@/hooks/useBrandArchiveData';
import type { SupplierSortDirection } from '@/hooks/useSupplierArchiveData';

interface BrandsTabTableProps {
  filteredBrands: EnrichedBrand[];
  paginatedBrands: EnrichedBrand[];
  sortField: BrandSortField;
  sortDirection: SupplierSortDirection;
  onSort: (field: BrandSortField) => void;
  loading: boolean;
  isError: boolean;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  onRetry: () => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  containerRef: React.Ref<HTMLDivElement>;
  onSelectBrand: (brand: EnrichedBrand) => void;
  panelClass: string;
}

export const BrandsTabTable: React.FC<BrandsTabTableProps> = ({
  filteredBrands,
  paginatedBrands,
  sortField,
  sortDirection,
  onSort,
  loading,
  isError,
  hasActiveFilters,
  onResetFilters,
  onRetry,
  currentPage,
  totalPages,
  onPageChange,
  containerRef,
  onSelectBrand,
  panelClass,
}) => {
  return (
    <ArchiveTableContainer
      header={
        <BrandTableHeader
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={onSort}
        />
      }
      loading={loading}
      loadingMessage="Caricamento marchi e brand in corso..."
      isError={isError}
      errorMessage={ERROR_MESSAGES.archive}
      onRetry={onRetry}
      isEmpty={filteredBrands.length === 0}
      emptyIcon={<TagIcon className="w-8 h-8 text-slate-400" />}
      emptyTitle="Nessun marchio o brand trovato"
      emptyDescription={
        hasActiveFilters
          ? 'Nessun marchio corrisponde ai filtri selezionati. Prova ad azzerarli.'
          : 'Non ci sono marchi o brand registrati in archivio.'
      }
      hasActiveFilters={hasActiveFilters}
      onResetFilters={onResetFilters}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={onPageChange}
      className={panelClass}
      bodyRef={containerRef}
    >
      {paginatedBrands.map((brand) => (
        <BrandTableRow
          key={brand.id}
          brand={brand}
          onSelect={onSelectBrand}
        />
      ))}
    </ArchiveTableContainer>
  );
};
