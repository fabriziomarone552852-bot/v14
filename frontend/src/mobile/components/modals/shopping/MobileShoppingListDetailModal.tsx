// src/mobile/components/modals/shopping/MobileShoppingListDetailModal.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileBaseModal from '../MobileBaseModal';
import {
  ShoppingIcon,
  CheckCircleIcon,
  ArchiveIcon,
  UsersIcon,
  LockIcon,
  ExternalLinkIcon,
  SearchIcon,
} from '@/components/shared/utils/Icons';
import type { ShoppingListSummary, ShoppingListItem } from '@/types/shopping';
import { useShoppingData } from '@/hooks/shopping/useShoppingData';
import { useShoppingMutations } from '@/hooks/shopping/useShoppingMutations';
import { useConfirm } from '@/context/ConfirmContext';
import { useModal } from '@/hooks/useModals';
import { getLocalTodayStr } from '@/utils/dateUtils';
import { MobileShoppingPurchaseModal } from './MobileShoppingPurchaseModal';
import {
  emptyPurchaseForm,
  getEurCurrencyId,
  type PurchaseFormState,
} from '@/components/shared/shopping/shoppingItems.utils';

interface MobileShoppingListDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  list: ShoppingListSummary | null;
  zIndexClass?: string;
}

type ItemFilterStatus = 'all' | 'open' | 'completed';

export const MobileShoppingListDetailModal: React.FC<MobileShoppingListDetailModalProps> = ({
  isOpen,
  onClose,
  list,
  zIndexClass = 'z-[10010]',
}) => {
  const navigate = useNavigate();
  const mutations = useShoppingMutations();
  const { confirm } = useConfirm();
  const { suppliers, config } = useShoppingData();

  const [filterStatus, setFilterStatus] = useState<ItemFilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Purchase Modal state
  const purchaseModal = useModal<ShoppingListItem>();
  const currencyOptions = config?.currencyOptions ?? [];
  const offerFlagOptions = config?.offerFlagOptions ?? [];
  const eurCurrencyId = getEurCurrencyId(currencyOptions);

  const [purchaseForm, setPurchaseForm] = useState<PurchaseFormState>(
    emptyPurchaseForm(eurCurrencyId)
  );

  if (!isOpen || !list) return null;

  const isGroup = Boolean(list.groupId || list.groupName);
  const items = list.items || [];

  const completedCount = items.filter((it) => it.isPurchased).length;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredItems = items.filter((it) => {
    if (filterStatus === 'open' && it.isPurchased) return false;
    if (filterStatus === 'completed' && !it.isPurchased) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = it.productName.toLowerCase().includes(q);
      const matchNote = it.note?.toLowerCase().includes(q) ?? false;
      if (!matchName && !matchNote) return false;
    }
    return true;
  });

  const handleOpenPurchase = (item: ShoppingListItem) => {
    setPurchaseForm({
      ...emptyPurchaseForm(eurCurrencyId, item.quantity != null ? String(item.quantity) : '1'),
      purchaseDate: getLocalTodayStr(),
    });
    purchaseModal.open(item);
  };

  const handleTogglePurchased = (item: ShoppingListItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.isPurchased) {
      confirm({
        title: 'Annulla Acquisto',
        message: `Vuoi segnare "${item.productName}" come non acquistato?`,
        confirmText: 'Conferma',
        onConfirm: async () => {
          await mutations.togglePurchased({
            id: item.id,
            listId: item.shoppingListId,
            data: { isPurchased: false },
          });
        },
      });
    } else {
      handleOpenPurchase(item);
    }
  };

  const handlePurchaseSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!purchaseModal.data || !list.id || !purchaseForm.price) return;

    const targetItem = purchaseModal.data;
    const boughtQuantity = Number(purchaseForm.quantity) || 1;
    const originalQuantity = targetItem.quantity != null ? targetItem.quantity : 1;

    try {
      await mutations.addInventoryBatch({
        itemId: targetItem.id,
        listId: list.id,
        data: {
          productId: targetItem.productId,
          supplierId: purchaseForm.supplierId ? Number(purchaseForm.supplierId) : undefined,
          purchaseDate: purchaseForm.purchaseDate,
          purchasePrice: Number(purchaseForm.price.replace(',', '.')),
          quantity: boughtQuantity,
          currencyId: purchaseForm.currencyId ? Number(purchaseForm.currencyId) : undefined,
          isOnSale: purchaseForm.isOnSale,
          offerFlagId: purchaseForm.isOnSale ? (Number(purchaseForm.offerFlagId) || 1) : undefined,
        },
      });

      if (boughtQuantity < originalQuantity) {
        const remainingQuantity = originalQuantity - boughtQuantity;
        await mutations.updateItem({
          id: targetItem.id,
          listId: list.id,
          data: { quantity: remainingQuantity },
        });
      } else {
        await mutations.togglePurchased({
          id: targetItem.id,
          listId: list.id,
          data: { isPurchased: true },
        });
      }

      purchaseModal.close();
    } catch {
      // Error handled by mutation toast
    }
  };

  const handleOpenShoppingPage = () => {
    onClose();
    navigate(`/shopping?listId=${list.id}`);
  };

  const headerActions = (
    <button
      type="button"
      onClick={handleOpenShoppingPage}
      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 rounded-xl transition cursor-pointer"
      title="Apri nella Spesa"
    >
      <ExternalLinkIcon className="w-3.5 h-3.5" />
      <span>Apri</span>
    </button>
  );

  return (
    <>
      <MobileBaseModal
        isOpen={isOpen}
        onClose={onClose}
        zIndexClass={zIndexClass}
        title={
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-lg border flex items-center justify-center text-xs shrink-0 ${
                isGroup
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-blue-50 border-blue-200 text-blue-700'
              }`}
            >
              <ShoppingIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-sm font-bold text-gray-900 truncate block">{list.name}</span>
            </div>
          </div>
        }
        headerActions={headerActions}
      >
        <div className="space-y-3.5 text-xs max-w-lg mx-auto pb-6">
          {/* Badge Gruppo / Privata & Stato */}
          <div className="flex items-center gap-2 flex-wrap">
            {isGroup ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-md">
                <UsersIcon className="w-3 h-3" />
                <span>{list.groupName || 'Gruppo Condiviso'}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-md">
                <LockIcon className="w-3 h-3 text-slate-400" />
                <span>Lista Personale</span>
              </span>
            )}

            {list.isCompleted ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
                <ArchiveIcon className="w-3 h-3" />
                <span>Completata</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
                <CheckCircleIcon className="w-3 h-3" />
                <span>Attiva</span>
              </span>
            )}
          </div>

          {/* Descrizione lista se presente */}
          {list.description && (
            <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              {list.description}
            </p>
          )}

          {/* Barra di avanzamento */}
          <div className="space-y-1 bg-white border border-gray-200 rounded-xl p-3 shadow-2xs">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <span>Avanzamento Spesa ({completedCount} / {totalCount})</span>
              <span className="font-extrabold text-slate-800">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
              <div
                className={`h-full transition-all duration-300 ${
                  progressPercent === 100 ? 'bg-emerald-500' : 'bg-blue-600'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Toolbar con Ricerca e Switcher Stato */}
          <div className="space-y-2">
            <div className="flex rounded-xl bg-slate-100 p-1 text-xs w-full">
              <button
                type="button"
                onClick={() => setFilterStatus('all')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition cursor-pointer text-center text-xs ${
                  filterStatus === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Tutti ({items.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('open')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition cursor-pointer text-center text-xs ${
                  filterStatus === 'open'
                    ? 'bg-white text-blue-700 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Da fare ({items.filter((it) => !it.isPurchased).length})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('completed')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition cursor-pointer text-center text-xs ${
                  filterStatus === 'completed'
                    ? 'bg-white text-emerald-700 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Presi ({items.filter((it) => it.isPurchased).length})
              </button>
            </div>

            <div className="relative w-full">
              <SearchIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cerca articoli nella lista..."
                className="w-full pl-8 pr-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Elenco Articoli Spesa */}
          <div className="space-y-1.5">
            {filteredItems.length === 0 ? (
              <div className="py-10 text-center text-slate-400 bg-white border border-gray-200 rounded-xl">
                <ShoppingIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs font-semibold">Nessun articolo trovato in questa lista.</p>
              </div>
            ) : (
              filteredItems.map((item) => {
                const qtyDisplay = item.quantity != null ? `${item.quantity}` : '';
                const unitDisplay = item.unitName || item.unitCode || '';
                const amountStr = [qtyDisplay, unitDisplay].filter(Boolean).join(' ');

                return (
                  <div
                    key={item.id}
                    onClick={(e) => handleTogglePurchased(item, e)}
                    className={`flex items-center justify-between gap-2.5 p-3 rounded-xl border transition cursor-pointer active:scale-[0.99] select-none ${
                      item.isPurchased
                        ? 'bg-slate-50/80 border-slate-200/80 text-slate-400'
                        : 'bg-white border-slate-200 hover:border-blue-300 text-slate-800 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        type="button"
                        onClick={(e) => handleTogglePurchased(item, e)}
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center transition cursor-pointer shrink-0 ${
                          item.isPurchased
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'bg-white border-slate-300 hover:border-blue-500'
                        }`}
                      >
                        {item.isPurchased && <CheckCircleIcon className="w-3.5 h-3.5" />}
                      </button>

                      <div className="min-w-0">
                        <p
                          className={`font-bold truncate text-xs ${
                            item.isPurchased ? 'line-through text-slate-400' : 'text-slate-900'
                          }`}
                        >
                          {item.productName}
                        </p>
                        {item.note && (
                          <p className="text-[11px] text-slate-400 truncate max-w-[200px] mt-0.5">
                            {item.note}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {amountStr && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {amountStr}
                        </span>
                      )}

                      {item.estimatedPrice != null && item.estimatedPrice > 0 && (
                        <span className="text-xs font-bold text-slate-700">
                          €{item.estimatedPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </MobileBaseModal>

      {/* Modale Mobile Registrazione Acquisto */}
      {purchaseModal.isOpen && purchaseModal.data && (
        <MobileShoppingPurchaseModal
          open={true}
          itemName={purchaseModal.data.productName}
          itemTotalQuantity={purchaseModal.data.quantity}
          unitCodeName={purchaseModal.data.unitCodeName || purchaseModal.data.unitCode || undefined}
          purchaseForm={purchaseForm}
          setPurchaseForm={setPurchaseForm}
          suppliers={suppliers}
          currencyOptions={currencyOptions}
          offerFlagOptions={offerFlagOptions}
          onClose={purchaseModal.close}
          onSubmit={handlePurchaseSubmit}
          zIndexClass="z-[10020]"
        />
      )}
    </>
  );
};

export default MobileShoppingListDetailModal;
