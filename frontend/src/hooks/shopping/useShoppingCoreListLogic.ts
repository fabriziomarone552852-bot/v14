// src/hooks/shopping/useShoppingCoreListLogic.ts
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useShoppingData } from './useShoppingData';
import { useShoppingMutations } from './useShoppingMutations';
import { useModal } from '@/hooks/useModals';
import { makeEmptyForm, type ListFormState } from '@/components/shared/shopping/ShoppingListModal';
import type {
  ConfigOption,
  ShoppingListSummary,
  ShoppingProductOption,
  ShoppingProductBrandLink,
  ShoppingListItem,
} from '@/types/shopping';

export function useShoppingCoreListLogic() {
  const mutations = useShoppingMutations();
  const shoppingData = useShoppingData();
  const {
    lists,
    groups,
    activeListId,
    setActiveListId,
    config,
  } = shoppingData;

  // 1. GESTIONE QUERY PARAM ?listId=
  const [searchParams, setSearchParams] = useSearchParams();
  const paramListId = searchParams.get('listId');

  useEffect(() => {
    if (paramListId) {
      const parsed = parseInt(paramListId, 10);
      if (!isNaN(parsed) && parsed > 0) {
        setActiveListId(parsed);
      }
    }
  }, [paramListId, setActiveListId]);

  // 2. CONFIGURAZIONI & OPZIONI DI VISIBILITÀ
  const unitOptions = config?.unitOptions ?? [];
  const currencyOptions = config?.currencyOptions ?? [];
  const offerFlagOptions = config?.offerFlagOptions ?? [];
  const listVisibilityOptions = useMemo(() => config?.visibilityOptions ?? [], [config?.visibilityOptions]);
  const listStatusOptions = config?.listStatusOptions ?? [];

  const groupVisibilityId = useMemo(() => {
    const opt = listVisibilityOptions.find(
      (o: ConfigOption) => o.codeValue?.toLowerCase() === 'group' || o.codeName?.toLowerCase() === 'group'
    );
    return opt ? Number(opt.id) : 2;
  }, [listVisibilityOptions]);

  const privateVisibilityId = useMemo(() => {
    const opt = listVisibilityOptions.find(
      (o: ConfigOption) => o.codeValue?.toLowerCase() === 'private' || o.codeName?.toLowerCase() === 'private'
    );
    return opt ? Number(opt.id) : 1;
  }, [listVisibilityOptions]);

  // 3. STATO LISTA ATTIVA E PERMESSI
  const activeList = useMemo(() => {
    return lists.find((l) => l.id === activeListId) ?? null;
  }, [lists, activeListId]);

  const activeGroup = useMemo(() => {
    if (!activeList?.groupId) return null;
    return groups.find((g) => g.id === activeList.groupId) ?? null;
  }, [activeList, groups]);

  const activeUserRole = useMemo(() => {
    if (!activeList?.groupId) return 'owner';
    return activeGroup?.userRole || 'reader';
  }, [activeList, activeGroup]);

  const isCompleted = Boolean(activeList?.isCompleted);
  const isReader = Boolean(activeList?.groupId && activeUserRole === 'reader');

  const canCreateItem = !isCompleted && !isReader;
  const canEditItem = !isCompleted && !isReader;
  const canEditPurchasedItem = !isCompleted && !isReader;
  const canDeleteItem = !isCompleted && !isReader;

  // 4. GESTIONE MODALI DI LISTA (CREAZIONE & MODIFICA)
  const quickPriceModal = useModal<null>();
  const editListModal = useModal<ShoppingListSummary>();
  const [listEditForm, setListEditForm] = useState<ListFormState>(() => makeEmptyForm(''));

  const handleOpenEditList = useCallback(
    (list: ShoppingListSummary) => {
      setListEditForm({
        name: list.name,
        description: list.description ?? '',
        destinationValue: list.groupId ? String(list.groupId) : '',
      });
      editListModal.open(list);
    },
    [editListModal]
  );

  const handleOpenCreatePersonalList = useCallback(() => {
    setListEditForm(makeEmptyForm(''));
    editListModal.open({
      id: 0,
      name: '',
      visibilityId: privateVisibilityId,
      groupId: null,
      openItemsCount: 0,
      purchasedItemsCount: 0,
      totalItemsCount: 0,
      isCompleted: false,
      canEdit: true,
      canDelete: true,
    });
  }, [editListModal, privateVisibilityId]);

  const handleOpenCreateGroupList = useCallback(
    (groupId?: number) => {
      setListEditForm(makeEmptyForm(groupId ? String(groupId) : ''));
      editListModal.open({
        id: 0,
        name: '',
        visibilityId: groupId ? groupVisibilityId : privateVisibilityId,
        groupId: groupId ?? null,
        openItemsCount: 0,
        purchasedItemsCount: 0,
        totalItemsCount: 0,
        isCompleted: false,
        canEdit: true,
        canDelete: true,
      });
    },
    [editListModal, groupVisibilityId, privateVisibilityId]
  );

  const handleSaveEditList = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!editListModal.data) return;
      const trimmedName = listEditForm.name.trim();
      if (!trimmedName) return;

      const isGroup = Boolean(listEditForm.destinationValue);
      const visibilityId = isGroup ? groupVisibilityId : privateVisibilityId;
      const groupId = isGroup ? Number(listEditForm.destinationValue) : null;

      if (editListModal.data.id === 0) {
        const created = await mutations.createList({
          name: trimmedName,
          description: listEditForm.description.trim() || undefined,
          groupId,
          visibilityId,
          isCompleted: false,
        });
        if (created?.id) {
          setActiveListId(created.id);
        }
      } else {
        await mutations.updateList({
          id: editListModal.data.id,
          data: {
            name: trimmedName,
            description: listEditForm.description.trim() || undefined,
            groupId,
            visibilityId,
          },
        });
      }

      editListModal.close();
    },
    [editListModal, listEditForm, groupVisibilityId, privateVisibilityId, mutations, setActiveListId]
  );

  const handleDeleteList = useCallback(
    async (list: ShoppingListSummary) => {
      await mutations.deleteList(list.id);
      if (activeListId === list.id) {
        const remaining = lists.filter((l) => l.id !== list.id);
        setActiveListId(remaining[0]?.id ?? null);
      }
    },
    [activeListId, lists, mutations, setActiveListId]
  );

  const handleToggleCompleteList = useCallback(
    async (list: ShoppingListSummary, isComplete: boolean) => {
      await mutations.updateList({
        id: list.id,
        data: { isCompleted: isComplete },
      });
    },
    [mutations]
  );

  // 5. INSERIMENTO RAPIDO DA CATALOGO PRODOTTI
  const [isQuickCatalogOpen, setIsQuickCatalogOpen] = useState(false);

  const handleToggleQuickCatalog = useCallback(() => {
    setIsQuickCatalogOpen((prev) => {
      const next = !prev;
      if (next) {
        const defaultList =
          lists.find((l) => l.isDefault) ||
          lists.find((l) => l.name?.toLowerCase() === 'senza lista') ||
          lists[0];
        if (defaultList && activeListId !== defaultList.id) {
          setActiveListId(defaultList.id);
        }
      }
      return next;
    });
  }, [lists, activeListId, setActiveListId]);

  const handleToggleCatalogItem = useCallback(
    async (
      product: ShoppingProductOption,
      existingItem: ShoppingListItem | null,
      targetBrand?: ShoppingProductBrandLink | null
    ) => {
      if (!activeListId) return;
      if (existingItem) {
        await mutations.deleteItem({ id: existingItem.id, listId: activeListId });
      } else {
        const displayName = (product.displayName || product.nameNormalized || '').trim();
        if (!displayName) return;
        const brandId = targetBrand ? targetBrand.brandId : (product.brandId ?? undefined);
        const brandName = targetBrand?.brand?.nameNormalized ?? product.brandName ?? undefined;
        const brandNotes = targetBrand?.notes ?? undefined;

        await mutations.createItem({
          shoppingListId: activeListId,
          productName: displayName,
          brandId: brandId ?? undefined,
          brandName: brandName ?? undefined,
          brandNotes: brandNotes ?? undefined,
          unitId: product.defaultUnitId ?? undefined,
          quantity: 1,
        });
      }
    },
    [activeListId, mutations]
  );

  return {
    ...shoppingData,
    mutations,
    searchParams,
    setSearchParams,
    unitOptions,
    currencyOptions,
    offerFlagOptions,
    listVisibilityOptions,
    listStatusOptions,
    groupVisibilityId,
    privateVisibilityId,
    activeList,
    activeGroup,
    activeUserRole,
    isCompleted,
    isReader,
    canCreateItem,
    canEditItem,
    canEditPurchasedItem,
    canDeleteItem,
    quickPriceModal,
    editListModal,
    listEditForm,
    setListEditForm,
    handleOpenEditList,
    handleOpenCreatePersonalList,
    handleOpenCreateGroupList,
    handleSaveEditList,
    handleDeleteList,
    handleToggleCompleteList,
    isQuickCatalogOpen,
    setIsQuickCatalogOpen,
    handleToggleQuickCatalog,
    handleToggleCatalogItem,
  };
}
