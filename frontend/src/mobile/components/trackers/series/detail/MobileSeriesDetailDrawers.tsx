import React from 'react';
import type {
  MediaList,
  SeriesDetailTarget,
  SeriesFriendDisplayItem,
  TMDBSeries,
  UserSeriesTracking,
} from '@/types/trackers';
import type { TabType } from '@/components/trackers/series/detail/useSeriesDetailModalLogic';
import { MobileTrackerFriendsDrawer } from '../../shared/detail/MobileTrackerFriendsDrawer';
import { MobileTrackerListsDrawer } from '../../shared/detail/MobileTrackerListsDrawer';
import { MobileTrackerListManagerModal } from '../../shared/detail/MobileTrackerListManagerModal';
import { TrackerListDetailModal } from '@/components/trackers/shared/detail/TrackerListDetailModal';
import { MobileSeriesOptionsModal } from './MobileSeriesOptionsModal';

export interface MobileSeriesDetailDrawersProps {
  tmdbSeries: TMDBSeries;
  series: SeriesDetailTarget | UserSeriesTracking;
  userTracking?: UserSeriesTracking | null;
  isUserTracked: boolean;
  showFriendsDrawer: boolean;
  onCloseFriendsDrawer: () => void;
  friends: SeriesFriendDisplayItem[];
  getStatusBorderColor: (status: string) => string;
  showListsDrawer: boolean;
  onCloseListsDrawer: () => void;
  listsWithSeries: MediaList[];
  onSelectList: (id: number) => void;
  onOpenManager: () => void;
  showOptionsModal: boolean;
  onCloseOptionsModal: () => void;
  isHistoricMode: boolean;
  onToggleHistoricMode: () => void;
  isListManagerOpen: boolean;
  onCloseListManager: () => void;
  listDetailId: number | null;
  onCloseListDetail: () => void;
  updateSeries: (payload: {
    id: number;
    updates: {
      status?: string;
      is_rewatching?: boolean;
      custom_poster_path?: string;
    };
  }) => void;
  onTabChange: (tab: TabType) => void;
  onClearEpisode: () => void;
}

export const MobileSeriesDetailDrawers: React.FC<MobileSeriesDetailDrawersProps> = ({
  tmdbSeries,
  series,
  userTracking,
  isUserTracked,
  showFriendsDrawer,
  onCloseFriendsDrawer,
  friends,
  getStatusBorderColor,
  showListsDrawer,
  onCloseListsDrawer,
  listsWithSeries,
  onSelectList,
  onOpenManager,
  showOptionsModal,
  onCloseOptionsModal,
  isHistoricMode,
  onToggleHistoricMode,
  isListManagerOpen,
  onCloseListManager,
  listDetailId,
  onCloseListDetail,
  updateSeries,
  onTabChange,
  onClearEpisode,
}) => {
  const targetTmdbId = tmdbSeries.tmdb_id || userTracking?.series_tmdb_id;

  return (
    <>
      <MobileTrackerFriendsDrawer
        isOpen={showFriendsDrawer}
        onClose={onCloseFriendsDrawer}
        friends={friends}
        getStatusBorderColor={getStatusBorderColor}
        mediaType="series"
      />

      <MobileTrackerListsDrawer
        isOpen={showListsDrawer}
        onClose={onCloseListsDrawer}
        lists={listsWithSeries}
        onSelectList={onSelectList}
        onOpenManager={onOpenManager}
        emptyMessage="Questa serie non è ancora presente in nessuna lista."
      />

      <MobileSeriesOptionsModal
        isOpen={showOptionsModal}
        onClose={onCloseOptionsModal}
        hasCustomPoster={Boolean(userTracking?.custom_poster_path)}
        onPosterUpdated={(url) => {
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
          if (targetTmdbId) {
            updateSeries({
              id: targetTmdbId,
              updates: { is_rewatching: false },
            });
          }
        }}
        isAbandoned={userTracking?.status === 'dropped'}
        onAbandonSeries={() => {
          if (targetTmdbId) {
            updateSeries({
              id: targetTmdbId,
              updates: { status: 'dropped', is_rewatching: false },
            });
          }
        }}
        onResumeSeries={() => {
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
        isHistoricMode={isHistoricMode}
        onEnableHistoricMode={() => {
          onToggleHistoricMode();
          onTabChange('seasons');
          onClearEpisode();
        }}
      />

      {isListManagerOpen && (
        <MobileTrackerListManagerModal
          isOpen={isListManagerOpen}
          onClose={onCloseListManager}
          seriesId={tmdbSeries.tmdb_id}
        />
      )}

      {listDetailId !== null && (
        <TrackerListDetailModal
          isOpen={listDetailId !== null}
          onClose={onCloseListDetail}
          listId={listDetailId}
        />
      )}
    </>
  );
};
