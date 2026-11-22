// src/mobile/components/trackers/detail/MobileSeriesReviewTab.tsx
import React from 'react';
import type { TMDBSeries, UserSeriesTracking, TMDBEpisode, UserSeriesLog } from '@/types/trackers';
import { useSeriesReviewTabLogic } from '@/components/trackers/series/detail/useSeriesReviewTabLogic';
import { aggregateFriendsReviews } from '@/utils/ratingUtils';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import { FriendsReviewsListView } from '@/components/trackers/shared/detail/FriendsReviewsListView';
import { FriendDetailReviewsView } from '@/components/trackers/shared/detail/FriendDetailReviewsView';
import { MobileReviewDetailView } from '../../shared/detail/MobileReviewDetailView';
import { MobileTrackerRatingsBar } from '../../shared/detail/MobileTrackerRatingsBar';
import { MobileSeriesReviewForm } from './MobileSeriesReviewForm';
import { MobileSeriesMyReviewsList } from './MobileSeriesMyReviewsList';

export interface MobileSeriesReviewTabProps {
  tmdbSeries: TMDBSeries;
  userTracking: UserSeriesTracking | null;
  initialReviewLogId?: number;
  onOpenEpisode?: (episode: TMDBEpisode) => void;
}

export const MobileSeriesReviewTab: React.FC<MobileSeriesReviewTabProps> = ({
  tmdbSeries,
  userTracking,
  initialReviewLogId,
  onOpenEpisode,
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
    SERIES_QUOTES,
    logs,
    friendsLogsData,
    tmdbValue,
    myAverage,
    friendsAverage,
    openNewReview,
    openEditReview,
    confirmDeleteLog,
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
      <div className="absolute inset-0 z-20 bg-gray-50 flex flex-col justify-between overflow-hidden p-4 pb-0 select-none animate-fadeIn">
        <MobileSeriesReviewForm
          editingLogId={editingLogId}
          onBack={() => setView(logs.length > 0 ? 'my_reviews' : 'main')}
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
      </div>
    );
  }

  // 2. My Reviews View (Elenco Personale con Selezione Multipla)
  if (view === 'my_reviews') {
    return (
      <MobileSeriesMyReviewsList
        logs={logs}
        onBack={() => setView('main')}
        onOpenNewReview={openNewReview}
        onOpenEditReview={openEditReview}
        onDeleteReview={(id) => confirmDeleteLog(id)}
        onDeleteReviews={(ids) => ids.forEach((id) => confirmDeleteLog(id))}
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
          emptyMessage="Nessun amico ha recensito questa serie."
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
            dateStr: log.watched_at || log.updated_at || new Date().toISOString(),
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
              updated_at: log.watched_at || log.updated_at || new Date().toISOString(),
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

  // 5. Review Detail & Comments View (Mobile Nativo)
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
        openEditReview(origLog as UserSeriesLog);
      } else {
        const found = logs.find((l) => l.id === selectedReview.id);
        if (found) openEditReview(found);
      }
    };

    const handleDeleteCurrentReview = () => {
      const logId = isUserLog ? (origLog as UserSeriesLog).id : selectedReview.id;
      confirmDeleteLog(Number(logId));
    };

    return (
      <div className="animate-fadeIn">
        <MobileReviewDetailView
          review={selectedReview}
          onBack={() => setView(selectedReview.is_mine ? 'my_reviews' : 'friend_detail')}
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

  // 6. Main Dashboard View (Barra voti unificata su riga singola)
  return (
    <div className="flex flex-col gap-5 animate-fadeIn pb-6">
      {/* SEZIONE VOTI SU RIGA SINGOLA (TMDB | IL TUO VOTO | AMICI) */}
      <MobileTrackerRatingsBar
        tmdbValue={tmdbValue}
        myAverage={myAverage}
        friendsAverage={friendsAverage}
        ratedLogsCount={logs.filter((l) => typeof l.rating === 'number').length}
        onOpenMyReviews={() => setView('my_reviews')}
        onOpenAddOrMyReviews={logs.length > 0 ? () => setView('my_reviews') : openNewReview}
        onOpenFriendsReviews={() => setView('friends_reviews')}
      />

      {/* CITAZIONI DELLA SERIE */}
      <div className="w-full bg-white border border-gray-200/80 rounded-2xl p-4 shadow-2xs flex flex-col gap-3">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-2">
            <span>Citazioni della Serie</span>
            {SERIES_QUOTES.length > 0 && (
              <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                {SERIES_QUOTES.length}
              </span>
            )}
          </h3>
        </div>
        {SERIES_QUOTES.length === 0 ? (
          <div className="py-6 flex flex-col items-center justify-center">
            <EmptyState message="Nessuna citazione salvata per questa serie." />
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto custom-scrollbar">
            {SERIES_QUOTES.map((q) => (
              <div
                key={q.id}
                onClick={() => onOpenEpisode && onOpenEpisode(q.episodeData)}
                className="p-3 bg-gray-50/70 hover:bg-blue-50/50 rounded-xl border border-gray-200/70 transition-all cursor-pointer flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between text-[10px] font-bold text-gray-400">
                  <span className="text-blue-600 font-extrabold">{q.episodeStr}</span>
                </div>
                <p className="text-xs text-gray-800 italic leading-relaxed">
                  &ldquo;{q.text}&rdquo;
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileSeriesReviewTab;
