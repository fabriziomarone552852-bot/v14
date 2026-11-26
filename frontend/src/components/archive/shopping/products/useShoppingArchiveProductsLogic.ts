// src/components/archive/shopping/products/useShoppingArchiveProductsLogic.ts
import { useMemo, useState } from 'react';
import type { ItemBatchRecord, ShoppingProductBrandLink, ShoppingProductOption } from '@/types/shopping';
import { useDynamicPageSize } from '@/hooks/useDynamicPageSize';
import { paginate } from '@/utils/paginationUtils';
import { formatDateString } from '@/utils/dateUtils';
import { parseBrandPreference, type BrandSentiment } from '@/utils/shoppingBrandPreference';

export type ShoppingCatalogSortField = 'name' | 'brands' | 'latestPrice' | 'purchases';
export type ShoppingCatalogSortDirection = 'asc' | 'desc';

export interface ShoppingCatalogProductFilterState {
  keyword: string;
  brandStatus: 'all' | 'with_brands' | 'without_brands';
  purchaseStatus: 'all' | 'purchased' | 'never_purchased';
}

export interface ProductBrandBadgeSummary {
  key: string;
  name: string;
  sentiment: BrandSentiment;
  notes: string | null;
}

export interface EnrichedCatalogProduct {
  product: ShoppingProductOption;
  displayName: string;
  brands: ProductBrandBadgeSummary[];
  batches: ItemBatchRecord[];
  purchaseCount: number;
  lastPrice: number | null;
  lastSupplierName: string | null;
  lastPurchaseDate: string | null;
  lastUnitName: string | null;
}

interface UseShoppingArchiveProductsLogicParams {
  products: ShoppingProductOption[];
  batches: ItemBatchRecord[];
  filterState: ShoppingCatalogProductFilterState;
}

const buildBrandsList = (product: ShoppingProductOption): ProductBrandBadgeSummary[] => {
  const seen = new Set<string>();
  const list: ProductBrandBadgeSummary[] = [];

  const links: ShoppingProductBrandLink[] = product.productBrands ?? [];
  for (const link of links) {
    const rawName = (link.brand?.nameNormalized || '').trim();
    if (!rawName) continue;
    const key = rawName.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    const pref = parseBrandPreference(link.notes);
    list.push({
      key: `b-${link.brandId}-${key}`,
      name: rawName,
      sentiment: pref?.sentiment ?? 'neutral',
      notes: link.notes ?? null,
    });
  }

  const fallbackBrand = (product.brandName || '').trim();
  if (fallbackBrand && !seen.has(fallbackBrand.toLowerCase())) {
    seen.add(fallbackBrand.toLowerCase());
    list.push({
      key: `fb-${fallbackBrand.toLowerCase()}`,
      name: fallbackBrand,
      sentiment: 'neutral',
      notes: null,
    });
  }

  return list;
};

export const useShoppingArchiveProductsLogic = ({
  products,
  batches,
  filterState,
}: UseShoppingArchiveProductsLogicParams) => {
  const [sortField, setSortField] = useState<ShoppingCatalogSortField>('name');
  const [sortDirection, setSortDirection] = useState<ShoppingCatalogSortDirection>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  const { containerRef, pageSize } = useDynamicPageSize({
    rowHeight: 50,
    defaultPageSize: 10,
    minItems: 3,
    maxItems: 30,
  });

  // Raggruppamento O(N) dei lotti per productId
  const batchesByProductId = useMemo(() => {
    const map = new Map<number, ItemBatchRecord[]>();
    for (const batch of batches) {
      if (!batch.productId) continue;
      const existing = map.get(batch.productId);
      if (existing) {
        existing.push(batch);
      } else {
        map.set(batch.productId, [batch]);
      }
    }
    for (const [, list] of map) {
      list.sort(
        (a, b) =>
          new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
      );
    }
    return map;
  }, [batches]);

  const enrichedProducts = useMemo<EnrichedCatalogProduct[]>(() => {
    return products.map((product) => {
      const displayName = (product.displayName || product.nameNormalized || '').trim();
      const prodBatches = batchesByProductId.get(product.id) ?? [];
      const latestBatch = prodBatches[0] ?? null;

      const latestUnitPrice =
        latestBatch?.unitPrice != null
          ? Number(latestBatch.unitPrice)
          : latestBatch?.purchasePrice != null
          ? Number(latestBatch.purchasePrice)
          : product.lastPurchasePrice != null
          ? Number(product.lastPurchasePrice)
          : null;

      const rawDate = latestBatch?.purchaseDate ?? product.lastPurchaseDate ?? null;
      const lastPurchaseDate = rawDate
        ? rawDate.includes('T')
          ? formatDateString(new Date(rawDate))
          : rawDate
        : null;

      return {
        product,
        displayName,
        brands: buildBrandsList(product),
        batches: prodBatches,
        purchaseCount: prodBatches.length,
        lastPrice: latestUnitPrice,
        lastSupplierName: latestBatch?.supplierName ?? product.lastSupplierName ?? null,
        lastPurchaseDate,
        lastUnitName: latestBatch?.unitName ?? product.defaultUnitCodeName ?? null,
      };
    });
  }, [products, batchesByProductId]);

  const filteredProducts = useMemo(() => {
    const keyword = filterState.keyword.trim().toLowerCase();

    const filtered = enrichedProducts.filter((item) => {
      if (filterState.brandStatus === 'with_brands' && item.brands.length === 0) {
        return false;
      }
      if (filterState.brandStatus === 'without_brands' && item.brands.length > 0) {
        return false;
      }
      if (filterState.purchaseStatus === 'purchased' && item.purchaseCount === 0) {
        return false;
      }
      if (filterState.purchaseStatus === 'never_purchased' && item.purchaseCount > 0) {
        return false;
      }

      if (keyword) {
        const matchName = item.displayName.toLowerCase().includes(keyword);
        const matchBrand = item.brands.some((b) => b.name.toLowerCase().includes(keyword));
        const matchSupplier = (item.lastSupplierName || '').toLowerCase().includes(keyword);
        if (!matchName && !matchBrand && !matchSupplier) {
          return false;
        }
      }

      return true;
    });

    const dir = sortDirection === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sortField === 'brands') {
        const diff = a.brands.length - b.brands.length;
        if (diff !== 0) return diff * dir;
      } else if (sortField === 'latestPrice') {
        const priceA = a.lastPrice ?? -1;
        const priceB = b.lastPrice ?? -1;
        if (priceA !== priceB) return (priceA - priceB) * dir;
      } else if (sortField === 'purchases') {
        const diff = a.purchaseCount - b.purchaseCount;
        if (diff !== 0) return diff * dir;
      }

      return a.displayName.localeCompare(b.displayName, 'it', { sensitivity: 'base' }) * dir;
    });
  }, [enrichedProducts, filterState, sortField, sortDirection]);

  const { paginatedItems: paginatedProducts, totalPages } = useMemo(
    () => paginate(filteredProducts, currentPage, pageSize),
    [filteredProducts, currentPage, pageSize]
  );

  const selectedProduct = useMemo(
    () =>
      selectedProductId != null
        ? enrichedProducts.find((p) => p.product.id === selectedProductId) ?? null
        : null,
    [enrichedProducts, selectedProductId]
  );

  const hasActiveFilters =
    Boolean(filterState.keyword.trim()) ||
    filterState.brandStatus !== 'all' ||
    filterState.purchaseStatus !== 'all';

  const handleSort = (field: ShoppingCatalogSortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection(field === 'name' ? 'asc' : 'desc');
    }
    setCurrentPage(1);
  };

  return {
    sortField,
    sortDirection,
    handleSort,
    currentPage,
    setCurrentPage,
    totalPages,
    containerRef,
    filteredProducts,
    paginatedProducts,
    hasActiveFilters,
    selectedProduct,
    setSelectedProductId,
  };
};
