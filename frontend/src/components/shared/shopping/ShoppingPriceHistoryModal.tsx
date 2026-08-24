// src/components/shared/shopping/ShoppingPriceHistoryModal.tsx
import React, { useEffect, useState } from 'react';
import { fetchItemPriceHistory } from '@/api/analyticsApi';
import type { ItemPriceHistoryPoint } from '@/types/shopping';
import { shoppingButtonSecondaryClass } from './shoppingUi';
import { extractErrorMessage } from '@/utils/errorUtils';

interface ShoppingPriceHistoryModalProps {
  isOpen: boolean;
  itemId: number | null;
  productName: string;
  onClose: () => void;
}

const ShoppingPriceHistoryModal: React.FC<ShoppingPriceHistoryModalProps> = ({
  isOpen,
  itemId,
  productName,
  onClose,
}) => {
  const [history, setHistory] = useState<ItemPriceHistoryPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && itemId) {
      setIsLoading(true);
      setError(null);
      fetchItemPriceHistory(itemId)
        .then((data) => setHistory(data))
        .catch((err: unknown) => {
          setError(extractErrorMessage(err, 'Impossibile caricare lo storico prezzi.'));
        })
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, itemId]);

  if (!isOpen || !itemId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl transition-all max-h-[85vh] flex flex-col">
        <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-gray-800">📊 Storico Acquisti e Prezzi</h3>
            <p className="text-xs text-gray-500">Prodotto: <span className="font-semibold text-blue-600">{productName}</span></p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {error ? (
          <div className="mb-4 shrink-0 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600">
            {error}
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[220px]">
          {isLoading ? (
            <div className="py-10 text-center text-xs text-gray-400">Caricamento dello storico in corso...</div>
          ) : history.length === 0 ? (
            <div className="py-10 text-center text-xs text-gray-400">
              Nessuno storico acquisti ancora registrato per questo prodotto.
            </div>
          ) : (
            <div className="divide-y divide-gray-100 rounded-xl border border-gray-100 bg-gray-50/50">
              {history.map((point) => (
                <div key={point.id} className="flex items-center justify-between p-3 text-xs">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {point.supplierName || 'Fornitore non specificato'}
                    </p>
                    <p className="text-[11px] text-gray-500">{point.purchaseDate}</p>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1.5 justify-end">
                      <span className="text-sm font-extrabold text-blue-700">
                        € {point.purchasePrice.toFixed(2)}
                      </span>
                      {point.isOnSale ? (
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">
                          Offerta
                        </span>
                      ) : null}
                    </div>
                    {point.quantityPurchased ? (
                      <p className="text-[10px] text-gray-400">Qtà: {point.quantityPurchased}</p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 shrink-0 border-t border-gray-100 pt-3 flex justify-end">
          <button type="button" onClick={onClose} className={shoppingButtonSecondaryClass}>
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShoppingPriceHistoryModal;
