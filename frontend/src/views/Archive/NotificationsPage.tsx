// src/views/Archive/NotificationsPage.tsx
import React from 'react';
import { BellIcon } from '@/components/shared/utils/Icons';
import { ArchiveActionBar } from '@/components/shared/layout/ArchiveActionBar';
import { ArchiveTableContainer } from '@/components/shared/layout/ArchiveTableContainer';
import { NotificationStatsOverview } from '@/components/archive/notifications/NotificationStatsOverview';
import { NotificationTableHeader } from '@/components/archive/notifications/NotificationTableHeader';
import { NotificationTableRow } from '@/components/archive/notifications/NotificationTableRow';
import { NotificationFilterModal } from '@/components/archive/notifications/NotificationFilterModal';
import { useNotificationsPageLogic } from '@/components/archive/notifications/useNotificationsPageLogic';
import { ARCHIVE_PANEL_CLASS } from './CategoriesPage';
import { ERROR_MESSAGES } from '@/data/loadingMessages';

export const NotificationsPage: React.FC = () => {
  const logic = useNotificationsPageLogic();

  return (
    <div className="h-full flex flex-col gap-2 sm:gap-3.5 w-full max-w-[1600px] mx-auto relative z-10 pb-1">
      {/* 1. HEADER COMPATTO CON STATISTICHE */}
      <NotificationStatsOverview
        stats={logic.stats}
        panelClass={ARCHIVE_PANEL_CLASS}
      />

      {/* 2. RIGA AZIONI: LENTE DI RICERCA (nascosta su mobile perché integrata nell'header) */}
      <ArchiveActionBar
        onOpenSearch={logic.filterModal.open}
        activeFiltersCount={logic.activeFiltersCount}
        className={ARCHIVE_PANEL_CLASS}
      />

      {/* 3. TABELLA NOTIFICHE CON ORDINAMENTO E PAGINAZIONE */}
      <ArchiveTableContainer
        header={
          <NotificationTableHeader
            sortField={logic.sortField}
            sortDirection={logic.sortDirection}
            onSort={logic.handleSort}
          />
        }
        loading={logic.loading}
        loadingMessage="Caricamento storico notifiche..."
        isError={logic.isError}
        errorMessage={ERROR_MESSAGES.archive}
        onRetry={() => logic.queryClient.refetchQueries()}
        isEmpty={logic.filteredNotifications.length === 0}
        emptyIcon={<BellIcon className="w-8 h-8 text-slate-400" />}
        emptyTitle="Nessuna notifica trovata"
        emptyDescription={
          logic.hasActiveFilters
            ? 'Nessuna notifica corrisponde ai filtri selezionati. Prova ad azzerarli.'
            : 'Non ci sono notifiche registrate nello storico.'
        }
        hasActiveFilters={logic.hasActiveFilters}
        onResetFilters={logic.handleResetFilters}
        currentPage={logic.currentPage}
        totalPages={logic.totalPages}
        onPageChange={logic.setCurrentPage}
        bodyRef={logic.containerRef}
        className={ARCHIVE_PANEL_CLASS}
      >
        {logic.paginatedNotifications.map((notif) => (
          <NotificationTableRow
            key={notif.id}
            notification={notif}
            onSelectNotification={logic.handleSelectNotification}
          />
        ))}
      </ArchiveTableContainer>

      {/* 4. MODALE FILTRI & RICERCA */}
      <NotificationFilterModal
        isOpen={logic.filterModal.isOpen}
        onClose={logic.filterModal.close}
        filters={logic.filters}
        onFilterChange={logic.handleFilterChange}
        onReset={logic.handleResetFilters}
        hasActiveFilters={logic.hasActiveFilters}
      />
    </div>
  );
};

export default NotificationsPage;
