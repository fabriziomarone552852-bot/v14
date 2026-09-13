// src/mobile/components/shopping/MobileShoppingNoListEmptyState.tsx
import React from 'react';
import { ShoppingIcon } from '@/components/shared/utils/Icons';

export interface MobileShoppingNoListEmptyStateProps {
  onOpenPicker: () => void;
  onOpenQuickPrice: () => void;
}

export const MobileShoppingNoListEmptyState: React.FC<MobileShoppingNoListEmptyStateProps> = ({
  onOpenPicker,
  onOpenQuickPrice,
}) => {
  return (
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
          onClick={onOpenPicker}
          className="w-full py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-blue-700 active:scale-95 transition-all cursor-pointer"
        >
          📋 Scegli o Crea Lista
        </button>
        <button
          type="button"
          onClick={onOpenQuickPrice}
          className="w-full py-2 bg-gray-100 text-gray-700 font-semibold text-xs rounded-xl hover:bg-gray-200 active:scale-95 transition-all cursor-pointer"
        >
          🏷️ Registra Prezzo Rapido a Catalogo
        </button>
      </div>
    </div>
  );
};
