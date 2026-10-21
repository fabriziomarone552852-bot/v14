// src/views/TVSeriesPage.tsx
import React from 'react';
import PageLoadingState from '@/components/shared/feedback/PageLoadingState';
import PageErrorState from '@/components/shared/feedback/PageErrorState';
import { TVSeriesHeader } from '@/components/trackers/TVSeriesHeader';
import { TVSeriesLibrary } from '@/components/trackers/TVSeriesLibrary';
import { TopSeriesCards } from '@/components/trackers/TopSeriesCards';
import { DailyQuoteWidget } from '@/components/trackers/DailyQuoteWidget';
import { UpcomingCalendarWidget } from '@/components/trackers/UpcomingCalendarWidget';
import { UpcomingEpisodesWidget } from '@/components/trackers/UpcomingEpisodesWidget';
import RandomMediaModal from '@/components/trackers/RandomMediaModal';
import SeriesStatsModal from '@/components/trackers/SeriesStatsModal';
import { SeriesDetailModal } from '@/components/trackers/SeriesDetailModal';
import { MediaFilterModal } from '@/components/trackers/MediaFilterModal';
import type { TVSeries, SeriesDetailTarget } from '@/types/trackers';
import { extractSeriesTmdbId } from '@/types/trackers';
import { useTVSeriesPageLogic } from '@/hooks/trackers/useTVSeriesPageLogic';

const TVSeriesPage: React.FC = () => {
  const {
    series,
    isLoading,
    isError,
    handleRetry,
    goalPercent,
    goalViewType,
    setGoalViewType,
    currentEpisodes,
    goal,
    setStatsModalOpen,
    statsModalOpen,
    setRandomModalOpen,
    isRandomModalOpen,
    openSeriesDetail,
    detailModalOpen,
    setDetailModalOpen,
    detailModalSeries,
    setDetailModalSeries,
    detailModalTab,
    setDetailModalTab,
    detailModalEpisode,
    detailModalReviewLogId,
    displaySeries,
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
  } = useTVSeriesPageLogic();

  if (isLoading) {
    return <PageLoadingState messages={['Caricamento Libreria Serie TV...']} />;
  }

  if (isError) {
    return (
      <PageErrorState
        message="Errore nel caricamento delle Serie TV."
        onRetry={handleRetry}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5 max-w-[1600px] mx-auto min-h-full xl:h-full xl:overflow-hidden relative p-2 xl:p-0">
      <TVSeriesHeader
        goalPercent={goalPercent}
        goalViewType={goalViewType}
        setGoalViewType={setGoalViewType}
        currentEpisodes={currentEpisodes}
        goal={goal}
        setStatsModalOpen={setStatsModalOpen}
        setRandomModalOpen={setRandomModalOpen}
      />

      {/* TOP ROW: 3 GLASS CARDS */}
      <TopSeriesCards series={series} openSeriesDetail={openSeriesDetail} />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        <TVSeriesLibrary
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
          series={series}
          setDetailModalSeries={setDetailModalSeries}
          setDetailModalTab={setDetailModalTab}
          setDetailModalOpen={setDetailModalOpen}
          handleAdd={handleAdd}
          displaySeries={displaySeries}
          openSeriesDetail={openSeriesDetail}
        />

        {/* SIDEBAR (4 Colonne) */}
        <div className="xl:col-span-4 flex flex-col gap-6 h-[600px] xl:h-full min-h-0 overflow-y-auto no-scrollbar pr-2">
          {/* CITAZIONI (Espandibile al clic) */}
          <DailyQuoteWidget
            myQuotes={myQuotes}
            isQuoteExpanded={isQuoteExpanded}
            setIsQuoteExpanded={setIsQuoteExpanded}
          />

          {/* CALENDARIO / LOCANDINE */}
          <div className="mx-2 mb-4 overflow-visible flex-1 flex flex-col min-h-0 relative">
            <div
              className={`absolute inset-0 transition-all duration-500 ease-in-out origin-top flex flex-col min-h-0 ${
                isQuoteExpanded
                  ? 'opacity-0 pointer-events-none translate-y-4'
                  : 'opacity-100 translate-y-0 delay-100'
              }`}
            >
              <UpcomingCalendarWidget openSeriesDetail={openSeriesDetail} />
            </div>
            <div
              className={`absolute top-0 left-0 right-0 transition-all duration-500 ease-in-out origin-top flex flex-col min-h-0 ${
                isQuoteExpanded
                  ? 'opacity-100 translate-y-0 delay-100'
                  : 'opacity-0 pointer-events-none -translate-y-4'
              }`}
            >
              <UpcomingEpisodesWidget openSeriesDetail={openSeriesDetail} />
            </div>
          </div>
        </div>
      </div>

      <RandomMediaModal
        isOpen={isRandomModalOpen}
        onClose={() => setRandomModalOpen(false)}
        items={series || []}
        onItemClick={(seriesItem) => {
          setRandomModalOpen(false);
          openSeriesDetail(seriesItem as TVSeries);
        }}
        modalTitle="Cosa guardare oggi?"
        emptyMessage="Nessuna serie salvata nella libreria."
        noUnstartedMessage="Non hai nessuna serie da iniziare nella lista!"
      />

      {detailModalSeries && (
        <SeriesDetailModal
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          series={
            (series?.find((s) => s.tmdb_id === extractSeriesTmdbId(detailModalSeries)) as SeriesDetailTarget) ||
            detailModalSeries
          }
          initialTab={detailModalTab}
          initialEpisode={detailModalEpisode}
          initialReviewLogId={detailModalReviewLogId}
          onSelectRecommendation={(rec) => openSeriesDetail(rec)}
          onToggleTrack={handleToggleTrack}
          onGenreClick={handleGenreClick}
          onPlatformClick={handlePlatformClick}
        />
      )}

      {statsModalOpen && (
        <SeriesStatsModal onClose={() => setStatsModalOpen(false)} />
      )}

      <MediaFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
        series={series || []}
        myLists={myLists}
      />
    </div>
  );
};

export default TVSeriesPage;
