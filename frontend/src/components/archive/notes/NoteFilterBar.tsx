// src/components/notes/NoteFilterBar.tsx
import React from 'react';
import { ArchiveActionBar } from '@/components/shared/layout/ArchiveActionBar';

interface NoteFilterBarProps {
  onOpenNewNote: () => void;
  onOpenSearch: () => void;
  activeFiltersCount: number;
  panelClass?: string;
}

export const NoteFilterBar: React.FC<NoteFilterBarProps> = ({
  onOpenNewNote,
  onOpenSearch,
  activeFiltersCount,
  panelClass,
}) => {
  return (
    <ArchiveActionBar
      addLabel="Nuova Nota"
      onAdd={onOpenNewNote}
      onOpenSearch={onOpenSearch}
      activeFiltersCount={activeFiltersCount}
      className={panelClass}
    />
  );
};

export default NoteFilterBar;
