// src/mobile/views/MobileHomeView.tsx
import React from 'react';

// Hooks
import { useMobileHomeLogic } from '../hooks/useMobileHomeLogic';

// Components
import MobileYearProgress from '../components/MobileYearProgress';
import MobileQuoteCard from '../components/MobileQuoteCard';
import { MobileHomeEventsSection } from '../components/home/MobileHomeEventsSection';
import { MobileHomeTasksSection } from '../components/home/MobileHomeTasksSection';
import { MobileSyncFeedbackModal } from '../components/home/MobileSyncFeedbackModal';
import PageLoadingState from '@/components/shared/feedback/PageLoadingState';
import PageErrorState from '@/components/shared/feedback/PageErrorState';
import { LOADING_MESSAGES, ERROR_MESSAGES } from '@/data/loadingMessages';

export const MobileHomeView: React.FC = () => {
  const {
    todayEvents,
    displayedTaskTree,
    yearProgress,
    formattedDate,
    sortMode,
    setSortMode,
    showWithDeadline,
    setShowWithDeadline,
    showNotificationDot,
    expandedView,
    setExpandedView,
    isSyncing,
    syncFeedback,
    clearSyncFeedback,
    handleSyncGoogle,
    handleToggleTask,
    openTaskDetail,
    openEventDetail,
    selectionState,
    isEventsSelection,
    isTasksSelection,
    handleToggleSelectEvent,
    handleToggleSelectTask,
    isInitialLoad,
    isError,
    handleRetry,
  } = useMobileHomeLogic();

  if (isInitialLoad) {
    return <PageLoadingState messages={LOADING_MESSAGES.home} />;
  }

  if (isError) {
    return (
      <PageErrorState
        message={ERROR_MESSAGES.home}
        onRetry={handleRetry}
      />
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#fafafa] p-3 gap-3 relative select-none">
      {/* 1. Sezione Superiore: Progress Bar Anno & Citazione del Giorno */}
      <div className="shrink-0 flex flex-col gap-2">
        <MobileYearProgress progress={yearProgress} />
        <MobileQuoteCard />
      </div>

      {/* 2. Sezione Eventi di Oggi (Compatto & Fullscreen) */}
      <MobileHomeEventsSection
        todayEvents={todayEvents}
        formattedDate={formattedDate}
        expandedView={expandedView}
        onExpand={() => setExpandedView('events')}
        onCloseExpanded={() => setExpandedView('none')}
        isSyncing={isSyncing}
        onSyncGoogle={handleSyncGoogle}
        onOpenDetail={openEventDetail}
        isEventsSelection={isEventsSelection}
        selectedIds={selectionState.selectedIds}
        onToggleSelectEvent={handleToggleSelectEvent}
      />

      {/* 3. Sezione Task di Oggi (Compatto & Fullscreen) */}
      <MobileHomeTasksSection
        displayedTaskTree={displayedTaskTree}
        showWithDeadline={showWithDeadline}
        setShowWithDeadline={setShowWithDeadline}
        sortMode={sortMode}
        setSortMode={setSortMode}
        showNotificationDot={showNotificationDot}
        expandedView={expandedView}
        onExpand={() => setExpandedView('tasks')}
        onCloseExpanded={() => setExpandedView('none')}
        onToggleTask={handleToggleTask}
        onOpenDetail={openTaskDetail}
        isTasksSelection={isTasksSelection}
        selectedIds={selectionState.selectedIds}
        onToggleSelectTask={handleToggleSelectTask}
      />

      {/* 4. Modale di Feedback Sincronizzazione Google Calendar */}
      <MobileSyncFeedbackModal
        message={syncFeedback}
        onClose={clearSyncFeedback}
      />
    </div>
  );
};

export default MobileHomeView;
