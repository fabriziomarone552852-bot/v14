// src/components/admin/shopping/entities/useAdminShoppingEntitiesLogic.ts
import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchShoppingProducts,
  updateShoppingProduct,
} from '@/api/shopping/shoppingConfigApi';
import {
  fetchShoppingBrands,
  fetchShoppingSuppliers,
  updateShoppingSupplier,
} from '@/api/shopping/shoppingSuppliersApi';
import {
  fetchShoppingLists,
  updateShoppingList,
} from '@/api/shopping/shoppingListsApi';
import {
  fetchShoppingGroups,
  updateShoppingGroup,
} from '@/api/shopping/shoppingGroupsApi';
import { fetchAllInventoryBatches } from '@/api/shopping/shoppingInventoryApi';
import type { ItemBatchRecord } from '@/types/shopping';
import type {
  AdminShoppingEntityTab,
  EnrichedProductItem,
  EnrichedBrandItem,
  EnrichedSupplierItem,
  EnrichedListItem,
  EnrichedGroupItem,
  EntityFeedbackMessage,
} from './types';

export const useAdminShoppingEntitiesLogic = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<AdminShoppingEntityTab>('products');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [message, setMessage] = useState<EntityFeedbackMessage | null>(null);

  // Mappa delle modifiche in bozza: chiave = `${tab}-${id}`
  const [drafts, setDrafts] = useState<Record<string, { name?: string; description?: string }>>({});

  // 1. QUERY CARICAMENTO DATI
  const { data: products = [], isLoading: loadingProducts, refetch: refetchProducts } = useQuery({
    queryKey: ['shopping', 'admin', 'products'],
    queryFn: ({ signal }) => fetchShoppingProducts(signal),
    staleTime: 60_000,
  });

  const { data: brands = [], isLoading: loadingBrands, refetch: refetchBrands } = useQuery({
    queryKey: ['shopping', 'admin', 'brands'],
    queryFn: ({ signal }) => fetchShoppingBrands(signal),
    staleTime: 60_000,
  });

  const { data: suppliers = [], isLoading: loadingSuppliers, refetch: refetchSuppliers } = useQuery({
    queryKey: ['shopping', 'admin', 'suppliers'],
    queryFn: ({ signal }) => fetchShoppingSuppliers(signal),
    staleTime: 60_000,
  });

  const { data: lists = [], isLoading: loadingLists, refetch: refetchLists } = useQuery({
    queryKey: ['shopping', 'admin', 'lists'],
    queryFn: ({ signal }) => fetchShoppingLists(signal),
    staleTime: 60_000,
  });

  const { data: groups = [], isLoading: loadingGroups, refetch: refetchGroups } = useQuery({
    queryKey: ['shopping', 'admin', 'groups'],
    queryFn: ({ signal }) => fetchShoppingGroups(signal),
    staleTime: 60_000,
  });

  const { data: batches = [], isLoading: loadingBatches } = useQuery<ItemBatchRecord[]>({
    queryKey: ['shopping', 'admin', 'batches-summary'],
    queryFn: ({ signal }) => fetchAllInventoryBatches(signal),
    staleTime: 120_000,
  });

  const isLoading =
    loadingProducts || loadingBrands || loadingSuppliers || loadingLists || loadingGroups || loadingBatches;

  // 2. CONTEGGI IN RAM (Mazzo di carte)
  const productBatchCounts = useMemo(() => {
    const map = new Map<number, number>();
    batches.forEach((b: ItemBatchRecord) => {
      if (b.productId) {
        map.set(b.productId, (map.get(b.productId) ?? 0) + 1);
      }
    });
    return map;
  }, [batches]);

  const brandBatchCounts = useMemo(() => {
    const map = new Map<number, number>();
    batches.forEach((b: ItemBatchRecord) => {
      if (b.brandId) {
        map.set(b.brandId, (map.get(b.brandId) ?? 0) + 1);
      }
    });
    return map;
  }, [batches]);

  const supplierBatchCounts = useMemo(() => {
    const map = new Map<number, number>();
    batches.forEach((b: ItemBatchRecord) => {
      if (b.supplierId) {
        map.set(b.supplierId, (map.get(b.supplierId) ?? 0) + 1);
      }
    });
    return map;
  }, [batches]);

  const brandProductCounts = useMemo(() => {
    const map = new Map<number, number>();
    products.forEach((p) => {
      p.productBrands?.forEach((pb) => {
        if (pb.brandId) {
          map.set(pb.brandId, (map.get(pb.brandId) ?? 0) + 1);
        }
      });
    });
    return map;
  }, [products]);

  // 3. DATI ARRICCHITI CON BOZZE E STATISTICHE
  const enrichedProducts: EnrichedProductItem[] = useMemo(() => {
    return products.map((p) => {
      const draft = drafts[`products-${p.id}`];
      return {
        ...p,
        batchCount: productBatchCounts.get(p.id) ?? 0,
        draftName: draft?.name !== undefined ? draft.name : (p.displayName || p.nameNormalized),
      };
    });
  }, [products, drafts, productBatchCounts]);

  const enrichedBrands: EnrichedBrandItem[] = useMemo(() => {
    return brands.map((b) => {
      const draft = drafts[`brands-${b.id}`];
      return {
        ...b,
        productCount: brandProductCounts.get(b.id) ?? 0,
        batchCount: brandBatchCounts.get(b.id) ?? 0,
        draftName: draft?.name !== undefined ? draft.name : (b.name || b.nameNormalized || ''),
      };
    });
  }, [brands, drafts, brandProductCounts, brandBatchCounts]);

  const enrichedSuppliers: EnrichedSupplierItem[] = useMemo(() => {
    return suppliers.map((s) => {
      const draft = drafts[`suppliers-${s.id}`];
      return {
        ...s,
        batchCount: supplierBatchCounts.get(s.id) ?? 0,
        draftName: draft?.name !== undefined ? draft.name : (s.name || s.nameNormalized || ''),
      };
    });
  }, [suppliers, drafts, supplierBatchCounts]);

  const enrichedLists: EnrichedListItem[] = useMemo(() => {
    return lists.map((l) => {
      const draft = drafts[`lists-${l.id}`];
      return {
        ...l,
        itemCount: l.totalItemsCount ?? (l.items?.length ?? 0),
        draftName: draft?.name !== undefined ? draft.name : l.name,
        draftDescription: draft?.description !== undefined ? draft.description : (l.description ?? ''),
      };
    });
  }, [lists, drafts]);

  const enrichedGroups: EnrichedGroupItem[] = useMemo(() => {
    return groups.map((g) => {
      const draft = drafts[`groups-${g.id}`];
      return {
        ...g,
        draftName: draft?.name !== undefined ? draft.name : g.name,
        draftDescription: draft?.description !== undefined ? draft.description : (g.description ?? ''),
      };
    });
  }, [groups, drafts]);

  // 4. FILTRAGGIO PER RICERCA
  const q = searchQuery.trim().toLowerCase();

  const filteredProducts = useMemo(() => {
    if (!q) return enrichedProducts;
    return enrichedProducts.filter(
      (p) =>
        (p.draftName || '').toLowerCase().includes(q) ||
        (p.brandName || '').toLowerCase().includes(q) ||
        String(p.id) === q
    );
  }, [enrichedProducts, q]);

  const filteredBrands = useMemo(() => {
    if (!q) return enrichedBrands;
    return enrichedBrands.filter(
      (b) =>
        (b.draftName || '').toLowerCase().includes(q) ||
        String(b.id) === q
    );
  }, [enrichedBrands, q]);

  const filteredSuppliers = useMemo(() => {
    if (!q) return enrichedSuppliers;
    return enrichedSuppliers.filter(
      (s) =>
        (s.draftName || '').toLowerCase().includes(q) ||
        String(s.id) === q
    );
  }, [enrichedSuppliers, q]);

  const filteredLists = useMemo(() => {
    if (!q) return enrichedLists;
    return enrichedLists.filter(
      (l) =>
        (l.draftName || '').toLowerCase().includes(q) ||
        (l.draftDescription || '').toLowerCase().includes(q) ||
        String(l.id) === q
    );
  }, [enrichedLists, q]);

  const filteredGroups = useMemo(() => {
    if (!q) return enrichedGroups;
    return enrichedGroups.filter(
      (g) =>
        (g.draftName || '').toLowerCase().includes(q) ||
        (g.draftDescription || '').toLowerCase().includes(q) ||
        String(g.id) === q
    );
  }, [enrichedGroups, q]);

  // 5. GESTIONE BOZZE (DRAFTS)
  const handleDraftChange = useCallback((entityType: AdminShoppingEntityTab, id: number, field: 'name' | 'description', value: string) => {
    setDrafts((prev) => {
      const key = `${entityType}-${id}`;
      return {
        ...prev,
        [key]: {
          ...prev[key],
          [field]: value,
        },
      };
    });
  }, []);

  const handleCancelDraft = useCallback((entityType: AdminShoppingEntityTab, id: number) => {
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[`${entityType}-${id}`];
      return next;
    });
  }, []);

  // 6. MUTAZIONI DI SALVATAGGIO
  const productMutation = useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      return await updateShoppingProduct(id, { name });
    },
    onSuccess: (updated) => {
      setMessage({ type: 'success', text: `Articolo #${updated.id} "${updated.displayName || updated.nameNormalized}" aggiornato con successo.` });
      handleCancelDraft('products', updated.id);
      queryClient.invalidateQueries({ queryKey: ['shopping', 'admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['shopping', 'products'] });
    },
    onError: (err: unknown) => {
      const detail = err instanceof Error ? err.message : 'Errore sconosciuto nel salvataggio dell\'articolo.';
      setMessage({ type: 'error', text: `Impossibile aggiornare l'articolo: ${detail}` });
    },
  });

  const supplierMutation = useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string; type: 'brands' | 'suppliers' }) => {
      return await updateShoppingSupplier(id, { name });
    },
    onSuccess: (updated, variables) => {
      const label = variables.type === 'brands' ? 'Marca' : 'Punto vendita';
      setMessage({ type: 'success', text: `${label} #${updated.id} "${updated.name}" aggiornato con successo.` });
      handleCancelDraft(variables.type, updated.id);
      queryClient.invalidateQueries({ queryKey: ['shopping', 'admin', variables.type] });
      queryClient.invalidateQueries({ queryKey: ['shopping', variables.type] });
      queryClient.invalidateQueries({ queryKey: ['shopping', 'suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['shopping', 'brands'] });
    },
    onError: (err: unknown) => {
      const detail = err instanceof Error ? err.message : 'Errore nel salvataggio del fornitore/marca.';
      setMessage({ type: 'error', text: `Errore: ${detail}` });
    },
  });

  const listMutation = useMutation({
    mutationFn: async ({ id, name, description }: { id: number; name: string; description?: string }) => {
      return await updateShoppingList(id, { name, description });
    },
    onSuccess: (updated) => {
      setMessage({ type: 'success', text: `Lista #${updated.id} "${updated.name}" aggiornata con successo.` });
      handleCancelDraft('lists', updated.id);
      queryClient.invalidateQueries({ queryKey: ['shopping', 'admin', 'lists'] });
      queryClient.invalidateQueries({ queryKey: ['shopping', 'lists'] });
    },
    onError: (err: unknown) => {
      const detail = err instanceof Error ? err.message : 'Errore nel salvataggio della lista.';
      setMessage({ type: 'error', text: `Errore: ${detail}` });
    },
  });

  const groupMutation = useMutation({
    mutationFn: async ({ id, name, description }: { id: number; name: string; description?: string }) => {
      return await updateShoppingGroup(id, { name, description });
    },
    onSuccess: (updated) => {
      setMessage({ type: 'success', text: `Gruppo #${updated.id} "${updated.name}" aggiornato con successo.` });
      handleCancelDraft('groups', updated.id);
      queryClient.invalidateQueries({ queryKey: ['shopping', 'admin', 'groups'] });
      queryClient.invalidateQueries({ queryKey: ['shopping', 'groups'] });
    },
    onError: (err: unknown) => {
      const detail = err instanceof Error ? err.message : 'Errore nel salvataggio del gruppo.';
      setMessage({ type: 'error', text: `Errore: ${detail}` });
    },
  });

  const handleSaveProduct = useCallback((id: number, newName: string) => {
    productMutation.mutate({ id, name: newName });
  }, [productMutation]);

  const handleSaveBrand = useCallback((id: number, newName: string) => {
    supplierMutation.mutate({ id, name: newName, type: 'brands' });
  }, [supplierMutation]);

  const handleSaveSupplier = useCallback((id: number, newName: string) => {
    supplierMutation.mutate({ id, name: newName, type: 'suppliers' });
  }, [supplierMutation]);

  const handleSaveList = useCallback((id: number, newName: string, newDesc?: string) => {
    listMutation.mutate({ id, name: newName, description: newDesc });
  }, [listMutation]);

  const handleSaveGroup = useCallback((id: number, newName: string, newDesc?: string) => {
    groupMutation.mutate({ id, name: newName, description: newDesc });
  }, [groupMutation]);

  const isSaving =
    productMutation.isPending ||
    supplierMutation.isPending ||
    listMutation.isPending ||
    groupMutation.isPending;

  return {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    message,
    setMessage,
    isLoading,
    isSaving,
    // Liste filtrate
    filteredProducts,
    filteredBrands,
    filteredSuppliers,
    filteredLists,
    filteredGroups,
    // Totali
    totalProductsCount: products.length,
    totalBrandsCount: brands.length,
    totalSuppliersCount: suppliers.length,
    totalListsCount: lists.length,
    totalGroupsCount: groups.length,
    // Azioni Draft
    handleDraftChange,
    handleCancelDraft,
    isDraftDirty: (entityType: AdminShoppingEntityTab, id: number) => Boolean(drafts[`${entityType}-${id}`]),
    // Azioni Salvataggio
    handleSaveProduct,
    handleSaveBrand,
    handleSaveSupplier,
    handleSaveList,
    handleSaveGroup,
    // Refetch
    refetchAll: () => {
      refetchProducts();
      refetchBrands();
      refetchSuppliers();
      refetchLists();
      refetchGroups();
    },
  };
};
