// src/mobile/components/trackers/MobileSeriesPersonalListsModal.tsx
import React from 'react';
import { createPortal } from 'react-dom';
import type { MediaList, TVSeries } from '@/types/trackers';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import { useBackHandler } from '@/utils/backButtonManager';
import { EditIcon, TrashIcon } from '@/components/shared/utils/Icons';
import ConfirmDialog from '@/components/shared/dialog/ConfirmDialog';
import {
  MobileSeriesCatalogHeader,
  MobileSeriesCatalogGrid,
} from './catalog';
import { MobileSeriesListOverviewCard } from './MobileSeriesListOverviewCard';
import { MobileSeriesSortFilterModal } from './MobileSeriesSortFilterModal';
import { MobileSeriesCreateListModal } from './MobileSeriesCreateListModal';
import { useFadeScrollbar } from '@/hooks/ui/useFadeScrollbar';
import { useMobileSeriesPersonalListsLogic } from './hooks/useMobileSeriesPersonalListsLogic';

export interface MobileSeriesPersonalListsModalProps {
  isOpen: boolean;
  onClose: () => void;
  myLists: MediaList[];
  series: TVSeries[];
  onOpenSeriesDetail: (series: TVSeries | Partial<TVSeries>) => void;
  onOpenListManager?: () => void;
  initialSelectedList?: MediaList | null;
}

export const MobileSeriesPersonalListsModal: React.FC<MobileSeriesPersonalListsModalProps> = ({
  isOpen,
  onClose,
  myLists,
  series,
  onOpenSeriesDetail,
  onOpenListManager: _onOpenListManager,
  initialSelectedList,
}) => {
  const {
    selectedList,
    setSelectedList,
    statusFilter,
    setStatusFilter,
    listSort,
    setListSort,
    seriesSort,
    setSeriesSort,
    isSortModalOpen,
    setIsSortModalOpen,
    isCreateModalOpen,
    setIsCreateModalOpen,
    listToEdit,
    setListToEdit,
    selectedListIds,
    toggleListSelection,
    clearListSelection,
    selectedSeriesTmdbIds,
    toggleSeriesSelection,
    confirmDeleteDialog,
    openDeleteConfirm,
    closeDeleteConfirm,
    executeDelete,
    openEditSelectedList,
    handleBack,
    sortedLists,
    selectedListSeries,
    hasActiveSortOrFilter,
  } = useMobileSeriesPersonalListsLogic({
    isOpen,
    onClose,
    myLists,
    series,
    initialSelectedList,
  });

  const { handleScroll, scrollbarClass } = useFadeScrollbar();

  // Gestione back hardware Android con priorità 25
  useBackHandler(
    isOpen,
    () => {
      handleBack();
      return true;
    },
    25
  );

  if (!isOpen) return null;

  // Header Title dinamico
  const getHeaderTitle = () => {
    if (selectedList) {
      if (selectedSeriesTmdbIds.length > 0) {
        return `${selectedSeriesTmdbIds.length} selezionat${selectedSeriesTmdbIds.length === 1 ? 'a' : 'e'}`;
      }
      return selectedList.name;
    }
    if (selectedListIds.length > 0) {
      return `${selectedListIds.length} selezionat${selectedListIds.length === 1 ? 'a' : 'e'}`;
    }
    return 'Le mie liste';
  };

  // Header Right Actions dinamico
  const renderHeaderRightActions = () => {
    // 1. All'interno di una lista specifica
    if (selectedList) {
      if (selectedSeriesTmdbIds.length > 0) {
        return (
          <div className="flex items-center gap-1 animate-fadeIn">
            <button
              type="button"
              onClick={() => openDeleteConfirm('series')}
              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl active:scale-95 transition-all cursor-pointer flex items-center justify-center"
              title="Rimuovi serie dalla lista"
              aria-label="Rimuovi serie dalla lista"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        );
      }

      // Nessuna serie selezionata nella lista: mostra ordinamento e crea
      return (
        <div className="flex items-center gap-1">
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
        </div>
      );
    }

    // 2. Nella vista panoramica di tutte le liste
    if (selectedListIds.length > 0) {
      return (
        <div className="flex items-center gap-1 animate-fadeIn">
          {/* Se è selezionata 1 sola lista, mostra il tasto modifica */}
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

          {/* Tasto elimina lista/liste */}
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

    // Nessuna lista selezionata: mostra ordina/filtra e crea nuova lista (+)
    return (
      <div className="flex items-center gap-1">
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
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-[10025] bg-gray-50 flex flex-col h-[100dvh] w-full overflow-hidden pointer-events-auto animate-fadeIn select-none">
      {/* 1. HEADER: TITOLO DINAMICO E AZIONI CONDIZIONATE DALLA SELEZIONE */}
      <MobileSeriesCatalogHeader
        title={getHeaderTitle()}
        onBack={handleBack}
        rightActions={renderHeaderRightActions()}
      />

      {/* 2. CONTENUTO CENTRALE: DETTAGLIO LISTA (CATALOGO) OPPURE PANORAMICA DELLE LISTE */}
      {selectedList ? (
        <MobileSeriesCatalogGrid
          series={selectedListSeries}
          onSelectSeries={(item) => {
            // Non chiudiamo il modale delle liste: la scheda serie si apre sopra (z-[10030])
            onOpenSeriesDetail(item);
          }}
          hasActiveFilters={statusFilter !== 'all'}
          onResetFilters={() => setStatusFilter('all')}
          emptyMessage="Nessuna serie presente in questa lista"
          resetFiltersLabel="Mostra tutte le serie"
          selectedSeriesTmdbIds={selectedSeriesTmdbIds}
          onToggleSelectSeries={toggleSeriesSelection}
        />
      ) : (
        /* VISTA ELENCO DI TUTTE LE LISTE */
        <div
          onScroll={handleScroll}
          className={`flex-1 min-h-0 overflow-y-auto p-3 sm:p-3.5 space-y-3 ${scrollbarClass}`}
        >
          {sortedLists.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-4">
              {myLists.length === 0 ? (
                <>
                  <EmptyState message="Non hai ancora creato nessuna lista personale." />
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
                  <EmptyState message="Nessuna lista contiene serie corrispondenti allo stato selezionato." />
                  <button
                    type="button"
                    onClick={() => setStatusFilter('all')}
                    className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 text-xs font-bold rounded-xl shadow-2xs cursor-pointer active:scale-95 transition-all hover:bg-blue-100"
                  >
                    Mostra tutte le serie
                  </button>
                </>
              )}
            </div>
          ) : (
            sortedLists.map((list) => (
              <MobileSeriesListOverviewCard
                key={list.id}
                list={list}
                series={series}
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
      <MobileSeriesSortFilterModal
        isOpen={isSortModalOpen}
        onClose={() => setIsSortModalOpen(false)}
        mode={selectedList ? 'series' : 'lists'}
        statusFilter={statusFilter}
        onSelectStatusFilter={(newStatus) => {
          setStatusFilter(newStatus);
          setIsSortModalOpen(false);
        }}
        sortOption={selectedList ? seriesSort : listSort}
        onSelectSortOption={(sort) => {
          if (selectedList) {
            setSeriesSort(sort);
          } else {
            setListSort(sort);
          }
          setIsSortModalOpen(false);
        }}
      />

      {/* 4. MODALE CREAZIONE / MODIFICA LISTA */}
      <MobileSeriesCreateListModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setListToEdit(null);
          clearListSelection();
        }}
        series={series}
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
            : confirmDeleteDialog.count === 1
            ? 'Rimuovi serie'
            : 'Rimuovi serie'
        }
        message={
          confirmDeleteDialog.type === 'lists' ? (
            confirmDeleteDialog.count === 1 ? (
              'Vuoi davvero eliminare questa lista? L\'operazione non potrà essere annullata.'
            ) : (
              `Vuoi davvero eliminare le ${confirmDeleteDialog.count} liste selezionate? L'operazione non potrà essere annullata.`
            )
          ) : confirmDeleteDialog.count === 1 ? (
            'Vuoi rimuovere questa serie dalla lista?'
          ) : (
            `Vuoi rimuovere le ${confirmDeleteDialog.count} serie selezionate da questa lista?`
          )
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

export default MobileSeriesPersonalListsModal;
