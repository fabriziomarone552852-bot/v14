// src/components/shared/shopping/useShoppingQuickCatalogLogic.ts
import { useState, useMemo, useCallback } from 'react';
import type {
  ShoppingProductOption,
  ShoppingListItem,
} from '@/types/shopping';

export interface UseShoppingQuickCatalogLogicProps {
  /** Elenco completo dei prodotti censiti nel catalogo */
  products: ShoppingProductOption[];
  /** Articoli attualmente presenti nella lista della spesa attiva */
  items: ShoppingListItem[];
  /** Direzione iniziale di ordinamento (default: 'asc') */
  initialSortDirection?: 'asc' | 'desc';
}

export interface UseShoppingQuickCatalogLogicReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  sortDirection: 'asc' | 'desc';
  setSortDirection: React.Dispatch<React.SetStateAction<'asc' | 'desc'>>;
  toggleSortDirection: () => void;
  /** Verifica se un prodotto del catalogo è già presente nella lista attiva */
  getExistingItem: (product: ShoppingProductOption) => ShoppingListItem | null;
  /** Verifica se uno specifico brand di un prodotto è già presente nella lista attiva */
  getExistingItemForBrand: (
    product: ShoppingProductOption,
    brandId: number | null,
    brandName?: string | null
  ) => ShoppingListItem | null;
  /** Set degli ID prodotto con accordion espanso su desktop */
  expandedProductIds: Set<number>;
  toggleProductExpand: (productId: number) => void;
  isProductExpanded: (productId: number) => boolean;
  /** Prodotto selezionato per il modale touch su mobile */
  mobileModalProduct: ShoppingProductOption | null;
  setMobileModalProduct: (p: ShoppingProductOption | null) => void;
  /** Elenco dei prodotti filtrati per ricerca testuale e ordinati */
  filteredProducts: ShoppingProductOption[];
  /** Numero di prodotti attualmente inseriti nella lista attiva */
  inListCount: number;
}

/**
 * Hook condiviso per la gestione del Catalogo Veloce della spesa (DRY e Mazzo di Carte).
 * Centralizza l'indicizzazione rapida O(1) degli elementi presenti in lista,
 * il filtraggio in memoria locale per nome/marca e l'ordinamento alfabetico,
 * fungendo da unica fonte di verità sia per la vista Desktop sia per Mobile.
 */
export const useShoppingQuickCatalogLogic = ({
  products,
  items,
  initialSortDirection = 'asc',
}: UseShoppingQuickCatalogLogicProps): UseShoppingQuickCatalogLogicReturn => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(initialSortDirection);
  const [expandedProductIds, setExpandedProductIds] = useState<Set<number>>(new Set());
  const [mobileModalProduct, setMobileModalProduct] = useState<ShoppingProductOption | null>(null);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const toggleSortDirection = useCallback(() => {
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  }, []);

  const toggleProductExpand = useCallback((productId: number) => {
    setExpandedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  }, []);

  const isProductExpanded = useCallback(
    (productId: number) => expandedProductIds.has(productId),
    [expandedProductIds]
  );

  // 1. Mappa rapida degli item presenti nella lista corrente in RAM (Look-up O(1))
  // Indicizzati sia per ID numerico sia per nome normalizzato (case-insensitive)
  const itemsInListMap = useMemo<Map<string, ShoppingListItem>>(() => {
    const map = new Map<string, ShoppingListItem>();
    for (const it of items) {
      if (it.productId && it.productId > 0) {
        map.set(`id:${it.productId}`, it);
      }
      const norm = (it.nameNormalized || it.productName || '').trim().toLowerCase();
      if (norm) {
        map.set(`name:${norm}`, it);
      }
    }
    return map;
  }, [items]);

  // 2. Helper per determinare se il prodotto del catalogo è già presente nella spesa
  const getExistingItem = useCallback(
    (product: ShoppingProductOption): ShoppingListItem | null => {
      if (product.id && itemsInListMap.has(`id:${product.id}`)) {
        return itemsInListMap.get(`id:${product.id}`)!;
      }
      const norm = (product.nameNormalized || product.displayName || '').trim().toLowerCase();
      if (norm && itemsInListMap.has(`name:${norm}`)) {
        return itemsInListMap.get(`name:${norm}`)!;
      }
      return null;
    },
    [itemsInListMap]
  );

  // 3. Helper per verificare la presenza di uno specifico Brand (o generico)
  const getExistingItemForBrand = useCallback(
    (
      product: ShoppingProductOption,
      brandId: number | null,
      brandName?: string | null
    ): ShoppingListItem | null => {
      const pid = product.id;
      const bNorm = (brandName || '').trim().toLowerCase();

      for (const it of items) {
        if (it.productId && it.productId === pid) {
          if (brandId != null) {
            if (it.brandId === brandId) return it;
            const itemNorm = (it.nameNormalized || it.productName || '').toLowerCase();
            if (bNorm && itemNorm.includes(`(${bNorm})`)) return it;
          } else {
            // Generico (senza brand specifico)
            if (!it.brandId && !(it.nameNormalized || '').includes('(')) return it;
          }
        }
      }

      // Fallback per nome normalizzato
      const prodNorm = (product.nameNormalized || product.displayName || '').trim().toLowerCase();
      for (const it of items) {
        const itemNorm = (it.nameNormalized || it.productName || '').toLowerCase();
        if (brandId != null && bNorm) {
          if (
            itemNorm === `${prodNorm} (${bNorm})` ||
            (itemNorm.startsWith(prodNorm) && itemNorm.includes(`(${bNorm})`))
          ) {
            return it;
          }
        } else if (brandId == null) {
          if (itemNorm === prodNorm) return it;
        }
      }

      return null;
    },
    [items]
  );

  // 4. Filtro e ordinamento alfabetico in memoria locale (Mazzo di Carte nel frontend)
  const filteredProducts = useMemo<ShoppingProductOption[]>(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = products;

    if (q) {
      list = list.filter((p) => {
        const name = (p.displayName || p.nameNormalized || '').toLowerCase();
        const brand = (p.brandName || '').toLowerCase();
        const matchesSubBrand = p.productBrands?.some((pb) =>
          (pb.brand?.nameNormalized || '').toLowerCase().includes(q)
        );
        return name.includes(q) || brand.includes(q) || Boolean(matchesSubBrand);
      });
    }

    return [...list].sort((a, b) => {
      const nameA = (a.displayName || a.nameNormalized || '').trim();
      const nameB = (b.displayName || b.nameNormalized || '').trim();
      const comp = nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
      return sortDirection === 'asc' ? comp : -comp;
    });
  }, [products, searchQuery, sortDirection]);

  // 5. Conteggio istantaneo degli articoli inseriti
  const inListCount = useMemo<number>(() => {
    let count = 0;
    for (const p of products) {
      if (getExistingItem(p)) {
        count++;
      }
    }
    return count;
  }, [products, getExistingItem]);

  return {
    searchQuery,
    setSearchQuery,
    clearSearch,
    sortDirection,
    setSortDirection,
    toggleSortDirection,
    getExistingItem,
    getExistingItemForBrand,
    expandedProductIds,
    toggleProductExpand,
    isProductExpanded,
    mobileModalProduct,
    setMobileModalProduct,
    filteredProducts,
    inListCount,
  };
};
