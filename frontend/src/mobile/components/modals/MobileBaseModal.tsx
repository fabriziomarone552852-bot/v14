// src/mobile/components/modals/MobileBaseModal.tsx
import React, { type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { CloseIcon, LoadingIcon } from '@/components/shared/utils/Icons';

interface MobileBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  headerActions?: ReactNode;
  hideDefaultClose?: boolean;

  onConfirm?: (e?: React.MouseEvent) => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  isConfirmDisabled?: boolean;
  formId?: string;

  isLoading?: boolean;
  zIndexClass?: string;
}

export const MobileBaseModal: React.FC<MobileBaseModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  headerActions,
  hideDefaultClose = false,
  onConfirm,
  onCancel,
  confirmText = 'Salva',
  cancelText = 'Annulla',
  isConfirmDisabled = false,
  formId,
  isLoading = false,
  zIndexClass = 'z-[9999]',
}) => {
  if (!isOpen) return null;

  const renderFooter = () => {
    if (footer) return footer;

    if (onConfirm || formId) {
      return (
        <div className="flex justify-end gap-3 w-full">
          <button
            type="button"
            onClick={onCancel || onClose}
            disabled={isLoading}
            className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 active:scale-[0.99] transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type={formId ? 'submit' : 'button'}
            form={formId}
            onClick={!formId ? onConfirm : undefined}
            disabled={isConfirmDisabled || isLoading}
            className="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {confirmText}
          </button>
        </div>
      );
    }
    return null;
  };

  const activeFooter = renderFooter();

  const modalContent = (
    <div className={`fixed inset-0 ${zIndexClass} bg-white flex flex-col h-[100dvh] w-full overflow-hidden pointer-events-auto animate-fadeIn`}>
      {/* 1. HEADER MODALE (Occupa l'intera barra superiore) */}
      <div className="px-4 py-3.5 border-b border-gray-200 flex justify-between items-center bg-gray-50/95 shrink-0 pt-[max(env(safe-area-inset-top,0px),14px)] select-none">
        <div className="text-base font-extrabold text-gray-900 uppercase tracking-wider truncate flex-1 min-w-0 pr-2">
          {title}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {headerActions}
          {headerActions && <div className="w-px h-5 bg-gray-300 mx-1" />}
          {!hideDefaultClose && (
            <button
              type="button"
              disabled={isLoading}
              onClick={onClose}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isLoading
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-500 hover:bg-gray-200 hover:text-red-500 active:scale-95'
              }`}
              aria-label="Chiudi"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. CORPO MODALE (Interamente scorrevole) */}
      <div className="p-4 flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        {children}
      </div>

      {/* 3. FOOTER MODALE (Fisso in basso) */}
      {activeFooter && (
        <div className="px-4 py-3.5 border-t border-gray-200 bg-gray-50/95 shrink-0 pb-[max(env(safe-area-inset-bottom,0px),14px)]">
          {activeFooter}
        </div>
      )}

      {/* Overlay di Caricamento */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[2px] animate-fadeIn">
          <div className="bg-white p-4 rounded-full shadow-xl mb-3 border border-gray-100">
            <LoadingIcon className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
          <span className="text-sm font-extrabold text-blue-900 tracking-widest uppercase drop-shadow-sm">
            Salvataggio...
          </span>
        </div>
      )}
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default MobileBaseModal;
