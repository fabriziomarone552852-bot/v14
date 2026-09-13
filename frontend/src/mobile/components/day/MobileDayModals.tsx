// src/mobile/components/day/MobileDayModals.tsx
import React from 'react';
import type { CountdownItem } from '@/components/day/CountdownWidget';
import type { CountdownSavePayload } from '../modals/MobileCountdownNewModal';
import MobileCountdownHubModal from '../modals/MobileCountdownHubModal';
import MobileCountdownDetailModal from '../modals/MobileCountdownDetailModal';
import MobileCountdownNewModal from '../modals/MobileCountdownNewModal';
import HabitNewModal from '@/components/day/HabitNewModal';
import MobileNotesBottomSheet from '../MobileNotesBottomSheet';
import type { LocalNoteEntry, NoteVariant } from '@/types';

export interface ModalController<T = unknown> {
  isOpen: boolean;
  data: T | null;
  open: (data?: T | null) => void;
  close: () => void;
}

export interface MobileDayModalsProps {
  // Countdowns
  countdownHubModal: ModalController<unknown>;
  countdownDetailModal: ModalController<CountdownItem>;
  countdownFormModal: ModalController<CountdownItem>;
  countdowns: CountdownItem[];
  onSaveCountdown: (payload: CountdownSavePayload) => void;
  onDeleteCountdown: (id: number) => Promise<unknown> | void;

  // Habit
  habitFormModal: ModalController<unknown>;
  onSaveHabit: (titolo: string, immagine_url?: string) => void;

  // Note
  isNotesOpen: boolean;
  notes: LocalNoteEntry[];
  editingNoteId: number | null;
  onCloseNotes: () => void;
  onAddNote: () => void;
  onAutoSaveNote: (id: number, testo: string, tipo: NoteVariant, isNew?: boolean) => void;
  onDeleteNote: (id: number) => void;
  clearEditingNoteId: () => void;
}

export const MobileDayModals: React.FC<MobileDayModalsProps> = ({
  countdownHubModal,
  countdownDetailModal,
  countdownFormModal,
  countdowns,
  onSaveCountdown,
  onDeleteCountdown,
  habitFormModal,
  onSaveHabit,
  isNotesOpen,
  notes,
  editingNoteId,
  onCloseNotes,
  onAddNote,
  onAutoSaveNote,
  onDeleteNote,
  clearEditingNoteId,
}) => {
  return (
    <>
      {/* 1. COUNTDOWN HUB MODAL */}
      <MobileCountdownHubModal
        isOpen={countdownHubModal.isOpen}
        onClose={countdownHubModal.close}
        countdowns={countdowns}
        onSelectCountdown={(cd) => countdownDetailModal.open(cd)}
        onNewClick={() => countdownFormModal.open(null)}
        onDeleteCountdown={onDeleteCountdown}
      />

      {/* 2. COUNTDOWN DETAIL MODAL */}
      <MobileCountdownDetailModal
        isOpen={countdownDetailModal.isOpen}
        onClose={countdownDetailModal.close}
        countdown={countdownDetailModal.data}
        onEditClick={() => {
          countdownFormModal.open(countdownDetailModal.data);
          countdownDetailModal.close();
        }}
        onDeleteClick={(id) => {
          onDeleteCountdown(id);
          countdownDetailModal.close();
        }}
        onRenewClick={(renewedCountdown) => {
          onSaveCountdown(renewedCountdown);
          countdownDetailModal.open(renewedCountdown);
        }}
      />

      {/* 3. COUNTDOWN NEW / EDIT MODAL */}
      <MobileCountdownNewModal
        isOpen={countdownFormModal.isOpen}
        onClose={countdownFormModal.close}
        countdownToEdit={countdownFormModal.data}
        onSave={(newCd: CountdownSavePayload) => {
          onSaveCountdown(newCd);
          countdownFormModal.close();
        }}
      />

      {/* 4. NEW HABIT MODAL */}
      <HabitNewModal
        isOpen={habitFormModal.isOpen}
        onClose={habitFormModal.close}
        onSave={(newHabit) => {
          onSaveHabit(newHabit.titolo, newHabit.immagine_url);
          habitFormModal.close();
        }}
      />

      {/* 5. NOTES BOTTOM SHEET */}
      <MobileNotesBottomSheet
        isOpen={isNotesOpen}
        notes={notes}
        editingNoteId={editingNoteId}
        onClose={onCloseNotes}
        onAddNote={onAddNote}
        onAutoSaveNote={onAutoSaveNote}
        onDeleteNote={onDeleteNote}
        clearEditingNoteId={clearEditingNoteId}
      />
    </>
  );
};
