// src/components/archive/shopping/ShoppingArchivePricesTab.tsx
import React, { useState, useMemo } from 'react';
import { TagIcon } from '@/components/shared/utils/Icons';
import type { ItemBatchRecord, ShoppingProductOption } from '@/types/shopping';
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
import { useIsMobile } from '@/mobile/hooks/useIsMobile';
import { ShoppingProductPriceModal } from './ShoppingProductPriceModal';
import { MobileShoppingProductPriceModal } from '@/mobile/components/modals/shopping/MobileShoppingProductPriceModal';
import { ShoppingPriceFilterModal, type ShoppingPriceFilterState } from './ShoppingPriceFilterModal';
import {
  computeCutoffDate,
  computePriceStatistics,
} from '@/components/shared/shopping/shoppingPriceUtils';

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
  const [selectedProductForModal, setSelectedProductForModal] = useState<ProductPriceSummary | null>(null);

  // Ordinamento & Paginazione
  const [sortField, setSortField] = useState<ShoppingProductSortField>('product');
  const [sortDirection, setSortDirection] = useState<ShoppingProductSortDirection>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Dynamic Page Size
  const { containerRef, pageSize } = useDynamicPageSize({
    rowHeight: 44,
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

    // 1. Inserisci prima tutti i prodotti dal catalogo principale (seed + creati da utente)
    for (const p of products || []) {
      const prodName = (p.displayName || p.nameNormalized || '').trim();
      if (!prodName) continue;
      const key = `${p.id}`;
      if (!map.has(key)) {
        map.set(key, {
          productId: p.id,
          productName: prodName,
          batches: [],
          unitName: p.defaultUnitCodeName || null,
        });
      }
    }

    // 2. Associa ciascun lotto/prezzo d'acquisto al rispettivo prodotto (per ID o per nome)
    for (const b of batches || []) {
      const prodName = (b.productName || 'Prodotto').trim();
      let target = b.productId ? map.get(`${b.productId}`) : undefined;

      if (!target && prodName) {
        for (const item of map.values()) {
          if (item.productName.toLowerCase() === prodName.toLowerCase()) {
            target = item;
            break;
          }
        }
      }

      if (!target) {
        const key = b.productId ? `${b.productId}` : `name-${prodName.toLowerCase()}`;
        target = {
          productId: b.productId ?? 0,
          productName: prodName,
          batches: [],
          unitName: b.unitName,
        };
        map.set(key, target);
      }

      target.batches.push(b);
      if (!target.unitName && b.unitName) {
        target.unitName = b.unitName;
      }
    }

    const result: ProductPriceSummary[] = [];

    for (const item of map.values()) {
      if (item.batches.length === 0) continue;

      const stats = computePriceStatistics(item.batches, cutoffDate);
      const effectiveStats = stats.count > 0 ? stats : computePriceStatistics(item.batches, null);

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
  }, [products, batches, cutoffDate]);

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

  // Prodotto selezionato aggiornato in tempo reale ad ogni modifica di batch/prezzi
  const activeProductSummary = useMemo(() => {
    if (!selectedProductForModal) return null;
    return (
      productSummaries.find(
        (p) =>
          (selectedProductForModal.productId > 0 && p.productId === selectedProductForModal.productId) ||
          p.productName.toLowerCase().trim() === selectedProductForModal.productName.toLowerCase().trim()
      ) || selectedProductForModal
    );
  }, [selectedProductForModal, productSummaries]);

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
      {activeProductSummary && (
        isMobile ? (
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
        )
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
