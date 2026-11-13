// src/components/shared/form/SelectModalDialog.tsx
import React from 'react';
import { createPortal } from 'react-dom';
import { CloseIcon } from '@/components/shared/utils/Icons';
import { useFadeScrollbar } from '@/hooks/ui/useFadeScrollbar';

export interface SelectModalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  maxWidthClass?: string;
  zIndex?: number;
  hideScrollbar?: boolean;
  headerAction?: React.ReactNode;
  footerSlot?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Modale a tutto schermo centrato per selezioni da mobile o quando asModal è true.
 * Unifica il comportamento di selezione a finestra tra diversi selettori (DRY)
 * con scrollbar a scomparsa automatica (invisibile a riposo, visibile solo durante lo scorrimento).
 */
export const SelectModalDialog: React.FC<SelectModalDialogProps> = ({
  isOpen,
  onClose,
  title,
  maxWidthClass = 'max-w-sm',
  zIndex = 10030,
  hideScrollbar = false,
  headerAction,
  footerSlot,
  children,
}) => {
  const { handleScroll, scrollbarClass } = useFadeScrollbar();

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
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide truncate">
              {title}
            </h3>
            {headerAction && <div className="shrink-0 flex items-center">{headerAction}</div>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer shrink-0"
            title="Chiudi"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo Elenco Selezionabile con scrollbar a scomparsa */}
        <div
          onScroll={handleScroll}
          className={`flex-1 min-h-0 overflow-y-auto space-y-1.5 ${
            hideScrollbar ? 'no-scrollbar pr-0' : `${scrollbarClass} pr-0.5`
          }`}
        >
          {children}
        </div>

        {/* Slot Opzionale Footer (es. Pulsanti Azzera e Conferma) */}
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
