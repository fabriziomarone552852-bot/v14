// src/mobile/views/MobileTVSeriesView.tsx
import React, { useState } from 'react';
import PageLoadingState from '@/components/shared/feedback/PageLoadingState';
import PageErrorState from '@/components/shared/feedback/PageErrorState';
import { useTVSeriesPageLogic } from '@/hooks/trackers/useTVSeriesPageLogic';
import { GlassCardWidget } from '@/components/trackers/GlassCardWidget';
import { MediaCard } from '@/components/trackers/MediaCard';
import { DailyQuoteWidget } from '@/components/trackers/DailyQuoteWidget';
import { UpcomingCalendarWidget } from '@/components/trackers/UpcomingCalendarWidget';
import { UpcomingEpisodesWidget } from '@/components/trackers/UpcomingEpisodesWidget';
import RandomMediaModal from '@/components/trackers/RandomMediaModal';
import SeriesStatsModal from '@/components/trackers/SeriesStatsModal';
import { SeriesDetailModal } from '@/components/trackers/SeriesDetailModal';
import MobileTVSeriesSearchModal from '../components/trackers/MobileTVSeriesSearchModal';
import { resolveImageUrl } from '@/utils/imageUtils';
import {
  EyeIcon,
  EyePlayIcon,
  EyeHalfOpenIcon,
  EyeClosedIcon,
  TvIcon,
} from '@/components/shared/utils/Icons';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import type { TVSeries } from '@/types/trackers';
import MobileTVPaginationDots from '../components/trackers/MobileTVPaginationDots';
import { useTrackerHeader } from '@/context/TrackerHeaderContext';

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

  // Paginazione a 2 slide (0 = Libreria, 1 = Dashboard/Attività)
  const [activePageIndex, setActivePageIndex] = useState<0 | 1>(0);

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

  const STATUS_TABS: { id: 'all' | 'watching' | 'watched' | 'to_watch'; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'Tutte', icon: <EyeHalfOpenIcon className="w-3.5 h-3.5" /> },
    { id: 'watching', label: 'In Corso', icon: <EyePlayIcon className="w-3.5 h-3.5" /> },
    { id: 'watched', label: 'Viste', icon: <EyeIcon className="w-3.5 h-3.5" /> },
    { id: 'to_watch', label: 'Da Vedere', icon: <EyeClosedIcon className="w-3.5 h-3.5" /> },
  ];

  return (
    <div
      className="h-full w-full flex flex-col justify-between overflow-hidden animate-fadeIn relative select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* AREA PRINCIPALE DELLE PAGINE CON ANIMAZIONE SLIDE ORIZZONTALE */}
      <div className="flex-1 min-h-0 relative overflow-hidden">
        
        {/* ===================================================================== */}
        {/* PAGINA 0: LIBRERIA SERIE TV (Ricerca, Filtri, Tabs di Stato e Griglia) */}
        {/* ===================================================================== */}
        <div
          className={`absolute inset-0 w-full h-full flex flex-col transition-transform duration-300 ease-out ${
            activePageIndex === 0
              ? 'translate-x-0 pointer-events-auto'
              : '-translate-x-full pointer-events-none'
          }`}
        >
          {/* PILLOLE TABS DI STATO NORMALI */}
          <div className="shrink-0 flex items-center justify-between gap-1 px-1 pb-2">
            {STATUS_TABS.map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs transition-all font-semibold cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {tab.icon}
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* 3. GRIGLIA LOCANDINE SCROLLABILE (2 COLONNE) */}
          <div className="flex-1 min-h-0 overflow-y-auto px-1 pt-1 pb-4 custom-scrollbar">
            {displaySeries.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {displaySeries.map((s) => (
                  <MediaCard
                    key={s.id}
                    title={s.title}
                    posterPath={s.poster_path}
                    customPosterPath={s.custom_poster_path}
                    status={s.status}
                    externalStatus={s.tmdb_status}
                    onClick={() => openSeriesDetail(s)}
                  />
                ))}
              </div>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center">
                <EmptyState
                  icon={<TvIcon className="w-10 h-10 opacity-30 text-gray-500" />}
                  message={
                    activeTab === 'all'
                      ? 'Nessuna serie nella tua libreria.'
                      : `Nessuna serie ${activeTab === 'watching' ? 'in corso' : activeTab === 'watched' ? 'completata' : 'da vedere'}.`
                  }
                />
              </div>
            )}
          </div>
        </div>

        {/* ===================================================================== */}
        {/* PAGINA 1: DASHBOARD & ATTIVITÀ (Obiettivo, In Evidenza, Prossimi Ep, Quotes) */}
        {/* ===================================================================== */}
        <div
          className={`absolute inset-0 w-full h-full flex flex-col overflow-y-auto px-1 pt-1 pb-4 custom-scrollbar transition-transform duration-300 ease-out space-y-3.5 ${
            activePageIndex === 1
              ? 'translate-x-0 pointer-events-auto'
              : 'translate-x-full pointer-events-none'
          }`}
        >
          {/* 1. OBIETTIVO ANNUALE EPISODI */}
          <div
            onClick={() => setGoalViewType((prev) => (prev === 'percent' ? 'fraction' : 'percent'))}
            className="w-full bg-white rounded-2xl shadow-xs border border-gray-200 p-3.5 cursor-pointer hover:shadow-md transition-shadow select-none relative group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-base">🎯</span>
                <span className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">
                  Obiettivo Annuale Episodi
                </span>
              </div>
              <span className="text-sm font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                {goalViewType === 'percent' ? `${goalPercent}%` : `${currentEpisodes}/${goal}`}
              </span>
            </div>
            <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${goalPercent}%` }}
              />
            </div>
          </div>

          {/* 2. QUICK ACTIONS BAR (Random Media & Statistiche) */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRandomModalOpen(true)}
              className="py-2.5 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-xs active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="text-base leading-none">🎲</span>
              <span className="truncate">Cosa guardare?</span>
            </button>

            <button
              type="button"
              onClick={() => setStatsModalOpen(true)}
              className="py-2.5 px-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 font-bold text-xs rounded-xl shadow-xs active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="text-base leading-none">📊</span>
              <span className="truncate">Statistiche</span>
            </button>
          </div>

          {/* 3. CARD IN EVIDENZA (Continua a guardare, Ultima aggiunta, Completata) */}
          <div className="space-y-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 px-1">
              In Evidenza
            </h3>
            <div className="grid grid-cols-1 gap-2">
              <GlassCardWidget
                label="Continua a guardare"
                title={lastWatched?.title || 'Nessuna serie'}
                subtitle={lastWatched ? 'In corso' : ''}
                posterPath={
                  lastWatched?.custom_poster_path
                    ? resolveImageUrl(lastWatched.custom_poster_path)
                    : lastWatched?.poster_path || null
                }
                onClick={() => lastWatched && openSeriesDetail(lastWatched)}
              />
              <GlassCardWidget
                label="Ultima aggiunta"
                title={lastAdded?.title || 'Nessuna serie'}
                subtitle=""
                posterPath={
                  lastAdded?.custom_poster_path
                    ? resolveImageUrl(lastAdded.custom_poster_path)
                    : lastAdded?.poster_path || null
                }
                onClick={() => lastAdded && openSeriesDetail(lastAdded)}
              />
              <GlassCardWidget
                label="Completata!"
                title={lastCompleted?.title || 'Nessuna serie'}
                subtitle=""
                posterPath={
                  lastCompleted?.custom_poster_path
                    ? resolveImageUrl(lastCompleted.custom_poster_path)
                    : lastCompleted?.poster_path || null
                }
                onClick={() => lastCompleted && openSeriesDetail(lastCompleted)}
              />
            </div>
          </div>

          {/* 4. PROSSIMI EPISODI */}
          <div className="space-y-1.5 pt-1">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 px-1">
              Prossimi Episodi in Uscita
            </h3>
            <div className="bg-white rounded-2xl border border-gray-200 p-2 shadow-xs">
              <UpcomingEpisodesWidget
                openSeriesDetail={({ tmdb_id, title, poster_path }) => {
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
          </div>

          {/* 5. CITAZIONE DEL GIORNO */}
          <div className="space-y-1.5 pt-1">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 px-1">
              Citazione del Giorno
            </h3>
            <DailyQuoteWidget
              myQuotes={myQuotes}
              isQuoteExpanded={isQuoteExpanded}
              setIsQuoteExpanded={setIsQuoteExpanded}
            />
          </div>

          {/* 6. CALENDARIO USCITE */}
          <div className="space-y-1.5 pt-1">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 px-1">
              Calendario Mese
            </h3>
            <UpcomingCalendarWidget
              openSeriesDetail={({ tmdb_id, title, poster_path }) => {
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
        </div>

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
        <SeriesDetailModal
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          series={detailModalSeries}
          initialTab={detailModalTab}
          initialEpisode={detailModalEpisode}
          initialReviewLogId={detailModalReviewLogId}
          onSelectRecommendation={(rec) => openSeriesDetail(rec)}
          onToggleTrack={handleToggleTrack}
          onGenreClick={handleGenreClick}
          onPlatformClick={handlePlatformClick}
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
      />
    </div>
  );
};

export default MobileTVSeriesView;
