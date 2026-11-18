import React from 'react';
import type { MediaList, SeriesFriendDisplayItem } from '@/types/trackers';
import type { MediaCreditPerson } from '@/types/people';
import type { CinemaProvince } from '@/types/cinema';
import { MobileTrackerFriendsDrawer } from '../../shared/detail/MobileTrackerFriendsDrawer';
import { MobileTrackerListsDrawer } from '../../shared/detail/MobileTrackerListsDrawer';
import { MobileMovieOptionsModal } from './MobileMovieOptionsModal';
import { MobileTrackerListManagerModal } from '../../shared/detail/MobileTrackerListManagerModal';
import { TrackerListDetailModal } from '@/components/trackers/shared/detail/TrackerListDetailModal';
import { PersonDetailModal } from '@/components/trackers/shared/detail/PersonDetailModal';
import { MobileCinemaProvinceModal } from '../cinema/MobileCinemaProvinceModal';

export interface MobileMovieDetailDrawersProps {
  tmdbId?: number;
  hasCustomPoster: boolean;
  onSaveCustomPoster: (url: string) => void;
  isTracked: boolean;
  isWatched: boolean;
  watchCount: number;
  onRewatch: () => void;
  isObtained: boolean;
  obtainedAt?: string | null;
  onToggleObtained: () => void;
  isHistoricMode: boolean;
  onToggleHistoricMode: () => void;
  showFriendsPanel: boolean;
  onCloseFriendsPanel: () => void;
  friends: SeriesFriendDisplayItem[];
  getStatusBorderColor: (status: string) => string;
  showListsPanel: boolean;
  onCloseListsPanel: () => void;
  listsWithMovie: MediaList[];
  onSelectList: (listId: number) => void;
  showOptionsModal: boolean;
  onCloseOptionsModal: () => void;
  isListManagerOpen: boolean;
  onOpenListManager: () => void;
  onCloseListManager: () => void;
  listDetailId: number | null;
  onCloseListDetail: () => void;
  selectedPerson: MediaCreditPerson | null;
  onClosePersonDetail: () => void;
  onSelectMovie: (movieTmdbId: number) => void;
  onSelectSeries: (seriesTmdbId: number) => void;
  isProvinceModalOpen: boolean;
  onCloseProvinceModal: () => void;
  cinemaProvinces: CinemaProvince[];
  selectedProvinceSlug: string;
  onSelectProvince: (slug: string) => void;
}

/**
 * Raccoglie drawer e modali secondari della scheda dettaglio Film mobile.
 */
export const MobileMovieDetailDrawers: React.FC<MobileMovieDetailDrawersProps> = ({
  tmdbId,
  hasCustomPoster,
  onSaveCustomPoster,
  isTracked,
  isWatched,
  watchCount,
  onRewatch,
  isObtained,
  obtainedAt,
  onToggleObtained,
  isHistoricMode,
  onToggleHistoricMode,
  showFriendsPanel,
  onCloseFriendsPanel,
  friends,
  getStatusBorderColor,
  showListsPanel,
  onCloseListsPanel,
  listsWithMovie,
  onSelectList,
  showOptionsModal,
  onCloseOptionsModal,
  isListManagerOpen,
  onOpenListManager,
  onCloseListManager,
  listDetailId,
  onCloseListDetail,
  selectedPerson,
  onClosePersonDetail,
  onSelectMovie,
  onSelectSeries,
  isProvinceModalOpen,
  onCloseProvinceModal,
  cinemaProvinces,
  selectedProvinceSlug,
  onSelectProvince,
}) => (
  <>
    <MobileTrackerFriendsDrawer
      isOpen={showFriendsPanel}
      onClose={onCloseFriendsPanel}
      friends={friends}
      getStatusBorderColor={getStatusBorderColor}
      mediaType="movies"
    />

    <MobileTrackerListsDrawer
      isOpen={showListsPanel}
      onClose={onCloseListsPanel}
      lists={listsWithMovie}
      onSelectList={onSelectList}
      onOpenManager={onOpenListManager}
      emptyMessage="Questo film non è ancora presente in nessuna lista."
    />

    <MobileMovieOptionsModal
      isOpen={showOptionsModal}
      onClose={onCloseOptionsModal}
      hasCustomPoster={hasCustomPoster}
      onPosterUpdated={(url) => onSaveCustomPoster(url || '')}
      isUserTracked={isTracked}
      isWatched={isWatched}
      watchCount={watchCount}
      onRewatch={onRewatch}
      isObtained={isObtained}
      obtainedAt={obtainedAt}
      onToggleObtained={onToggleObtained}
      isHistoricMode={isHistoricMode}
      onToggleHistoricMode={onToggleHistoricMode}
    />

    {isListManagerOpen && (
      <MobileTrackerListManagerModal
        isOpen={isListManagerOpen}
        onClose={onCloseListManager}
        movieId={tmdbId}
      />
    )}

    {listDetailId !== null && (
      <TrackerListDetailModal
        isOpen={listDetailId !== null}
        onClose={onCloseListDetail}
        listId={listDetailId}
      />
    )}

    <PersonDetailModal
      isOpen={Boolean(selectedPerson)}
      person={selectedPerson}
      onClose={onClosePersonDetail}
      onSelectMovie={onSelectMovie}
      onSelectSeries={onSelectSeries}
    />

    {isProvinceModalOpen && (
      <MobileCinemaProvinceModal
        isOpen={isProvinceModalOpen}
        onClose={onCloseProvinceModal}
        provinces={cinemaProvinces}
        selectedSlug={selectedProvinceSlug}
        onSelectProvince={(newSlug) => {
          onSelectProvince(newSlug);
          onCloseProvinceModal();
        }}
      />
    )}
  </>
);
