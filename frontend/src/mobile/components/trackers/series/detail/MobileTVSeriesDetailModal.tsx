// src/mobile/components/trackers/detail/MobileTVSeriesDetailModal.tsx
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import type {
  TMDBEpisode,
  SeriesDetailTarget,
  SeriesRecommendation,
  UserSeriesTracking,
} from '@/types/trackers';
import {
  useSeriesDetailModalLogic,
  type TabType,
} from '@/components/trackers/series/detail/useSeriesDetailModalLogic';
import { useTrackersMutations } from '@/hooks/mutations/useTrackersMutations';
import { useBackHandler } from '@/utils/backButtonManager';
import { resolveImageUrl } from '@/utils/imageUtils';
import { Info, Layers, Star } from 'lucide-react';
import { LoadingIcon } from '@/components/shared/utils/Icons';
import { MobileSeriesReviewTab } from './MobileSeriesReviewTab';
import { MobileTrackerDetailBanner } from '../../shared/detail/MobileTrackerDetailBanner';
import { MobileEpisodeDetailBanner } from './MobileEpisodeDetailBanner';
import { MobileSeriesOverviewTab } from './MobileSeriesOverviewTab';
import { MobileSeriesSeasonsTab } from './MobileSeriesSeasonsTab';
import { MobileEpisodeDetailView } from './MobileEpisodeDetailView';
import { MobileSeasonDetailView } from './MobileSeasonDetailView';
import { useSeriesExtras } from '@/hooks/queries/useTrackersQueries';
import { MobileTrackerDetailBottomBar } from '../../shared/detail/MobileTrackerDetailBottomBar';
import { MobileSeriesDetailDrawers } from './MobileSeriesDetailDrawers';
import { useTrackerPersonNavigation } from '@/hooks/trackers/useTrackerPersonNavigation';

export interface MobileTVSeriesDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  series: SeriesDetailTarget | UserSeriesTracking;
  initialTab?: TabType;
  initialEpisode?: TMDBEpisode | null;
  initialSeasonNumber?: number | null;
  initialReviewLogId?: number;
  isStandaloneEpisode?: boolean;
  onToggleTrack?: (tmdbId: number, isTracked: boolean) => void;
  onSelectRecommendation?: (series: SeriesRecommendation) => void;
  onGenreClick?: (genre: string) => void;
  onPlatformClick?: (platform: string, providerId?: number) => void;
  zIndexClass?: string;
  backHandlerPriority?: number;
}

export const MobileTVSeriesDetailModal: React.FC<MobileTVSeriesDetailModalProps> = ({
  isOpen,
  onClose,
  series,
  initialTab = 'overview',
  initialEpisode = null,
  initialSeasonNumber = null,
  initialReviewLogId,
  isStandaloneEpisode = false,
  onToggleTrack,
  onSelectRecommendation,
  onGenreClick,
  onPlatformClick,
  zIndexClass,
  backHandlerPriority = 28,
}) => {
  const [showFriendsDrawer, setShowFriendsDrawer] = useState(false);
  const [showListsDrawer, setShowListsDrawer] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [isHistoricMode, setIsHistoricMode] = useState(false);

  const { updateSeries } = useTrackersMutations();

  const {
    activeTab,
    setActiveTab,
    internalEpisode,
    setInternalEpisode,
    internalSeasonNumber,
    setInternalSeasonNumber,
    internalReviewLogId,
    isListManagerOpen,
    setIsListManagerOpen,
    listDetailId,
    setListDetailId,
    handleClickTrack,
    tmdbSeries,
    userTracking,
    isUserTracked,
    title,
    backdropUrl,
    genres,
    providersData,
    listsWithSeries,
    StatusIcon,
    statusColor,
    SERIES_FRIENDS,
    getStatusBorderColor,
  } = useSeriesDetailModalLogic({
    isOpen,
    series,
    initialTab,
    initialEpisode,
    initialSeasonNumber,
    initialReviewLogId,
    onToggleTrack,
  });

  const { data: extras } = useSeriesExtras(tmdbSeries.tmdb_id, isOpen);

  const { openPersonDetail, openSeriesInStack } = useTrackerPersonNavigation({
    surface: 'mobile',
  });

  const handleSelectRelatedSeries = (rec: SeriesRecommendation) => {
    const targetTmdbId = rec.tmdb_id ?? rec.id;
    if (targetTmdbId && targetTmdbId !== tmdbSeries.tmdb_id) {
      openSeriesInStack(targetTmdbId);
      return;
    }
    onSelectRecommendation?.(rec);
  };

  // Dati dell'episodio correntemente selezionato (sempre allineati ai dati più recenti in memoria)
  const currentEpisode = internalEpisode
    ? tmdbSeries.episodes?.find((ep) => ep.id === internalEpisode.id) || internalEpisode
    : null;

  const rawEpisodeBackdrop = currentEpisode?.still_path || tmdbSeries.backdrop_path;
  const episodeBackdropUrl = rawEpisodeBackdrop
    ? rawEpisodeBackdrop.startsWith('http') || rawEpisodeBackdrop.startsWith('data:')
      ? rawEpisodeBackdrop
      : rawEpisodeBackdrop.startsWith('/uploads')
      ? resolveImageUrl(rawEpisodeBackdrop)
      : `https://image.tmdb.org/t/p/w780${rawEpisodeBackdrop}`
    : backdropUrl;

  const episodeTitle = currentEpisode
    ? currentEpisode.title || `Episodio ${currentEpisode.episode_number}`
    : '';

  const currentSeasonNumber = !currentEpisode ? internalSeasonNumber : null;
  const currentSeasonInfo =
    currentSeasonNumber !== null
      ? extras?.seasons?.find((s) => s.season_number === currentSeasonNumber)
      : undefined;
  const currentSeasonTitle =
    currentSeasonNumber === null
      ? ''
      : currentSeasonNumber === 0
      ? 'Episodi Speciali'
      : currentSeasonInfo?.name || `Stagione ${currentSeasonNumber}`;
  const hasSeasonPoster = Boolean(currentSeasonInfo?.poster_path);
  const seasonBannerUrl = currentSeasonInfo?.poster_path
    ? `https://image.tmdb.org/t/p/w780${currentSeasonInfo.poster_path}`
    : backdropUrl;

  // Gestione tasto Indietro hardware Android
  useBackHandler(
    isOpen,
    () => {
      if (isListManagerOpen) {
        setIsListManagerOpen(false);
        return true;
      }
      if (showFriendsDrawer) {
        setShowFriendsDrawer(false);
        return true;
      }
      if (showListsDrawer) {
        setShowListsDrawer(false);
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
      if (currentEpisode) {
        if (isStandaloneEpisode) {
          onClose();
          return true;
        }
        setInternalEpisode(null);
        return true;
      }
      if (currentSeasonNumber !== null) {
        setInternalSeasonNumber(null);
        return true;
      }
      onClose();
      return true;
    },
    backHandlerPriority
  );

  if (!isOpen) return null;

  // Schermata di caricamento dedicata per apertura diretta da notifica prima che i dati dell'episodio siano pronti
  if (initialReviewLogId && currentEpisode && !currentEpisode.title) {
    return createPortal(
      <div
        className={`fixed inset-0 ${
          zIndexClass || 'z-[10020]'
        } bg-gray-50 flex flex-col items-center justify-center gap-3.5 p-6 select-none animate-fadeIn`}
      >
        <LoadingIcon className="w-10 h-10 text-blue-600 animate-spin -ml-0 mr-0" />
        <p className="text-sm font-bold text-gray-800 tracking-tight">Apertura recensione...</p>
        <p className="text-xs text-gray-500 font-medium">Caricamento commenti in corso...</p>
      </div>,
      document.body
    );
  }

  const bottomBarTab: TabType =
    currentEpisode || currentSeasonNumber !== null ? 'seasons' : activeTab;

  const content = (
    <div
      className={`fixed inset-0 ${
        zIndexClass || 'z-[10020]'
      } bg-gray-50 flex flex-col h-[100dvh] w-full overflow-hidden pointer-events-auto animate-fadeIn select-none`}
    >
      {/* 1. BANNER FOTOGRAFICO SUPERIORE (Episodio, Stagione o Serie) */}
      {currentEpisode ? (
        <MobileEpisodeDetailBanner
          backdropUrl={episodeBackdropUrl}
          title={episodeTitle}
          onClose={() => {
            if (isStandaloneEpisode) {
              onClose();
            } else {
              setInternalEpisode(null);
            }
          }}
        />
      ) : currentSeasonNumber !== null ? (
        <MobileEpisodeDetailBanner
          backdropUrl={seasonBannerUrl}
          title={currentSeasonTitle}
          imageClassName={hasSeasonPoster ? 'object-cover object-[50%_30%]' : 'object-cover'}
          onClose={() => setInternalSeasonNumber(null)}
        />
      ) : (
        <MobileTrackerDetailBanner
          backdropUrl={backdropUrl}
          title={title}
          genres={genres}
          onGenreClick={onGenreClick}
          friends={SERIES_FRIENDS}
          lists={listsWithSeries}
          StatusIcon={StatusIcon}
          statusColor={statusColor}
          onClose={onClose}
          onOpenOptions={() => setShowOptionsModal(true)}
          onOpenFriendsDrawer={() => setShowFriendsDrawer(true)}
          onOpenListsDrawer={() => setShowListsDrawer(true)}
          optionsTitle="Opzioni serie"
          closeAriaLabel="Chiudi dettaglio serie"
        />
      )}

      {/* 2. CONTENUTO SCROLLABILE (Episodio, Stagione o Schede Serie) */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex flex-col relative">
        {currentEpisode ? (
          <MobileEpisodeDetailView
            episode={currentEpisode}
            tmdbSeries={tmdbSeries}
            userTracking={userTracking}
            logs={currentEpisode.logs || []}
            initialView={internalReviewLogId ? 'review_detail' : 'main'}
            initialReviewLogId={internalReviewLogId}
          />
        ) : currentSeasonNumber !== null ? (
          <MobileSeasonDetailView
            seasonNumber={currentSeasonNumber}
            tmdbSeries={tmdbSeries}
            userTracking={userTracking}
            isHistoricMode={isHistoricMode}
            initialView={
              internalReviewLogId && initialSeasonNumber === currentSeasonNumber
                ? 'review_detail'
                : 'main'
            }
            initialReviewLogId={
              initialSeasonNumber === currentSeasonNumber ? internalReviewLogId : undefined
            }
          />
        ) : (
          <>
            {activeTab === 'overview' && (
              <MobileSeriesOverviewTab
                tmdbSeries={tmdbSeries}
                isUserTracked={isUserTracked}
                handleClickTrack={handleClickTrack}
                providersData={providersData}
                onPlatformClick={onPlatformClick}
                onSelectRecommendation={handleSelectRelatedSeries}
                onPersonClick={openPersonDetail}
                isLoading={false}
              />
            )}
            {activeTab === 'seasons' && (
              <MobileSeriesSeasonsTab
                tmdbSeries={tmdbSeries}
                userTracking={userTracking}
                initialEpisode={null}
                initialReviewLogId={internalReviewLogId}
                onSelectEpisode={(ep) => setInternalEpisode(ep)}
                onSelectSeason={(sn) => setInternalSeasonNumber(sn)}
                isLoading={false}
                isHistoricMode={isHistoricMode}
                onDisableHistoricMode={() => setIsHistoricMode(false)}
              />
            )}
            {activeTab === 'review' && (
              <MobileSeriesReviewTab
                tmdbSeries={tmdbSeries}
                userTracking={userTracking}
                initialReviewLogId={internalReviewLogId}
                onOpenEpisode={(ep) => {
                  setInternalSeasonNumber(null);
                  setInternalEpisode(ep);
                  setActiveTab('seasons');
                }}
              />
            )}
          </>
        )}
      </div>

      {/* 3. BARRA DI NAVIGAZIONE INFERIORE (Nascosta in modalità solo episodio standalone) */}
      {!isStandaloneEpisode && (
        <MobileTrackerDetailBottomBar<TabType>
          activeTab={bottomBarTab}
          tabs={[
            {
              id: 'overview',
              label: 'Panoramica',
              icon: (
                <Info
                  className={`w-5 h-5 ${
                    bottomBarTab === 'overview' ? 'stroke-[2.5]' : 'stroke-2'
                  }`}
                />
              ),
            },
            {
              id: 'seasons',
              label: 'Stagioni ed Episodi',
              icon: (
                <Layers
                  className={`w-5 h-5 ${
                    bottomBarTab === 'seasons' ? 'stroke-[2.5]' : 'stroke-2'
                  }`}
                />
              ),
            },
            {
              id: 'review',
              label: 'Recensioni',
              icon: (
                <Star
                  className={`w-5 h-5 ${
                    bottomBarTab === 'review'
                      ? 'fill-blue-500 text-blue-600 stroke-[2.5]'
                      : 'stroke-2'
                  }`}
                />
              ),
            },
          ]}
          onTabChange={(tab) => {
            setInternalEpisode(null);
            setInternalSeasonNumber(null);
            setActiveTab(tab);
          }}
        />
      )}

      {/* 5. DRAWERS DAL BASSO E MODALI SECONDARI */}
      <MobileSeriesDetailDrawers
        tmdbSeries={tmdbSeries}
        series={series}
        userTracking={userTracking}
        isUserTracked={isUserTracked}
        showFriendsDrawer={showFriendsDrawer}
        onCloseFriendsDrawer={() => setShowFriendsDrawer(false)}
        friends={SERIES_FRIENDS}
        getStatusBorderColor={getStatusBorderColor}
        showListsDrawer={showListsDrawer}
        onCloseListsDrawer={() => setShowListsDrawer(false)}
        listsWithSeries={listsWithSeries}
        onSelectList={(id) => setListDetailId(id)}
        onOpenManager={() => setIsListManagerOpen(true)}
        showOptionsModal={showOptionsModal}
        onCloseOptionsModal={() => setShowOptionsModal(false)}
        isHistoricMode={isHistoricMode}
        onToggleHistoricMode={() => setIsHistoricMode((prev) => !prev)}
        isListManagerOpen={isListManagerOpen}
        onCloseListManager={() => setIsListManagerOpen(false)}
        listDetailId={listDetailId}
        onCloseListDetail={() => setListDetailId(null)}
        updateSeries={updateSeries}
        onTabChange={setActiveTab}
        onClearEpisode={() => setInternalEpisode(null)}
      />
    </div>
  );

  return createPortal(content, document.body);
};

export default MobileTVSeriesDetailModal;
