import React from 'react';
import type { UnifiedReviewData } from '@/types/trackers';
import { StarRating } from '../StarRating';
import { ReviewVisibilityIcon, getVisibilityLabel } from './ReviewVisibilityBadge';
import { ReviewCommentItem } from './ReviewCommentItem';
import { EditIcon, TrashIcon } from '@/components/shared/utils/Icons';

interface ReviewDetailCardProps {
  review: UnifiedReviewData;
  onBack: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onReply: (authorName: string) => void;
  commentInputSlot?: React.ReactNode;
}

export const ReviewDetailCard: React.FC<ReviewDetailCardProps> = ({
  review,
  onBack,
  onEdit,
  onDelete,
  onReply,
  commentInputSlot,
}) => {
  return (
    <div className="flex flex-col h-full animate-fadeIn">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-full transition-colors"
            title="Torna indietro"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h2 className="text-xl font-bold text-gray-900">
            {review.is_mine ? 'La tua recensione' : `Recensione di ${review.author_name}`}
          </h2>
        </div>

        {review.is_mine && (
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                title="Modifica recensione"
              >
                <EditIcon className="w-5 h-5" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                title="Elimina recensione"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-6 pt-4 pr-2">
        {/* Main Review Box */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {review.is_mine ? (
                <div
                  className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700"
                  title={getVisibilityLabel(review.review_visibility)}
                >
                  <ReviewVisibilityIcon visibility={review.review_visibility} className="w-5 h-5" />
                </div>
              ) : (
                <img
                  src={review.author_avatar || '/default_avatar.png'}
                  alt={review.author_name}
                  className="w-10 h-10 rounded-full border border-gray-100 object-cover"
                />
              )}
              <div>
                <div className="font-bold text-gray-900">{review.author_name}</div>
                <div className="text-xs text-gray-500">
                  {review.updated_at
                    ? new Date(review.updated_at).toLocaleDateString('it-IT', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'Visto nel passato'}
                </div>
              </div>
            </div>

            {review.viewing_platform_name && (
              <div className="flex-1 flex justify-center">
                <span className="px-3 py-1 bg-slate-50 text-slate-600 rounded-lg font-bold text-xs border border-slate-200 flex items-center gap-1.5 shadow-sm">
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  {review.viewing_platform_name}
                </span>
              </div>
            )}

            <StarRating value={review.rating || 0} hideNumber readonly iconClassName="w-6 h-6" />
          </div>

          <div className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap">
            {review.review_visibility === 'private' && !review.is_mine ? (
              <span className="italic text-gray-500 flex items-center gap-2">
                <ReviewVisibilityIcon visibility="private" className="w-4 h-4" />
                Recensione privata (solo il voto è visibile)
              </span>
            ) : (
              review.notes
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div className="flex flex-col gap-4">
          {review.comments.length === 0 ? (
            <div className="text-center py-6 text-gray-500 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
              Non ci sono ancora commenti. Sii il primo a commentare!
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {review.comments.map((comment) => (
                <ReviewCommentItem key={comment.id} comment={comment} onReply={onReply} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Input comment slot at the bottom */}
      {commentInputSlot}
    </div>
  );
};
