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

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const toggleSortDirection = useCallback(() => {
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  }, []);

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

  // 3. Filtro e ordinamento alfabetico in memoria locale (Mazzo di Carte nel frontend)
  const filteredProducts = useMemo<ShoppingProductOption[]>(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = products;

    if (q) {
      list = list.filter((p) => {
        const name = (p.displayName || p.nameNormalized || '').toLowerCase();
        const brand = (p.brandName || '').toLowerCase();
        return name.includes(q) || brand.includes(q);
      });
    }

    return [...list].sort((a, b) => {
      const nameA = (a.displayName || a.nameNormalized || '').trim();
      const nameB = (b.displayName || b.nameNormalized || '').trim();
      const comp = nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
      return sortDirection === 'asc' ? comp : -comp;
    });
  }, [products, searchQuery, sortDirection]);

  // 4. Conteggio istantaneo degli articoli inseriti
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
    filteredProducts,
    inListCount,
  };
};
