// src/mobile/components/MobileSelectionHeader.tsx
import React from 'react';
import {
  CloseIcon,
  TrashIcon,
  CheckboxCheckedIcon,
  CheckboxEmptyIcon,
  ArchiveIcon,
} from '@/components/shared/utils/Icons';

export interface MobileSelectionHeaderProps {
  selectedCount: number;
  isAllSelected: boolean;
  onClearSelection: () => void;
  onToggleSelectAll: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
  className?: string;
  isInsideModal?: boolean;
}

export const MobileSelectionHeader: React.FC<MobileSelectionHeaderProps> = ({
  selectedCount,
  isAllSelected,
  onClearSelection,
  onToggleSelectAll,
  onDelete,
  onArchive,
  className = '',
  isInsideModal = false,
}) => {
  return (
    <div
      className={`w-full flex items-center justify-between gap-2 animate-fadeIn select-none ${
        isInsideModal
          ? 'pb-2 border-b border-blue-200'
          : 'h-14 px-3 max-w-lg mx-auto'
      } ${className}`}
    >
      {/* 1. SINISTRA: Tasto X per chiudere la selezione & Contatore */}
      <div className="flex items-center gap-2.5 shrink-0 z-10">
        <button
          type="button"
          onClick={onClearSelection}
          className="w-9 h-9 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-100 active:scale-95 transition-all focus:outline-none cursor-pointer flex items-center justify-center"
          aria-label="Annulla selezione"
          title="Annulla selezione"
        >
          <CloseIcon className="w-5 h-5 text-gray-800" />
        </button>

        <div className="flex items-center gap-1.5">
          <span className="text-sm font-black text-gray-900 tracking-tight">
            {selectedCount} selezionat{selectedCount === 1 ? 'o' : 'i'}
          </span>
        </div>
      </div>

      {/* 2. DESTRA: Azioni contestuali (Archivia, Seleziona Tutto, Elimina) */}
      <div className="flex items-center gap-1 shrink-0 z-10">
        {/* Tasto Archiviazione (Solo se fornito onArchive, es. per Gruppi & Liste) */}
        {onArchive && (
          <button
            type="button"
            onClick={onArchive}
            className="w-9 h-9 rounded-xl text-gray-700 hover:text-blue-600 hover:bg-blue-50 active:scale-95 transition-all focus:outline-none cursor-pointer flex items-center justify-center"
            title="Archivia elementi selezionati"
            aria-label="Archivia"
          >
            <ArchiveIcon className="w-5 h-5 text-gray-800" />
          </button>
        )}

        {/* Tasto Quadratino con Check / Vuoto (Seleziona tutto / Deseleziona tutto) */}
        <button
          type="button"
          onClick={onToggleSelectAll}
          className={`w-9 h-9 rounded-xl hover:bg-blue-50 active:scale-95 transition-all focus:outline-none cursor-pointer flex items-center justify-center ${
            isAllSelected ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600'
          }`}
          title={isAllSelected ? 'Deseleziona tutti' : 'Seleziona tutti'}
          aria-label={isAllSelected ? 'Deseleziona tutti' : 'Seleziona tutti'}
        >
          {isAllSelected ? (
            <CheckboxEmptyIcon className="w-5 h-5" />
          ) : (
            <CheckboxCheckedIcon className="w-5 h-5" />
          )}
        </button>

        {/* Tasto Cestino per Eliminare (sulla stessa linea e posizione del tasto "+") */}
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="w-9 h-9 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 active:scale-95 transition-all focus:outline-none cursor-pointer flex items-center justify-center"
            title="Elimina elementi selezionati"
            aria-label="Elimina selezionati"
          >
            <TrashIcon className="w-5 h-5 text-red-600" />
          </button>
        )}
      </div>
    </div>
  );
};

export default MobileSelectionHeader;
