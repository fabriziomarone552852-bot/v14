// src/components/archive/shopping/ShoppingArchivePricesTab.tsx
import React, { useState, useMemo } from 'react';
import { TagIcon } from '@/components/shared/utils/Icons';
import type { ItemBatchRecord } from '@/types/shopping';
import { useDynamicPageSize } from '@/hooks/useDynamicPageSize';
import { ArchiveTableContainer } from '@/components/shared/layout/ArchiveTableContainer';
import {
  ShoppingPriceTableHeader,
  type ShoppingProductSortField,
  type ShoppingProductSortDirection,
} from './ShoppingPriceTableHeader';
import {
  ShoppingPriceTableRow,
  type ProductPriceSummary,
} from './ShoppingPriceTableRow';
import { ShoppingProductPriceModal } from './ShoppingProductPriceModal';
import { ShoppingPriceFilterModal, type ShoppingPriceFilterState } from './ShoppingPriceFilterModal';
import {
  computeCutoffDate,
  computePriceStatistics,
} from '@/components/shared/shopping/shoppingPriceUtils';

interface ShoppingArchivePricesTabProps {
  batches: ItemBatchRecord[];
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
  loading = false,
  isFilterModalOpen,
  onCloseFilterModal,
  filterState,
  onFilterChange,
  onResetFilters,
  className = '',
}) => {
  const [selectedProductForModal, setSelectedProductForModal] = useState<ProductPriceSummary | null>(null);

  // Ordinamento & Paginazione
  const [sortField, setSortField] = useState<ShoppingProductSortField>('product');
  const [sortDirection, setSortDirection] = useState<ShoppingProductSortDirection>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Dynamic Page Size
  const { containerRef, pageSize } = useDynamicPageSize({
    rowHeight: 48,
    defaultPageSize: 8,
    minItems: 3,
    maxItems: 25,
  });

  // Calcolo data di cutoff in base al selettore di lookback
  const cutoffDate = useMemo(() => {
    return computeCutoffDate(filterState.lookbackValue, filterState.lookbackUnit);
  }, [filterState.lookbackValue, filterState.lookbackUnit]);

  // Raggruppamento dei lotti/prezzi per Prodotto e calcolo sintetico
  const productSummaries = useMemo(() => {
    const map = new Map<string, {
      productId: number;
      productName: string;
      batches: ItemBatchRecord[];
      unitName?: string | null;
    }>();

    for (const b of batches) {
      const prodName = (b.productName || 'Prodotto').trim();
      const key = `${b.productId ?? prodName}`;
      if (!map.has(key)) {
        map.set(key, {
          productId: b.productId ?? 0,
          productName: prodName,
          batches: [],
          unitName: b.unitName,
        });
      }
      map.get(key)!.batches.push(b);
    }

    const result: ProductPriceSummary[] = [];

    for (const item of map.values()) {
      const stats = computePriceStatistics(item.batches, cutoffDate);
      const effectiveStats = stats.count > 0 ? stats : computePriceStatistics(item.batches, null);

      if (effectiveStats.count === 0) continue;

      result.push({
        productId: item.productId,
        productName: item.productName,
        batches: item.batches,
        lowestPrice: effectiveStats.bestPrice,
        lowestSupplier: effectiveStats.bestSupplier,
        lowestDate: effectiveStats.bestDate,
        avgPrice: effectiveStats.avg,
        latestPrice: effectiveStats.latestPrice,
        latestSupplier: effectiveStats.latestSupplier,
        latestDate: effectiveStats.latestDate,
        unitName: item.unitName,
      });
    }

    return result;
  }, [batches, cutoffDate]);

  // Filtraggio dei prodotti per parola chiave nel nome
  const filteredProducts = useMemo(() => {
    return productSummaries.filter((p) => {
      if (filterState.keyword.trim()) {
        const q = filterState.keyword.toLowerCase().trim();
        const matchProd = p.productName.toLowerCase().includes(q);
        if (!matchProd) return false;
      }
      return true;
    });
  }, [productSummaries, filterState.keyword]);

  // Ordinamento
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    list.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'product') {
        comparison = a.productName.localeCompare(b.productName);
      } else if (sortField === 'lowest') {
        comparison = (a.lowestPrice ?? 0) - (b.lowestPrice ?? 0);
      } else if (sortField === 'avg') {
        comparison = (a.avgPrice ?? 0) - (b.avgPrice ?? 0);
      } else if (sortField === 'latest') {
        comparison = (a.latestPrice ?? 0) - (b.latestPrice ?? 0);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    return list;
  }, [filteredProducts, sortField, sortDirection]);

  // Paginazione
  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / pageSize));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedProducts.slice(start, start + pageSize);
  }, [sortedProducts, currentPage, pageSize]);

  const handleSort = (field: ShoppingProductSortField) => {
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
    filterState.lookbackValue !== 1 ||
    filterState.lookbackUnit !== 'years';

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
        isEmpty={filteredProducts.length === 0}
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
      {selectedProductForModal && (
        <ShoppingProductPriceModal
          isOpen={true}
          onClose={() => setSelectedProductForModal(null)}
          productSummary={selectedProductForModal}
        />
      )}

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
