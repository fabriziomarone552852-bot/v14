// src/components/archive/shopping/ShoppingArchiveProductsTab.tsx
import React from 'react';
import { ShoppingIcon } from '@/components/shared/utils/Icons';
import { ArchiveTableContainer } from '@/components/shared/layout/ArchiveTableContainer';
import { useIsMobile } from '@/mobile/hooks/useIsMobile';
import type { ItemBatchRecord, ShoppingProductOption } from '@/types/shopping';
import {
  useShoppingArchiveProductsLogic,
  type ShoppingCatalogProductFilterState,
} from './products/useShoppingArchiveProductsLogic';
import { ShoppingCatalogProductTableHeader } from './products/ShoppingCatalogProductTableHeader';
import { ShoppingCatalogProductTableRow } from './products/ShoppingCatalogProductTableRow';
import { ShoppingCatalogProductFilterModal } from './products/ShoppingCatalogProductFilterModal';
import { ShoppingCatalogProductDetailModal } from './products/ShoppingCatalogProductDetailModal';

interface ShoppingArchiveProductsTabProps {
  products: ShoppingProductOption[];
  batches: ItemBatchRecord[];
  loading?: boolean;
  isFilterModalOpen: boolean;
  onCloseFilterModal: () => void;
  filterState: ShoppingCatalogProductFilterState;
  onFilterChange: (filters: ShoppingCatalogProductFilterState) => void;
  onResetFilters: () => void;
  className?: string;
}

export const ShoppingArchiveProductsTab: React.FC<ShoppingArchiveProductsTabProps> = ({
  products,
  batches,
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
    selectedProduct,
    setSelectedProductId,
  } = useShoppingArchiveProductsLogic({
    products,
    batches,
    filterState,
  });

  return (
    <>
      <ArchiveTableContainer
        header={
          <ShoppingCatalogProductTableHeader
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        }
        loading={loading}
        loadingMessage="Caricamento catalogo prodotti in corso..."
        isEmpty={paginatedProducts.length === 0}
        emptyIcon={<ShoppingIcon className="w-8 h-8 text-slate-400" />}
        emptyTitle="Nessun prodotto trovato"
        emptyDescription={
          hasActiveFilters
            ? 'Nessun prodotto corrisponde ai filtri selezionati. Prova ad azzerarli.'
            : 'Non ci sono prodotti registrati nel catalogo.'
        }
        hasActiveFilters={hasActiveFilters}
        onResetFilters={onResetFilters}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        className={className}
        bodyRef={containerRef}
      >
        {paginatedProducts.map((item) => (
          <ShoppingCatalogProductTableRow
            key={item.product.id}
            item={item}
            onSelect={(p) => setSelectedProductId(p.product.id)}
          />
        ))}
      </ArchiveTableContainer>

      <ShoppingCatalogProductDetailModal
        isOpen={Boolean(selectedProduct)}
        isMobile={isMobile}
        product={selectedProduct}
        onClose={() => setSelectedProductId(null)}
      />

      <ShoppingCatalogProductFilterModal
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

export default ShoppingArchiveProductsTab;
