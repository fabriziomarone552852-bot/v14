// src/components/trackers/SeriesDetailModal/SeriesDetailModal.tsx
import React from 'react';
import BaseModal from '@/components/shared/dialog/BaseModal';
import {
  type TMDBEpisode,
  type SeriesDetailTarget,
  type SeriesRecommendation,
  type UserSeriesTracking,
} from '@/types/trackers';
import { OverviewTab } from './OverviewTab';
import { SeasonsTab } from './SeasonsTab';
import { SeriesReviewTab } from './SeriesReviewTab';
import { MediaListManagerModal } from './MediaListManagerModal';
import { SeriesImageModal } from './SeriesImageModal';
import { SeriesDetailListsDrawer } from './SeriesDetailListsDrawer';
import { SeriesDetailFriendsDrawer } from './SeriesDetailFriendsDrawer';
import { ListDetailModal } from './ListDetailModal';
import { SeriesDetailHeader } from './SeriesDetailHeader';
import { SeriesDetailSidebar } from './SeriesDetailSidebar';
import {
  useSeriesDetailModalLogic,
  type TabType,
} from './hooks/useSeriesDetailModalLogic';
import { useTrackersMutations } from '@/hooks/mutations/useTrackersMutations';

export type { TabType } from './hooks/useSeriesDetailModalLogic';

interface SeriesDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  series: SeriesDetailTarget | UserSeriesTracking;
  initialTab?: TabType;
  initialEpisode?: TMDBEpisode | null;
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
  initialReviewLogId,
  onToggleTrack,
  onSelectRecommendation,
  onGenreClick,
  onPlatformClick,
  zIndexClass,
}) => {
  const { updateSeries } = useTrackersMutations();

  const {
    activeTab,
    setActiveTab,
    internalEpisode,
    setInternalEpisode,
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
    StatusIcon,
    statusColor,
    statusText,
    SERIES_FRIENDS,
    isFriendsLoading,
    getStatusBorderColor,
  } = useSeriesDetailModalLogic({
    isOpen,
    series,
    initialTab,
    initialEpisode,
    initialReviewLogId,
    onToggleTrack,
  });

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
          genres={genres}
          onGenreClick={onGenreClick}
          providersData={providersData}
          onPlatformClick={onPlatformClick}
          isFriendsLoading={isFriendsLoading}
          friends={SERIES_FRIENDS}
          onOpenFriendsPanel={() => setShowFriendsPanel(true)}
          getStatusBorderColor={getStatusBorderColor}
          listsWithSeries={listsWithSeries}
          onOpenListManager={() => setIsListManagerOpen(true)}
          onOpenListDrawer={(id) => {
            if (id) {
              setListDetailId(id);
            } else {
              setShowListsPanel(true);
            }
          }}
        />

        {/* CONTENUTO PRINCIPALE */}
        <div className="flex-1 flex min-h-0 relative z-10">
          {/* COLONNA SINISTRA (Locandina, stato, menu schede) */}
          <SeriesDetailSidebar
            posterUrl={posterUrl}
            title={title}
            userTracking={userTracking}
            isPressing={isPressing}
            handleMouseDown={handleMouseDown}
            handleMouseUp={handleMouseUp}
            handleTouchStart={handleTouchStart}
            handleTouchEnd={handleTouchEnd}
            handleClickTrack={handleClickTrack}
            statusColor={statusColor}
            statusText={statusText}
            StatusIcon={StatusIcon}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onOpenImageModal={() => setIsImageModalOpen(true)}
          />

          {/* COLONNA DESTRA (Schede dinamiche) */}
          <div className="flex-1 overflow-y-auto bg-transparent modal-scrollbar p-6 relative z-10">
            {activeTab === 'overview' && (
              <OverviewTab
                tmdbSeries={tmdbSeries}
                onSelectRecommendation={onSelectRecommendation}
                isLoading={false}
              />
            )}
            {activeTab === 'seasons' && (
              <SeasonsTab
                tmdbSeries={tmdbSeries}
                userTracking={userTracking}
                initialEpisode={internalEpisode}
                initialReviewLogId={internalReviewLogId}
                isLoading={false}
              />
            )}
            {activeTab === 'review' && (
              <SeriesReviewTab
                tmdbSeries={tmdbSeries}
                userTracking={userTracking}
                initialReviewLogId={internalReviewLogId}
                onOpenEpisode={(ep) => {
                  setInternalEpisode(ep);
                  setActiveTab('seasons');
                }}
              />
            )}
          </div>
        </div>

        {/* SIDEBAR LISTE */}
        <SeriesDetailListsDrawer
          isOpen={showListsPanel}
          onClose={() => setShowListsPanel(false)}
          lists={listsWithSeries}
          onSelectList={(id) => setListDetailId(id)}
          onOpenManager={() => setIsListManagerOpen(true)}
        />

        {/* SIDEBAR AMICI */}
        <SeriesDetailFriendsDrawer
          isOpen={showFriendsPanel}
          onClose={() => setShowFriendsPanel(false)}
          friends={SERIES_FRIENDS}
          getStatusBorderColor={getStatusBorderColor}
        />
      </div>

      {isListManagerOpen && (
        <MediaListManagerModal
          isOpen={isListManagerOpen}
          onClose={() => setIsListManagerOpen(false)}
          seriesId={tmdbSeries.tmdb_id}
          zIndexClass="z-[10050]"
        />
      )}

      {isImageModalOpen && (
        <SeriesImageModal
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
        <ListDetailModal
          isOpen={listDetailId !== null}
          onClose={() => setListDetailId(null)}
          listId={listDetailId}
          zIndexClass="z-[10050]"
        />
      )}
    </BaseModal>
  );
};
