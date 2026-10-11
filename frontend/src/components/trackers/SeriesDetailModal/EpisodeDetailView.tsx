// src/components/trackers/SeriesDetailModal/EpisodeDetailView.tsx
import React from 'react';
import type {
  TMDBEpisode,
  TMDBSeries,
  UserEpisodeLog,
  FriendEpisodeLog,
} from '@/types/trackers';
export type { UnifiedReviewData } from '@/types/trackers';
export type FriendLog = FriendEpisodeLog;

import { ReviewDetailCard } from './shared/ReviewDetailCard';
import { ReviewCommentInput } from './shared/ReviewCommentInput';
import { EpisodeQuotesSection } from './EpisodeQuotesSection';
import { EpisodeReviewForm } from './EpisodeReviewForm';
import { aggregateFriendsReviews } from '@/utils/ratingUtils';
import { FriendsReviewsListView } from './shared/FriendsReviewsListView';
import { FriendDetailReviewsView } from './shared/FriendDetailReviewsView';
import { EpisodeMyReviewsList } from './EpisodeMyReviewsList';
import { EpisodeMainOverview } from './EpisodeMainOverview';
import {
  useEpisodeDetailLogic,
  type EpisodeViewState,
} from './hooks/useEpisodeDetailLogic';

interface EpisodeDetailViewProps {
  episode: TMDBEpisode;
  tmdbSeries?: TMDBSeries;
  logs: UserEpisodeLog[];
  onBack: () => void;
  initialView?: EpisodeViewState;
  initialReviewLogId?: number;
}

export const EpisodeDetailView: React.FC<EpisodeDetailViewProps> = ({
  episode,
  tmdbSeries,
  logs,
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
    myAverage,
    friendsAverage,
    tmdbValue,
    imagePlaceholder,
    friendsLogsData,
    openNewReview,
    openEditReview,
    handleDeleteLog,
    handleSave,
    handleToggleWatched,
    handleSaveQuote,
    handleDeleteQuote,
    commentMentions,
    handleSendComment,
  } = useEpisodeDetailLogic({
    episode,
    tmdbSeries,
    logs,
    initialView,
    initialReviewLogId,
  });

  const quotes = episode.quotes || [];

  // 1. Form View (Nuova o Modifica Recensione Episodio)
  if (view === 'form') {
    return (
      <EpisodeReviewForm
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
      />
    );
  }

  // 2. Reviews List View (Le mie recensioni dell'episodio)
  if (view === 'reviews') {
    return (
      <EpisodeMyReviewsList
        logs={logs}
        onBack={() => setView('main')}
        onOpenNewReview={openNewReview}
        onOpenEditReview={openEditReview}
        onSelectReview={(log) => {
          setSelectedReview({
            id: log.id,
            author_id: String(log.user_id),
            author_name: 'Tu',
            rating: (log.rating || 0) / 2,
            notes: log.notes || '',
            updated_at: log.watched_at,
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
        emptyMessage="Nessun amico ha recensito questo episodio."
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
          dateStr: log.watched_at,
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
        onBack={() => setView(selectedReview.is_mine ? 'reviews' : 'friend_detail')}
        onEdit={
          selectedReview.is_mine && isUserLog
            ? () => openEditReview(origLog as UserEpisodeLog)
            : undefined
        }
        onDelete={
          selectedReview.is_mine && isUserLog
            ? () => handleDeleteLog((origLog as UserEpisodeLog).id)
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

  // 6. Quotes View
  if (view === 'quotes') {
    return (
      <EpisodeQuotesSection
        quotes={quotes}
        onBackToMain={() => setView('main')}
        onSaveQuote={handleSaveQuote}
        onDeleteQuote={handleDeleteQuote}
      />
    );
  }

  // 7. Main Episode Detail View
  return (
    <EpisodeMainOverview
      episode={episode}
      logs={logs}
      onBack={onBack}
      handleToggleWatched={handleToggleWatched}
      imagePlaceholder={imagePlaceholder}
      onOpenQuotes={() => setView('quotes')}
      quotesCount={quotes.length}
      tmdbValue={tmdbValue}
      friendsAverage={friendsAverage}
      myAverage={myAverage}
      onOpenFriendsReviews={() => setView('friends_reviews')}
      onOpenMyReviews={() => setView('reviews')}
    />
  );
};
