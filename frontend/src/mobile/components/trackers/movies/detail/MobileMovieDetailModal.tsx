// src/mobile/components/trackers/detail/MobileMovieDetailModal.tsx
import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Clock, Info, Layers, Star } from 'lucide-react';
import type { MovieDetailTarget } from '@/types/movies';
import { useMovieDetailModalLogic } from '@/components/trackers/movies/detail/useMovieDetailModalLogic';
import { useBackHandler } from '@/utils/backButtonManager';
import { MobileTrackerDetailBanner } from '../../shared/detail/MobileTrackerDetailBanner';
import {
  MobileTrackerDetailBottomBar,
  type MobileTrackerBottomBarTab,
} from '../../shared/detail/MobileTrackerDetailBottomBar';
import { useTrackerPersonNavigation } from '@/hooks/trackers/useTrackerPersonNavigation';
import { MobileMovieOverviewTab } from './MobileMovieOverviewTab';
import { MobileMovieSagaTab } from './MobileMovieSagaTab';
import { MobileMovieReviewTab } from './MobileMovieReviewTab';
import { MobileCinemaShowtimesView } from '../cinema/MobileCinemaShowtimesView';
import { MobileMovieDetailDrawers } from './MobileMovieDetailDrawers';
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
  const [isProvinceModalOpen, setIsProvinceModalOpen] = useState(false);

  const {
    tmdbId,
    userMovie,
    resolvedMovie,
    isMovieDetailLoading,
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
    hasCinemaShowtimes,
    cinemaProvinces,
    selectedProvinceSlug,
    currentProvinceName,
    matchedCinemaIdf,
    handleSelectCinemaProvince,
  } = useMovieDetailModalLogic({
    isOpen,
    movie,
    initialTab,
    initialReviewLogId,
    onToggleTrack,
  });

  const {
    selectedPerson,
    openPersonDetail,
    closePersonDetail,
    handleSelectMovie,
    handleSelectSeries,
  } = useTrackerPersonNavigation({
    mediaType: 'movie',
    onSelectSameMedia: (targetTmdbId) => onSelectRecommendation?.({ tmdb_id: targetTmdbId }),
    onCloseParentModal: onClose,
  });

  const hasCollection = Boolean(
    extras?.collection?.parts && extras.collection.parts.length > 0
  );
  const showCinemaTab = Boolean(hasCinemaShowtimes || activeTab === 'cinema');

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

    if (showCinemaTab) {
      list.push({
        id: 'cinema',
        label: 'Orari',
        icon: (
          <Clock
            className={`w-5 h-5 ${
              activeTab === 'cinema' ? 'stroke-[2.5]' : 'stroke-2'
            }`}
          />
        ),
      });
    }

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
  }, [activeTab, showCinemaTab, hasCollection, logs.length]);

  // Gestione Tasto Indietro Hardware Android
  useBackHandler(
    isOpen,
    () => {
      if (isProvinceModalOpen) {
        setIsProvinceModalOpen(false);
        return true;
      }
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
            directors={extras?.directors}
            overview={overview}
            cast={extras?.cast}
            recommendations={extras?.recommendations}
            isLoadingExtras={isExtrasLoading || (isMovieDetailLoading && !overview)}
            isUserTracked={isTracked}
            handleClickTrack={handleClickTrack}
            providersData={providersData}
            onPlatformClick={onPlatformClick}
            onSelectRecommendation={onSelectRecommendation}
            onPersonClick={openPersonDetail}
          />
        )}

        {activeTab === 'cinema' && (
          <MobileCinemaShowtimesView
            provinceSlug={selectedProvinceSlug}
            provinceName={currentProvinceName}
            idf={matchedCinemaIdf}
            tmdbId={tmdbId}
            movieTitle={title}
            onChangeProvinceClick={() => setIsProvinceModalOpen(true)}
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
            movie={resolvedMovie}
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
      <MobileMovieDetailDrawers
        tmdbId={tmdbId}
        hasCustomPoster={Boolean(userMovie?.custom_poster_path)}
        onSaveCustomPoster={handleSaveCustomPoster}
        isTracked={isTracked}
        isWatched={isWatched}
        watchCount={watchCount}
        onRewatch={handleRewatch}
        isObtained={isObtained}
        obtainedAt={obtainedAt}
        onToggleObtained={handleToggleObtained}
        isHistoricMode={isHistoricMode}
        onToggleHistoricMode={() => setIsHistoricMode((prev) => !prev)}
        showFriendsPanel={showFriendsPanel}
        onCloseFriendsPanel={() => setShowFriendsPanel(false)}
        friends={MOVIE_FRIENDS}
        getStatusBorderColor={getStatusBorderColor}
        showListsPanel={showListsPanel}
        onCloseListsPanel={() => setShowListsPanel(false)}
        listsWithMovie={listsWithMovie}
        onSelectList={(id) => setListDetailId(id)}
        showOptionsModal={showOptionsModal}
        onCloseOptionsModal={() => setShowOptionsModal(false)}
        isListManagerOpen={isListManagerOpen}
        onOpenListManager={() => setIsListManagerOpen(true)}
        onCloseListManager={() => setIsListManagerOpen(false)}
        listDetailId={listDetailId}
        onCloseListDetail={() => setListDetailId(null)}
        selectedPerson={selectedPerson}
        onClosePersonDetail={closePersonDetail}
        onSelectMovie={handleSelectMovie}
        onSelectSeries={handleSelectSeries}
        isProvinceModalOpen={isProvinceModalOpen}
        onCloseProvinceModal={() => setIsProvinceModalOpen(false)}
        cinemaProvinces={cinemaProvinces}
        selectedProvinceSlug={selectedProvinceSlug}
        onSelectProvince={handleSelectCinemaProvince}
      />
    </div>
  );

  return createPortal(content, document.body);
};

export default MobileMovieDetailModal;
