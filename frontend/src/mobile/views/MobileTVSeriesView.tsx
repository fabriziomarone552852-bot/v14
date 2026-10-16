// src/mobile/views/MobileTVSeriesView.tsx
import React, { useState } from 'react';
import PageLoadingState from '@/components/shared/feedback/PageLoadingState';
import PageErrorState from '@/components/shared/feedback/PageErrorState';
import { useTVSeriesPageLogic } from '@/hooks/trackers/useTVSeriesPageLogic';
import RandomMediaModal from '@/components/trackers/RandomMediaModal';
import SeriesStatsModal from '@/components/trackers/SeriesStatsModal';
import { MobileTVSeriesDetailModal } from '../components/trackers/detail';
import MobileTVSeriesSearchModal from '../components/trackers/MobileTVSeriesSearchModal';
import MobileTVEpisodesTimeline from '../components/trackers/MobileTVEpisodesTimeline';
import MobileEpisodeDetailModal from '../components/trackers/MobileEpisodeDetailModal';
import MobileTVSeriesDashboardSlide from '../components/trackers/MobileTVSeriesDashboardSlide';
import type { TVSeries, UpcomingEpisode } from '@/types/trackers';
import MobileTVPaginationDots from '../components/trackers/MobileTVPaginationDots';
import { useTrackerHeader } from '@/context/TrackerHeaderContext';
import { useTMDBGenres, useTMDBProviders } from '@/hooks/queries/useTrackersQueries';

export const MobileTVSeriesView: React.FC = () => {
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
    myQuotes,
    isQuoteExpanded,
    setIsQuoteExpanded,
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
  } = useTVSeriesPageLogic();

  const { data: tmdbGenres = [] } = useTMDBGenres();
  const { data: tmdbProviders = [] } = useTMDBProviders();

  // Apertura ricerca globale TMDB filtrata per Genere
  const handleMobileGenreClick = React.useCallback(
    (genreName: string) => {
      const match = tmdbGenres.find((g) => g.name.toLowerCase() === genreName.toLowerCase());
      const genreId = match ? String(match.id) : genreName;

      handleFilterChange({
        keyword: '',
        genre: genreId,
        network: 'all',
        ratings: [],
        tmdbStatus: 'all',
        year: 'all',
        sortBy: 'date_added_desc',
        listId: null,
        globalSearch: true,
      });
      setDebouncedQuery('');
      setDetailModalOpen(false);
      setIsFilterModalOpen(true);
    },
    [tmdbGenres, handleFilterChange, setDebouncedQuery, setDetailModalOpen, setIsFilterModalOpen]
  );

  // Apertura ricerca globale TMDB filtrata per Piattaforma streaming / distributore
  const handleMobilePlatformClick = React.useCallback(
    (platformName: string, providerId?: number) => {
      let networkId = providerId ? String(providerId) : '';
      if (!networkId) {
        const match = tmdbProviders.find((p) => p.provider_name.toLowerCase() === platformName.toLowerCase());
        networkId = match ? String(match.provider_id) : platformName;
      }

      handleFilterChange({
        keyword: '',
        genre: 'all',
        network: networkId,
        ratings: [],
        tmdbStatus: 'all',
        year: 'all',
        sortBy: 'date_added_desc',
        listId: null,
        globalSearch: true,
      });
      setDebouncedQuery('');
      setDetailModalOpen(false);
      setIsFilterModalOpen(true);
    },
    [tmdbProviders, handleFilterChange, setDebouncedQuery, setDetailModalOpen, setIsFilterModalOpen]
  );

  // Configurazione bottoni Header Mobile (Lente ricerca e Pallino blu ?) con handler stabili
  const handleOpenSearch = React.useCallback(() => {
    setIsFilterModalOpen(true);
  }, [setIsFilterModalOpen]);

  const handleOpenRandom = React.useCallback(() => {
    setRandomModalOpen(true);
  }, [setRandomModalOpen]);

  useTrackerHeader({
    onOpenSearch: handleOpenSearch,
    onOpenRandom: handleOpenRandom,
    hasActiveFilters: hasActiveFilters || Boolean(searchQuery) || Boolean(debouncedQuery),
  });

  // Paginazione a 2 slide (0 = Timeline Uscite, 1 = Dashboard/Attività)
  const [activePageIndex, setActivePageIndex] = useState<0 | 1>(0);
  const [selectedEpisodeDetail, setSelectedEpisodeDetail] = useState<UpcomingEpisode | null>(null);

  // Gesture Touch Swipe
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

    // Ignora lo swipe orizzontale se prevale lo scroll verticale
    if (Math.abs(deltaY) > Math.abs(deltaX)) return;
    // Soglia minima di scorrimento (45px)
    if (Math.abs(deltaX) < 45) return;

    if (deltaX < 0 && activePageIndex === 0) {
      setActivePageIndex(1);
    } else if (deltaX > 0 && activePageIndex === 1) {
      setActivePageIndex(0);
    }
  };

  if (isLoading) {
    return <PageLoadingState messages={['Caricamento Serie TV...']} />;
  }

  if (isError) {
    return (
      <PageErrorState
        message="Errore nel caricamento delle Serie TV."
        onRetry={handleRetry}
      />
    );
  }

  // Card in evidenza per Dashboard
  const watchingSeries = series?.filter((s) => s.status === 'watching') || [];
  const watchedSeries = series?.filter((s) => s.status === 'watched' || s.status === 'completed') || [];
  const lastAdded = series && series.length > 0
    ? [...series].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
    : null;
  const lastWatched = watchingSeries.length > 0 ? watchingSeries[0] : null;
  const lastCompleted = watchedSeries.length > 0 ? watchedSeries[0] : null;

  return (
    <div
      className="h-full w-full flex flex-col justify-between overflow-hidden animate-fadeIn relative select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* AREA PRINCIPALE DELLE PAGINE CON ANIMAZIONE SLIDE ORIZZONTALE */}
      <div className="flex-1 min-h-0 relative overflow-hidden">
        {/* ===================================================================== */}
        {/* PAGINA 0: TIMELINE USCITE EPISODI (Oggi, Prossime uscite e Precedenti) */}
        {/* ===================================================================== */}
        <div
          className={`absolute inset-0 w-full h-full flex flex-col transition-transform duration-300 ease-out ${
            activePageIndex === 0
              ? 'translate-x-0 pointer-events-auto'
              : '-translate-x-full pointer-events-none'
          }`}
        >
          <MobileTVEpisodesTimeline
            onEpisodeClick={(ep) => setSelectedEpisodeDetail(ep)}
            onOpenSeriesDetail={(ep) => {
              const match = series?.find((s) => s.tmdb_id === ep.series_tmdb_id);
              if (match) {
                openSeriesDetail(match);
              } else {
                openSeriesDetail({
                  tmdb_id: ep.series_tmdb_id,
                  title: ep.series_title,
                  poster_path: ep.series_poster_path,
                } as TVSeries);
              }
            }}
          />
        </div>

        {/* ===================================================================== */}
        {/* PAGINA 1: DASHBOARD & ATTIVITÀ (Obiettivo, In Evidenza, Prossimi Ep, Quotes) */}
        {/* ===================================================================== */}
        <MobileTVSeriesDashboardSlide
          activePageIndex={activePageIndex}
          goalViewType={goalViewType}
          setGoalViewType={setGoalViewType}
          goalPercent={goalPercent}
          currentEpisodes={currentEpisodes}
          goal={goal}
          lastWatched={lastWatched}
          lastAdded={lastAdded}
          lastCompleted={lastCompleted}
          myQuotes={myQuotes}
          isQuoteExpanded={isQuoteExpanded}
          setIsQuoteExpanded={setIsQuoteExpanded}
          series={series}
          onOpenSeriesDetail={openSeriesDetail}
          onOpenRandom={() => setRandomModalOpen(true)}
          onOpenStats={() => setStatsModalOpen(true)}
        />
      </div>

      {/* 3. INDICATORE DI PAGINAZIONE TOUCH IN BASSO (SLIDER DOTS) */}
      <MobileTVPaginationDots
        activePageIndex={activePageIndex}
        onSelectPage={setActivePageIndex}
      />

      {/* 4. MODALI CONDIVISI */}
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
        fullScreen={true}
      />

      {detailModalSeries && (
        <MobileTVSeriesDetailModal
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          series={detailModalSeries}
          initialTab={detailModalTab}
          initialEpisode={detailModalEpisode}
          initialReviewLogId={detailModalReviewLogId}
          onSelectRecommendation={(rec) => openSeriesDetail(rec)}
          onToggleTrack={handleToggleTrack}
          onGenreClick={handleMobileGenreClick}
          onPlatformClick={handleMobilePlatformClick}
          zIndexClass="z-[10020]"
        />
      )}

      {statsModalOpen && (
        <SeriesStatsModal onClose={() => setStatsModalOpen(false)} />
      )}

      <MobileTVSeriesSearchModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
        series={series || []}
        myLists={myLists}
        debouncedQuery={debouncedQuery}
        setDebouncedQuery={setDebouncedQuery}
        searchResults={searchResults}
        discoverData={discoverData}
        isSearchLoading={isSearchLoading}
        isDiscoverLoading={isDiscoverLoading}
        onCardClick={(mockSeries) => {
          setDetailModalSeries(mockSeries);
          setDetailModalTab('overview');
          setDetailModalOpen(true);
        }}
        onAddClick={handleAdd}
        onToggleTrack={(tmdbId, isTracked) => handleToggleTrack(tmdbId, isTracked)}
      />

      <MobileEpisodeDetailModal
        isOpen={Boolean(selectedEpisodeDetail)}
        onClose={() => setSelectedEpisodeDetail(null)}
        episode={selectedEpisodeDetail}
        onOpenSeriesDetail={({ tmdb_id, title, poster_path }) => {
          const match = series?.find((s) => s.tmdb_id === tmdb_id);
          if (match) {
            openSeriesDetail(match);
          } else {
            setDetailModalSeries({
              tmdb_id,
              title,
              poster_path,
            });
            setDetailModalOpen(true);
          }
        }}
      />
    </div>
  );
};

export default MobileTVSeriesView;
