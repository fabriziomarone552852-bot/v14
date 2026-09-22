import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiService';
import type { FriendshipResponse, FriendStatusResponse } from '@/types/social';

export const useSocial = () => {
  const queryClient = useQueryClient();

  const { data: friends = [] as FriendshipResponse[], isLoading: isLoadingFriends } = useQuery<FriendshipResponse[]>({
    queryKey: ['social', 'friends'],
    queryFn: async () => (await api.get<FriendshipResponse[]>('/social/friends')) || [],
  });

  const { data: pendingRequests = [] as FriendshipResponse[], isLoading: isLoadingPending } = useQuery<FriendshipResponse[]>({
    queryKey: ['social', 'pending'],
    queryFn: async () => (await api.get<FriendshipResponse[]>('/social/friends/pending')) || [],
  });

  const { data: sentRequests = [] as FriendshipResponse[], isLoading: isLoadingSent } = useQuery<FriendshipResponse[]>({
    queryKey: ['social', 'sent'],
    queryFn: async () => (await api.get<FriendshipResponse[]>('/social/friends/pending/sent')) || [],
  });

  const searchUser = useMutation<FriendStatusResponse[], Error, string>({
    mutationFn: async (query: string) => (await api.get<FriendStatusResponse[]>(`/social/search?q=${encodeURIComponent(query)}`)) || [],
  });

  const sendRequest = useMutation<void, Error, number>({
    mutationFn: async (userId: number) => { await api.post(`/social/friends/request/${userId}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social'] });
    },
  });

  const acceptRequest = useMutation<void, Error, number>({
    mutationFn: async (userId: number) => { await api.post(`/social/friends/accept/${userId}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social'] });
    },
  });

  const removeFriendship = useMutation<void, Error, number>({
    mutationFn: async (userId: number) => { await api.delete(`/social/friends/${userId}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social'] });
    },
  });

  return {
    friends,
    isLoadingFriends,
    pendingRequests,
    isLoadingPending,
    sentRequests,
    isLoadingSent,
    searchUser,
    sendRequest,
    acceptRequest,
    removeFriendship,
  };
};
