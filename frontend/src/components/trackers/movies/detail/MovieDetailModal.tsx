import React from 'react';
import BaseModal from '@/components/shared/dialog/BaseModal';
import type { MovieDetailTarget } from '@/types/movies';
import { useMovieDetailModalLogic } from './useMovieDetailModalLogic';
import { MovieDetailHeader } from './MovieDetailHeader';
import { MovieDetailSidebar } from './MovieDetailSidebar';
import { MovieOverviewTab } from './MovieOverviewTab';
import { MovieSagaTab } from './MovieSagaTab';
import { MovieReviewTab } from './MovieReviewTab';
import { SeriesDetailListsDrawer } from '@/components/trackers/SeriesDetailModal/SeriesDetailListsDrawer';
import { SeriesDetailFriendsDrawer } from '@/components/trackers/SeriesDetailModal/SeriesDetailFriendsDrawer';
import { MediaListManagerModal } from '@/components/trackers/SeriesDetailModal/MediaListManagerModal';
import { SeriesImageModal } from '@/components/trackers/SeriesDetailModal/SeriesImageModal';
import { ListDetailModal } from '@/components/trackers/SeriesDetailModal/ListDetailModal';
import type { MovieDetailTabType } from '@/hooks/trackers/useMovieUrlParams';

export interface MovieDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie: MovieDetailTarget;
  initialTab?: MovieDetailTabType;
  initialReviewLogId?: number;
  onToggleTrack?: (tmdbId: number, isTracked: boolean) => void;
  onSelectRecommendation?: (movie: MovieDetailTarget) => void;
  onGenreClick?: (genre: string) => void;
  onPlatformClick?: (platform: string) => void;
  zIndexClass?: string;
}

export const MovieDetailModal: React.FC<MovieDetailModalProps> = ({
  isOpen,
  onClose,
  movie,
  initialTab = 'overview',
  initialReviewLogId,
  onToggleTrack,
  onSelectRecommendation,
  onGenreClick,
  onPlatformClick,
  zIndexClass = 'z-[10020]',
}) => {
  const {
    tmdbId,
    userMovie,
    extras,
    isExtrasLoading,
    providersData,
    listsWithMovie,
    MOVIE_FRIENDS,
    getStatusBorderColor,
    title,
    originalTitle,
    overview,
    runtime,
    releaseDate,
    posterUrl,
    backdropUrl,
    genres,
    isTracked,
    isWatched,
    isObtained,
    obtainedAt,
    watchCount,
    logs,
    activeTab,
    setActiveTab,
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
    isHistoricMode,
    setIsHistoricMode,
    isPressing,
    handleMouseDown,
    handleMouseUp,
    handleTouchStart,
    handleTouchEnd,
    handleClickTrack,
    handleToggleLibrary,
    handleToggleObtained,
    handleRewatch,
    handleSaveCustomPoster,
    isFriendsLoading,
  } = useMovieDetailModalLogic({
    isOpen,
    movie,
    initialTab,
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
      zIndexClass={zIndexClass}
    >
      <div className="-m-6 relative flex flex-col min-h-[70vh] max-h-[85vh] rounded-2xl overflow-hidden bg-gray-50">
        {/* TESTATA CON BACKDROP, BADGE E AMICI */}
        <MovieDetailHeader
          backdropUrl={backdropUrl}
          onClose={onClose}
          isUserTracked={isTracked}
          isWatched={isWatched}
          watchCount={watchCount}
          onRewatch={handleRewatch}
          isObtained={isObtained}
          obtainedAt={obtainedAt}
          onToggleObtained={handleToggleObtained}
          isHistoricMode={isHistoricMode}
          onToggleHistoricMode={() => {
            setIsHistoricMode((prev) => !prev);
          }}
          genres={genres}
          onGenreClick={onGenreClick}
          providersData={providersData}
          onPlatformClick={onPlatformClick}
          isFriendsLoading={isFriendsLoading}
          friends={MOVIE_FRIENDS}
          onOpenFriendsPanel={() => setShowFriendsPanel(true)}
          getStatusBorderColor={getStatusBorderColor}
          listsWithMovie={listsWithMovie}
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
        <div className="flex-1 flex min-h-0 relative z-20">
          {/* COLONNA SINISTRA (Locandina sovrapposta, menu schede) */}
          <MovieDetailSidebar
            posterUrl={posterUrl}
            title={title}
            isTracked={isTracked}
            isWatched={isWatched}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onToggleLibrary={handleToggleLibrary}
            onOpenImageModal={() => setIsImageModalOpen(true)}
            isPressing={isPressing}
            handleMouseDown={handleMouseDown}
            handleMouseUp={handleMouseUp}
            handleTouchStart={handleTouchStart}
            handleTouchEnd={handleTouchEnd}
            handleClickTrack={handleClickTrack}
            hasCollection={Boolean(extras?.collection?.parts && extras.collection.parts.length > 0)}
            reviewsCount={logs.length}
          />

          {/* COLONNA DESTRA (Schede dinamiche con scrollbar personalizzata) */}
          <div className="flex-1 overflow-y-auto bg-transparent modal-scrollbar p-6 relative z-10">
            {activeTab === 'overview' && (
              <MovieOverviewTab
                title={title}
                originalTitle={originalTitle}
                releaseYear={releaseDate ? releaseDate.substring(0, 4) : undefined}
                runtime={runtime}
                director={extras?.director}
                overview={overview}
                cast={extras?.cast}
                recommendations={extras?.recommendations}
                isLoadingExtras={isExtrasLoading}
                onSelectRecommendation={onSelectRecommendation}
              />
            )}

            {activeTab === 'saga' && (
              <MovieSagaTab
                collection={extras?.collection}
                currentMovieId={tmdbId}
                isLoading={isExtrasLoading}
                onSelectMovie={(selected) => onSelectRecommendation?.(selected)}
                onQuickAdd={(sagaTmdbId) => {
                  if (onToggleTrack) onToggleTrack(sagaTmdbId, false);
                }}
              />
            )}

            {activeTab === 'review' && (
              <MovieReviewTab
                movieTmdbId={tmdbId || 0}
                movie={movie}
                userMovie={userMovie}
                initialReviewLogId={initialReviewLogId}
                onAddTracking={handleToggleLibrary}
              />
            )}
          </div>
        </div>

        {/* SIDEBAR LISTE */}
        <SeriesDetailListsDrawer
          isOpen={showListsPanel}
          onClose={() => setShowListsPanel(false)}
          lists={listsWithMovie}
          onSelectList={(id) => setListDetailId(id)}
          onOpenManager={() => setIsListManagerOpen(true)}
        />

        {/* SIDEBAR AMICI */}
        <SeriesDetailFriendsDrawer
          isOpen={showFriendsPanel}
          onClose={() => setShowFriendsPanel(false)}
          friends={MOVIE_FRIENDS}
          getStatusBorderColor={getStatusBorderColor}
          mediaType="movies"
        />
      </div>

      {/* MODALE GESTIONE LISTE */}
      {isListManagerOpen && (
        <MediaListManagerModal
          isOpen={isListManagerOpen}
          onClose={() => setIsListManagerOpen(false)}
          movieId={tmdbId}
          zIndexClass="z-[10050]"
        />
      )}

      {/* MODALE CAMBIA IMMAGINE / LOCANDINA */}
      {isImageModalOpen && (
        <SeriesImageModal
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          currentUrl={posterUrl}
          zIndexClass="z-[10050]"
          onSave={handleSaveCustomPoster}
        />
      )}

      {/* MODALE DETTAGLIO LISTA */}
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
