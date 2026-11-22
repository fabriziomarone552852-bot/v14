import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CloseIcon, CopyIcon } from '@/components/shared/utils/Icons';
import { useBackHandler } from '@/utils/backButtonManager';

export interface TaskCopySubtasksModalProps {
  isOpen: boolean;
  subtaskCount: number;
  onCopyWithSubtasks: () => void;
  onCopySingleOnly: () => void;
  onClose: () => void;
}

/**
 * Modale centrato (standard Mobile UI e riutilizzabile su Desktop) che chiede
 * se duplicare anche l'albero delle sottotask sottostanti alla task selezionata.
 */
export const TaskCopySubtasksModal: React.FC<TaskCopySubtasksModalProps> = ({
  isOpen,
  subtaskCount,
  onCopyWithSubtasks,
  onCopySingleOnly,
  onClose,
}) => {
  useBackHandler(isOpen, onClose, 15);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const subtaskLabel =
    subtaskCount === 1 ? '1 sottotask collegata' : `${subtaskCount} sottotask collegate`;

  return createPortal(
    <div
      className="fixed inset-0 z-[10050] bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn pointer-events-auto"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-sm overflow-hidden animate-fadeIn pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con titolo e pulsante X */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <CopyIcon className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-gray-900 truncate">
              Copia Task
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Chiudi"
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer shrink-0"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo */}
        <div className="p-5 space-y-4">
          <p className="text-sm text-gray-600 leading-relaxed">
            La task che stai copiando ha{' '}
            <span className="font-bold text-blue-700">{subtaskLabel}</span> sotto di sé.
            Vuoi copiare anche l&apos;albero delle sottotask?
          </p>

          {/* Scelte verticali touch-friendly */}
          <div className="flex flex-col gap-2.5 pt-1">
            <button
              type="button"
              onClick={onCopyWithSubtasks}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-sm transition-all shadow-sm cursor-pointer"
            >
              Sì, copia con sottotask
            </button>
            <button
              type="button"
              onClick={onCopySingleOnly}
              className="w-full py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-[0.99] text-gray-800 font-bold text-sm transition-all cursor-pointer"
            >
              No, copia solo questa task
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TaskCopySubtasksModal;
