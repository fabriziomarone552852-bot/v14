// src/mobile/views/MobileTVSeriesView.tsx
import React, { useState } from 'react';
import PageLoadingState from '@/components/shared/feedback/PageLoadingState';
import PageErrorState from '@/components/shared/feedback/PageErrorState';
import { useTVSeriesPageLogic } from '@/hooks/trackers/useTVSeriesPageLogic';
import RandomMediaModal from '@/components/trackers/RandomMediaModal';
import { MobileSeriesStatsModal } from '../components/trackers/stats';
import { MobileTVSeriesDetailModal } from '../components/trackers/detail';
import MobileTVSeriesSearchModal from '../components/trackers/MobileTVSeriesSearchModal';
import MobileTVEpisodesTimeline from '../components/trackers/MobileTVEpisodesTimeline';
import MobileTVSeriesDashboardSlide from '../components/trackers/MobileTVSeriesDashboardSlide';
import MobileTVSeriesDiarySlide from '../components/trackers/MobileTVSeriesDiarySlide';
import MobileSeriesCatalogModal from '../components/trackers/MobileSeriesCatalogModal';
import MobileSeriesPersonalListsModal from '../components/trackers/MobileSeriesPersonalListsModal';
import { MobileMediaListManagerModal } from '../components/trackers/detail/MobileMediaListManagerModal';
import type {
  TVSeries,
  UpcomingEpisode,
  TMDBEpisode,
  SeriesDetailTarget,
  MediaList,
} from '@/types/trackers';
import { extractSeriesTmdbId } from '@/types/trackers';
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
  } = useTVSeriesPageLogic();

  const { data: tmdbGenres = [] } = useTMDBGenres();
  const { data: tmdbProviders = [] } = useTMDBProviders();

  // Modali dedicati per Catalogo e Liste Personali
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [isPersonalListsModalOpen, setIsPersonalListsModalOpen] = useState(false);
  const [selectedListForModal, setSelectedListForModal] = useState<MediaList | null>(null);
  const [isListManagerModalOpen, setIsListManagerModalOpen] = useState(false);
  const [isStandaloneEpisode, setIsStandaloneEpisode] = useState(() => {
    return Boolean(new URLSearchParams(window.location.search).get('open_episode'));
  });

  React.useEffect(() => {
    if (detailModalEpisode && detailModalReviewLogId) {
      setIsStandaloneEpisode(true);
    }
  }, [detailModalEpisode, detailModalReviewLogId]);

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

  // Paginazione a 3 slide:
  // 0 = Timeline Uscite (a sinistra di Pagina 1)
  // 1 = Diario Episodi (Pagina centrale / Home principale all'apertura)
  // 2 = Dashboard & Catalogo (a destra di Pagina 1)
  const [activePageIndex, setActivePageIndex] = useState<0 | 1 | 2>(1);

  // Calcolo classi di posizionamento orizzontale circolare per le 3 slide
  const getSlideClass = (pageIdx: 0 | 1 | 2) => {
    const diff = pageIdx - activePageIndex;
    if (diff === 0) {
      return 'translate-x-0 pointer-events-auto z-10 opacity-100';
    }
    if (diff === 1 || diff === -2) {
      return 'translate-x-full pointer-events-none z-0 opacity-0';
    }
    return '-translate-x-full pointer-events-none z-0 opacity-0';
  };

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

    if (deltaX < 0) {
      // Dito verso sinistra -> pagina successiva in loop circolare (0 -> 1 -> 2 -> 0)
      setActivePageIndex((prev) => ((prev + 1) % 3) as 0 | 1 | 2);
    } else if (deltaX > 0) {
      // Dito verso destra -> pagina precedente in loop circolare (0 -> 2 -> 1 -> 0)
      setActivePageIndex((prev) => ((prev - 1 + 3) % 3) as 0 | 1 | 2);
    }
  };

  // Apertura a tutto schermo dell'episodio nel modale dettaglio della serie (standalone)
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
    const isOpeningReview = Boolean(new URLSearchParams(window.location.search).get('open_review_log_id'));
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
        {/* PAGINA 0: TIMELINE USCITE EPISODI (A sinistra del Diario)             */}
        {/* ===================================================================== */}
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

        {/* ===================================================================== */}
        {/* PAGINA 1: DIARIO EPISODI (Pagina principale centrale all'apertura)    */}
        {/* ===================================================================== */}
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

        {/* ===================================================================== */}
        {/* PAGINA 2: DASHBOARD & ATTIVITÀ (A destra del Diario)                   */}
        {/* ===================================================================== */}
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
          onOpenPersonalLists={(list) => {
            setSelectedListForModal(list || null);
            setIsPersonalListsModalOpen(true);
          }}
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
            (series?.find((s) => s.tmdb_id === extractSeriesTmdbId(detailModalSeries)) as SeriesDetailTarget) ||
            detailModalSeries
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
      />

      {/* 5. MODALE CATALOGO COMPLETO */}
      <MobileSeriesCatalogModal
        isOpen={isCatalogModalOpen}
        onClose={() => setIsCatalogModalOpen(false)}
        series={series || []}
        myLists={myLists}
        onOpenSeriesDetail={openSeriesDetail}
      />

      {/* 6. MODALE LISTE PERSONALI */}
      <MobileSeriesPersonalListsModal
        isOpen={isPersonalListsModalOpen}
        onClose={() => {
          setIsPersonalListsModalOpen(false);
          setSelectedListForModal(null);
        }}
        myLists={myLists || []}
        series={series || []}
        onOpenSeriesDetail={openSeriesDetail}
        onOpenListManager={() => setIsListManagerModalOpen(true)}
        initialSelectedList={selectedListForModal}
      />

      {/* 7. MODALE CREAZIONE / GESTIONE LISTE */}
      <MobileMediaListManagerModal
        isOpen={isListManagerModalOpen}
        onClose={() => setIsListManagerModalOpen(false)}
      />
    </div>
  );
};

export default MobileTVSeriesView;
