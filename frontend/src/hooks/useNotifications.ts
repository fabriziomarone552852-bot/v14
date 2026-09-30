import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiService';
import type { NotificationResponse } from '@/types/notifications';

export const useNotifications = () => {
  const queryClient = useQueryClient();

  const { data: unreadNotifications = [] as NotificationResponse[], isLoading: isLoadingUnread } = useQuery<NotificationResponse[]>({
    queryKey: ['interactions', 'unread'],
    queryFn: async () => (await api.get<NotificationResponse[]>('/interactions?unread_only=true')) || [],
  });

  const { data: allNotifications = [] as NotificationResponse[], isLoading: isLoadingAll } = useQuery<NotificationResponse[]>({
    queryKey: ['interactions', 'all'],
    queryFn: async () => (await api.get<NotificationResponse[]>('/interactions')) || [],
  });

  // Read a single interaction (will trigger burn-after-reading for ephemeral messages)
  const readInteraction = useMutation<NotificationResponse, Error, number>({
    mutationFn: async (interactionId: number) => { 
      const res = await api.get<NotificationResponse>(`/interactions/${interactionId}`);
      if (!res) throw new Error('No response');
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interactions'] });
    },
  });

  const deleteNotification = useMutation<void, Error, number>({
    mutationFn: async (interactionId: number) => { await api.delete(`/interactions/${interactionId}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interactions'] });
    },
  });

  const createInteraction = useMutation<NotificationResponse, Error, { interaction_type: string; recipient_id?: number; content: string; reference_id?: number }>({
    mutationFn: async (payload) => {
      const res = await api.post<NotificationResponse>('/interactions', payload);
      if (!res) throw new Error('No response');
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interactions'] });
    },
  });

  return {
    unreadNotifications,
    isLoadingUnread,
    allNotifications,
    isLoadingAll,
    readInteraction,
    deleteNotification,
    createInteraction,
  };
};
