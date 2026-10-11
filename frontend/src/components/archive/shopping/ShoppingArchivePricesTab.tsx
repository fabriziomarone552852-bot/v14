// src/components/archive/shopping/ShoppingArchivePricesTab.tsx
import React from 'react';
import { TagIcon } from '@/components/shared/utils/Icons';
import type { ItemBatchRecord, ShoppingProductOption } from '@/types/shopping';
import { ArchiveTableContainer } from '@/components/shared/layout/ArchiveTableContainer';
import { ShoppingPriceTableHeader } from './ShoppingPriceTableHeader';
import { ShoppingPriceTableRow } from './ShoppingPriceTableRow';
import { useIsMobile } from '@/mobile/hooks/useIsMobile';
import { ShoppingProductPriceModal } from './ShoppingProductPriceModal';
import { MobileShoppingProductPriceModal } from '@/mobile/components/modals/shopping/MobileShoppingProductPriceModal';
import {
  ShoppingPriceFilterModal,
  type ShoppingPriceFilterState,
} from './ShoppingPriceFilterModal';
import { useShoppingArchivePricesLogic } from './useShoppingArchivePricesLogic';

interface ShoppingArchivePricesTabProps {
  batches: ItemBatchRecord[];
  products?: ShoppingProductOption[];
  loading?: boolean;
  isFilterModalOpen: boolean;
  onCloseFilterModal: () => void;
  filterState: ShoppingPriceFilterState;
  onFilterChange: (filters: ShoppingPriceFilterState) => void;
  onResetFilters: () => void;
  className?: string;
}

export const ShoppingArchivePricesTab: React.FC<ShoppingArchivePricesTabProps> = ({
  batches,
  products = [],
  loading = false,
  isFilterModalOpen,
  onCloseFilterModal,
  filterState,
  onFilterChange,
  onResetFilters,
  className = '',
}) => {
  const isMobile = useIsMobile();

  const {
    sortField,
    sortDirection,
    handleSort,
    currentPage,
    setCurrentPage,
    totalPages,
    containerRef,
    paginatedProducts,
    hasActiveFilters,
    setSelectedProductForModal,
    activeProductSummary,
  } = useShoppingArchivePricesLogic({
    batches,
    products,
    filterState,
  });

  return (
    <>
      <ArchiveTableContainer
        header={
          <ShoppingPriceTableHeader
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        }
        loading={loading}
        loadingMessage="Caricamento prezzi prodotti in corso..."
        isEmpty={paginatedProducts.length === 0}
        emptyIcon={<TagIcon className="w-8 h-8 text-slate-400" />}
        emptyTitle="Nessun prodotto trovato"
        emptyDescription={
          hasActiveFilters
            ? 'Nessun prodotto corrisponde ai filtri selezionati. Prova ad azzerarli.'
            : 'Non ci sono prezzi o acquisti registrati in archivio.'
        }
        hasActiveFilters={hasActiveFilters}
        onResetFilters={onResetFilters}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        className={className}
        bodyRef={containerRef}
      >
        {paginatedProducts.map((prod) => (
          <ShoppingPriceTableRow
            key={`${prod.productId}-${prod.productName}`}
            productSummary={prod}
            onSelectProduct={(p) => setSelectedProductForModal(p)}
          />
        ))}
      </ArchiveTableContainer>

      {/* Modale Storico Prezzi Prodotto */}
      {activeProductSummary &&
        (isMobile ? (
          <MobileShoppingProductPriceModal
            isOpen={true}
            onClose={() => setSelectedProductForModal(null)}
            productSummary={activeProductSummary}
          />
        ) : (
          <ShoppingProductPriceModal
            isOpen={true}
            onClose={() => setSelectedProductForModal(null)}
            productSummary={activeProductSummary}
          />
        ))}

      {/* Modale Filtri Prezzi */}
      <ShoppingPriceFilterModal
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
        hasActiveFilters={hasActiveFilters}
      />
    </>
  );
};

export default ShoppingArchivePricesTab;
