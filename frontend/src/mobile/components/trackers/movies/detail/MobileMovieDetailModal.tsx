// src/mobile/components/trackers/detail/MobileMovieDetailModal.tsx
import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Info, Layers, Star } from 'lucide-react';
import type { MovieDetailTarget } from '@/types/movies';
import { useMovieDetailModalLogic } from '@/components/trackers/movies/detail/useMovieDetailModalLogic';
import { useBackHandler } from '@/utils/backButtonManager';
import { MobileTrackerDetailBanner } from '../../shared/detail/MobileTrackerDetailBanner';
import {
  MobileTrackerDetailBottomBar,
  type MobileTrackerBottomBarTab,
} from '../../shared/detail/MobileTrackerDetailBottomBar';
import { MobileTrackerFriendsDrawer } from '../../shared/detail/MobileTrackerFriendsDrawer';
import { MobileTrackerListsDrawer } from '../../shared/detail/MobileTrackerListsDrawer';
import { MobileMovieOptionsModal } from './MobileMovieOptionsModal';
import { MobileTrackerListManagerModal } from '../../shared/detail/MobileTrackerListManagerModal';
import { TrackerListDetailModal } from '@/components/trackers/shared/detail/TrackerListDetailModal';
import { MobileMovieOverviewTab } from './MobileMovieOverviewTab';
import { MobileMovieSagaTab } from './MobileMovieSagaTab';
import { MobileMovieReviewTab } from './MobileMovieReviewTab';
import type { MovieDetailTabType } from '@/hooks/trackers/useMovieUrlParams';

export interface MobileMovieDetailModalProps {
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

export const MobileMovieDetailModal: React.FC<MobileMovieDetailModalProps> = ({
  isOpen,
  onClose,
  movie,
  initialTab = 'overview',
  initialReviewLogId,
  onToggleTrack,
  onSelectRecommendation,
  onGenreClick,
  onPlatformClick,
  zIndexClass = 'z-[10030]',
}) => {
  const [showOptionsModal, setShowOptionsModal] = useState(false);

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
    listDetailId,
    setListDetailId,
    isHistoricMode,
    setIsHistoricMode,
    handleClickTrack,
    handleToggleLibrary,
    handleToggleWatched,
    handleToggleObtained,
    handleRewatch,
    handleSaveCustomPoster,
    StatusIcon,
    statusColor,
  } = useMovieDetailModalLogic({
    isOpen,
    movie,
    initialTab,
    initialReviewLogId,
    onToggleTrack,
  });

  const hasCollection = Boolean(
    extras?.collection?.parts && extras.collection.parts.length > 0
  );

  // Tasti Barra Inferiore dinamici
  const tabs = useMemo<MobileTrackerBottomBarTab<MovieDetailTabType>[]>(() => {
    const list: MobileTrackerBottomBarTab<MovieDetailTabType>[] = [
      {
        id: 'overview',
        label: 'Panoramica',
        icon: (
          <Info
            className={`w-5 h-5 ${
              activeTab === 'overview' ? 'stroke-[2.5]' : 'stroke-2'
            }`}
          />
        ),
      },
    ];

    if (hasCollection) {
      list.push({
        id: 'saga',
        label: 'Saga',
        icon: (
          <Layers
            className={`w-5 h-5 ${
              activeTab === 'saga' ? 'stroke-[2.5]' : 'stroke-2'
            }`}
          />
        ),
      });
    }

    list.push({
      id: 'review',
      label: 'Recensioni',
      icon: (
        <Star
          className={`w-5 h-5 ${
            activeTab === 'review'
              ? 'fill-blue-500 text-blue-600 stroke-[2.5]'
              : 'stroke-2'
          }`}
        />
      ),
      badge: logs.length > 0 ? logs.length : undefined,
    });

    return list;
  }, [activeTab, hasCollection, logs.length]);

  // Gestione Tasto Indietro Hardware Android
  useBackHandler(
    isOpen,
    () => {
      if (isListManagerOpen) {
        setIsListManagerOpen(false);
        return true;
      }
      if (showFriendsPanel) {
        setShowFriendsPanel(false);
        return true;
      }
      if (showListsPanel) {
        setShowListsPanel(false);
        return true;
      }
      if (showOptionsModal) {
        setShowOptionsModal(false);
        return true;
      }
      if (isHistoricMode) {
        setIsHistoricMode(false);
        return true;
      }
      onClose();
      return true;
    },
    28
  );

  if (!isOpen) return null;

  const content = (
    <div
      className={`fixed inset-0 ${
        zIndexClass || 'z-[10030]'
      } bg-gray-50 flex flex-col h-[100dvh] w-full overflow-hidden pointer-events-auto animate-fadeIn select-none`}
    >
      {/* 1. BANNER FOTOGRAFICO SUPERIORE */}
      <MobileTrackerDetailBanner
        backdropUrl={backdropUrl}
        title={title}
        genres={genres}
        onGenreClick={onGenreClick}
        friends={MOVIE_FRIENDS}
        lists={listsWithMovie}
        StatusIcon={StatusIcon}
        statusColor={statusColor}
        onStatusClick={handleToggleWatched}
        onClose={onClose}
        onOpenOptions={() => setShowOptionsModal(true)}
        onOpenFriendsDrawer={() => setShowFriendsPanel(true)}
        onOpenListsDrawer={() => setShowListsPanel(true)}
        optionsTitle="Opzioni film"
        closeAriaLabel="Chiudi dettaglio film"
      />

      {/* 2. CONTENUTO SCROLLABILE (Schede Film) */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex flex-col relative">
        {activeTab === 'overview' && (
          <MobileMovieOverviewTab
            title={title}
            originalTitle={originalTitle}
            releaseYear={releaseDate ? releaseDate.substring(0, 4) : undefined}
            runtime={runtime}
            director={extras?.director}
            overview={overview}
            cast={extras?.cast}
            recommendations={extras?.recommendations}
            isLoadingExtras={isExtrasLoading}
            isUserTracked={isTracked}
            handleClickTrack={handleClickTrack}
            providersData={providersData}
            onPlatformClick={onPlatformClick}
            onSelectRecommendation={onSelectRecommendation}
          />
        )}

        {activeTab === 'saga' && (
          <MobileMovieSagaTab
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
          <MobileMovieReviewTab
            movieTmdbId={tmdbId || 0}
            movie={movie}
            userMovie={userMovie}
            initialReviewLogId={initialReviewLogId}
            onAddTracking={handleToggleLibrary}
          />
        )}
      </div>

      {/* 3. BARRA DI NAVIGAZIONE INFERIORE */}
      <MobileTrackerDetailBottomBar
        activeTab={activeTab}
        tabs={tabs}
        onTabChange={(tab) => setActiveTab(tab)}
      />

      {/* 4. DRAWERS DAL BASSO E MODALI SECONDARI */}
      <MobileTrackerFriendsDrawer
        isOpen={showFriendsPanel}
        onClose={() => setShowFriendsPanel(false)}
        friends={MOVIE_FRIENDS}
        getStatusBorderColor={getStatusBorderColor}
        mediaType="movies"
      />

      <MobileTrackerListsDrawer
        isOpen={showListsPanel}
        onClose={() => setShowListsPanel(false)}
        lists={listsWithMovie}
        onSelectList={(id) => setListDetailId(id)}
        onOpenManager={() => setIsListManagerOpen(true)}
        emptyMessage="Questo film non è ancora presente in nessuna lista."
      />

      <MobileMovieOptionsModal
        isOpen={showOptionsModal}
        onClose={() => setShowOptionsModal(false)}
        hasCustomPoster={Boolean(userMovie?.custom_poster_path)}
        onPosterUpdated={(url) => {
          if (url) {
            handleSaveCustomPoster(url);
          } else {
            handleSaveCustomPoster('');
          }
        }}
        isUserTracked={isTracked}
        isWatched={isWatched}
        watchCount={watchCount}
        onRewatch={handleRewatch}
        isObtained={isObtained}
        obtainedAt={obtainedAt}
        onToggleObtained={handleToggleObtained}
        isHistoricMode={isHistoricMode}
        onToggleHistoricMode={() => setIsHistoricMode((prev) => !prev)}
      />

      {isListManagerOpen && (
        <MobileTrackerListManagerModal
          isOpen={isListManagerOpen}
          onClose={() => setIsListManagerOpen(false)}
          movieId={tmdbId}
        />
      )}

      {listDetailId !== null && (
        <TrackerListDetailModal
          isOpen={listDetailId !== null}
          onClose={() => setListDetailId(null)}
          listId={listDetailId}
        />
      )}
    </div>
  );

  return createPortal(content, document.body);
};

export default MobileMovieDetailModal;
