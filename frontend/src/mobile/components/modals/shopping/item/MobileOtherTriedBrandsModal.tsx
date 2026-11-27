// src/mobile/components/modals/shopping/item/MobileOtherTriedBrandsModal.tsx
import React from 'react';
import { createPortal } from 'react-dom';
import { CloseIcon, StoreIcon, TagIcon } from '@/components/shared/utils/Icons';
import type { TriedBrandEntry } from '@/components/shared/shopping/ShoppingItemBrandSidePanel';
import { parseBrandPreference } from '@/utils/shoppingBrandPreference';
import { useBackHandler } from '@/utils/backButtonManager';

export interface MobileOtherTriedBrandsModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  title?: string;
  brands: TriedBrandEntry[];
  onSelectBrand: (entry: TriedBrandEntry) => void;
}

export const MobileOtherTriedBrandsModal: React.FC<MobileOtherTriedBrandsModalProps> = ({
  isOpen,
  onClose,
  productName,
  title = 'Altri marchi già provati',
  brands,
  onSelectBrand,
}) => {
  useBackHandler(isOpen, onClose, 20);

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[10030] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn pointer-events-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col max-h-[80vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modale */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/70 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
              <TagIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-gray-900 truncate">
                {title}
              </h3>
              {productName.trim() && (
                <p className="text-[11px] text-gray-500 truncate capitalize">
                  {productName.trim()}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Chiudi"
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition cursor-pointer shrink-0"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Elenco Verticale Marchi Già Provati */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3.5 space-y-2.5">
          {brands.length === 0 ? (
            <p className="py-6 text-center text-xs text-gray-400">
              Nessun altro marchio già provato per questo prodotto.
            </p>
          ) : (
            brands.map((entry) => {
              const pref = parseBrandPreference(entry.notes);
              const isPos = pref?.sentiment === 'positive';
              const isNeg = pref?.sentiment === 'negative';
              const displayComment = pref?.comment || '';

              const rowColorClass = isNeg
                ? 'bg-rose-50/70 border-rose-200 active:bg-rose-100/80'
                : isPos
                ? 'bg-emerald-50/70 border-emerald-200 active:bg-emerald-100/80'
                : 'bg-gray-50/80 border-gray-200 active:bg-blue-50/60';

              return (
                <button
                  key={entry.key}
                  type="button"
                  onClick={() => {
                    onSelectBrand(entry);
                    onClose();
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer space-y-1.5 ${rowColorClass}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-sm text-gray-900 capitalize truncate block">
                        {entry.brandName}
                      </span>
                      {entry.lastSupplierName && (
                        <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5 truncate">
                          <StoreIcon className="w-3 h-3 text-orange-500 shrink-0" />
                          <span className="truncate">{entry.lastSupplierName}</span>
                        </div>
                      )}
                    </div>

                    {isNeg ? (
                      <span
                        title="Da evitare"
                        className="shrink-0 w-7 h-7 rounded-lg text-sm bg-rose-100 border border-rose-200 flex items-center justify-center"
                      >
                        👎
                      </span>
                    ) : isPos ? (
                      <span
                        title="Gradito"
                        className="shrink-0 w-7 h-7 rounded-lg text-sm bg-emerald-100 border border-emerald-200 flex items-center justify-center"
                      >
                        👍
                      </span>
                    ) : (
                      <span className="shrink-0 px-2 py-0.5 rounded-lg text-[11px] font-medium bg-white text-gray-500 border border-gray-200">
                        Già provato
                      </span>
                    )}
                  </div>

                  {displayComment && (
                    <p
                      className={`text-xs italic leading-snug ${
                        isNeg
                          ? 'text-rose-700 font-medium'
                          : isPos
                          ? 'text-emerald-800 font-medium'
                          : 'text-gray-600'
                      }`}
                    >
                      «{displayComment}»
                    </p>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default MobileOtherTriedBrandsModal;
