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
} from '@/components/trackers/SeriesDetailModal/hooks/useSeriesDetailModalLogic';
import { useTrackersMutations } from '@/hooks/mutations/useTrackersMutations';
import { useBackHandler } from '@/utils/backButtonManager';
import { resolveImageUrl } from '@/utils/imageUtils';
import { LoadingIcon } from '@/components/shared/utils/Icons';
import { MobileSeriesReviewTab } from './MobileSeriesReviewTab';
import { MobileMediaListManagerModal } from './MobileMediaListManagerModal';
import { ListDetailModal } from '@/components/trackers/SeriesDetailModal/ListDetailModal';
import { MobileSeriesDetailBanner } from './MobileSeriesDetailBanner';
import { MobileEpisodeDetailBanner } from './MobileEpisodeDetailBanner';
import { MobileSeriesOverviewTab } from './MobileSeriesOverviewTab';
import { MobileSeriesSeasonsTab } from './MobileSeriesSeasonsTab';
import { MobileEpisodeDetailView } from './MobileEpisodeDetailView';
import { MobileSeriesDetailBottomBar } from './MobileSeriesDetailBottomBar';
import { MobileSeriesFriendsDrawer } from './MobileSeriesFriendsDrawer';
import { MobileSeriesListsDrawer } from './MobileSeriesListsDrawer';
import { MobileSeriesOptionsModal } from './MobileSeriesOptionsModal';

export interface MobileTVSeriesDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  series: SeriesDetailTarget | UserSeriesTracking;
  initialTab?: TabType;
  initialEpisode?: TMDBEpisode | null;
  initialReviewLogId?: number;
  isStandaloneEpisode?: boolean;
  onToggleTrack?: (tmdbId: number, isTracked: boolean) => void;
  onSelectRecommendation?: (series: SeriesRecommendation) => void;
  onGenreClick?: (genre: string) => void;
  onPlatformClick?: (platform: string, providerId?: number) => void;
  zIndexClass?: string;
}

export const MobileTVSeriesDetailModal: React.FC<MobileTVSeriesDetailModalProps> = ({
  isOpen,
  onClose,
  series,
  initialTab = 'overview',
  initialEpisode = null,
  initialReviewLogId,
  isStandaloneEpisode = false,
  onToggleTrack,
  onSelectRecommendation,
  onGenreClick,
  onPlatformClick,
  zIndexClass,
}) => {
  const [showFriendsDrawer, setShowFriendsDrawer] = useState(false);
  const [showListsDrawer, setShowListsDrawer] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);

  const { updateSeries } = useTrackersMutations();

  const {
    activeTab,
    setActiveTab,
    internalEpisode,
    setInternalEpisode,
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
    initialReviewLogId,
    onToggleTrack,
  });

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
      // Se c'è un episodio aperto, chiude il modale se standalone o torna alla lista delle stagioni
      if (currentEpisode) {
        if (isStandaloneEpisode) {
          onClose();
          return true;
        }
        setInternalEpisode(null);
        return true;
      }
      onClose();
      return true;
    },
    28
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

  const content = (
    <div
      className={`fixed inset-0 ${
        zIndexClass || 'z-[10020]'
      } bg-gray-50 flex flex-col h-[100dvh] w-full overflow-hidden pointer-events-auto animate-fadeIn select-none`}
    >
      {/* 1. BANNER FOTOGRAFICO SUPERIORE (Episodio a tutto schermo o Serie) */}
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
      ) : (
        <MobileSeriesDetailBanner
          backdropUrl={backdropUrl}
          title={title}
          genres={genres}
          onGenreClick={onGenreClick}
          friends={SERIES_FRIENDS}
          listsWithSeries={listsWithSeries}
          StatusIcon={StatusIcon}
          statusColor={statusColor}
          onClose={onClose}
          onOpenOptions={() => setShowOptionsModal(true)}
          onOpenFriendsDrawer={() => setShowFriendsDrawer(true)}
          onOpenListsDrawer={() => setShowListsDrawer(true)}
        />
      )}

      {/* 2. CONTENUTO SCROLLABILE (Episodio a tutto schermo o Schede Serie) */}
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
        ) : (
          <>
            {activeTab === 'overview' && (
              <MobileSeriesOverviewTab
                tmdbSeries={tmdbSeries}
                isUserTracked={isUserTracked}
                handleClickTrack={handleClickTrack}
                providersData={providersData}
                onPlatformClick={onPlatformClick}
                onSelectRecommendation={onSelectRecommendation}
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
                isLoading={false}
              />
            )}
            {activeTab === 'review' && (
              <MobileSeriesReviewTab
                tmdbSeries={tmdbSeries}
                userTracking={userTracking}
                initialReviewLogId={internalReviewLogId}
                onOpenEpisode={(ep) => {
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
        <MobileSeriesDetailBottomBar
          activeTab={currentEpisode ? 'seasons' : activeTab}
          onTabChange={(tab) => {
            if (tab === 'seasons') {
              setInternalEpisode(null);
              setActiveTab('seasons');
            } else {
              setInternalEpisode(null);
              setActiveTab(tab);
            }
          }}
        />
      )}

      {/* 5. DRAWERS DAL BASSO E MODALI SECONDARI */}
      <MobileSeriesFriendsDrawer
        isOpen={showFriendsDrawer}
        onClose={() => setShowFriendsDrawer(false)}
        friends={SERIES_FRIENDS}
        getStatusBorderColor={getStatusBorderColor}
      />

      <MobileSeriesListsDrawer
        isOpen={showListsDrawer}
        onClose={() => setShowListsDrawer(false)}
        lists={listsWithSeries}
        onSelectList={(id) => setListDetailId(id)}
        onOpenManager={() => setIsListManagerOpen(true)}
      />

      <MobileSeriesOptionsModal
        isOpen={showOptionsModal}
        onClose={() => setShowOptionsModal(false)}
        hasCustomPoster={Boolean(userTracking?.custom_poster_path)}
        onPosterUpdated={(url) => {
          const targetTmdbId = tmdbSeries.tmdb_id || userTracking?.series_tmdb_id;
          if (targetTmdbId) {
            updateSeries({
              id: targetTmdbId,
              updates: { custom_poster_path: url || undefined },
            });
          }
        }}
        isUserTracked={isUserTracked}
        isRewatching={Boolean(
          userTracking?.is_rewatching ||
          ('is_rewatching' in series && (series as { is_rewatching?: boolean }).is_rewatching)
        )}
        onStopRewatch={() => {
          const targetTmdbId = tmdbSeries.tmdb_id || userTracking?.series_tmdb_id;
          if (targetTmdbId) {
            updateSeries({
              id: targetTmdbId,
              updates: { is_rewatching: false },
            });
          }
        }}
        isAbandoned={userTracking?.status === 'dropped'}
        onAbandonSeries={() => {
          const targetTmdbId = tmdbSeries.tmdb_id || userTracking?.series_tmdb_id;
          if (targetTmdbId) {
            updateSeries({
              id: targetTmdbId,
              updates: { status: 'dropped', is_rewatching: false },
            });
          }
        }}
        onResumeSeries={() => {
          const targetTmdbId = tmdbSeries.tmdb_id || userTracking?.series_tmdb_id;
          const hasWatched = Boolean(
            tmdbSeries.episodes?.some((ep) => ep.is_watched || (ep.watch_count ?? 0) > 0)
          );
          const targetStatus = hasWatched ? 'watching' : 'to_watch';
          if (targetTmdbId) {
            updateSeries({
              id: targetTmdbId,
              updates: { status: targetStatus },
            });
          }
        }}
      />

      {isListManagerOpen && (
        <MobileMediaListManagerModal
          isOpen={isListManagerOpen}
          onClose={() => setIsListManagerOpen(false)}
          seriesId={tmdbSeries.tmdb_id}
        />
      )}

      {listDetailId !== null && (
        <ListDetailModal
          isOpen={listDetailId !== null}
          onClose={() => setListDetailId(null)}
          listId={listDetailId}
        />
      )}
    </div>
  );

  return createPortal(content, document.body);
};

export default MobileTVSeriesDetailModal;
