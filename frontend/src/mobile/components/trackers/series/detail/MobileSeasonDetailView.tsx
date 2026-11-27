// src/mobile/components/trackers/series/detail/MobileSeasonDetailView.tsx
import React, { useMemo } from 'react';
import type {
  TMDBSeries,
  UserSeriesTracking,
  UserSeasonLog,
} from '@/types/trackers';
import { FriendsReviewsListView } from '@/components/trackers/shared/detail/FriendsReviewsListView';
import { FriendDetailReviewsView } from '@/components/trackers/shared/detail/FriendDetailReviewsView';
import { aggregateFriendsReviews } from '@/utils/ratingUtils';
import { useSeriesExtras } from '@/hooks/queries/useTrackersQueries';
import { MobileReviewDetailView } from '../../shared/detail/MobileReviewDetailView';
import { MobileSeriesReviewForm } from './MobileSeriesReviewForm';
import { MobileEpisodeMyReviewsList } from './MobileEpisodeMyReviewsList';
import { MobileSeasonMainOverview } from './MobileSeasonMainOverview';
import {
  useSeasonDetailLogic,
  type SeasonViewState,
} from '@/components/trackers/series/detail/useSeasonDetailLogic';

export interface MobileSeasonDetailViewProps {
  seasonNumber: number;
  tmdbSeries: TMDBSeries;
  userTracking: UserSeriesTracking | null;
  isHistoricMode?: boolean;
  initialView?: SeasonViewState;
  initialReviewLogId?: number;
}

export const MobileSeasonDetailView: React.FC<MobileSeasonDetailViewProps> = ({
  seasonNumber,
  tmdbSeries,
  userTracking,
  isHistoricMode = false,
  initialView = 'main',
  initialReviewLogId,
}) => {
  const { data: extras } = useSeriesExtras(tmdbSeries.tmdb_id);
  const seasonInfo = useMemo(
    () => extras?.seasons?.find((s) => s.season_number === seasonNumber),
    [extras?.seasons, seasonNumber]
  );

  const episodes = useMemo(
    () => (tmdbSeries.episodes || []).filter((ep) => ep.season_number === seasonNumber),
    [tmdbSeries.episodes, seasonNumber]
  );

  const watchedCount = useMemo(
    () => episodes.filter((ep) => (ep.watch_count || 0) > 0).length,
    [episodes]
  );

  const seasonMinWatchCount = useMemo(
    () => (episodes.length > 0 ? Math.min(...episodes.map((ep) => ep.watch_count || 0)) : 0),
    [episodes]
  );

  const {
    view,
    setView,
    selectedFriendId,
    setSelectedFriendId,
    selectedReview,
    setSelectedReview,
    editingLogId,
    rating,
    setRating,
    review,
    setReview,
    visibility,
    setVisibility,
    reviewDate,
    setReviewDate,
    logs,
    friendsLogsData,
    mySeasonAverage,
    mySeasonRatedCount,
    myEpisodesAverage,
    myEpisodesRatedCount,
    friendsAverage,
    tmdbSeasonValue,
    seasonTitle,
    seasonAirDateRange,
    openNewReview,
    openEditReview,
    handleDeleteLog,
    handleSave,
    commentMentions,
    handleSendComment,
  } = useSeasonDetailLogic({
    tmdbSeries,
    userTracking,
    seasonNumber,
    seasonInfo,
    episodes,
    initialView,
    initialReviewLogId,
  });

  // 1. Form View
  if (view === 'form') {
    return (
      <div className="absolute inset-0 z-20 bg-gray-50 flex flex-col justify-between overflow-hidden p-4 pb-0 select-none animate-fadeIn">
        <MobileSeriesReviewForm
          editingLogId={editingLogId}
          onBack={() => setView(logs.length > 0 ? 'reviews' : 'main')}
          reviewDate={reviewDate}
          setReviewDate={setReviewDate}
          visibility={visibility}
          setVisibility={setVisibility}
          review={review}
          setReview={setReview}
          rating={rating}
          setRating={setRating}
          onSave={handleSave}
          title={editingLogId ? 'Modifica Recensione Stagione' : 'Nuova Recensione Stagione'}
          placeholder="Cosa ne pensi di questa stagione?"
        />
      </div>
    );
  }

  // 2. My Reviews List
  if (view === 'reviews') {
    return (
      <MobileEpisodeMyReviewsList<UserSeasonLog>
        logs={logs}
        onBack={() => setView('main')}
        onOpenNewReview={openNewReview}
        onOpenEditReview={openEditReview}
        onDeleteReview={handleDeleteLog}
        onDeleteReviews={(ids) => ids.forEach((id) => handleDeleteLog(id))}
        backTitle="Torna alla stagione"
        emptyMessage="Non hai ancora scritto alcuna recensione per questa stagione."
        onSelectReview={(log) => {
          setSelectedReview({
            id: log.id,
            author_id: String(log.user_id),
            author_name: 'Tu',
            rating: log.rating ? log.rating / 2 : 0,
            notes: log.notes || '',
            updated_at: log.watched_at || log.updated_at,
            comments: log.comments || [],
            is_mine: true,
            review_visibility: log.review_visibility,
            original_log: log,
          });
          setView('review_detail');
        }}
      />
    );
  }

  // 3. Friends Reviews Overview
  if (view === 'friends_reviews') {
    const friendsList = aggregateFriendsReviews(friendsLogsData);
    return (
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden -mb-4 animate-fadeIn">
        <FriendsReviewsListView
          friendsList={friendsList}
          onBack={() => setView('main')}
          onSelectFriend={(friendId) => {
            setSelectedFriendId(friendId);
            setView('friend_detail');
          }}
          title="Recensioni Amici"
          emptyMessage="Nessun amico ha recensito questa stagione."
          mobileFixedHeader
        />
      </div>
    );
  }

  // 4. Friend Detail View
  if (view === 'friend_detail' && selectedFriendId) {
    const friendLogs = friendsLogsData.filter(
      (l) => String(l.friend_id) === String(selectedFriendId)
    );
    const friendName = friendLogs[0]?.friend_name || '';

    return (
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden -mb-4 animate-fadeIn">
        <FriendDetailReviewsView
          friendName={friendName}
          onBack={() => setView('friends_reviews')}
          logs={friendLogs}
          mobileFixedHeader
          getCardData={(log) => ({
            id: log.id,
            rating: log.rating,
            dateStr: log.watched_at || log.updated_at,
            notes: log.notes,
            review_visibility: log.review_visibility,
            commentsCount: log.comments?.length,
          })}
          onSelectReview={(log) => {
            setSelectedReview({
              id: log.id,
              author_id: String(log.friend_id),
              author_name: log.friend_name,
              author_avatar: log.friend_avatar || '',
              rating: log.rating ? log.rating / 2 : 0,
              notes: log.notes || '',
              updated_at: log.watched_at || log.updated_at,
              comments: log.comments || [],
              is_mine: false,
              review_visibility: log.review_visibility,
              original_log: log,
            });
            setView('review_detail');
          }}
        />
      </div>
    );
  }

  // 5. Review Detail & Comments View
  if (view === 'review_detail') {
    if (!selectedReview) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-12 gap-3 text-gray-500 min-h-[300px]">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-gray-500">Apertura recensione...</span>
        </div>
      );
    }

    const origLog = selectedReview.original_log;
    const isUserLog = origLog && 'user_id' in origLog;

    const handleEditCurrentReview = () => {
      if (isUserLog) {
        openEditReview(origLog as UserSeasonLog);
      } else {
        const found = logs.find((l) => l.id === selectedReview.id);
        if (found) openEditReview(found);
      }
    };

    const handleDeleteCurrentReview = () => {
      const logId = isUserLog ? (origLog as UserSeasonLog).id : selectedReview.id;
      handleDeleteLog(Number(logId));
    };

    return (
      <div className="animate-fadeIn">
        <MobileReviewDetailView
          review={selectedReview}
          onBack={() => setView(selectedReview.is_mine ? 'reviews' : 'friend_detail')}
          onEdit={selectedReview.is_mine ? handleEditCurrentReview : undefined}
          onDelete={selectedReview.is_mine ? handleDeleteCurrentReview : undefined}
          onReply={(name) => commentMentions.handleReplyClick(name)}
          commentText={commentMentions.commentText}
          commentTextRef={commentMentions.commentTextRef}
          mentionQuery={commentMentions.mentionQuery}
          mentionSuggestions={commentMentions.mentionSuggestions}
          onChangeComment={commentMentions.handleCommentChange}
          onSelectMention={commentMentions.handleSelectMention}
          onSubmitComment={handleSendComment}
        />
      </div>
    );
  }

  // 6. Main Season Overview Mobile
  return (
    <MobileSeasonMainOverview
      seasonNumber={seasonNumber}
      seasonTitle={seasonTitle}
      seasonInfo={seasonInfo}
      airDateRange={seasonAirDateRange}
      userTracking={userTracking}
      episodes={episodes}
      watchedCount={watchedCount}
      totalCount={episodes.length}
      seasonMinWatchCount={seasonMinWatchCount}
      isHistoricMode={isHistoricMode}
      tmdbSeasonValue={tmdbSeasonValue}
      myEpisodesAverage={myEpisodesAverage}
      myEpisodesRatedCount={myEpisodesRatedCount}
      friendsAverage={friendsAverage}
      mySeasonAverage={mySeasonAverage}
      mySeasonRatedCount={mySeasonRatedCount}
      logs={logs}
      onOpenFriendsReviews={() => setView('friends_reviews')}
      onOpenMyReviews={() => (logs.length > 0 ? setView('reviews') : openNewReview())}
    />
  );
};

export default MobileSeasonDetailView;
