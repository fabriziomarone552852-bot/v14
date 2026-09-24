import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiService';
import type { NotificationResponse } from '@/types/notifications';

export const useNotifications = () => {
  const queryClient = useQueryClient();

  const { data: unreadNotifications = [] as NotificationResponse[], isLoading: isLoadingUnread } = useQuery<NotificationResponse[]>({
    queryKey: ['notifications', 'unread'],
    queryFn: async () => (await api.get<NotificationResponse[]>('/notifications?unread_only=true')) || [],
  });

  const { data: allNotifications = [] as NotificationResponse[], isLoading: isLoadingAll } = useQuery<NotificationResponse[]>({
    queryKey: ['notifications', 'all'],
    queryFn: async () => (await api.get<NotificationResponse[]>('/notifications')) || [],
  });

  const markAsRead = useMutation<NotificationResponse, Error, number>({
    mutationFn: async (notificationId: number) => { 
      const res = await api.patch<NotificationResponse>(`/notifications/${notificationId}/read`, {});
      if (!res) throw new Error('No response');
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsRead = useMutation<void, Error, void>({
    mutationFn: async () => { await api.post('/notifications/read-all'); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const deleteNotification = useMutation<void, Error, number>({
    mutationFn: async (notificationId: number) => { await api.delete(`/notifications/${notificationId}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return {
    unreadNotifications,
    isLoadingUnread,
    allNotifications,
    isLoadingAll,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
};
