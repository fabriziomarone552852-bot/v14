// src/mobile/components/modals/event/MobileEventRecurringDeleteView.tsx
import React from 'react';
import { TrashIcon } from '@/components/shared/utils/Icons';

export interface MobileEventRecurringDeleteViewProps {
  onConfirm: (type: 'single' | 'future' | 'all') => void;
  onCancel: () => void;
}

export const MobileEventRecurringDeleteView: React.FC<MobileEventRecurringDeleteViewProps> = ({
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-4 text-center animate-in fade-in duration-200">
      <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <TrashIcon className="w-7 h-7 text-red-600" />
      </div>
      <h3 className="text-lg font-extrabold text-gray-900 mb-1.5">Elimina Evento Ricorrente</h3>
      <p className="text-xs text-gray-500 mb-6 px-2">
        Questo evento si ripete nel tempo. Quali occorrenze desideri rimuovere dal calendario?
      </p>

      <div className="flex flex-col gap-2.5 w-full">
        <button
          type="button"
          onClick={() => onConfirm('single')}
          className="w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-800 font-bold rounded-xl transition-all text-xs sm:text-sm cursor-pointer"
        >
          Elimina solo questo evento
        </button>
        <button
          type="button"
          onClick={() => onConfirm('future')}
          className="w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-800 font-bold rounded-xl transition-all text-xs sm:text-sm cursor-pointer"
        >
          Elimina questo e i successivi
        </button>
        <button
          type="button"
          onClick={() => onConfirm('all')}
          className="w-full py-3 px-4 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold rounded-xl transition-all text-xs sm:text-sm cursor-pointer"
        >
          Elimina tutte le ripetizioni
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="w-full py-2.5 px-4 mt-1 text-gray-500 hover:text-gray-800 font-bold rounded-xl transition-all text-xs cursor-pointer"
        >
          Annulla operazione
        </button>
      </div>
    </div>
  );
};
