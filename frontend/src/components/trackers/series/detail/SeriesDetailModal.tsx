// src/components/trackers/SeriesDetailModal/SeriesDetailModal.tsx
import React, { useRef, useState } from 'react';
import BaseModal from '@/components/shared/dialog/BaseModal';
import {
  type TMDBEpisode,
  type SeriesDetailTarget,
  type SeriesRecommendation,
  type UserSeriesTracking,
} from '@/types/trackers';
import { SeriesOverviewTab } from './SeriesOverviewTab';
import { SeasonsTab } from './SeasonsTab';
import { SeriesReviewTab } from './SeriesReviewTab';
import { TrackerListManagerModal } from '@/components/trackers/shared/detail/TrackerListManagerModal';
import { TrackerImageModal } from '@/components/trackers/shared/detail/TrackerImageModal';
import { TrackerDetailListsDrawer } from '@/components/trackers/shared/detail/TrackerDetailListsDrawer';
import { TrackerDetailFriendsDrawer } from '@/components/trackers/shared/detail/TrackerDetailFriendsDrawer';
import { TrackerListDetailModal } from '@/components/trackers/shared/detail/TrackerListDetailModal';
import { useTrackerPersonNavigation } from '@/hooks/trackers/useTrackerPersonNavigation';
import { SeriesDetailHeader } from './SeriesDetailHeader';
import { SeriesDetailSidebar } from './SeriesDetailSidebar';
import {
  useSeriesDetailModalLogic,
  type TabType,
} from './useSeriesDetailModalLogic';
import { useTrackersMutations } from '@/hooks/mutations/useTrackersMutations';

export type { TabType } from './useSeriesDetailModalLogic';

interface SeriesDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  series: SeriesDetailTarget | UserSeriesTracking;
  initialTab?: TabType;
  initialEpisode?: TMDBEpisode | null;
  initialSeasonNumber?: number | null;
  initialReviewLogId?: number;
  onToggleTrack?: (tmdbId: number, isTracked: boolean) => void;
  onSelectRecommendation?: (series: SeriesRecommendation) => void;
  onGenreClick?: (genre: string) => void;
  onPlatformClick?: (platform: string) => void;
  zIndexClass?: string;
}

export const SeriesDetailModal: React.FC<SeriesDetailModalProps> = ({
  isOpen,
  onClose,
  series,
  initialTab = 'overview',
  initialEpisode = null,
  initialSeasonNumber = null,
  initialReviewLogId,
  onToggleTrack,
  onSelectRecommendation,
  onGenreClick,
  onPlatformClick,
  zIndexClass,
}) => {
  const [isHistoricMode, setIsHistoricMode] = useState(false);
  const posterRef = useRef<HTMLDivElement>(null);
  const { updateSeries } = useTrackersMutations();

  const {
    activeTab,
    setActiveTab,
    internalEpisode,
    setInternalEpisode,
    internalSeasonNumber,
    setInternalSeasonNumber,
    internalReviewLogId,
    showFriendsPanel,
    setShowFriendsPanel,
    showListsPanel,
    setShowListsPanel,
    isListManagerOpen,
    setIsListManagerOpen,
    isImageModalOpen,
    setIsImageModalOpen,
    listDetailId,
    setListDetailId,
    isPressing,
    handleTouchStart,
    handleTouchEnd,
    handleMouseDown,
    handleMouseUp,
    handleClickTrack,
    tmdbSeries,
    userTracking,
    title,
    posterUrl,
    backdropUrl,
    genres,
    providersData,
    listsWithSeries,
    SERIES_FRIENDS,
    isFriendsLoading,
    getStatusBorderColor,
  } = useSeriesDetailModalLogic({
    isOpen,
    series,
    initialTab,
    initialEpisode,
    initialSeasonNumber,
    initialReviewLogId,
    onToggleTrack,
  });

  const { openPersonDetail, openSeriesInStack } = useTrackerPersonNavigation({
    surface: 'desktop',
  });

  const handleSelectRelatedSeries = (rec: SeriesRecommendation) => {
    const targetTmdbId = rec.tmdb_id ?? rec.id;
    if (targetTmdbId && targetTmdbId !== tmdbSeries.tmdb_id) {
      openSeriesInStack(targetTmdbId);
      return;
    }
    onSelectRecommendation?.(rec);
  };

  const isUserTracked = Boolean(userTracking);
  const isAbandoned = userTracking?.status === 'dropped';

  const handleAbandon = () => {
    const targetTmdbId = tmdbSeries.tmdb_id || userTracking?.series_tmdb_id;
    if (targetTmdbId) {
      updateSeries({
        id: targetTmdbId,
        updates: { status: 'dropped', is_rewatching: false },
      });
    }
  };

  const handleResume = () => {
    const targetTmdbId = tmdbSeries.tmdb_id || userTracking?.series_tmdb_id;
    const hasWatched = Boolean(
      tmdbSeries.episodes?.some((ep) => ep.is_watched || (ep.watch_count ?? 0) > 0)
    );
    const targetStatus = hasWatched ? 'watching' : 'to_watch';
    if (targetTmdbId) {
      updateSeries({
        id: targetTmdbId,
        updates: { status: targetStatus },
      });
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidthClass="max-w-5xl"
      hideHeader={true}
      zIndexClass={zIndexClass || 'z-[10020]'}
    >
      <div className="-m-6 relative flex flex-col min-h-[70vh] max-h-[85vh] rounded-2xl overflow-hidden bg-gray-50">
        {/* TESTATA CON BACKDROP, BADGE E AMICI */}
        <SeriesDetailHeader
          backdropUrl={backdropUrl}
          onClose={onClose}
          isUserTracked={isUserTracked}
          isAbandoned={isAbandoned}
          onAbandon={handleAbandon}
          onResume={handleResume}
          isHistoricMode={isHistoricMode}
          onToggleHistoricMode={() => {
            setIsHistoricMode((prev) => !prev);
            setActiveTab('seasons');
          }}
          genres={genres}
          onGenreClick={onGenreClick}
          providersData={providersData}
          onPlatformClick={onPlatformClick}
          isFriendsLoading={isFriendsLoading}
          friends={SERIES_FRIENDS}
          onOpenFriendsPanel={() => {
            setShowListsPanel(false);
            setShowFriendsPanel(true);
          }}
          getStatusBorderColor={getStatusBorderColor}
          listsWithSeries={listsWithSeries}
          onOpenListManager={() => setIsListManagerOpen(true)}
          onOpenListDrawer={(id) => {
            if (id) {
              setListDetailId(id);
            } else {
              setShowFriendsPanel(false);
              setShowListsPanel(true);
            }
          }}
          posterRef={posterRef}
        />

        {/* CONTENUTO PRINCIPALE */}
        <div className="flex-1 flex min-h-0 relative z-20">
          {/* COLONNA SINISTRA (Locandina, stato, menu schede) */}
          <SeriesDetailSidebar
            posterUrl={posterUrl}
            title={title}
            userTracking={userTracking}
            tmdbStatus={tmdbSeries?.tmdb_status}
            isPressing={isPressing}
            handleMouseDown={handleMouseDown}
            handleMouseUp={handleMouseUp}
            handleTouchStart={handleTouchStart}
            handleTouchEnd={handleTouchEnd}
            handleClickTrack={handleClickTrack}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onOpenImageModal={() => setIsImageModalOpen(true)}
            posterRef={posterRef}
          />

          {/* COLONNA DESTRA (Schede dinamiche) */}
          <div className="flex-1 overflow-y-auto bg-transparent modal-scrollbar p-6 relative z-10">
            {activeTab === 'overview' && (
              <SeriesOverviewTab
                tmdbSeries={tmdbSeries}
                onSelectRecommendation={handleSelectRelatedSeries}
                onPersonClick={openPersonDetail}
                isLoading={false}
              />
            )}
            {activeTab === 'seasons' && (
              <SeasonsTab
                tmdbSeries={tmdbSeries}
                userTracking={userTracking}
                initialEpisode={internalEpisode}
                initialSeasonNumber={internalSeasonNumber}
                initialReviewLogId={internalReviewLogId}
                isLoading={false}
                isHistoricMode={isHistoricMode}
                onDisableHistoricMode={() => setIsHistoricMode(false)}
                onClearInitialSeason={() => setInternalSeasonNumber(null)}
              />
            )}
            {activeTab === 'review' && (
              <SeriesReviewTab
                tmdbSeries={tmdbSeries}
                userTracking={userTracking}
                initialReviewLogId={internalReviewLogId}
                onOpenEpisode={(ep) => {
                  setInternalSeasonNumber(null);
                  setInternalEpisode(ep);
                  setActiveTab('seasons');
                }}
                onOpenSeason={(sn) => {
                  setInternalEpisode(null);
                  setInternalSeasonNumber(sn);
                  setActiveTab('seasons');
                }}
              />
            )}
          </div>
        </div>

        {/* SIDEBAR LISTE */}
        <TrackerDetailListsDrawer
          isOpen={showListsPanel}
          onClose={() => setShowListsPanel(false)}
          lists={listsWithSeries}
          onSelectList={(id) => setListDetailId(id)}
          onOpenManager={() => setIsListManagerOpen(true)}
        />

        {/* SIDEBAR AMICI */}
        <TrackerDetailFriendsDrawer
          isOpen={showFriendsPanel}
          onClose={() => setShowFriendsPanel(false)}
          friends={SERIES_FRIENDS}
          getStatusBorderColor={getStatusBorderColor}
        />
      </div>

      {isListManagerOpen && (
        <TrackerListManagerModal
          isOpen={isListManagerOpen}
          onClose={() => setIsListManagerOpen(false)}
          seriesId={tmdbSeries.tmdb_id}
          zIndexClass="z-[10050]"
        />
      )}

      {isImageModalOpen && (
        <TrackerImageModal
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          currentUrl={posterUrl}
          zIndexClass="z-[10050]"
          onSave={(url) => {
            if (tmdbSeries.tmdb_id) {
              updateSeries({ id: tmdbSeries.tmdb_id, updates: { custom_poster_path: url } });
            }
          }}
        />
      )}

      {listDetailId !== null && (
        <TrackerListDetailModal
          isOpen={listDetailId !== null}
          onClose={() => setListDetailId(null)}
          listId={listDetailId}
          zIndexClass="z-[10050]"
        />
      )}
    </BaseModal>
  );
};
