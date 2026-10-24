// src/mobile/components/trackers/detail/MobileReviewDetailView.tsx
import React from 'react';
import { ArrowLeft, Send, MessageCircle } from 'lucide-react';
import type { UnifiedReviewData } from '@/types/trackers';
import { StarRating } from '@/components/trackers/SeriesDetailModal/StarRating';
import { ReviewVisibilityIcon, getVisibilityLabel } from '@/components/trackers/SeriesDetailModal/shared/ReviewVisibilityBadge';
import { ReviewCommentItem } from '@/components/trackers/SeriesDetailModal/shared/ReviewCommentItem';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import { EditIcon, TrashIcon } from '@/components/shared/utils/Icons';
import type { MentionFriendUser } from '@/components/trackers/SeriesDetailModal/shared/useCommentMentions';

export interface MobileReviewDetailViewProps {
  review: UnifiedReviewData;
  onBack: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onReply: (authorName: string) => void;
  commentText: string;
  commentTextRef: React.RefObject<HTMLTextAreaElement | null>;
  mentionQuery: { active: boolean; query: string; startPos: number };
  mentionSuggestions: MentionFriendUser[];
  onChangeComment: (val: string) => void;
  onSelectMention: (username: string) => void;
  onSubmitComment: () => Promise<void> | void;
  isSubmittingComment?: boolean;
}

export const MobileReviewDetailView: React.FC<MobileReviewDetailViewProps> = ({
  review,
  onBack,
  onEdit,
  onDelete,
  onReply,
  commentText,
  commentTextRef,
  mentionQuery,
  mentionSuggestions,
  onChangeComment,
  onSelectMention,
  onSubmitComment,
  isSubmittingComment = false,
}) => {
  return (
    <div className="flex flex-col flex-1 min-h-[calc(100dvh-18.5rem)] justify-between select-none animate-fadeIn">
      {/* 1. SEZIONE SUPERIORE: INTESTAZIONE CON TASTI MODIFICA/ELIMINA IN ALTO A DESTRA */}
      <div className="flex items-center justify-between pb-3 pt-1 border-b border-gray-200/80 mb-3 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="p-1 -ml-1 text-gray-500 hover:text-gray-800 active:scale-90 transition-all cursor-pointer rounded-lg hover:bg-gray-100"
            title="Torna indietro"
            aria-label="Torna indietro"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h2 className="text-sm font-extrabold text-gray-900 truncate">
            {review.is_mine ? 'La tua recensione' : `Recensione di ${review.author_name}`}
          </h2>
        </div>

        {/* Tasti Modifica ed Elimina in alto a destra per la propria recensione */}
        {review.is_mine && (
          <div className="flex items-center gap-1 shrink-0">
            {onEdit && (
              <button
                type="button"
                title="Modifica"
                onClick={onEdit}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
              >
                <EditIcon className="h-5 w-5" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                title="Elimina"
                onClick={onDelete}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2. AREA CENTRALE SCORREVOLE: CARD RECENSIONE E COMMENTI */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {/* Card Recensione Principale */}
        <div className="bg-white border border-gray-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              {review.is_mine ? (
                <div
                  className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0"
                  title={getVisibilityLabel(review.review_visibility)}
                >
                  <ReviewVisibilityIcon visibility={review.review_visibility} className="w-4 h-4" />
                </div>
              ) : (
                <img
                  src={review.author_avatar || '/default_avatar.png'}
                  alt={review.author_name}
                  className="w-9 h-9 rounded-full border border-gray-100 object-cover shrink-0"
                />
              )}
              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-xs text-gray-900 truncate">
                  {review.author_name}
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-gray-400 font-medium">
                    {review.updated_at
                      ? new Date(review.updated_at).toLocaleDateString('it-IT', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'Visto nel passato'}
                  </span>
                  {review.viewing_platform_name && (
                    <span className="text-[9px] font-bold text-slate-600 bg-slate-50 border border-slate-200/80 px-1.5 py-0.5 rounded-md leading-none">
                      {review.viewing_platform_name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="shrink-0">
              <StarRating value={review.rating || 0} hideNumber readonly iconClassName="w-4 h-4" />
            </div>
          </div>

          {/* Testo della recensione */}
          <div className="text-xs sm:text-sm text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
            {review.review_visibility === 'private' && !review.is_mine ? (
              <span className="italic text-gray-400 flex items-center gap-2 text-xs">
                <ReviewVisibilityIcon visibility="private" className="w-3.5 h-3.5" />
                Recensione privata (solo il voto è visibile)
              </span>
            ) : (
              review.notes || <span className="italic text-gray-400">Nessun commento testuale.</span>
            )}
          </div>
        </div>

        {/* Sezione Commenti */}
        <div className="space-y-3 pt-1">
          <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 px-1">
            Commenti {review.comments.length > 0 && `(${review.comments.length})`}
          </h3>

          {review.comments.length === 0 ? (
            <div className="py-6 flex flex-col items-center justify-center">
              <EmptyState
                message="Non ci sono ancora commenti."
                icon={
                  <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-500 shadow-2xs">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                }
              />
            </div>
          ) : (
            <div className="space-y-2.5 bg-white border border-gray-200/90 rounded-2xl p-3.5 shadow-2xs">
              {review.comments.map((comment) => (
                <ReviewCommentItem key={comment.id} comment={comment} onReply={onReply} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. SEZIONE INFERIORE FISSA IN BASSO: TEXTAREA PER COMMENTO E TASTO INVIA ALLINEATI IN BASSO */}
      <div className="sticky bottom-0 bg-gray-50/95 backdrop-blur-xs pt-3 pb-1 mt-auto border-t border-gray-200/80 shrink-0 z-10 relative">
        {/* Suggerimenti Menzioni Friend (@) */}
        {mentionQuery.active && mentionSuggestions.length > 0 && (
          <div className="absolute bottom-full mb-2 left-0 right-0 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-2xl shadow-xl z-50 animate-fadeIn">
            {mentionSuggestions.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => onSelectMention(f.username)}
                className="w-full text-left px-3.5 py-2 hover:bg-blue-50 text-xs font-bold text-gray-800 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <img
                  src={f.profile_picture_url || '/default_avatar.png'}
                  alt={f.username}
                  className="w-6 h-6 rounded-full border border-gray-100 object-cover"
                />
                <span>@{f.username}</span>
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <textarea
            ref={commentTextRef}
            value={commentText}
            onChange={(e) => onChangeComment(e.target.value)}
            className="flex-1 bg-white border border-gray-200/90 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none resize-none h-11 custom-scrollbar transition-all shadow-2xs leading-normal"
            placeholder="Scrivi un commento..."
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !mentionQuery.active) {
                e.preventDefault();
                onSubmitComment();
              }
            }}
          />

          <button
            type="button"
            onClick={() => onSubmitComment()}
            disabled={!commentText.trim() || isSubmittingComment}
            className="h-11 w-11 bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-white rounded-2xl flex items-center justify-center transition-all shadow-xs shrink-0 cursor-pointer"
            title="Invia commento"
            aria-label="Invia commento"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileReviewDetailView;
