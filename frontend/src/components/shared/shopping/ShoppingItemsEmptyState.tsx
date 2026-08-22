// src/components/shared/shopping/ShoppingItemsEmptyState.tsx
import React from 'react';
import { ShoppingIcon } from '@/components/shared/utils/Icons';

export const ShoppingItemsEmptyState: React.FC = () => {
  return (
    <div className="flex h-full min-h-0 flex-col items-center justify-center text-center p-8 text-gray-400">
      <div className="w-16 h-16 rounded-3xl bg-gray-100 flex items-center justify-center mb-4 text-gray-400">
        <ShoppingIcon className="w-8 h-8" />
      </div>
      <h3 className="text-base font-bold text-gray-700">Nessuna lista selezionata</h3>
      <p className="text-xs text-gray-400 max-w-sm mt-1">
        Seleziona una lista della spesa dalla colonna a sinistra per visualizzarne i dettagli, le statistiche e gestire i prodotti.
      </p>
    </div>
  );
};
