import React from 'react';
import type { Movie, MovieDetailTarget, UserMovieLog } from '@/types/movies';
import { useMovieReviewTabLogic } from './useMovieReviewTabLogic';
import { MovieMainOverview } from './MovieMainOverview';
import { MovieMyReviewsList } from './MovieMyReviewsList';
import { MovieReviewForm } from './MovieReviewForm';
import { ReviewDetailCard } from '@/components/trackers/SeriesDetailModal/shared/ReviewDetailCard';
import { ReviewCommentInput } from '@/components/trackers/SeriesDetailModal/shared/ReviewCommentInput';
import { FriendsReviewsListView } from '@/components/trackers/SeriesDetailModal/shared/FriendsReviewsListView';
import { FriendDetailReviewsView } from '@/components/trackers/SeriesDetailModal/shared/FriendDetailReviewsView';
import { aggregateFriendsReviews } from '@/utils/ratingUtils';

interface MovieReviewTabProps {
  movieTmdbId: number;
  movie: MovieDetailTarget;
  userMovie?: Movie;
  initialReviewLogId?: number;
  onAddTracking?: () => void;
}

export const MovieReviewTab: React.FC<MovieReviewTabProps> = ({
  movieTmdbId,
  movie,
  userMovie,
  initialReviewLogId,
  onAddTracking,
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
    platform,
    setPlatform,
    allPlatforms,
    reviewDate,
    setReviewDate,
    isDeleteDialogOpen,
    confirmDeleteLog,
    executeDeleteLog,
    cancelDeleteLog,
    isAddingQuote,
    setIsAddingQuote,
    newQuoteText,
    setNewQuoteText,
    editingQuoteId,
    handleOpenAddQuote,
    handleEditQuote,
    handleCancelQuote,
    handleSaveQuote,
    handleDeleteQuote,
    tmdbValue,
    friendsAverage,
    myAverage,
    logs,
    quotes,
    friendsLogsData,
    openNewReview,
    openEditReview,
    handleSave,
    commentMentions,
    handleSendComment,
    user,
  } = useMovieReviewTabLogic({
    movieTmdbId,
    movie,
    userMovie,
    initialReviewLogId,
    onAddTracking,
  });

  // 1. Form View (Nuova / Modifica Recensione Film)
  if (view === 'form') {
    return (
      <MovieReviewForm
        editingLogId={editingLogId}
        onBack={() => setView('my_reviews')}
        reviewDate={reviewDate}
        setReviewDate={setReviewDate}
        visibility={visibility}
        setVisibility={setVisibility}
        platform={platform}
        setPlatform={setPlatform}
        allPlatforms={allPlatforms}
        review={review}
        setReview={setReview}
        rating={rating}
        setRating={setRating}
        onSave={handleSave}
      />
    );
  }

  // 2. My Reviews View (Diario personale)
  if (view === 'my_reviews') {
    return (
      <MovieMyReviewsList
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
            rating: (log.rating || 0) / 2,
            notes: log.notes || '',
            updated_at: log.watched_at || log.updated_at || new Date().toISOString(),
            comments: log.comments || [],
            is_mine: true,
            review_visibility: log.review_visibility,
            viewing_platform_name: log.viewing_platform_name,
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
        emptyMessage="Nessun amico ha ancora recensito questo film."
      />
    );
  }

  // 4. Friend Detail View
  if (view === 'friend_detail' && selectedFriendId) {
    const friendLogs = friendsLogsData
      .filter((l) => String(l.friend_id) === selectedFriendId)
      .sort((a, b) => {
        const timeA = new Date(a.watched_at || '').getTime();
        const timeB = new Date(b.watched_at || '').getTime();
        return timeB - timeA;
      });
    const friendName = friendLogs[0]?.friend_name || '';

    return (
      <FriendDetailReviewsView
        friendName={friendName}
        onBack={() => setView('friends_reviews')}
        logs={friendLogs}
        getCardData={(log) => ({
          id: log.id,
          rating: log.rating,
          dateStr: log.watched_at || undefined,
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
            updated_at: log.watched_at,
            comments: log.comments || [],
            is_mine: false,
            review_visibility: log.review_visibility,
            viewing_platform_name: log.viewing_platform_name,
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
            ? () => openEditReview(origLog as UserMovieLog)
            : undefined
        }
        onDelete={
          selectedReview.is_mine && isUserLog
            ? () => confirmDeleteLog((origLog as UserMovieLog).id)
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
    <MovieMainOverview
      tmdbValue={tmdbValue}
      friendsAverage={friendsAverage}
      myAverage={myAverage}
      logsCount={logs.filter((l) => typeof l.rating === 'number' && l.rating! > 0).length}
      quotes={quotes}
      editingQuoteId={editingQuoteId}
      onOpenFriendsReviews={() => setView('friends_reviews')}
      onOpenMyReviews={() => setView('my_reviews')}
      onOpenNewReview={openNewReview}
      isAddingQuote={isAddingQuote}
      setIsAddingQuote={setIsAddingQuote}
      newQuoteText={newQuoteText}
      setNewQuoteText={setNewQuoteText}
      onSaveQuote={handleSaveQuote}
      onDeleteQuote={handleDeleteQuote}
      onEditQuote={handleEditQuote}
      onCancelQuote={handleCancelQuote}
      onOpenAddQuote={handleOpenAddQuote}
    />
  );
};
