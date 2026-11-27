import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiService';
import type { NotificationResponse, NotificationCreate } from '@/types/notifications';

interface NotificationsSnapshot {
  prevAll?: NotificationResponse[];
  prevUnread?: NotificationResponse[];
}

export const useNotifications = () => {
  const queryClient = useQueryClient();

  const { data: unreadNotifications = [] as NotificationResponse[], isLoading: isLoadingUnread } = useQuery<NotificationResponse[]>({
    queryKey: ['interactions', 'unread'],
    queryFn: async () => {
      const res = await api.get<NotificationResponse[]>('/interactions?unread_only=true');
      return Array.isArray(res) ? res : [];
    },
  });

  const {
    data: allNotifications = [] as NotificationResponse[],
    isLoading: isLoadingAll,
    isError: isErrorAll,
  } = useQuery<NotificationResponse[]>({
    queryKey: ['interactions', 'all'],
    queryFn: async () => {
      const res = await api.get<NotificationResponse[]>('/interactions');
      return Array.isArray(res) ? res : [];
    },
  });

  // Read a single interaction (0ms optimistic update; triggers burn-after-reading on server for ephemeral messages)
  const readInteraction = useMutation<NotificationResponse, Error, number, NotificationsSnapshot>({
    mutationFn: async (interactionId: number) => {
      const res = await api.get<NotificationResponse>(`/interactions/${interactionId}`);
      if (!res) throw new Error('No response');
      return res;
    },
    onMutate: async (interactionId) => {
      await queryClient.cancelQueries({ queryKey: ['interactions'] });
      const prevAll = queryClient.getQueryData<NotificationResponse[]>(['interactions', 'all']);
      const prevUnread = queryClient.getQueryData<NotificationResponse[]>(['interactions', 'unread']);
      const nowIso = new Date().toISOString();

      if (prevAll) {
        queryClient.setQueryData<NotificationResponse[]>(
          ['interactions', 'all'],
          prevAll.map((item) =>
            item.id === interactionId && !item.read_at
              ? { ...item, read_at: nowIso }
              : item
          )
        );
      }
      if (prevUnread) {
        queryClient.setQueryData<NotificationResponse[]>(
          ['interactions', 'unread'],
          prevUnread.filter((item) => item.id !== interactionId)
        );
      }

      return { prevAll, prevUnread };
    },
    onError: (_err, _id, context) => {
      if (context?.prevAll) queryClient.setQueryData(['interactions', 'all'], context.prevAll);
      if (context?.prevUnread) queryClient.setQueryData(['interactions', 'unread'], context.prevUnread);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['interactions'] });
    },
  });

  const deleteNotification = useMutation<void, Error, number, NotificationsSnapshot>({
    mutationFn: async (interactionId: number) => {
      await api.delete(`/interactions/${interactionId}`);
    },
    onMutate: async (interactionId) => {
      await queryClient.cancelQueries({ queryKey: ['interactions'] });
      const prevAll = queryClient.getQueryData<NotificationResponse[]>(['interactions', 'all']);
      const prevUnread = queryClient.getQueryData<NotificationResponse[]>(['interactions', 'unread']);

      if (prevAll) {
        queryClient.setQueryData<NotificationResponse[]>(
          ['interactions', 'all'],
          prevAll.filter((item) => item.id !== interactionId)
        );
      }
      if (prevUnread) {
        queryClient.setQueryData<NotificationResponse[]>(
          ['interactions', 'unread'],
          prevUnread.filter((item) => item.id !== interactionId)
        );
      }

      return { prevAll, prevUnread };
    },
    onError: (_err, _id, context) => {
      if (context?.prevAll) queryClient.setQueryData(['interactions', 'all'], context.prevAll);
      if (context?.prevUnread) queryClient.setQueryData(['interactions', 'unread'], context.prevUnread);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['interactions'] });
    },
  });

  const createInteraction = useMutation<NotificationResponse, Error, NotificationCreate>({
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
    isErrorAll,
    readInteraction,
    deleteNotification,
    createInteraction,
  };
};
