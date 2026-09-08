// src/mobile/views/MobileShoppingView.tsx
import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

// Hooks & Contesti Shopping
import { useShoppingData } from '@/hooks/shopping/useShoppingData';
import { useShoppingMutations } from '@/hooks/shopping/useShoppingMutations';
import { useShoppingGroupActions } from '@/hooks/shopping/useShoppingGroupActions';
import { useShoppingItemsColumn } from '@/components/shared/shopping/useShoppingItemsColumn';
import { useShoppingModals } from '@/context/ShoppingModalContext';
import { useModal } from '@/hooks/useModals';

// Modali e Componenti Shopping Mobile Dedicati
import MobileShoppingListModal from '../components/modals/shopping/MobileShoppingListModal';
import { makeEmptyForm, type ListFormState } from '@/components/shared/shopping/ShoppingListModal';
import MobileShoppingQuickPriceModal from '../components/modals/shopping/MobileShoppingQuickPriceModal';
import MobileShoppingGroupCreateModal from '../components/modals/shopping/MobileShoppingGroupCreateModal';
import MobileShoppingGroupDetailModal from '../components/modals/shopping/MobileShoppingGroupDetailModal';
import MobileShoppingGroupInviteModal from '../components/modals/shopping/MobileShoppingGroupInviteModal';
import MobileShoppingItemsColumnModals from '../components/modals/shopping/MobileShoppingItemsColumnModals';
import ShoppingUnitSelect from '@/components/shared/shopping/ShoppingUnitSelect';

// Componenti Mobile Shopping
import MobileShoppingListSelector from '../components/shopping/MobileShoppingListSelector';
import MobileShoppingListPickerModal from '../components/shopping/MobileShoppingListPickerModal';
import MobileShoppingOmniSearch from '../components/shopping/MobileShoppingOmniSearch';

// Feedback & Icone
import PageLoadingState from '@/components/shared/feedback/PageLoadingState';
import PageErrorState from '@/components/shared/feedback/PageErrorState';
import { LOADING_MESSAGES, ERROR_MESSAGES } from '@/data/loadingMessages';
import {
  ShoppingIcon,
  PlusIcon,
} from '@/components/shared/utils/Icons';
import type { ConfigOption, ShoppingListSummary } from '@/types/shopping';

export const MobileShoppingView: React.FC = () => {
  const queryClient = useQueryClient();
  const mutations = useShoppingMutations();

  // 1. DATA FETCHING PRINCIPALE
  const {
    lists,
    groups,
    activeListId,
    setActiveListId,
    items,
    suppliers,
    brands,
    products,
    config,
    isInitialLoading,
    isError,
    refreshLists,
    refreshGroups,
  } = useShoppingData();

  // Gestione query param ?listId=
  const [searchParams] = useSearchParams();
  const paramListId = searchParams.get('listId');

  useEffect(() => {
    if (paramListId) {
      const parsed = parseInt(paramListId, 10);
      if (!isNaN(parsed) && parsed > 0) {
        setActiveListId(parsed);
      }
    }
  }, [paramListId, setActiveListId]);

  // Configurazioni & Opzioni
  const unitOptions = config?.unitOptions ?? [];
  const currencyOptions = config?.currencyOptions ?? [];
  const offerFlagOptions = config?.offerFlagOptions ?? [];
  const listVisibilityOptions = useMemo(() => config?.visibilityOptions ?? [], [config?.visibilityOptions]);

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

  // 2. HOOK GESTIONE ARTICOLI E MODALI ITEM
  const columnLogic = useShoppingItemsColumn({
    items,
    currencyOptions,
    activeListId,
    activeList,
    searchQuery: '',
    initialFiltroStato: 'tutti',
  });

  // 3. HOOK GESTIONE GRUPPI
  const {
    isGroupCreateOpen,
    setIsGroupCreateOpen,
    editingGroup,
    setEditingGroup,
    detailGroup,
    setDetailGroup,
    activeInviteGroup,
    setActiveInviteGroup,
    groupMembersRefreshKey,
    handleCreateGroup,
    handleUpdateGroup,
    handleDeleteGroup,
    handleArchiveGroup,
    handleUnarchiveGroup,
    handleInviteMembers,
  } = useShoppingGroupActions({ refreshGroups, refreshLists, queryClient });

  // 4. STATI MODALI LOCALI & PICKER
  const quickPriceModal = useModal<null>();
  const editListModal = useModal<ShoppingListSummary>();
  const [listEditForm, setListEditForm] = useState<ListFormState>(() => makeEmptyForm(''));

  const [isPickerModalOpen, setIsPickerModalOpen] = useState(false);

  // 5. REGISTRAZIONE HANDLERS PER MOBILEHEADER
  const { registerHandlers, isOmniSearchOpen, setIsOmniSearchOpen } = useShoppingModals();

  const handleOpenCreatePersonalList = () => {
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
  };

  const handleOpenCreateGroupList = (groupId?: number) => {
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
  };

  useEffect(() => {
    registerHandlers({
      openOmniSearch: () => setIsOmniSearchOpen((prev) => !prev),
      openQuickPrice: () => quickPriceModal.open(null),
      openCreateItem: () => {
        if (activeListId) {
          columnLogic.handleOpenCreate();
        } else {
          setIsPickerModalOpen(true);
        }
      },
      openCreateList: (groupId) => {
        if (groupId) {
          handleOpenCreateGroupList(groupId);
        } else {
          handleOpenCreatePersonalList();
        }
      },
      openCreateGroup: () => setIsGroupCreateOpen(true),
    });
  }, [
    registerHandlers,
    setIsOmniSearchOpen,
    activeListId,
    columnLogic.handleOpenCreate,
  ]);

  // Calcolo articoli divisi per stato (Da Comprare vs Nel Carrello)
  const openItems = useMemo(() => {
    return columnLogic.filteredItems.filter((item) => !item.isPurchased);
  }, [columnLogic.filteredItems]);

  const purchasedItems = useMemo(() => {
    return columnLogic.filteredItems.filter((item) => item.isPurchased);
  }, [columnLogic.filteredItems]);

  const handleOpenEditList = (list: ShoppingListSummary) => {
    setListEditForm({
      name: list.name,
      description: list.description ?? '',
      destinationValue: list.groupId ? String(list.groupId) : '',
    });
    editListModal.open(list);
  };

  const handleSaveEditList = async (e: React.FormEvent<HTMLFormElement>) => {
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
  };

  const handleDeleteList = async (list: ShoppingListSummary) => {
    await mutations.deleteList(list.id);
    if (activeListId === list.id) {
      const remaining = lists.filter((l) => l.id !== list.id);
      setActiveListId(remaining[0]?.id ?? null);
    }
  };

  const handleToggleCompleteList = async (list: ShoppingListSummary, isCompleted: boolean) => {
    await mutations.updateList({
      id: list.id,
      data: { isCompleted },
    });
  };

  // Permessi Utente
  const canCreateItem = activeUserRole === 'owner' || activeUserRole === 'admin' || activeUserRole === 'editor';
  const canEditItem = activeUserRole === 'owner' || activeUserRole === 'admin' || activeUserRole === 'editor';
  const canEditPurchasedItem = activeUserRole === 'owner' || activeUserRole === 'admin';
  const canDeleteItem = activeUserRole === 'owner' || activeUserRole === 'admin';

  // Stato di caricamento iniziale
  if (isInitialLoading) {
    return <PageLoadingState messages={LOADING_MESSAGES.shopping} />;
  }

  if (isError) {
    return (
      <PageErrorState
        message={ERROR_MESSAGES.shopping}
        onRetry={() => queryClient.refetchQueries()}
      />
    );
  }

  return (
    <div className="h-full w-full flex flex-col justify-between gap-2 overflow-hidden animate-fadeIn relative select-none">
      
      {/* ========================================================================= */}
      {/* 1. SCOMPARTO 1: SELETTORE GRUPPO / LISTA FISSO                            */}
      {/*    (Al clic apre MobileShoppingListPickerModal a tutto schermo)           */}
      {/* ========================================================================= */}
      <MobileShoppingListSelector
        activeList={activeList}
        activeGroup={activeGroup}
        onOpenPicker={() => setIsPickerModalOpen(true)}
        onEditList={handleOpenEditList}
        onDeleteList={handleDeleteList}
        onToggleCompleteList={handleToggleCompleteList}
        onOpenGroupDetail={(group) => setDetailGroup(group)}
      />

      {/* ========================================================================= */}
      {/* 2. SCOMPARTO 2: LISTA ATTIVA (Zero-Scroll Esterno, Scroll Interno Fluido)   */}
      {/* ========================================================================= */}
      <div className="flex-1 min-h-0 w-full bg-white border border-gray-200/90 rounded-2xl shadow-2xs p-2.5 flex flex-col justify-between overflow-hidden">
        
        {!activeListId || !activeList ? (
          /* Empty State Nessuna Lista */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <ShoppingIcon className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-gray-800">Nessuna lista selezionata</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-xs mb-4">
              Scegli una lista dal selettore in alto oppure creane subito una nuova.
            </p>
            <div className="flex flex-col gap-2 w-full max-w-xs">
              <button
                type="button"
                onClick={() => setIsPickerModalOpen(true)}
                className="w-full py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-blue-700 active:scale-95 transition-all cursor-pointer"
              >
                📋 Scegli o Crea Lista
              </button>
              <button
                type="button"
                onClick={() => quickPriceModal.open(null)}
                className="w-full py-2 bg-gray-100 text-gray-700 font-semibold text-xs rounded-xl hover:bg-gray-200 active:scale-95 transition-all cursor-pointer"
              >
                🏷️ Registra Prezzo Rapido a Catalogo
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* MINI QUICK ADD BAR (Fissa in alto, thumb-friendly con nome, qtà e unità) */}
            {canCreateItem && (
              <form
                onSubmit={columnLogic.handleQuickAdd}
                className="shrink-0 flex items-center gap-1.5 pb-2 border-b border-gray-100"
              >
                {/* 1. Nome Prodotto */}
                <div className="relative flex-1 min-w-0">
                  <input
                    type="text"
                    value={columnLogic.quickName}
                    onChange={(e) => columnLogic.setQuickName(e.target.value)}
                    placeholder="Aggiungi prodotto alla lista..."
                    className="w-full px-3 py-2 bg-gray-100/90 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>

                {/* 2. Input Quantità compatto */}
                <input
                  type="text"
                  value={columnLogic.quickQuantity}
                  onChange={(e) => columnLogic.setQuickQuantity(e.target.value)}
                  placeholder="Q.tà"
                  className="w-12 px-1.5 py-2 bg-gray-100/90 border border-gray-200 rounded-xl text-xs font-medium text-center text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shrink-0"
                />

                {/* 3. Selettore Unità di Misura con modale centrata */}
                <div className="shrink-0">
                  <ShoppingUnitSelect
                    value={columnLogic.quickUnitId}
                    onChange={columnLogic.setQuickUnitId}
                    unitOptions={unitOptions}
                    compact={true}
                    asModal={true}
                  />
                </div>

                {/* 4. Tasto Invia (+) */}
                <button
                  type="submit"
                  disabled={!columnLogic.quickName.trim() || columnLogic.quickAdding}
                  className="p-2 rounded-xl bg-blue-600 text-white disabled:opacity-40 disabled:pointer-events-none hover:bg-blue-700 active:scale-95 transition-all shrink-0 cursor-pointer shadow-2xs"
                  title="Aggiungi alla lista"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* AREA ARTICOLI CON SCROLL INTERNO FLUIDO */}
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pt-2 space-y-2">
              
              {/* Stato Vuoto se 0 articoli totali */}
              {openItems.length === 0 && purchasedItems.length === 0 && (
                <div className="py-8 px-4 bg-gray-50/70 border border-dashed border-gray-200 rounded-2xl text-center my-2">
                  <p className="text-xs font-semibold text-gray-600">
                    Nessun articolo nella lista! 🎉
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Usa la barra sopra per aggiungere prodotti alla spesa.
                  </p>
                </div>
              )}

              {/* 🛒 PRODOTTI DA COMPRARE (Senza etichetta iniziale) */}
              {openItems.length > 0 && (
                <div className="space-y-1.5">
                  {openItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 bg-white border border-gray-200 rounded-xl hover:border-blue-300 transition-colors shadow-2xs flex items-center gap-2.5 group"
                    >
                      {/* Checkbox touch-friendly: al tocco apre PurchaseModal */}
                      <button
                        type="button"
                        onClick={() => columnLogic.handleTogglePurchased(item)}
                        className="w-7 h-7 rounded-lg border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 active:scale-90 flex items-center justify-center shrink-0 transition-all cursor-pointer"
                        title="Segna come acquistato e registra spesa"
                        aria-label={`Acquista ${item.productName}`}
                      >
                        <span className="opacity-0 group-hover:opacity-30 text-blue-600 text-xs">✓</span>
                      </button>

                      {/* Corpo dell'item: al tocco apre DetailModal */}
                      <div
                        onClick={() => columnLogic.detailModal.open(item)}
                        className="flex-1 min-w-0 cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-gray-900 truncate">
                            {item.productName}
                          </h4>
                          {item.quantity != null && (
                            <span className="text-xs font-extrabold text-blue-600 shrink-0">
                              {item.quantity} {item.unitCodeName || ''}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-0.5 truncate">
                          {item.brandName && (
                            <span className="text-gray-600 font-medium">
                              {item.brandName}
                            </span>
                          )}
                          {item.notes && (
                            <span className="italic text-gray-400 truncate">
                              • {item.notes}
                            </span>
                          )}
                          {item.lastPrice != null && (
                            <span className="text-emerald-600 font-semibold ml-auto shrink-0">
                              ~{item.lastPrice.toFixed(2)} €
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ✅ PRODOTTI ACQUISTATI (Slittano alla fine, separati da una linea) */}
              {purchasedItems.length > 0 && (
                <>
                  {/* Linea di separazione tra aperti e acquistati */}
                  <div className="pt-2 pb-1 flex items-center gap-2">
                    <div className="h-px bg-gray-200 flex-1" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Acquistati
                    </span>
                    <div className="h-px bg-gray-200 flex-1" />
                  </div>

                  <div className="space-y-1.5">
                    {purchasedItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 bg-gray-50/90 border border-gray-200/80 rounded-xl transition-colors shadow-2xs flex items-center gap-2.5 opacity-80"
                      >
                        {/* Checkbox verde spuntata: al tocco chiede conferma per annullare */}
                        <button
                          type="button"
                          onClick={() => columnLogic.handleTogglePurchased(item)}
                          className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 active:scale-90 transition-all cursor-pointer shadow-2xs"
                          title="Annulla acquisto"
                          aria-label={`Annulla acquisto ${item.productName}`}
                        >
                          <span className="text-xs font-bold">✓</span>
                        </button>

                        {/* Corpo dell'item completato: al tocco apre il modale dettaglio acquisto */}
                        <div
                          onClick={() => columnLogic.purchasedDetailModal.open(item)}
                          className="flex-1 min-w-0 cursor-pointer"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="text-xs font-bold text-gray-500 line-through truncate">
                              {item.productName}
                            </h4>
                            {item.lastPrice != null && (
                              <span className="text-xs font-extrabold text-emerald-700 shrink-0">
                                {item.lastPrice.toFixed(2)} €
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-0.5 truncate">
                            {item.quantity != null && (
                              <span>
                                Q.tà: {item.quantity} {item.unitCodeName || ''}
                              </span>
                            )}
                            {item.lastSupplierName && (
                              <span>• {item.lastSupplierName}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

            </div>
          </>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. MODALE FULL-SCREEN SELETTORE GRUPPO & LISTA                              */}
      {/* ========================================================================= */}
      <MobileShoppingListPickerModal
        isOpen={isPickerModalOpen}
        onClose={() => setIsPickerModalOpen(false)}
        lists={lists}
        groups={groups}
        activeListId={activeListId}
        onSelectList={(id) => setActiveListId(id)}
        onOpenGroupDetail={(group) => setDetailGroup(group)}
        onOpenListDetail={(list) => handleOpenEditList(list)}
      />

      {/* ========================================================================= */}
      {/* 4. MODALI COMPLETE DI GESTIONE & AZIONE                                    */}
      {/* ========================================================================= */}
      
      {/* Modale Ricerca Globale Rapida (Omni-Search) */}
      <MobileShoppingOmniSearch
        isOpen={isOmniSearchOpen}
        onClose={() => setIsOmniSearchOpen(false)}
        groups={groups}
        lists={lists}
        products={products}
        currentItems={items}
        activeListId={activeListId}
        onSelectList={(id) => setActiveListId(id)}
        onOpenGroupDetail={(group) => setDetailGroup(group)}
        onQuickAddProduct={async (prodName) => {
          let targetListId = activeListId;
          if (!targetListId && lists.length > 0) {
            const defaultList = lists.find((l) => l.isDefault) || lists[0];
            targetListId = defaultList.id;
            setActiveListId(defaultList.id);
          }
          if (!targetListId) return;
          await mutations.createItem({
            shoppingListId: targetListId,
            productName: prodName,
          });
        }}
        onOpenQuickPrice={() => quickPriceModal.open(null)}
      />

      {/* Modale Aggiunta Rapida Prezzi a Catalogo */}
      <MobileShoppingQuickPriceModal
        isOpen={quickPriceModal.isOpen}
        onClose={quickPriceModal.close}
        products={products}
        brands={brands}
        suppliers={suppliers}
        unitOptions={unitOptions}
      />

      {/* Modali Articoli Spesa (Purchase, Detail, PurchasedDetail, PurchasedEdit, Create, Edit, Price History) */}
      <MobileShoppingItemsColumnModals
        detailModal={columnLogic.detailModal}
        purchasedDetailModal={columnLogic.purchasedDetailModal}
        purchasedEditModal={columnLogic.purchasedEditModal}
        editModal={columnLogic.editModal}
        purchaseModal={columnLogic.purchaseModal}
        isCreateOpen={columnLogic.isCreateOpen}
        historyModalItem={columnLogic.historyModalItem}
        itemForm={columnLogic.itemForm}
        setItemForm={columnLogic.setItemForm}
        editForm={columnLogic.editForm}
        setEditForm={columnLogic.setEditForm}
        purchaseForm={columnLogic.purchaseForm}
        setPurchaseForm={columnLogic.setPurchaseForm}
        activeListId={activeListId}
        lists={lists}
        unitOptions={unitOptions}
        products={products}
        brands={brands}
        suppliers={suppliers}
        currencyOptions={currencyOptions}
        offerFlagOptions={offerFlagOptions}
        handleCloseCreate={columnLogic.handleCloseCreate}
        handleCreate={columnLogic.handleCreate}
        handleCloseEdit={columnLogic.handleCloseEdit}
        handleEdit={columnLogic.handleEdit}
        handleClosePurchase={columnLogic.handleClosePurchase}
        handlePurchase={columnLogic.handlePurchase}
        handleOpenEdit={columnLogic.handleOpenEdit}
        handlePurchasedEdit={columnLogic.handlePurchasedEdit}
        handleDelete={columnLogic.handleDelete}
        setHistoryModalItem={columnLogic.setHistoryModalItem}
        canEditItem={canEditItem}
        canEditPurchasedItem={canEditPurchasedItem}
        canDeleteItem={canDeleteItem}
      />

      {/* Modale Creazione / Modifica Lista */}
      {editListModal.isOpen && editListModal.data && (
        <MobileShoppingListModal
          title={editListModal.data.id === 0 ? 'Nuova Lista Spesa' : 'Modifica Lista Spesa'}
          form={listEditForm}
          setForm={setListEditForm}
          groups={groups}
          isDefault={Boolean(editListModal.data.isDefault)}
          onClose={editListModal.close}
          onSubmit={handleSaveEditList}
          submitLabel={editListModal.data.id === 0 ? 'Crea Lista' : 'Salva Modifiche'}
          zIndexClass="z-[10010]"
        />
      )}

      {/* Modale Creazione Gruppo */}
      <MobileShoppingGroupCreateModal
        isOpen={isGroupCreateOpen}
        onClose={() => setIsGroupCreateOpen(false)}
        onSubmit={handleCreateGroup}
      />

      {/* Modale Modifica Gruppo */}
      {editingGroup && (
        <MobileShoppingGroupCreateModal
          isOpen={Boolean(editingGroup)}
          onClose={() => setEditingGroup(null)}
          onSubmit={async (data) => {
            await handleUpdateGroup(data);
            setDetailGroup((prev) => (prev ? { ...prev, ...data } : null));
          }}
          initialData={editingGroup}
          title="Modifica Gruppo Spesa"
          submitLabel="Salva Modifiche"
          zIndexClass="z-[10010]"
        />
      )}

      {/* Modale Dettaglio Gruppo & Membri */}
      {detailGroup && (
        <MobileShoppingGroupDetailModal
          isOpen={Boolean(detailGroup)}
          onClose={() => setDetailGroup(null)}
          group={detailGroup}
          lists={lists}
          onEditClick={(group) => setEditingGroup(group)}
          onDeleteClick={handleDeleteGroup}
          onArchiveClick={handleArchiveGroup}
          onUnarchiveClick={handleUnarchiveGroup}
          onOpenInvite={(group) => setActiveInviteGroup(group)}
          onSelectList={(listId) => {
            setActiveListId(listId);
            setDetailGroup(null);
          }}
          onCreateListInGroup={(groupId) => handleOpenCreateGroupList(groupId)}
          currentUserRole={detailGroup.userRole || undefined}
          refreshKey={groupMembersRefreshKey}
        />
      )}

      {/* Modale Aggiunta Collaboratori */}
      {activeInviteGroup && (
        <MobileShoppingGroupInviteModal
          isOpen={Boolean(activeInviteGroup)}
          groupName={activeInviteGroup.name}
          currentUserRole={activeInviteGroup.userRole || undefined}
          onClose={() => setActiveInviteGroup(null)}
          onSubmit={handleInviteMembers}
          zIndexClass="z-[10010]"
        />
      )}

    </div>
  );
};

export default MobileShoppingView;
