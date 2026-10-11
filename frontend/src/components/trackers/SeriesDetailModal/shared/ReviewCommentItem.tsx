import React from 'react';
import type { ReviewComment } from '@/types/trackers';

export const renderCommentText = (text: string) => {
  const parts = text.split(/(@[\w.-]+)/g);
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('@')) {
          return (
            <span key={index} className="font-bold text-blue-600">
              {part}
            </span>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
};

interface ReviewCommentItemProps {
  comment: ReviewComment;
  onReply: (authorName: string) => void;
}

export const ReviewCommentItem: React.FC<ReviewCommentItemProps> = ({ comment, onReply }) => {
  return (
    <div className="flex gap-3 items-start">
      <img
        src={comment.author_avatar || '/default_avatar.png'}
        alt={comment.author_name}
        className="w-8 h-8 rounded-full border border-gray-200 shrink-0 mt-1 object-cover"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1 pl-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-gray-900 truncate">{comment.author_name}</span>
            <span className="text-[10px] text-gray-400 shrink-0">
              {new Date(comment.created_at).toLocaleDateString('it-IT', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <button
            onClick={() => onReply(comment.author_name)}
            className="text-[11px] font-bold text-gray-400 hover:text-blue-600 transition-colors flex items-center gap-1 uppercase tracking-wide"
            title={`Rispondi a @${comment.author_name}`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
              />
            </svg>
            Rispondi
          </button>
        </div>
        <div className="bg-gray-50 border border-gray-100 p-3 rounded-2xl rounded-tl-sm text-sm text-gray-800 whitespace-pre-wrap leading-relaxed shadow-sm">
          {renderCommentText(comment.text)}
        </div>
      </div>
    </div>
  );
};
