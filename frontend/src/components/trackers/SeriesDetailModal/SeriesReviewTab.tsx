// src/components/trackers/SeriesDetailModal/SeriesReviewTab.tsx
import React from 'react';
import type { TMDBSeries, UserSeriesTracking, TMDBEpisode, UserSeriesLog } from '@/types/trackers';
export type { UnifiedReviewData, UserSeriesLog } from '@/types/trackers';
export { renderCommentText } from './shared/ReviewCommentItem';

import { ReviewDetailCard } from './shared/ReviewDetailCard';
import { ReviewCommentInput } from './shared/ReviewCommentInput';
import { SeriesReviewForm } from './SeriesReviewForm';
import { useSeriesReviewTabLogic } from './hooks/useSeriesReviewTabLogic';
import { aggregateFriendsReviews } from '@/utils/ratingUtils';
import { FriendsReviewsListView } from './shared/FriendsReviewsListView';
import { FriendDetailReviewsView } from './shared/FriendDetailReviewsView';
import { SeriesMyReviewsList } from './SeriesMyReviewsList';
import { SeriesMainOverview } from './SeriesMainOverview';

interface SeriesReviewTabProps {
  tmdbSeries: TMDBSeries;
  userTracking: UserSeriesTracking | null;
  onOpenEpisode?: (episode: TMDBEpisode) => void;
  initialReviewLogId?: number;
}

export const SeriesReviewTab: React.FC<SeriesReviewTabProps> = ({
  tmdbSeries,
  userTracking,
  onOpenEpisode,
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
    isDeleteDialogOpen,
    confirmDeleteLog,
    executeDeleteLog,
    cancelDeleteLog,
    SERIES_QUOTES,
    logs,
    friendsLogsData,
    tmdbValue,
    myAverage,
    friendsAverage,
    openNewReview,
    openEditReview,
    handleSave,
    commentMentions,
    handleSendComment,
    user,
  } = useSeriesReviewTabLogic({
    tmdbSeries,
    userTracking,
    initialReviewLogId,
  });

  // 1. Form View (Nuova o Modifica Recensione Serie)
  if (view === 'form') {
    return (
      <SeriesReviewForm
        editingLogId={editingLogId}
        onBack={() => setView('my_reviews')}
        reviewDate={reviewDate}
        setReviewDate={setReviewDate}
        visibility={visibility}
        setVisibility={setVisibility}
        review={review}
        setReview={setReview}
        rating={rating}
        setRating={setRating}
        onSave={handleSave}
      />
    );
  }

  // 2. My Reviews View
  if (view === 'my_reviews') {
    return (
      <SeriesMyReviewsList
        logs={logs}
        onBack={() => setView('main')}
        onOpenNewReview={openNewReview}
        onOpenEditReview={openEditReview}
        onConfirmDelete={confirmDeleteLog}
        onSelectReview={(log) => {
          setSelectedReview({
            id: log.id,
            author_id: String(user?.id || ''),
            author_name: 'Tu',
            rating: log.rating || 0,
            notes: log.notes || '',
            updated_at: log.updated_at || new Date().toISOString(),
            comments: log.comments || [],
            is_mine: true,
            review_visibility: log.review_visibility,
            original_log: log,
          });
          setView('review_detail');
        }}
        isDeleteDialogOpen={isDeleteDialogOpen}
        onExecuteDelete={executeDeleteLog}
        onCancelDelete={cancelDeleteLog}
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
        emptyMessage="Nessun amico ha recensito questa serie."
      />
    );
  }

  // 4. Friend Detail View
  if (view === 'friend_detail' && selectedFriendId) {
    const friendLogs = friendsLogsData
      .filter((l) => String(l.friend_id) === selectedFriendId)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    const friendName = friendLogs[0]?.friend_name || '';

    return (
      <FriendDetailReviewsView
        friendName={friendName}
        onBack={() => setView('friends_reviews')}
        logs={friendLogs}
        getCardData={(log) => ({
          id: log.id,
          rating: log.rating,
          dateStr: log.updated_at,
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
            rating: (log.rating || 0) / 2,
            notes: log.notes || '',
            updated_at: log.updated_at,
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

  // 5. Review Detail & Comments View (Condiviso)
  if (view === 'review_detail' && selectedReview) {
    const origLog = selectedReview.original_log;
    const isUserLog = origLog && 'user_id' in origLog;

    return (
      <ReviewDetailCard
        review={selectedReview}
        onBack={() => setView(selectedReview.is_mine ? 'my_reviews' : 'friend_detail')}
        onEdit={
          selectedReview.is_mine && isUserLog
            ? () => openEditReview(origLog as UserSeriesLog)
            : undefined
        }
        onDelete={
          selectedReview.is_mine && isUserLog
            ? () => confirmDeleteLog((origLog as UserSeriesLog).id)
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

  // 6. Main Dashboard View
  return (
    <SeriesMainOverview
      tmdbValue={tmdbValue}
      friendsAverage={friendsAverage}
      myAverage={myAverage}
      logsCount={logs.filter((l) => typeof l.rating === 'number').length}
      quotes={SERIES_QUOTES}
      onOpenFriendsReviews={() => setView('friends_reviews')}
      onOpenMyReviews={() => setView('my_reviews')}
      onOpenEpisode={onOpenEpisode}
    />
  );
};
