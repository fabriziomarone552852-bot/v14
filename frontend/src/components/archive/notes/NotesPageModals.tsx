// src/components/archive/notes/NotesPageModals.tsx
import React from 'react';
import { useIsMobile } from '@/mobile/hooks/useIsMobile';
import { NoteFilterModal } from './NoteFilterModal';
import { NoteModal } from './NoteModal';
import { MobileNoteModal } from '@/mobile/components/modals/MobileNoteModal';
import type { UseModalResult } from '@/hooks/useModals';
import type { NoteFilterState } from '@/hooks/useNoteArchiveData';
import type { DailyEntry } from '@/types/dailyentries';
import type { NoteVariant } from '@/types';

interface NotesPageModalsProps {
  filterModal: UseModalResult;
  formModal: UseModalResult<DailyEntry>;
  filters: NoteFilterState;
  onFilterChange: (filters: NoteFilterState) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  onSaveNote: (payload: {
    data_riferimento: string;
    testo: string;
    tipo: NoteVariant;
    id?: number;
  }) => Promise<void>;
}

export const NotesPageModals: React.FC<NotesPageModalsProps> = ({
  filterModal,
  formModal,
  filters,
  onFilterChange,
  onResetFilters,
  hasActiveFilters,
  onSaveNote,
}) => {
  const isMobile = useIsMobile();

  return (
    <>
      {/* MODALE FILTRI & RICERCA */}
      <NoteFilterModal
        isOpen={filterModal.isOpen}
        onClose={filterModal.close}
        filters={filters}
        onFilterChange={onFilterChange}
        onReset={onResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* MODALE CREAZIONE / MODIFICA NOTA */}
      {isMobile ? (
        <MobileNoteModal
          isOpen={formModal.isOpen}
          onClose={formModal.close}
          noteToEdit={formModal.data}
          onSave={onSaveNote}
        />
      ) : (
        <NoteModal
          isOpen={formModal.isOpen}
          onClose={formModal.close}
          noteToEdit={formModal.data}
          onSave={onSaveNote}
        />
      )}
    </>
  );
};
