// src/mobile/components/trackers/shared/lists/MobileTrackerPersonalListsModal.tsx
import React from 'react';
import { createPortal } from 'react-dom';
import type { MediaList, TVSeries, TrackerMediaType } from '@/types/trackers';
import type { Movie, MovieDetailTarget } from '@/types/movies';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import { useBackHandler } from '@/utils/backButtonManager';
import { EditIcon, TrashIcon } from '@/components/shared/utils/Icons';
import ConfirmDialog from '@/components/shared/dialog/ConfirmDialog';
import { MobileTrackerCatalogHeader } from '../catalog';
import { MobileSeriesCatalogGrid } from '../../series/MobileSeriesCatalogGrid';
import { MobileMovieCatalogGrid } from '../../movies/MobileMovieCatalogGrid';
import { MobileTrackerListOverviewCard } from './MobileTrackerListOverviewCard';
import { MobileTrackerSortFilterModal } from './MobileTrackerSortFilterModal';
import { MobileTrackerCreateListModal } from './MobileTrackerCreateListModal';
import { useFadeScrollbar } from '@/hooks/ui/useFadeScrollbar';
import { useMobileTrackerPersonalListsLogic } from './hooks/useMobileTrackerPersonalListsLogic';

export interface MobileTrackerPersonalListsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaType: TrackerMediaType;
  myLists: MediaList[];
  series?: TVSeries[];
  movies?: Movie[];
  onOpenSeriesDetail?: (series: TVSeries | Partial<TVSeries>) => void;
  onOpenMovieDetail?: (movie: MovieDetailTarget) => void;
  initialSelectedList?: MediaList | null;
}

export const MobileTrackerPersonalListsModal: React.FC<
  MobileTrackerPersonalListsModalProps
> = ({
  isOpen,
  onClose,
  mediaType,
  myLists,
  series = [],
  movies = [],
  onOpenSeriesDetail,
  onOpenMovieDetail,
  initialSelectedList,
}) => {
  const {
    selectedList,
    setSelectedList,
    statusFilter,
    setStatusFilter,
    listSort,
    setListSort,
    itemSort,
    setItemSort,
    isSortModalOpen,
    setIsSortModalOpen,
    isCreateModalOpen,
    setIsCreateModalOpen,
    listToEdit,
    setListToEdit,
    selectedListIds,
    toggleListSelection,
    clearListSelection,
    selectedItemTmdbIds,
    toggleItemSelection,
    confirmDeleteDialog,
    openDeleteConfirm,
    closeDeleteConfirm,
    executeDelete,
    openEditSelectedList,
    handleBack,
    trackerLists,
    sortedLists,
    selectedListSeries,
    selectedListMovies,
    hasActiveSortOrFilter,
  } = useMobileTrackerPersonalListsLogic({
    isOpen,
    onClose,
    mediaType,
    myLists,
    series,
    movies,
    initialSelectedList,
  });

  const { handleScroll, scrollbarClass } = useFadeScrollbar();

  useBackHandler(
    isOpen,
    () => {
      handleBack();
      return true;
    },
    25
  );

  if (!isOpen) return null;

  const isMovie = mediaType === 'movie';

  const getHeaderTitle = () => {
    if (selectedList) {
      if (selectedItemTmdbIds.length > 0) {
        const suffix = isMovie
          ? selectedItemTmdbIds.length === 1
            ? 'o'
            : 'i'
          : selectedItemTmdbIds.length === 1
          ? 'a'
          : 'e';
        return `${selectedItemTmdbIds.length} selezionat${suffix}`;
      }
      return selectedList.name;
    }
    if (selectedListIds.length > 0) {
      return `${selectedListIds.length} selezionat${
        selectedListIds.length === 1 ? 'a' : 'e'
      }`;
    }
    return 'Le mie liste';
  };

  const renderSortButton = () => (
    <button
      type="button"
      onClick={() => setIsSortModalOpen(true)}
      className={`relative w-9 h-9 rounded-xl active:scale-95 transition-all cursor-pointer flex items-center justify-center ${
        hasActiveSortOrFilter
          ? 'bg-blue-50 text-blue-600 font-bold'
          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
      }`}
      title="Filtra e ordina"
      aria-label="Filtra e ordina"
    >
      <svg
        className="w-5 h-5 text-gray-800"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5"
        />
      </svg>
      {hasActiveSortOrFilter && (
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full border border-white" />
      )}
    </button>
  );

  const renderHeaderRightActions = () => {
    if (selectedList) {
      if (selectedItemTmdbIds.length > 0) {
        return (
          <div className="flex items-center gap-1 animate-fadeIn">
            <button
              type="button"
              onClick={() => openDeleteConfirm('items')}
              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl active:scale-95 transition-all cursor-pointer flex items-center justify-center"
              title="Rimuovi dalla lista"
              aria-label="Rimuovi dalla lista"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        );
      }
      return <div className="flex items-center gap-1">{renderSortButton()}</div>;
    }

    if (selectedListIds.length > 0) {
      return (
        <div className="flex items-center gap-1 animate-fadeIn">
          {selectedListIds.length === 1 && (
            <button
              type="button"
              onClick={openEditSelectedList}
              className="p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl active:scale-95 transition-all cursor-pointer flex items-center justify-center"
              title="Modifica lista"
              aria-label="Modifica lista"
            >
              <EditIcon className="h-5 w-5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => openDeleteConfirm('lists')}
            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl active:scale-95 transition-all cursor-pointer flex items-center justify-center"
            title="Elimina lista selezionata"
            aria-label="Elimina lista selezionata"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1">
        {renderSortButton()}
        <button
          type="button"
          onClick={() => {
            setListToEdit(null);
            setIsCreateModalOpen(true);
          }}
          className="w-9 h-9 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-100 active:scale-95 transition-all focus:outline-none cursor-pointer flex items-center justify-center"
          title="Crea nuova lista"
          aria-label="Crea nuova lista"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-[10025] bg-gray-50 flex flex-col h-[100dvh] w-full overflow-hidden pointer-events-auto animate-fadeIn select-none">
      {/* 1. HEADER */}
      <MobileTrackerCatalogHeader
        title={getHeaderTitle()}
        onBack={handleBack}
        rightActions={renderHeaderRightActions()}
      />

      {/* 2. CONTENUTO CENTRALE: DETTAGLIO LISTA OPPURE PANORAMICA DELLE LISTE */}
      {selectedList ? (
        isMovie ? (
          <MobileMovieCatalogGrid
            movies={selectedListMovies}
            onSelectMovie={(item) => {
              onOpenMovieDetail?.(item);
            }}
            hasActiveFilters={statusFilter !== 'all'}
            onResetFilters={() => setStatusFilter('all')}
            emptyMessage="Nessun film presente in questa lista"
            resetFiltersLabel="Mostra tutti i film"
            selectedMovieTmdbIds={selectedItemTmdbIds}
            onToggleSelectMovie={toggleItemSelection}
          />
        ) : (
          <MobileSeriesCatalogGrid
            series={selectedListSeries}
            onSelectSeries={(item) => {
              onOpenSeriesDetail?.(item);
            }}
            hasActiveFilters={statusFilter !== 'all'}
            onResetFilters={() => setStatusFilter('all')}
            emptyMessage="Nessuna serie presente in questa lista"
            resetFiltersLabel="Mostra tutte le serie"
            selectedSeriesTmdbIds={selectedItemTmdbIds}
            onToggleSelectSeries={toggleItemSelection}
          />
        )
      ) : (
        <div
          onScroll={handleScroll}
          className={`flex-1 min-h-0 overflow-y-auto p-3 sm:p-3.5 space-y-3 ${scrollbarClass}`}
        >
          {sortedLists.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-4">
              {trackerLists.length === 0 ? (
                <>
                  <EmptyState
                    message={
                      isMovie
                        ? 'Non hai ancora nessuna lista personale con dei film.'
                        : 'Non hai ancora creato nessuna lista personale.'
                    }
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setListToEdit(null);
                      setIsCreateModalOpen(true);
                    }}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer active:scale-95 transition-all"
                  >
                    Crea la tua prima lista
                  </button>
                </>
              ) : (
                <>
                  <EmptyState
                    message={
                      isMovie
                        ? 'Nessuna lista contiene film corrispondenti allo stato selezionato.'
                        : 'Nessuna lista contiene serie corrispondenti allo stato selezionato.'
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setStatusFilter('all')}
                    className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 text-xs font-bold rounded-xl shadow-2xs cursor-pointer active:scale-95 transition-all hover:bg-blue-100"
                  >
                    {isMovie ? 'Mostra tutti i film' : 'Mostra tutte le serie'}
                  </button>
                </>
              )}
            </div>
          ) : (
            sortedLists.map((list) => (
              <MobileTrackerListOverviewCard
                key={list.id}
                list={list}
                mediaType={mediaType}
                series={series}
                movies={movies}
                activeTab={statusFilter}
                onSelectList={(targetList) => {
                  setSelectedList(targetList);
                }}
                isSelected={selectedListIds.includes(list.id)}
                isSelectionActive={selectedListIds.length > 0}
                onToggleSelect={toggleListSelection}
              />
            ))
          )}
        </div>
      )}

      {/* 3. MODALE FILTRO & ORDINAMENTO */}
      <MobileTrackerSortFilterModal
        isOpen={isSortModalOpen}
        onClose={() => setIsSortModalOpen(false)}
        mediaType={mediaType}
        mode={selectedList ? 'items' : 'lists'}
        statusFilter={statusFilter}
        onSelectStatusFilter={(newStatus) => {
          setStatusFilter(newStatus);
          setIsSortModalOpen(false);
        }}
        sortOption={selectedList ? itemSort : listSort}
        onSelectSortOption={(sort) => {
          if (selectedList) {
            setItemSort(sort);
          } else {
            setListSort(sort);
          }
          setIsSortModalOpen(false);
        }}
      />

      {/* 4. MODALE CREAZIONE / MODIFICA LISTA */}
      <MobileTrackerCreateListModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setListToEdit(null);
          clearListSelection();
        }}
        mediaType={mediaType}
        series={series}
        movies={movies}
        listToEdit={listToEdit}
      />

      {/* 5. DIALOG CONFERMA ELIMINAZIONE BATCH */}
      <ConfirmDialog
        isOpen={confirmDeleteDialog.isOpen}
        title={
          confirmDeleteDialog.type === 'lists'
            ? confirmDeleteDialog.count === 1
              ? 'Elimina lista'
              : 'Elimina liste'
            : isMovie
            ? 'Rimuovi film'
            : 'Rimuovi serie'
        }
        message={
          confirmDeleteDialog.type === 'lists'
            ? confirmDeleteDialog.count === 1
              ? "Vuoi davvero eliminare questa lista? L'operazione non potrà essere annullata."
              : `Vuoi davvero eliminare le ${confirmDeleteDialog.count} liste selezionate? L'operazione non potrà essere annullata.`
            : confirmDeleteDialog.count === 1
            ? `Vuoi rimuovere ${isMovie ? 'questo film' : 'questa serie'} dalla lista?`
            : `Vuoi rimuovere ${isMovie ? 'i' : 'le'} ${confirmDeleteDialog.count} ${
                isMovie ? 'film selezionati' : 'serie selezionate'
              } da questa lista?`
        }
        confirmText={confirmDeleteDialog.type === 'lists' ? 'Elimina' : 'Rimuovi'}
        cancelText="Annulla"
        isDestructive={true}
        onConfirm={executeDelete}
        onCancel={closeDeleteConfirm}
      />
    </div>,
    document.body
  );
};

export default MobileTrackerPersonalListsModal;
