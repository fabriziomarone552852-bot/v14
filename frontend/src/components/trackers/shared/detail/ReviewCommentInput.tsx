import React from 'react';
import type { MentionFriendUser } from './useCommentMentions';

interface ReviewCommentInputProps {
  commentText: string;
  commentTextRef: React.RefObject<HTMLTextAreaElement | null>;
  mentionQuery: { active: boolean; query: string; startPos: number };
  mentionSuggestions: MentionFriendUser[];
  onChange: (val: string) => void;
  onSelectMention: (username: string) => void;
  onSubmit: () => Promise<void> | void;
  isSubmitting?: boolean;
}

export const ReviewCommentInput: React.FC<ReviewCommentInputProps> = ({
  commentText,
  commentTextRef,
  mentionQuery,
  mentionSuggestions,
  onChange,
  onSelectMention,
  onSubmit,
  isSubmitting = false,
}) => {
  return (
    <div className="pt-4 mt-2 border-t border-gray-100 shrink-0 relative">
      {mentionQuery.active && mentionSuggestions.length > 0 && (
        <div className="absolute bottom-full mb-1 left-0 w-64 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50 animate-fadeIn">
          {mentionSuggestions.map((f) => (
            <button
              key={f.id}
              onClick={() => onSelectMention(f.username)}
              className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm font-semibold text-gray-800 transition-colors flex items-center gap-2"
            >
              <img
                src={f.profile_picture_url || '/default_avatar.png'}
                alt={f.username}
                className="w-6 h-6 rounded-full border border-gray-100 object-cover"
              />
              {f.username}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <textarea
          ref={commentTextRef}
          value={commentText}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-0 focus:border-blue-500 outline-none resize-none h-12 custom-scrollbar transition-colors"
          placeholder="Scrivi un commento..."
          rows={1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !mentionQuery.active) {
              e.preventDefault();
              onSubmit();
            }
          }}
        />

        <button
          onClick={() => onSubmit()}
          disabled={!commentText.trim() || isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl px-4 flex items-center justify-center transition-colors shadow-sm shrink-0"
          title="Invia commento"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};
