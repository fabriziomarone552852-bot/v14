// src/mobile/views/MobileTVSeriesView.tsx
import React, { useState, useCallback, useEffect } from 'react';
import PageLoadingState from '@/components/shared/feedback/PageLoadingState';
import PageErrorState from '@/components/shared/feedback/PageErrorState';
import { useTVSeriesPageLogic } from '@/hooks/trackers/useTVSeriesPageLogic';
import { DEFAULT_SERIES_FILTERS } from '@/hooks/trackers/useMediaFilterOptions';
import RandomTrackerModal from '@/components/trackers/shared/RandomTrackerModal';
import { MobileSeriesStatsModal } from '../components/trackers/series/stats';
import { MobileTVSeriesDetailModal } from '../components/trackers/series/detail';
import MobileTVSeriesSearchModal from '../components/trackers/series/MobileTVSeriesSearchModal';
import MobileTVEpisodesTimeline from '../components/trackers/series/MobileTVEpisodesTimeline';
import MobileTVSeriesDashboardSlide from '../components/trackers/series/MobileTVSeriesDashboardSlide';
import MobileTVSeriesDiarySlide from '../components/trackers/series/MobileTVSeriesDiarySlide';
import MobileSeriesCatalogModal from '../components/trackers/series/MobileSeriesCatalogModal';
import type {
  TVSeries,
  UpcomingEpisode,
  TMDBEpisode,
  SeriesDetailTarget,
} from '@/types/trackers';
import { extractSeriesTmdbId } from '@/types/trackers';
import {
  MobileTrackerPaginationDots,
  MobileTrackerPersonalListsModal,
} from '../components/trackers/shared';
import { useTrackerHeader } from '@/context/TrackerHeaderContext';
import { useMobileHorizontalSlidePages } from '../hooks/useMobileHorizontalSlidePages';

export const MobileTVSeriesView: React.FC = () => {
  const {
    series,
    isLoading,
    isError,
    handleRetry,
    goalPercent,
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
  } = useTVSeriesPageLogic();

  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [isPersonalListsModalOpen, setIsPersonalListsModalOpen] = useState(false);
  const [isStandaloneEpisode, setIsStandaloneEpisode] = useState(() => {
    return Boolean(new URLSearchParams(window.location.search).get('open_episode'));
  });

  useEffect(() => {
    if (detailModalEpisode && detailModalReviewLogId) {
      setIsStandaloneEpisode(true);
    }
  }, [detailModalEpisode, detailModalReviewLogId]);

  const handleMobileGenreClick = useCallback(
    (genreName: string) => {
      handleFilterChange({
        ...DEFAULT_SERIES_FILTERS,
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
        ...DEFAULT_SERIES_FILTERS,
        networks: [platformName],
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

  // Paginazione circolare a 3 slide: 0 = Timeline, 1 = Diario, 2 = Dashboard
  const {
    activePageIndex,
    setActivePageIndex,
    getSlideClass,
    handleTouchStart,
    handleTouchEnd,
  } = useMobileHorizontalSlidePages<0 | 1 | 2>({
    pageCount: 3,
    initialPage: 1,
    circular: true,
  });

  const handleTimelineEpisodeClick = (ep: UpcomingEpisode) => {
    setIsStandaloneEpisode(true);
    const match = series?.find((s) => s.tmdb_id === ep.series_tmdb_id);
    const seriesTarget: SeriesDetailTarget = match || {
      tmdb_id: ep.series_tmdb_id,
      title: ep.series_title,
      poster_path: ep.series_poster_path,
      backdrop_path: ep.series_backdrop_path,
    };

    const targetEpisode: TMDBEpisode = {
      id: ep.episode_id,
      series_tmdb_id: ep.series_tmdb_id,
      season_number: ep.season_number,
      episode_number: ep.episode_number,
      title: ep.episode_title,
      overview: ep.episode_overview,
      air_date: ep.air_date,
      still_path: ep.episode_still_path,
      is_watched: ep.is_watched,
    };

    openSeriesDetail(seriesTarget, 'seasons', targetEpisode);
  };

  if (isLoading) {
    const isOpeningReview = Boolean(
      new URLSearchParams(window.location.search).get('open_review_log_id')
    );
    return (
      <PageLoadingState
        messages={
          isOpeningReview
            ? ['Apertura recensione...', 'Recupero commenti in corso...']
            : ['Caricamento Serie TV...']
        }
      />
    );
  }

  if (isError) {
    return (
      <PageErrorState
        message="Errore nel caricamento delle Serie TV."
        onRetry={handleRetry}
      />
    );
  }

  const watchingSeries = series?.filter((s) => s.status === 'watching') || [];
  const watchedSeries =
    series?.filter((s) => s.status === 'watched' || s.status === 'completed') || [];
  const lastAdded =
    series && series.length > 0
      ? [...series].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0]
      : null;
  const lastWatched = watchingSeries.length > 0 ? watchingSeries[0] : null;
  const lastCompleted = watchedSeries.length > 0 ? watchedSeries[0] : null;

  return (
    <div
      className="h-full w-full flex flex-col justify-between overflow-hidden animate-fadeIn relative select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex-1 min-h-0 relative overflow-hidden">
        {/* PAGINA 0: TIMELINE USCITE EPISODI */}
        <div
          className={`absolute inset-0 w-full h-full flex flex-col transition-all duration-300 ease-out ${getSlideClass(0)}`}
        >
          <MobileTVEpisodesTimeline
            series={series}
            onEpisodeClick={handleTimelineEpisodeClick}
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

        {/* PAGINA 1: DIARIO EPISODI */}
        <div
          className={`absolute inset-0 w-full h-full flex flex-col transition-all duration-300 ease-out ${getSlideClass(1)}`}
        >
          <MobileTVSeriesDiarySlide
            series={series}
            activePageIndex={activePageIndex}
            onOpenEpisode={(s, ep) => {
              setIsStandaloneEpisode(true);
              openSeriesDetail(s, 'seasons', ep);
            }}
            onOpenSeriesDetail={(s) => {
              setIsStandaloneEpisode(false);
              openSeriesDetail(s);
            }}
          />
        </div>

        {/* PAGINA 2: DASHBOARD & ATTIVITÀ */}
        <MobileTVSeriesDashboardSlide
          className={getSlideClass(2)}
          activePageIndex={activePageIndex}
          goalPercent={goalPercent}
          currentEpisodes={currentEpisodes}
          goal={goal}
          lastWatched={lastWatched}
          lastAdded={lastAdded}
          lastCompleted={lastCompleted}
          myQuotes={myQuotes}
          series={series}
          myLists={myLists}
          onOpenSeriesDetail={(s) => {
            setIsStandaloneEpisode(false);
            openSeriesDetail(s);
          }}
          onOpenStats={() => setStatsModalOpen(true)}
          onOpenCatalog={() => setIsCatalogModalOpen(true)}
          onOpenPersonalLists={() => setIsPersonalListsModalOpen(true)}
        />
      </div>

      <MobileTrackerPaginationDots
        activePageIndex={activePageIndex}
        onSelectPage={setActivePageIndex}
      />

      <RandomTrackerModal
        isOpen={isRandomModalOpen}
        onClose={() => setRandomModalOpen(false)}
        items={series || []}
        onItemClick={(seriesItem) => {
          setRandomModalOpen(false);
          setIsStandaloneEpisode(false);
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
          onClose={() => {
            setDetailModalOpen(false);
            setIsStandaloneEpisode(false);
          }}
          series={
            (series?.find(
              (s) => s.tmdb_id === extractSeriesTmdbId(detailModalSeries)
            ) as SeriesDetailTarget) || detailModalSeries
          }
          initialTab={detailModalTab}
          initialEpisode={detailModalEpisode}
          initialReviewLogId={detailModalReviewLogId}
          isStandaloneEpisode={isStandaloneEpisode}
          onSelectRecommendation={(rec) => {
            setIsStandaloneEpisode(false);
            openSeriesDetail(rec);
          }}
          onToggleTrack={handleToggleTrack}
          onGenreClick={handleMobileGenreClick}
          onPlatformClick={handleMobilePlatformClick}
          zIndexClass="z-[10030]"
        />
      )}

      <MobileSeriesStatsModal
        isOpen={statsModalOpen}
        onClose={() => setStatsModalOpen(false)}
      />

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
        hasMoreResults={hasMoreResults}
        isFetchingMore={isFetchingMore}
        onFetchMore={fetchMoreResults}
      />

      <MobileSeriesCatalogModal
        isOpen={isCatalogModalOpen}
        onClose={() => setIsCatalogModalOpen(false)}
        series={series || []}
        myLists={myLists}
        onOpenSeriesDetail={openSeriesDetail}
      />

      <MobileTrackerPersonalListsModal
        isOpen={isPersonalListsModalOpen}
        onClose={() => setIsPersonalListsModalOpen(false)}
        mediaType="tv"
        myLists={myLists || []}
        series={series || []}
        onOpenSeriesDetail={(s) => {
          setIsStandaloneEpisode(false);
          openSeriesDetail(s);
        }}
      />
    </div>
  );
};

export default MobileTVSeriesView;
