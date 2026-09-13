// src/mobile/components/shopping/omni/useMobileShoppingOmniSearchLogic.ts
import { useState, useMemo, useEffect, useRef } from 'react';
import type {
  ShoppingGroupSummary,
  ShoppingListSummary,
  ShoppingProductOption,
  ShoppingListItem,
} from '@/types/shopping';
import { useBackHandler } from '@/utils/backButtonManager';

export interface UseMobileShoppingOmniSearchLogicProps {
  isOpen: boolean;
  onClose: () => void;
  groups: ShoppingGroupSummary[];
  lists: ShoppingListSummary[];
  products: ShoppingProductOption[];
  currentItems?: ShoppingListItem[];
  activeListId: number | null;
}

export function useMobileShoppingOmniSearchLogic({
  isOpen,
  onClose,
  groups,
  lists,
  products,
  currentItems = [],
  activeListId,
}: UseMobileShoppingOmniSearchLogicProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useBackHandler(isOpen, onClose, 10);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  const cleanQuery = query.toLowerCase().trim();

  // Filtraggio Gruppi
  const matchedGroups = useMemo(() => {
    if (!cleanQuery) return [];
    return groups
      .filter(
        (g) =>
          g.name.toLowerCase().includes(cleanQuery) ||
          (g.description && g.description.toLowerCase().includes(cleanQuery))
      )
      .slice(0, 5);
  }, [groups, cleanQuery]);

  // Filtraggio Liste
  const matchedLists = useMemo(() => {
    if (!cleanQuery) return [];
    return lists
      .filter(
        (l) =>
          l.name.toLowerCase().includes(cleanQuery) ||
          (l.groupName && l.groupName.toLowerCase().includes(cleanQuery)) ||
          (l.description && l.description.toLowerCase().includes(cleanQuery))
      )
      .slice(0, 6);
  }, [lists, cleanQuery]);

  // Raccogli tutti gli articoli noti
  const allKnownItems = useMemo(() => {
    const fromLists = lists.flatMap((l) =>
      (l.items || []).map((it) => ({
        ...it,
        shoppingListId: it.shoppingListId || l.id,
        listName: it.listName || l.name,
      }))
    );
    if (fromLists.length > 0) return fromLists;
    return currentItems.map((it) => ({
      ...it,
      shoppingListId: it.shoppingListId || (activeListId ?? 0),
    }));
  }, [lists, currentItems, activeListId]);

  // Filtraggio Articoli nelle Liste
  const matchedItemsInLists = useMemo(() => {
    if (!cleanQuery) return [];
    return allKnownItems
      .filter(
        (item) =>
          item.productName.toLowerCase().includes(cleanQuery) ||
          (item.brandName && item.brandName.toLowerCase().includes(cleanQuery))
      )
      .slice(0, 8);
  }, [allKnownItems, cleanQuery]);

  // Filtraggio Prodotti Catalogo (con deduplicazione)
  const matchedProducts = useMemo(() => {
    if (!cleanQuery) return [];
    const seenNames = new Set<string>();
    const uniqueMatches: ShoppingProductOption[] = [];

    for (const p of products) {
      const pName = (p?.displayName || p?.nameNormalized || '').toLowerCase();
      const bName = (p?.brandName || '').toLowerCase();
      const key = `${pName}::${bName}`;
      if (
        (pName.includes(cleanQuery) || bName.includes(cleanQuery)) &&
        !seenNames.has(key)
      ) {
        seenNames.add(key);
        uniqueMatches.push(p);
      }
    }

    return uniqueMatches.slice(0, 10);
  }, [products, cleanQuery]);

  const totalResults =
    matchedGroups.length +
    matchedLists.length +
    matchedProducts.length +
    matchedItemsInLists.length;

  return {
    query,
    setQuery,
    inputRef,
    cleanQuery,
    matchedGroups,
    matchedLists,
    matchedItemsInLists,
    matchedProducts,
    totalResults,
  };
}
