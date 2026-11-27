import React, { useState } from 'react';
import type {
  TMDBEpisode,
  TMDBSeries,
  UserEpisodeLog,
  UserSeriesTracking,
} from '@/types/trackers';
import { MobileEpisodeQuotesSection } from './MobileEpisodeQuotesSection';
import { MobileEpisodeReviewForm } from './MobileEpisodeReviewForm';
import { MobileEpisodeMyReviewsList } from './MobileEpisodeMyReviewsList';
import { MobileEpisodeMainOverview } from './MobileEpisodeMainOverview';
import { MobileReviewDetailView } from '../../shared/detail/MobileReviewDetailView';
import { aggregateFriendsReviews } from '@/utils/ratingUtils';
import { FriendsReviewsListView } from '@/components/trackers/shared/detail/FriendsReviewsListView';
import { FriendDetailReviewsView } from '@/components/trackers/shared/detail/FriendDetailReviewsView';
import {
  useEpisodeDetailLogic,
  type EpisodeViewState,
} from '@/components/trackers/series/detail/useEpisodeDetailLogic';
import { useTrackersMutations } from '@/hooks/mutations/useTrackersMutations';
import type { MobileWatchActionTarget } from './MobileWatchActionDrawer';
import { showTrackerToast } from '@/components/trackers/shared/TrackerToast';

export interface MobileEpisodeDetailViewProps {
  episode: TMDBEpisode;
  tmdbSeries: TMDBSeries;
  userTracking: UserSeriesTracking | null;
  logs: UserEpisodeLog[];
  initialView?: EpisodeViewState;
  initialReviewLogId?: number;
}

export const MobileEpisodeDetailView: React.FC<MobileEpisodeDetailViewProps> = ({
  episode,
  tmdbSeries,
  userTracking,
  logs,
  initialView = 'main',
  initialReviewLogId,
}) => {
  const [drawerTarget, setDrawerTarget] = useState<MobileWatchActionTarget | null>(null);
  const { toggleEpisodeWatched, deleteEpisodeLog } = useTrackersMutations();

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
    myAverage,
    friendsAverage,
    tmdbValue,
    friendsLogsData,
    openNewReview,
    openEditReview,
    handleDeleteLog,
    handleSave,
    handleToggleWatched,
    handleSaveQuote,
    handleDeleteQuote,
    optimisticWatchCount,
    isWatched,
    quotes,
    commentMentions,
    handleSendComment,
  } = useEpisodeDetailLogic({
    episode,
    tmdbSeries,
    logs,
    initialView,
    initialReviewLogId,
  });

  const watchCount = optimisticWatchCount;

  // Gestione tocco pallino visto / rewatch
  const handleCircleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userTracking) {
      showTrackerToast('Aggiungi prima la serie alla tua libreria', 'warning');
      return;
    }
    if (watchCount === 0) {
      handleToggleWatched();
    } else {
      setDrawerTarget({
        type: 'episode',
        id: episode.id,
        title: episode.title || `Episodio ${episode.episode_number}`,
        seasonNumber: episode.season_number,
        episodeNumber: episode.episode_number,
        watchCount,
      });
    }
  };

  const handleDrawerAddWatch = () => {
    toggleEpisodeWatched({ episode_id: episode.id, watched: true });
  };

  const handleDrawerResetWatch = () => {
    for (let i = 0; i < watchCount; i++) {
      toggleEpisodeWatched({ episode_id: episode.id, watched: false });
    }
  };

  const handleDrawerSubWatch = () => {
    toggleEpisodeWatched({ episode_id: episode.id, watched: false });
  };

  // 1. Form View (Nuova o Modifica Recensione Episodio)
  if (view === 'form') {
    return (
      <div className="absolute inset-0 z-20 bg-gray-50 flex flex-col justify-between overflow-hidden p-4 pb-0 select-none animate-fadeIn">
        <MobileEpisodeReviewForm
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
          platform={platform}
          setPlatform={setPlatform}
          allPlatforms={allPlatforms}
          onSave={handleSave}
        />
      </div>
    );
  }

  // 2. Reviews List View (Le mie recensioni dell'episodio - intestazione fissa)
  if (view === 'reviews') {
    return (
      <MobileEpisodeMyReviewsList
        logs={logs}
        onBack={() => setView('main')}
        onOpenNewReview={openNewReview}
        onOpenEditReview={openEditReview}
        onDeleteReview={(id) => deleteEpisodeLog(id)}
        onDeleteReviews={(ids) => ids.forEach((id) => deleteEpisodeLog(id))}
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
            viewing_platform_name: log.viewing_platform_name ?? null,
            original_log: log,
          });
          setView('review_detail');
        }}
      />
    );
  }

  // 3. Friends Reviews Overview (intestazione fissa)
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
          emptyMessage="Nessun amico ha recensito questo episodio."
          mobileFixedHeader
        />
      </div>
    );
  }

  // 4. Friend Detail View (intestazione fissa)
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
      </div>
    );
  }

  // 5. Review Detail & Comments View (Dedicato Mobile)
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
        openEditReview(origLog as UserEpisodeLog);
      } else {
        const found = logs.find((l) => l.id === selectedReview.id);
        if (found) openEditReview(found);
      }
    };

    const handleDeleteCurrentReview = () => {
      const logId = isUserLog ? (origLog as UserEpisodeLog).id : selectedReview.id;
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

  // 6. Quotes View
  if (view === 'quotes') {
    return (
      <div className="h-full flex flex-col flex-1 animate-fadeIn">
        <MobileEpisodeQuotesSection
          quotes={quotes}
          onBackToMain={() => setView('main')}
          onSaveQuote={handleSaveQuote}
          onDeleteQuote={handleDeleteQuote}
          onDeleteQuotes={(ids) => ids.forEach((id) => handleDeleteQuote(id))}
        />
      </div>
    );
  }

  // 7. Schermata Principale Episodio Mobile
  return (
    <MobileEpisodeMainOverview
      episode={episode}
      logs={logs}
      isWatched={isWatched}
      watchCount={watchCount}
      quotesCount={quotes.length}
      tmdbValue={tmdbValue}
      myAverage={myAverage}
      friendsAverage={friendsAverage}
      onCircleClick={handleCircleClick}
      onOpenQuotes={() => setView('quotes')}
      onOpenMyReviews={() => setView('reviews')}
      onOpenNewReview={openNewReview}
      onOpenFriendsReviews={() => setView('friends_reviews')}
      drawerTarget={drawerTarget}
      onCloseDrawer={() => setDrawerTarget(null)}
      onDrawerAddWatch={handleDrawerAddWatch}
      onDrawerResetWatch={handleDrawerResetWatch}
      onDrawerSubWatch={handleDrawerSubWatch}
    />
  );
};

export default MobileEpisodeDetailView;
