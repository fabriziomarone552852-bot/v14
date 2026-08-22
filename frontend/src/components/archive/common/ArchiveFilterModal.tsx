// src/components/archive/common/ArchiveFilterModal.tsx
import React, { type ReactNode } from 'react';
import BaseModal from '@/components/shared/dialog/BaseModal';
import { UndoIcon } from '@/components/shared/utils/Icons';

export interface ArchiveFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onReset: () => void;
  hasActiveFilters: boolean;
  children: ReactNode;
  maxWidthClass?: string;
  overflowVisible?: boolean;
}

export const ArchiveFilterModal: React.FC<ArchiveFilterModalProps> = ({
  isOpen,
  onClose,
  title,
  onReset,
  hasActiveFilters,
  children,
  maxWidthClass = 'max-w-md',
  overflowVisible = false,
}) => {
  if (!isOpen) return null;

  const modalFooter = (
    <div className="flex items-center justify-between gap-3 w-full">
      {hasActiveFilters ? (
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 py-2.5 px-3 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
        >
          <UndoIcon className="w-4 h-4" />
          <span>Reset filtri</span>
        </button>
      ) : (
        <div />
      )}

      <button
        type="button"
        onClick={onClose}
        className="py-2.5 px-6 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm cursor-pointer ml-auto"
      >
        {hasActiveFilters ? 'Applica Filtri' : 'Chiudi'}
      </button>
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidthClass={maxWidthClass}
      footer={modalFooter}
      overflowVisible={overflowVisible}
    >
      <div className="space-y-4">{children}</div>
    </BaseModal>
  );
};
