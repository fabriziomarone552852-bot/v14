// src/components/trackers/series/detail/SeasonDetailView.tsx
import React from 'react';
import type {
  TMDBSeries,
  TMDBEpisode,
  UserSeriesTracking,
  UserSeasonLog,
  SeriesSeasonInfo,
} from '@/types/trackers';
import { ReviewDetailCard } from '@/components/trackers/shared/detail/ReviewDetailCard';
import { ReviewCommentInput } from '@/components/trackers/shared/detail/ReviewCommentInput';
import { FriendsReviewsListView } from '@/components/trackers/shared/detail/FriendsReviewsListView';
import { FriendDetailReviewsView } from '@/components/trackers/shared/detail/FriendDetailReviewsView';
import { aggregateFriendsReviews } from '@/utils/ratingUtils';
import { SeriesReviewForm } from './SeriesReviewForm';
import { EpisodeMyReviewsList } from './EpisodeMyReviewsList';
import { SeasonMainOverview } from './SeasonMainOverview';
import { useSeasonDetailLogic, type SeasonViewState } from './useSeasonDetailLogic';

interface SeasonDetailViewProps {
  seasonNumber: number;
  seasonInfo?: SeriesSeasonInfo;
  tmdbSeries: TMDBSeries;
  userTracking: UserSeriesTracking | null;
  episodes: TMDBEpisode[];
  watchedCount: number;
  totalCount: number;
  isSeasonWatched: boolean;
  onToggleSeasonWatched: () => void;
  onBack: () => void;
  initialView?: SeasonViewState;
  initialReviewLogId?: number;
}

export const SeasonDetailView: React.FC<SeasonDetailViewProps> = ({
  seasonNumber,
  seasonInfo,
  tmdbSeries,
  userTracking,
  episodes,
  watchedCount,
  totalCount,
  isSeasonWatched,
  onToggleSeasonWatched,
  onBack,
  initialView = 'main',
  initialReviewLogId,
}) => {
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
    seasonPosterUrl,
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

  // 1. Form View (Nuova o Modifica Recensione Stagione)
  if (view === 'form') {
    return (
      <SeriesReviewForm
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
    );
  }

  // 2. My Season Reviews List
  if (view === 'reviews') {
    return (
      <EpisodeMyReviewsList<UserSeasonLog>
        logs={logs}
        onBack={() => setView('main')}
        onOpenNewReview={openNewReview}
        onOpenEditReview={openEditReview}
        onDeleteReview={handleDeleteLog}
        backTitle="Torna ai Dettagli Stagione"
        emptyMessage="Nessuna recensione registrata per questa stagione."
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
      <FriendsReviewsListView
        friendsList={friendsList}
        onBack={() => setView('main')}
        onSelectFriend={(friendId) => {
          setSelectedFriendId(friendId);
          setView('friend_detail');
        }}
        title="Recensioni Amici"
        emptyMessage="Nessun amico ha recensito questa stagione."
      />
    );
  }

  // 4. Friend Detail View
  if (view === 'friend_detail' && selectedFriendId) {
    const friendLogs = friendsLogsData.filter(
      (l) => String(l.friend_id) === String(selectedFriendId)
    );
    const friendName = friendLogs[0]?.friend_name || '';

    return (
      <FriendDetailReviewsView
        friendName={friendName}
        onBack={() => setView('friends_reviews')}
        logs={friendLogs}
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
    );
  }

  // 5. Review Detail & Comments View
  if (view === 'review_detail' && selectedReview) {
    const origLog = selectedReview.original_log;
    return (
      <ReviewDetailCard
        review={selectedReview}
        onBack={() => setView(selectedReview.is_mine ? 'reviews' : 'friend_detail')}
        onEdit={
          selectedReview.is_mine && origLog
            ? () => openEditReview(origLog as UserSeasonLog)
            : undefined
        }
        onDelete={
          selectedReview.is_mine && origLog
            ? () => handleDeleteLog((origLog as UserSeasonLog).id)
            : undefined
        }
        onReply={(name) => commentMentions.handleReplyClick(name)}
        commentInputSlot={
          <ReviewCommentInput
            commentText={commentMentions.commentText}
            commentTextRef={commentMentions.commentTextRef}
            mentionQuery={commentMentions.mentionQuery}
            mentionSuggestions={commentMentions.mentionSuggestions}
            onChange={commentMentions.handleCommentChange}
            onSelectMention={commentMentions.handleSelectMention}
            onSubmit={handleSendComment}
          />
        }
      />
    );
  }

  // 6. Main Season Overview
  return (
    <SeasonMainOverview
      seasonTitle={seasonTitle}
      seasonInfo={seasonInfo}
      airDateRange={seasonAirDateRange}
      posterUrl={seasonPosterUrl}
      watchedCount={watchedCount}
      totalCount={totalCount}
      isSeasonWatched={isSeasonWatched}
      onBack={onBack}
      onToggleSeasonWatched={onToggleSeasonWatched}
      tmdbValue={tmdbSeasonValue}
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
