// src/views/MoviePage.tsx
import React from 'react';
import PageLoadingState from '@/components/shared/feedback/PageLoadingState';
import PageErrorState from '@/components/shared/feedback/PageErrorState';
import { MovieHeader } from '@/components/trackers/movies/MovieHeader';
import { TopMovieCards } from '@/components/trackers/movies/TopMovieCards';
import { MovieLibrary } from '@/components/trackers/movies/MovieLibrary';
import { MovieQuoteWidget } from '@/components/trackers/movies/MovieQuoteWidget';
import { UpcomingMoviesWidget } from '@/components/trackers/movies/UpcomingMoviesWidget';
import { UpcomingMovieCalendarWidget } from '@/components/trackers/movies/UpcomingMovieCalendarWidget';
import RandomMediaModal from '@/components/trackers/RandomMediaModal';
import { MovieDetailModal } from '@/components/trackers/movies/detail/MovieDetailModal';
import { MovieStatsModal } from '@/components/trackers/movies/stats/MovieStatsModal';
import { MovieFilterModal } from '@/components/trackers/movies/MovieFilterModal';
import { useMoviePageLogic } from '@/hooks/trackers/useMoviePageLogic';
import type { Movie } from '@/types/movies';

const MoviePage: React.FC = () => {
  const {
    movies,
    isLoading,
    isError,
    handleRetry,
    goalPercent,
    goalViewType,
    setGoalViewType,
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
    setDetailModalMovie,
    detailModalTab,
    setDetailModalTab,
    detailModalReviewLogId,
    displayMovies,
    myQuotes,
    isQuoteExpanded,
    setIsQuoteExpanded,
    filters,
    searchQuery,
    hasActiveFilters,
    handleFilterChange,
    handleResetFilters,
    activeTab,
    setActiveTab,
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

  if (isLoading) {
    return <PageLoadingState messages={['Caricamento Libreria Film...']} />;
  }

  if (isError) {
    return (
      <PageErrorState message="Errore nel caricamento dei Film." onRetry={handleRetry} />
    );
  }

  return (
    <div className="flex flex-col gap-5 max-w-[1600px] mx-auto min-h-full xl:h-full xl:overflow-hidden relative p-2 xl:p-0">
      <MovieHeader
        goalPercent={goalPercent}
        goalViewType={goalViewType}
        setGoalViewType={setGoalViewType}
        currentMovies={currentMovies}
        goal={goal}
        setStatsModalOpen={setStatsModalOpen}
        setRandomModalOpen={setRandomModalOpen}
      />

      {/* TOP ROW: 3 GLASS CARDS */}
      <TopMovieCards movies={movies} openMovieDetail={openMovieDetail} />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        <MovieLibrary
          setIsFilterModalOpen={setIsFilterModalOpen}
          hasActiveFilters={hasActiveFilters}
          searchQuery={searchQuery}
          setDebouncedQuery={setDebouncedQuery}
          handleFilterChange={handleFilterChange}
          filters={filters}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          debouncedQuery={debouncedQuery}
          isSearchLoading={isSearchLoading}
          isDiscoverLoading={isDiscoverLoading}
          searchResults={searchResults}
          discoverData={discoverData}
          movies={movies}
          setDetailModalMovie={setDetailModalMovie}
          setDetailModalTab={setDetailModalTab}
          setDetailModalOpen={setDetailModalOpen}
          handleAdd={handleAdd}
          displayMovies={displayMovies}
          openMovieDetail={openMovieDetail}
          hasMoreResults={hasMoreResults}
          isFetchingMore={isFetchingMore}
          fetchMoreResults={fetchMoreResults}
        />

        {/* SIDEBAR (4 Colonne) */}
        <div className="xl:col-span-4 flex flex-col gap-6 h-[600px] xl:h-full min-h-0 overflow-y-auto no-scrollbar pr-2">
          {/* CITAZIONI (Espandibile al click) */}
          <MovieQuoteWidget
            myQuotes={myQuotes}
            isQuoteExpanded={isQuoteExpanded}
            setIsQuoteExpanded={setIsQuoteExpanded}
          />

          {/* CALENDARIO / PROSSIME USCITE */}
          <div className="mx-2 mb-4 overflow-visible flex-1 flex flex-col min-h-0 relative">
            <div
              className={`absolute inset-0 transition-all duration-500 ease-in-out origin-top flex flex-col min-h-0 ${
                isQuoteExpanded
                  ? 'opacity-0 pointer-events-none translate-y-4'
                  : 'opacity-100 translate-y-0 delay-100'
              }`}
            >
              <UpcomingMovieCalendarWidget openMovieDetail={openMovieDetail} />
            </div>
            <div
              className={`absolute top-0 left-0 right-0 transition-all duration-500 ease-in-out origin-top flex flex-col min-h-0 ${
                isQuoteExpanded
                  ? 'opacity-100 translate-y-0 delay-100'
                  : 'opacity-0 pointer-events-none -translate-y-4'
              }`}
            >
              <UpcomingMoviesWidget openMovieDetail={openMovieDetail} />
            </div>
          </div>
        </div>
      </div>

      {/* Modal Random Chooser */}
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
      />

      {/* Modal Dettaglio Film */}
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

      {/* Modal Statistiche Film */}
      {statsModalOpen && <MovieStatsModal onClose={() => setStatsModalOpen(false)} />}

      {/* Modal Filtri & Ricerca Approfondita */}
      <MovieFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
        movies={movies || []}
        myLists={myLists}
      />
    </div>
  );
};

export default MoviePage;
