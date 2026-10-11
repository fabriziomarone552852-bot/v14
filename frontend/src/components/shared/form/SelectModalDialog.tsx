// src/components/shared/form/SelectModalDialog.tsx
import React from 'react';
import { createPortal } from 'react-dom';
import { CloseIcon } from '@/components/shared/utils/Icons';

export interface SelectModalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  maxWidthClass?: string;
  zIndex?: number;
  footerSlot?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Modale a tutto schermo centrato per selezioni da mobile o quando asModal è true.
 * Unifica il comportamento di selezione a finestra tra diversi selettori (DRY).
 */
export const SelectModalDialog: React.FC<SelectModalDialogProps> = ({
  isOpen,
  onClose,
  title,
  maxWidthClass = 'max-w-sm',
  zIndex = 10030,
  footerSlot,
  children,
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div
      style={{ zIndex }}
      className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn pointer-events-auto"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-3xl shadow-2xl w-full ${maxWidthClass} p-5 space-y-4 border border-gray-100 animate-scaleUp pointer-events-auto max-h-[85vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Finestra */}
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 shrink-0">
          <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            title="Chiudi"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo Elenco Selezionabile */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-1.5 pr-0.5">
          {children}
        </div>

        {/* Slot Opzionale Footer (es. Pulsante Crea Nuovo) */}
        {footerSlot && (
          <div className="pt-2 border-t border-gray-100 shrink-0">
            {footerSlot}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
