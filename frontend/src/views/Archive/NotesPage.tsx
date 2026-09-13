// src/views/Archive/NotesPage.tsx
import React from 'react';
import { ArchiveHeader } from '@/components/shared/layout/ArchiveHeader';
import { NoteIcon } from '@/components/shared/utils/Icons';
import { NoteFilterBar } from '@/components/archive/notes/NoteFilterBar';
import { NotesPageGrid } from '@/components/archive/notes/NotesPageGrid';
import { NotesPageModals } from '@/components/archive/notes/NotesPageModals';
import { useNotesPageLogic } from '@/components/archive/notes/useNotesPageLogic';
import { ARCHIVE_PANEL_CLASS } from './CategoriesPage';

export const NotesPage: React.FC = () => {
  const {
    loading,
    isError,
    filters,
    setFilters,
    currentPage,
    setCurrentPage,
    filterModal,
    formModal,
    containerRef,
    paginatedNotes,
    totalPages,
    totalCount,
    activeFiltersCount,
    hasActiveFilters,
    handleResetFilters,
    handleOpenNew,
    handleOpenEdit,
    handleDeleteNote,
    handleSaveNote,
  } = useNotesPageLogic();

  return (
    <div className="h-full flex flex-col gap-2 sm:gap-3.5 w-full max-w-[1600px] mx-auto relative z-10 pb-1">
      {/* 1. HEADER STANDARD */}
      <ArchiveHeader
        title="NOTE & RIFLESSIONI"
        subtitle="Bacheca completa delle tue note, memo veloci e riflessioni giornaliere."
        icon={<NoteIcon className="w-5 h-5 text-white" />}
        className={ARCHIVE_PANEL_CLASS}
      />

      {/* 2. BARRA AZIONI (NUOVA NOTA + RICERCA) */}
      <NoteFilterBar
        onOpenNewNote={handleOpenNew}
        onOpenSearch={filterModal.open}
        activeFiltersCount={activeFiltersCount}
        panelClass={ARCHIVE_PANEL_CLASS}
      />

      {/* 3. BACHECA NOTE */}
      <NotesPageGrid
        containerRef={containerRef}
        loading={loading}
        isError={isError}
        totalCount={totalCount}
        hasActiveFilters={hasActiveFilters}
        paginatedNotes={paginatedNotes}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onResetFilters={handleResetFilters}
        onEditNote={handleOpenEdit}
        onDeleteNote={handleDeleteNote}
        panelClass={ARCHIVE_PANEL_CLASS}
      />

      {/* 4. MODALI */}
      <NotesPageModals
        filterModal={filterModal}
        formModal={formModal}
        filters={filters}
        onFilterChange={(newFilters) => {
          setFilters(newFilters);
          setCurrentPage(1);
        }}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
        onSaveNote={handleSaveNote}
      />
    </div>
  );
};

export default NotesPage;
