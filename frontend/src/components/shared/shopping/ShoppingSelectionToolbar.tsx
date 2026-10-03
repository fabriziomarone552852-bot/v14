import React, { useEffect, useRef } from 'react';
import {
  TrashIcon,
  CloseIcon,
  TaskListIcon,
  ForwardIcon,
} from '@/components/shared/utils/Icons';

export interface ShoppingSelectionToolbarProps {
  selectedCount: number;
  totalCount: number;
  isAllSelected: boolean;
  isListCompleted: boolean;
  onToggleSelectAll: () => void;
  onOpenMoveModal: () => void;
  onOpenCopyModal: () => void;
  onDeleteSelected: () => void;
  onExitSelection: () => void;
}

export const ShoppingSelectionToolbar: React.FC<ShoppingSelectionToolbarProps> = ({
  selectedCount,
  totalCount,
  isAllSelected,
  isListCompleted,
  onToggleSelectAll,
  onOpenMoveModal,
  onOpenCopyModal,
  onDeleteSelected,
  onExitSelection,
}) => {
  const masterCheckboxRef = useRef<HTMLInputElement>(null);

  const isIndeterminate = selectedCount > 0 && !isAllSelected;

  useEffect(() => {
    if (masterCheckboxRef.current) {
      masterCheckboxRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-blue-50/90 border border-blue-200 rounded-xl shadow-xs animate-fadeIn select-none">
      {/* 1. Master Checkbox + Conteggio */}
      <div className="flex items-center gap-2.5">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            ref={masterCheckboxRef}
            type="checkbox"
            checked={isAllSelected && totalCount > 0}
            onChange={onToggleSelectAll}
            className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
          />
          <span className="text-xs font-bold text-blue-950">
            {selectedCount === 0
              ? 'Seleziona tutti'
              : `${selectedCount} di ${totalCount} selezionati`}
          </span>
        </label>
      </div>

      {/* 2. Gruppo Azioni */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {!isListCompleted ? (
          <>
            {/* Sposta in... */}
            <button
              type="button"
              onClick={onOpenMoveModal}
              disabled={selectedCount === 0}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                selectedCount === 0
                  ? 'bg-gray-200/70 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-blue-700 border border-blue-300 hover:bg-blue-100/60 shadow-2xs cursor-pointer'
              }`}
              title="Sposta gli articoli selezionati in un'altra lista"
            >
              <ForwardIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>Sposta in...</span>
            </button>

            {/* Copia in... */}
            <button
              type="button"
              onClick={onOpenCopyModal}
              disabled={selectedCount === 0}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                selectedCount === 0
                  ? 'bg-gray-200/70 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-emerald-700 border border-emerald-300 hover:bg-emerald-100/60 shadow-2xs cursor-pointer'
              }`}
              title="Crea una copia degli articoli selezionati in un'altra lista"
            >
              <TaskListIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span>Copia in...</span>
            </button>

            {/* Elimina */}
            <button
              type="button"
              onClick={onDeleteSelected}
              disabled={selectedCount === 0}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                selectedCount === 0
                  ? 'bg-gray-200/70 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-rose-700 border border-rose-300 hover:bg-rose-100/60 shadow-2xs cursor-pointer'
              }`}
              title="Elimina gli articoli selezionati dalla lista"
            >
              <TrashIcon className="w-3.5 h-3.5 text-rose-600" />
              <span>Elimina ({selectedCount})</span>
            </button>
          </>
        ) : (
          <>
            {/* Solo Copia per lista completata */}
            <span className="text-[11px] font-semibold px-2 py-1 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
              🔒 Lista chiusa
            </span>

            <button
              type="button"
              onClick={onOpenCopyModal}
              disabled={selectedCount === 0}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                selectedCount === 0
                  ? 'bg-gray-200/70 text-gray-400 cursor-not-allowed'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs cursor-pointer'
              }`}
              title="Copia gli articoli selezionati in una lista spesa aperta"
            >
              <TaskListIcon className="w-3.5 h-3.5" />
              <span>Copia in lista aperta ({selectedCount})</span>
            </button>
          </>
        )}

        {/* Chiudi modalità selezione */}
        <button
          type="button"
          onClick={onExitSelection}
          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-blue-100/60 rounded-lg transition cursor-pointer ml-1"
          title="Esci dalla modalità selezione"
        >
          <CloseIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ShoppingSelectionToolbar;
