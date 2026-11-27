// src/hooks/useNotificationArchiveData.ts
import { useMemo } from 'react';
import type { NotificationResponse } from '@/types/notifications';
import {
  formatNotificationMessage,
  getNotificationCategory,
  getNotificationTypeBadge,
  type NotificationCategory,
} from '@/utils/notificationUtils';
import { formatDateString } from '@/utils/dateUtils';
import { paginate } from '@/utils/paginationUtils';

export type NotificationArchiveTab = 'all' | NotificationCategory;
export type NotificationReadStatusFilter = 'all' | 'unread' | 'read';
export type NotificationSortField = 'created' | 'type' | 'status';
export type NotificationSortDirection = 'asc' | 'desc';

export interface NotificationFilterState {
  keyword: string;
  category: NotificationArchiveTab;
  readStatus: NotificationReadStatusFilter;
  startDate: string;
  endDate: string;
}

export interface NotificationArchiveStats {
  total: number;
  unread: number;
  shopping: number;
  media: number;
  system: number;
}

export interface UseNotificationArchiveDataParams {
  rawNotifications: NotificationResponse[];
  filters: NotificationFilterState;
  sortField: NotificationSortField;
  sortDirection: NotificationSortDirection;
  currentPage: number;
  pageSize: number;
}

export const useNotificationArchiveData = ({
  rawNotifications,
  filters,
  sortField,
  sortDirection,
  currentPage,
  pageSize,
}: UseNotificationArchiveDataParams) => {
  const permanentNotifications = useMemo(
    () => rawNotifications.filter((n) => n.interaction_type !== 'EPHEMERAL_MSG'),
    [rawNotifications]
  );

  const stats = useMemo<NotificationArchiveStats>(() => {
    let unread = 0;
    let shopping = 0;
    let media = 0;
    let system = 0;

    for (const notif of permanentNotifications) {
      if (!notif.read_at) unread++;
      const cat = getNotificationCategory(notif.interaction_type);
      if (cat === 'shopping') shopping++;
      else if (cat === 'media') media++;
      else system++;
    }

    return {
      total: permanentNotifications.length,
      unread,
      shopping,
      media,
      system,
    };
  }, [permanentNotifications]);

  const filteredNotifications = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();
    const hasDateFilter = Boolean(filters.startDate || filters.endDate);

    const filtered = permanentNotifications.filter((notif) => {
      const category = getNotificationCategory(notif.interaction_type);

      if (filters.category !== 'all' && category !== filters.category) {
        return false;
      }
      if (filters.readStatus === 'unread' && notif.read_at) {
        return false;
      }
      if (filters.readStatus === 'read' && !notif.read_at) {
        return false;
      }
      if (hasDateFilter) {
        const createdDate = new Date(notif.created_at);
        if (Number.isNaN(createdDate.getTime())) return false;
        const notifDateStr = formatDateString(createdDate);
        if (filters.startDate && notifDateStr < filters.startDate) return false;
        if (filters.endDate && notifDateStr > filters.endDate) return false;
      }

      if (keyword) {
        const formatted = formatNotificationMessage(notif).toLowerCase();
        const badgeLabel = getNotificationTypeBadge(notif.interaction_type).label.toLowerCase();
        const rawContent = (notif.content || '').toLowerCase();
        const author = (notif.author_name || '').toLowerCase();
        const contextTitle = (notif.context_title || '').toLowerCase();

        const matches =
          formatted.includes(keyword) ||
          badgeLabel.includes(keyword) ||
          rawContent.includes(keyword) ||
          author.includes(keyword) ||
          contextTitle.includes(keyword);

        if (!matches) return false;
      }

      return true;
    });

    const direction = sortDirection === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sortField === 'type') {
        const labelA = getNotificationTypeBadge(a.interaction_type).label;
        const labelB = getNotificationTypeBadge(b.interaction_type).label;
        const cmp = labelA.localeCompare(labelB);
        if (cmp !== 0) return cmp * direction;
      } else if (sortField === 'status') {
        const unreadA = a.read_at ? 1 : 0;
        const unreadB = b.read_at ? 1 : 0;
        if (unreadA !== unreadB) return (unreadA - unreadB) * direction;
      }

      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();
      return (timeA - timeB) * direction;
    });
  }, [permanentNotifications, filters, sortField, sortDirection]);

  const { paginatedItems: paginatedNotifications, totalPages } = useMemo(
    () => paginate(filteredNotifications, currentPage, pageSize),
    [filteredNotifications, currentPage, pageSize]
  );

  return {
    stats,
    totalPermanentCount: permanentNotifications.length,
    filteredNotifications,
    paginatedNotifications,
    totalPages,
  };
};
