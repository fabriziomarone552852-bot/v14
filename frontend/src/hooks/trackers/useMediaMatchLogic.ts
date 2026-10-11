import { useState } from 'react';
import { api } from '@/api/apiService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMediaLists } from '@/hooks/queries/useTrackersQueries';
import { useSocial } from '@/hooks/useSocial';
import { useAuth } from '@/context/AuthContext';

export interface MatchSessionParticipant {
  user_id: number;
  status: string;
}

export interface MatchSession {
  id: number;
  status: string;
  participants: MatchSessionParticipant[];
}

export interface MatchResult {
  title: string;
  poster_path: string | null;
  matched_users: number[];
}

export interface MappedFriend {
  id: number;
  username: string;
  profile_picture_url?: string | null;
}

interface UseMediaMatchLogicProps {
  isOpen: boolean;
  domain?: 'series' | 'movies' | 'books';
}

export const useMediaMatchLogic = ({ isOpen, domain = 'series' }: UseMediaMatchLogicProps) => {
  const queryClient = useQueryClient();
  const { friends } = useSocial();
  const { user } = useAuth();
  const { data: myLists } = useMediaLists();

  // Transform friends into clean list
  const mappedFriends: MappedFriend[] = (friends || [])
    .map((f) => {
      const isRequester = f.requester_id === user?.id;
      return isRequester ? f.addressee : f.requester;
    })
    .filter((f): f is MappedFriend => Boolean(f && typeof f.id === 'number'));

  // Selected state
  const [selectedListId, setSelectedListId] = useState<number | 'catalog'>('catalog');
  const [selectedFriends, setSelectedFriends] = useState<number[]>([]);

  // Fetch active sessions
  const { data: activeSessions, isLoading: isLoadingSessions } = useQuery({
    queryKey: ['trackers', domain, 'match'],
    queryFn: async () => {
      return await api.get<MatchSession[]>(`/trackers/${domain}/match`);
    },
    enabled: isOpen,
    refetchOnWindowFocus: false,
  });

  const activeSession = activeSessions && activeSessions.length > 0 ? activeSessions[0] : null;

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (payload: { friend_ids: number[]; media_list_id: number | null; use_entire_catalog: boolean }) => {
      return await api.post(`/trackers/${domain}/match/create`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackers', domain, 'match'] });
    },
  });

  // Join session mutation
  const joinSessionMutation = useMutation({
    mutationFn: async (payload: { sessionId: number; listId: number | 'catalog' }) => {
      const body = {
        media_list_id: payload.listId === 'catalog' ? null : payload.listId,
        use_entire_catalog: payload.listId === 'catalog',
      };
      return await api.post(`/trackers/${domain}/match/${payload.sessionId}/join`, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackers', domain, 'match'] });
    },
  });

  // Fetch results if session completed
  const { data: matchResults, isLoading: isResultsLoading } = useQuery({
    queryKey: ['trackers', domain, 'match', activeSession?.id, 'results'],
    queryFn: async () => {
      return await api.get<MatchResult[]>(`/trackers/${domain}/match/${activeSession!.id}/results`);
    },
    enabled: !!activeSession && activeSession.status === 'completed',
    refetchOnWindowFocus: false,
  });

  const toggleFriend = (id?: number) => {
    if (!id) return;
    setSelectedFriends((prev) => (prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]));
  };

  const handleCreate = () => {
    if (selectedFriends.length === 0) {
      alert('Seleziona almeno un amico.');
      return;
    }
    createSessionMutation.mutate({
      friend_ids: selectedFriends,
      media_list_id: selectedListId === 'catalog' ? null : selectedListId,
      use_entire_catalog: selectedListId === 'catalog',
    });
  };

  const handleJoin = () => {
    if (!activeSession) return;
    joinSessionMutation.mutate({
      sessionId: activeSession.id,
      listId: selectedListId,
    });
  };

  const isMyTurn = !!(
    activeSession &&
    activeSession.participants.some((p) => p.user_id === user?.id && p.status === 'invited')
  );

  return {
    selectedListId,
    setSelectedListId,
    selectedFriends,
    mappedFriends,
    myLists,
    user,
    activeSession,
    isLoadingSessions,
    matchResults,
    isResultsLoading,
    isCreatePending: createSessionMutation.isPending,
    isJoinPending: joinSessionMutation.isPending,
    isMyTurn,
    toggleFriend,
    handleCreate,
    handleJoin,
  };
};
