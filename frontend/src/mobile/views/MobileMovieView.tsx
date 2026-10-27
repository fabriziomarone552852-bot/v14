// src/mobile/views/MobileMovieView.tsx
import React, { useState, useCallback } from 'react';
import PageLoadingState from '@/components/shared/feedback/PageLoadingState';
import PageErrorState from '@/components/shared/feedback/PageErrorState';
import { useMoviePageLogic } from '@/hooks/trackers/useMoviePageLogic';
import RandomMediaModal from '@/components/trackers/RandomMediaModal';
import { MovieDetailModal } from '@/components/trackers/movies/detail/MovieDetailModal';
import { MovieStatsModal } from '@/components/trackers/movies/stats/MovieStatsModal';
import { MobileMovieSearchModal } from '../components/trackers/movies/MobileMovieSearchModal';
import { MobileMovieDashboardSlide } from '../components/trackers/movies/MobileMovieDashboardSlide';
import { MobileMovieUpcomingSlide } from '../components/trackers/movies/MobileMovieUpcomingSlide';
import { MobileTrackerPaginationDots } from '../components/trackers/shared';
import { useTrackerHeader } from '@/context/TrackerHeaderContext';
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
    handleGenreClick,
    handlePlatformClick,
    hasMoreResults,
    isFetchingMore,
    fetchMoreResults,
  } = useMoviePageLogic();

  // Configurazione header mobile (lente ricerca e bottone random)
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

  // Paginazione a 2 slide:
  // 0 = Cinema & Prossime Uscite (La prima pagina)
  // 1 = Dashboard & Obiettivo annuale, Catalogo, Liste
  const [activePageIndex, setActivePageIndex] = useState<0 | 1>(0);

  // Calcolo classi di posizionamento orizzontale a 2 slide
  const getSlideClass = (pageIdx: 0 | 1) => {
    const diff = pageIdx - activePageIndex;
    if (diff === 0) {
      return 'translate-x-0 pointer-events-auto z-10 opacity-100';
    }
    if (diff > 0) {
      return 'translate-x-full pointer-events-none z-0 opacity-0';
    }
    return '-translate-x-full pointer-events-none z-0 opacity-0';
  };

  // Touch Swipe
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || touchStartY === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    const deltaY = e.changedTouches[0].clientY - touchStartY;
    setTouchStartX(null);
    setTouchStartY(null);

    if (Math.abs(deltaY) > Math.abs(deltaX)) return;
    if (Math.abs(deltaX) < 45) return;

    if (deltaX < 0) {
      // Swipe verso sinistra -> vai a Pagina 1 (Dashboard)
      setActivePageIndex(1);
    } else if (deltaX > 0) {
      // Swipe verso destra -> vai a Pagina 0 (Cinema & Uscite)
      setActivePageIndex(0);
    }
  };

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
      {/* AREA PRINCIPALE DELLE PAGINE CON ANIMAZIONE SLIDE ORIZZONTALE */}
      <div className="flex-1 min-h-0 relative overflow-hidden">
        {/* ===================================================================== */}
        {/* PAGINA 0: AL CINEMA & PROSSIME USCITE (La prima pagina)               */}
        {/* ===================================================================== */}
        <div
          className={`absolute inset-0 w-full h-full flex flex-col transition-all duration-300 ease-out ${getSlideClass(0)}`}
        >
          <MobileMovieUpcomingSlide
            activePageIndex={activePageIndex}
            movies={movies}
            onOpenMovieDetail={openMovieDetail}
          />
        </div>

        {/* ===================================================================== */}
        {/* PAGINA 1: DASHBOARD, OBIETTIVO, CATALOGO & LISTE                     */}
        {/* ===================================================================== */}
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
          onOpenCatalog={() => setIsFilterModalOpen(true)}
          onOpenPersonalLists={() => setIsFilterModalOpen(true)}
        />
      </div>

      {/* 2. INDICATORE DI PAGINAZIONE TOUCH IN BASSO (SLIDER DOTS) */}
      <MobileTrackerPaginationDots
        activePageIndex={activePageIndex}
        onSelectPage={(idx: number) => setActivePageIndex(idx as 0 | 1)}
        labels={['Al Cinema & Uscite', 'Dashboard']}
      />

      {/* MODALI */}
      {detailModalOpen && detailModalMovie && (
        <MovieDetailModal
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          movie={detailModalMovie}
          initialTab={detailModalTab}
          initialReviewLogId={detailModalReviewLogId}
          onToggleTrack={handleToggleTrack}
          onSelectRecommendation={(rec) => openMovieDetail(rec)}
          onGenreClick={handleGenreClick}
          onPlatformClick={handlePlatformClick}
        />
      )}

      {statsModalOpen && <MovieStatsModal onClose={() => setStatsModalOpen(false)} />}

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

      <RandomMediaModal
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
