// src/components/archive/notifications/useNotificationsPageLogic.ts
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useNotifications } from '@/hooks/useNotifications';
import { useModal } from '@/hooks/useModals';
import { useDynamicPageSize } from '@/hooks/useDynamicPageSize';
import { useArchiveHeader } from '@/context/ArchiveHeaderContext';
import {
  useNotificationArchiveData,
  type NotificationFilterState,
  type NotificationSortDirection,
  type NotificationSortField,
} from '@/hooks/useNotificationArchiveData';
import type { NotificationResponse } from '@/types/notifications';
import { getNotificationNavigationTarget } from '@/utils/notificationUtils';

export const initialNotificationFilterState: NotificationFilterState = {
  keyword: '',
  category: 'all',
  readStatus: 'all',
  startDate: '',
  endDate: '',
};

export const useNotificationsPageLogic = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    allNotifications,
    isLoadingAll,
    isErrorAll,
    readInteraction,
  } = useNotifications();

  const [filters, setFilters] = useState<NotificationFilterState>(initialNotificationFilterState);
  const [sortField, setSortField] = useState<NotificationSortField>('created');
  const [sortDirection, setSortDirection] = useState<NotificationSortDirection>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const filterModal = useModal();

  const { containerRef, pageSize } = useDynamicPageSize({
    rowHeight: 50,
    defaultPageSize: 10,
    minItems: 3,
    maxItems: 30,
  });

  const {
    stats,
    totalPermanentCount,
    filteredNotifications,
    paginatedNotifications,
    totalPages,
  } = useNotificationArchiveData({
    rawNotifications: allNotifications,
    filters,
    sortField,
    sortDirection,
    currentPage,
    pageSize,
  });

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.keyword.trim()) count++;
    if (filters.category !== 'all') count++;
    if (filters.readStatus !== 'all') count++;
    if (filters.startDate) count++;
    if (filters.endDate) count++;
    return count;
  }, [filters]);

  const hasActiveFilters = activeFiltersCount > 0;

  useArchiveHeader({
    title: 'Notifiche & Avvisi',
    onOpenSearch: filterModal.open,
    activeFiltersCount,
  });

  const handleFilterChange = (newFilters: NotificationFilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters(initialNotificationFilterState);
    setCurrentPage(1);
  };

  const handleSort = (field: NotificationSortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection(field === 'created' ? 'desc' : 'asc');
    }
    setCurrentPage(1);
  };

  const handleSelectNotification = (notification: NotificationResponse) => {
    if (!notification.read_at) {
      readInteraction.mutate(notification.id);
    }

    const target = getNotificationNavigationTarget(notification);
    if (target) {
      navigate(target.route);
    }
  };

  return {
    queryClient,
    loading: isLoadingAll,
    isError: isErrorAll,
    stats,
    totalPermanentCount,
    filters,
    sortField,
    sortDirection,
    currentPage,
    setCurrentPage,
    containerRef,
    filterModal,
    filteredNotifications,
    paginatedNotifications,
    totalPages,
    activeFiltersCount,
    hasActiveFilters,
    handleFilterChange,
    handleResetFilters,
    handleSort,
    handleSelectNotification,
  };
};
