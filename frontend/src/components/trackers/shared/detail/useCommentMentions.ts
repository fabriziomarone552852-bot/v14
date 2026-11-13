import { useState, useMemo, useRef, useCallback } from 'react';
import { useSocial } from '@/hooks/useSocial';
import { useAuth } from '@/context/AuthContext';
import type { FriendshipResponse } from '@/types/social';

export interface MentionFriendUser {
  id: number;
  username: string;
  profile_picture_url?: string | null;
}

export const getFriendUser = (
  friendship: FriendshipResponse,
  currentUserId?: number
): MentionFriendUser | undefined => {
  return friendship.requester_id === currentUserId ? friendship.addressee : friendship.requester;
};

export const useCommentMentions = () => {
  const [commentText, setCommentText] = useState<string>('');
  const commentTextRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();
  const { friends } = useSocial();

  const [mentionQuery, setMentionQuery] = useState<{
    active: boolean;
    query: string;
    startPos: number;
  }>({ active: false, query: '', startPos: -1 });

  const mentionSuggestions = useMemo<MentionFriendUser[]>(() => {
    if (!mentionQuery.active) return [];
    const q = mentionQuery.query;

    return friends
      .map((f) => getFriendUser(f, user?.id))
      .filter((u): u is MentionFriendUser => !!u && typeof u.username === 'string')
      .filter((u) => u.username.toLowerCase().includes(q))
      .slice(0, 5);
  }, [mentionQuery, friends, user]);

  const handleCommentChange = useCallback((val: string) => {
    setCommentText(val);
    if (commentTextRef.current) {
      const cursor = commentTextRef.current.selectionStart;
      const textBeforeCursor = val.slice(0, cursor);
      const match = textBeforeCursor.match(/@([\w.-]*)$/);
      if (match && typeof match.index === 'number') {
        setMentionQuery({ active: true, query: match[1].toLowerCase(), startPos: match.index });
      } else {
        setMentionQuery({ active: false, query: '', startPos: -1 });
      }
    }
  }, []);

  const handleSelectMention = useCallback(
    (username: string) => {
      if (!mentionQuery.active) return;
      const start = mentionQuery.startPos;
      const end = start + mentionQuery.query.length + 1;
      const newText = commentText.slice(0, start) + `@${username} ` + commentText.slice(end);
      setCommentText(newText);
      setMentionQuery({ active: false, query: '', startPos: -1 });

      setTimeout(() => {
        if (commentTextRef.current) {
          commentTextRef.current.focus();
          const newPos = start + username.length + 2;
          commentTextRef.current.setSelectionRange(newPos, newPos);
        }
      }, 0);
    },
    [commentText, mentionQuery]
  );

  const handleReplyClick = useCallback((username: string) => {
    const textToInsert = `@${username} `;
    if (commentTextRef.current) {
      const cursorPosition = commentTextRef.current.selectionStart;
      const currentText = commentTextRef.current.value;
      const newText =
        currentText.slice(0, cursorPosition) + textToInsert + currentText.slice(cursorPosition);
      setCommentText(newText);
      setTimeout(() => {
        if (commentTextRef.current) {
          commentTextRef.current.focus();
          const newPos = cursorPosition + textToInsert.length;
          commentTextRef.current.setSelectionRange(newPos, newPos);
        }
      }, 0);
    } else {
      setCommentText((prev) => prev + textToInsert);
    }
  }, []);

  const resetComment = useCallback(() => {
    setCommentText('');
    setMentionQuery({ active: false, query: '', startPos: -1 });
  }, []);

  return {
    commentText,
    setCommentText,
    commentTextRef,
    mentionQuery,
    mentionSuggestions,
    handleCommentChange,
    handleSelectMention,
    handleReplyClick,
    resetComment,
  };
};
