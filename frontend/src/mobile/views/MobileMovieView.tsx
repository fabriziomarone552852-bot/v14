// src/mobile/views/MobileMovieView.tsx
import React, { useState, useCallback } from 'react';
import PageLoadingState from '@/components/shared/feedback/PageLoadingState';
import PageErrorState from '@/components/shared/feedback/PageErrorState';
import { useMoviePageLogic } from '@/hooks/trackers/useMoviePageLogic';
import { DEFAULT_MOVIE_FILTERS } from '@/hooks/trackers/useMovieFilterOptions';
import RandomTrackerModal from '@/components/trackers/shared/RandomTrackerModal';
import { MobileMovieDetailModal } from '../components/trackers/movies/detail';
import { MobileMovieStatsModal } from '../components/trackers/movies/stats';
import { MobileMovieSearchModal } from '../components/trackers/movies/MobileMovieSearchModal';
import { MobileMovieCatalogModal } from '../components/trackers/movies/MobileMovieCatalogModal';
import { MobileMovieDashboardSlide } from '../components/trackers/movies/MobileMovieDashboardSlide';
import { MobileMovieUpcomingSlide } from '../components/trackers/movies/MobileMovieUpcomingSlide';
import {
  MobileTrackerPaginationDots,
  MobileTrackerPersonalListsModal,
} from '../components/trackers/shared';
import { useTrackerHeader } from '@/context/TrackerHeaderContext';
import { useMobileHorizontalSlidePages } from '../hooks/useMobileHorizontalSlidePages';
import type { Movie } from '@/types/movies';

export const MobileMovieView: React.FC = () => {
  const {
    movies,
    isLoading,
    isError,
    handleRetry,
    goalPercent,
    currentMovies,
    goal,
    setStatsModalOpen,
    statsModalOpen,
    setRandomModalOpen,
    isRandomModalOpen,
    openMovieDetail,
    detailModalOpen,
    setDetailModalOpen,
    detailModalMovie,
    detailModalTab,
    detailModalReviewLogId,
    myQuotes,
    filters,
    searchQuery,
    hasActiveFilters,
    handleFilterChange,
    handleResetFilters,
    debouncedQuery,
    setDebouncedQuery,
    isSearchLoading,
    isDiscoverLoading,
    searchResults,
    discoverData,
    handleAdd,
    isFilterModalOpen,
    setIsFilterModalOpen,
    myLists,
    handleToggleTrack,
    hasMoreResults,
    isFetchingMore,
    fetchMoreResults,
  } = useMoviePageLogic();

  const handleMobileGenreClick = useCallback(
    (genreName: string) => {
      handleFilterChange({
        ...DEFAULT_MOVIE_FILTERS,
        genres: { include: [genreName], exclude: [], mode: 'OR' },
        globalSearch: true,
      });
      setDebouncedQuery('');
      setDetailModalOpen(false);
      setIsFilterModalOpen(true);
    },
    [handleFilterChange, setDebouncedQuery, setDetailModalOpen, setIsFilterModalOpen]
  );

  const handleMobilePlatformClick = useCallback(
    (platformName: string) => {
      handleFilterChange({
        ...DEFAULT_MOVIE_FILTERS,
        platforms: [platformName],
        globalSearch: true,
      });
      setDebouncedQuery('');
      setDetailModalOpen(false);
      setIsFilterModalOpen(true);
    },
    [handleFilterChange, setDebouncedQuery, setDetailModalOpen, setIsFilterModalOpen]
  );

  const handleOpenSearch = useCallback(() => {
    setIsFilterModalOpen(true);
  }, [setIsFilterModalOpen]);

  const handleOpenRandom = useCallback(() => {
    setRandomModalOpen(true);
  }, [setRandomModalOpen]);

  useTrackerHeader({
    onOpenSearch: handleOpenSearch,
    onOpenRandom: handleOpenRandom,
    hasActiveFilters: hasActiveFilters || Boolean(searchQuery) || Boolean(debouncedQuery),
  });

  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [isPersonalListsModalOpen, setIsPersonalListsModalOpen] = useState(false);

  // Paginazione lineare a 2 slide: 0 = Al Cinema & Prossime Uscite, 1 = Dashboard
  const {
    activePageIndex,
    setActivePageIndex,
    getSlideClass,
    handleTouchStart,
    handleTouchEnd,
  } = useMobileHorizontalSlidePages<0 | 1>({
    pageCount: 2,
    initialPage: 0,
    circular: false,
  });

  if (isLoading) {
    return <PageLoadingState messages={['Caricamento Film Mobile...']} />;
  }

  if (isError) {
    return (
      <PageErrorState message="Errore nel caricamento dei film." onRetry={handleRetry} />
    );
  }

  const watchedMovies = movies?.filter((m) => m.status === 'watched') || [];
  const toWatchMovies = movies?.filter((m) => m.status === 'to_watch') || [];
  const obtainedMovies = movies?.filter((m) => Boolean(m.obtained_at)) || [];

  const lastAdded =
    toWatchMovies.length > 0
      ? [...toWatchMovies].sort(
          (a, b) =>
            new Date(b.added_at || b.updated_at || 0).getTime() -
            new Date(a.added_at || a.updated_at || 0).getTime()
        )[0]
      : movies && movies.length > 0
      ? [...movies].sort(
          (a, b) =>
            new Date(b.added_at || b.updated_at || 0).getTime() -
            new Date(a.added_at || a.updated_at || 0).getTime()
        )[0]
      : null;

  const lastObtained =
    obtainedMovies.length > 0
      ? [...obtainedMovies].sort(
          (a, b) =>
            new Date(b.obtained_at || 0).getTime() -
            new Date(a.obtained_at || 0).getTime()
        )[0]
      : null;

  const lastWatched =
    watchedMovies.length > 0
      ? [...watchedMovies].sort(
          (a, b) =>
            new Date(b.my_last_watched_at || b.updated_at || 0).getTime() -
            new Date(a.my_last_watched_at || a.updated_at || 0).getTime()
        )[0]
      : null;

  const nextToWatch =
    toWatchMovies.length > 0
      ? [...toWatchMovies].sort(
          (a, b) =>
            new Date(b.added_at || b.updated_at || 0).getTime() -
            new Date(a.added_at || a.updated_at || 0).getTime()
        )[0]
      : null;

  return (
    <div
      className="h-full w-full flex flex-col justify-between overflow-hidden animate-fadeIn relative select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex-1 min-h-0 relative overflow-hidden">
        {/* PAGINA 0: AL CINEMA & PROSSIME USCITE */}
        <div
          className={`absolute inset-0 w-full h-full flex flex-col transition-all duration-300 ease-out ${getSlideClass(0)}`}
        >
          <MobileMovieUpcomingSlide
            activePageIndex={activePageIndex}
            movies={movies}
            onOpenMovieDetail={openMovieDetail}
          />
        </div>

        {/* PAGINA 1: DASHBOARD, OBIETTIVO, CATALOGO & LISTE */}
        <MobileMovieDashboardSlide
          className={getSlideClass(1)}
          activePageIndex={activePageIndex}
          goalPercent={goalPercent}
          currentMovies={currentMovies}
          goal={goal}
          lastAdded={lastAdded}
          lastWatched={lastWatched}
          lastObtained={lastObtained}
          nextToWatch={nextToWatch}
          myQuotes={myQuotes}
          movies={movies}
          myLists={myLists}
          onOpenMovieDetail={openMovieDetail}
          onOpenStats={() => setStatsModalOpen(true)}
          onOpenCatalog={() => setIsCatalogModalOpen(true)}
          onOpenPersonalLists={() => setIsPersonalListsModalOpen(true)}
        />
      </div>

      <MobileTrackerPaginationDots
        activePageIndex={activePageIndex}
        onSelectPage={(idx: number) => setActivePageIndex(idx as 0 | 1)}
        labels={['Al Cinema & Uscite', 'Dashboard']}
      />

      {detailModalOpen && detailModalMovie && (
        <MobileMovieDetailModal
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          movie={detailModalMovie}
          initialTab={detailModalTab}
          initialReviewLogId={detailModalReviewLogId}
          onToggleTrack={handleToggleTrack}
          onSelectRecommendation={(rec) => openMovieDetail(rec)}
          onGenreClick={handleMobileGenreClick}
          onPlatformClick={handleMobilePlatformClick}
          zIndexClass="z-[10030]"
        />
      )}

      <MobileMovieStatsModal
        isOpen={statsModalOpen}
        onClose={() => setStatsModalOpen(false)}
      />

      <MobileMovieCatalogModal
        isOpen={isCatalogModalOpen}
        onClose={() => setIsCatalogModalOpen(false)}
        movies={movies || []}
        myLists={myLists}
        onOpenMovieDetail={openMovieDetail}
      />

      <MobileTrackerPersonalListsModal
        isOpen={isPersonalListsModalOpen}
        onClose={() => setIsPersonalListsModalOpen(false)}
        mediaType="movie"
        myLists={myLists || []}
        movies={movies || []}
        onOpenMovieDetail={openMovieDetail}
      />

      <MobileMovieSearchModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
        movies={movies || []}
        myLists={myLists}
        debouncedQuery={debouncedQuery}
        setDebouncedQuery={setDebouncedQuery}
        searchResults={searchResults}
        discoverData={discoverData}
        isSearchLoading={isSearchLoading}
        isDiscoverLoading={isDiscoverLoading}
        onCardClick={(target) => openMovieDetail(target)}
        onAddClick={handleAdd}
        onToggleTrack={(tmdbId, isTracked) => handleToggleTrack(tmdbId, isTracked)}
        hasMoreResults={hasMoreResults}
        isFetchingMore={isFetchingMore}
        onFetchMore={fetchMoreResults}
      />

      <RandomTrackerModal
        isOpen={isRandomModalOpen}
        onClose={() => setRandomModalOpen(false)}
        items={movies || []}
        onItemClick={(movieItem) => {
          setRandomModalOpen(false);
          openMovieDetail(movieItem as Movie);
        }}
        modalTitle="Cosa guardare oggi?"
        emptyMessage="Nessun film salvato nella libreria."
        noUnstartedMessage="Non hai nessun film da iniziare nella lista!"
        fullScreen={true}
      />
    </div>
  );
};

export default MobileMovieView;
