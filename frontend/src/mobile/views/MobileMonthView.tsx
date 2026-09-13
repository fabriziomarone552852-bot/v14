// src/mobile/views/MobileMonthView.tsx
import React from 'react';

// Hooks & Logica
import { useMobileMonthLogic } from '../hooks/useMobileMonthLogic';

// Componenti Mobile Standardizzati
import MobileAgendaPeriodHeader from '../components/MobileAgendaPeriodHeader';
import { MobileMonthTrackersSlide } from '../components/month/MobileMonthTrackersSlide';
import { MobileMonthCalendarSlide } from '../components/month/MobileMonthCalendarSlide';
import { MobileMonthMoodSlide } from '../components/month/MobileMonthMoodSlide';
import { MobileExpandedDayTasksModal } from '../components/modals/MobileExpandedDayTasksModal';
import { MobileMonthReviewModal } from '../components/modals/MobileMonthReviewModal';
import { MobileDateSwipeOverlay } from '../components/common/MobileDateSwipeOverlay';
import MobileNotesBottomSheet from '../components/MobileNotesBottomSheet';

// Feedback & Loading
import PageLoadingState from '@/components/shared/feedback/PageLoadingState';
import PageErrorState from '@/components/shared/feedback/PageErrorState';
import { LOADING_MESSAGES, ERROR_MESSAGES } from '@/data/loadingMessages';

export const MobileMonthView: React.FC = () => {
  const {
    queryClient,
    setTargetDate,
    openEventDetail,
    dbCategories,
    state,
    apiData,
    handlers,
    review,
    monthTitle,
    isCurrentMonth,
    mappedEvents,
    activePageIndex,
    setActivePageIndex,
    expandedTasksDay,
    setExpandedTasksDay,
    handleToggleTask,
    handleToggleTaskFromCalendar,
    handleSelectDbTask,
    handleSelectTaskSummary,
    handleTouchStart,
    handleTouchEnd,
    swipeDirection,
    handlePrevMonth,
    handleNextMonth,
  } = useMobileMonthLogic();

  // Stati di Caricamento ed Errore
  if (state.isLoading && !apiData) {
    return <PageLoadingState messages={LOADING_MESSAGES.month} />;
  }

  if (state.isError && !apiData) {
    return (
      <PageErrorState
        message={ERROR_MESSAGES.month}
        onRetry={() => queryClient.refetchQueries()}
      />
    );
  }

  return (
    <div className="h-full w-full flex flex-col justify-between gap-1.5 overflow-hidden animate-fadeIn relative select-none">
      {/* 1. Header Periodo */}
      <MobileAgendaPeriodHeader
        title={monthTitle}
        currentDate={state.monthTargetDate}
        isCurrent={isCurrentMonth}
        onResetToday={handlers.handleResetCurrentMonth}
        onChangeDate={setTargetDate}
        viewMode="month"
        reviewStatus={review.reviewStatus}
        onOpenReview={review.openReview}
        onOpenNotes={() => state.setIsNotesOpen(true)}
        notesCount={state.mappedNotes.length}
      />

      {/* 2. Container 3 Slide */}
      <div
        className={`flex-1 min-h-0 w-full overflow-hidden relative ${
          swipeDirection === 'down'
            ? 'animate-content-down'
            : swipeDirection === 'up'
            ? 'animate-content-up'
            : ''
        }`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Slide 0: Grafici Tracker (Umore & Sfere) */}
        <MobileMonthTrackersSlide
          activePageIndex={activePageIndex}
          moodsUI={state.moodsUI}
          spheresUI={state.spheresUI}
          onUpdateMood={handlers.handleUpdateMood}
          onUpdateSphere={handlers.handleUpdateSphere}
        />

        {/* Slide 1: Obiettivi, Priorità & Calendario Mensile */}
        <MobileMonthCalendarSlide
          activePageIndex={activePageIndex}
          goalText={apiData?.obiettivi?.[0]?.monthly_field}
          priorities={apiData?.priorita}
          onSaveGoal={handlers.handleSaveGoal}
          onSavePriority={handlers.handleSavePriority}
          targetDate={state.monthTargetDate}
          events={mappedEvents}
          tasks={apiData?.tasks || []}
          dailyEntries={apiData?.daily_entries || []}
          allCategories={dbCategories}
          onDayClick={handlers.handleGoToDay}
          onSelectEvent={openEventDetail}
          onSelectTask={handleSelectDbTask}
          onToggleTask={handleToggleTaskFromCalendar}
          onMoodChange={handlers.handleMoodChange}
          onOpenExpandedTasks={(dateStr, dayTasks) =>
            setExpandedTasksDay({ dateStr, tasks: dayTasks })
          }
        />

        {/* Slide 2: Eventi Emotivi */}
        <MobileMonthMoodSlide
          activePageIndex={activePageIndex}
          positiveEvents={apiData?.eventi_positivi || []}
          negativeEvents={apiData?.eventi_negativi || []}
          onAddMoodEvent={handlers.handleAddMoodEvent}
          onUpdateMoodEvent={handlers.handleUpdateMoodEvent}
          onDeleteMoodEvent={handlers.handleDeleteMoodEvent}
        />
      </div>

      {/* 3. Indicatori di Paginazione Dots */}
      <div className="shrink-0 flex items-center justify-center gap-2 py-1 select-none">
        <button
          type="button"
          onClick={() => setActivePageIndex(0)}
          className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
            activePageIndex === 0
              ? 'w-6 bg-blue-600 shadow-xs'
              : 'w-1.5 bg-gray-300 hover:bg-gray-400'
          }`}
          title="Slide 1: Grafici & Sfere"
          aria-label="Slide 1: Grafici e Sfere"
        />
        <button
          type="button"
          onClick={() => setActivePageIndex(1)}
          className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
            activePageIndex === 1
              ? 'w-6 bg-blue-600 shadow-xs'
              : 'w-1.5 bg-gray-300 hover:bg-gray-400'
          }`}
          title="Slide 2: Calendario Mensile"
          aria-label="Slide 2: Calendario Mensile"
        />
        <button
          type="button"
          onClick={() => setActivePageIndex(2)}
          className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
            activePageIndex === 2
              ? 'w-6 bg-blue-600 shadow-xs'
              : 'w-1.5 bg-gray-300 hover:bg-gray-400'
          }`}
          title="Slide 3: Eventi Emotivi"
          aria-label="Slide 3: Eventi Emotivi"
        />
      </div>

      {/* 4. Modale Task Espanse per il giorno selezionato */}
      <MobileExpandedDayTasksModal
        expandedTasksDay={expandedTasksDay}
        onClose={() => setExpandedTasksDay(null)}
        onSelectTask={handleSelectTaskSummary}
        onToggleTask={handleToggleTask}
      />

      {/* 5. Review Mensile */}
      <MobileMonthReviewModal
        isOpen={review.isOpen}
        onClose={review.closeReview}
        monthDate={state.monthTargetDate}
        reviewData={review.reviewData}
        moodsUI={review.moodsUI}
        spheresUI={review.spheresUI}
        onSaveAnswer={review.handleSaveAnswer}
        onUpdateMood={handlers.handleUpdateMood}
        onUpdateSphere={handlers.handleUpdateSphere}
      />

      {/* 6. Note Mensili */}
      <MobileNotesBottomSheet
        isOpen={state.isNotesOpen}
        notes={state.mappedNotes}
        editingNoteId={state.editingNoteId}
        onClose={() => state.setIsNotesOpen(false)}
        onAddNote={handlers.handleAddNote}
        onAutoSaveNote={handlers.handleAutoSaveNote}
        onDeleteNote={handlers.handleDeleteNote}
        clearEditingNoteId={() => state.setEditingNoteId(null)}
      />

      {/* 7. Overlay Onda Luminosa e Frecce Test Desktop */}
      <MobileDateSwipeOverlay
        swipeDirection={swipeDirection}
        onSwipePrev={handlePrevMonth}
        onSwipeNext={handleNextMonth}
      />
    </div>
  );
};

export default MobileMonthView;
