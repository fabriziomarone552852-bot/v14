// src/mobile/views/MobileWeekView.tsx
import React from 'react';

// Logica e Hooks Centralizzati
import { useMobileWeekLogic } from '../hooks/useMobileWeekLogic';

// Componenti Mobile Standardizzati
import MobileAgendaPeriodHeader from '../components/MobileAgendaPeriodHeader';
import { MobileWeekCalendarSlide } from '../components/week/MobileWeekCalendarSlide';
import { MobileWeekMoodSlide } from '../components/week/MobileWeekMoodSlide';
import { MobileExpandedDayTasksModal } from '../components/modals/MobileExpandedDayTasksModal';
import { MobileDateSwipeOverlay } from '../components/common/MobileDateSwipeOverlay';
import MobileNotesBottomSheet from '../components/MobileNotesBottomSheet';

// Feedback & Loading
import PageLoadingState from '@/components/shared/feedback/PageLoadingState';
import PageErrorState from '@/components/shared/feedback/PageErrorState';
import { LOADING_MESSAGES, ERROR_MESSAGES } from '@/data/loadingMessages';

export const MobileWeekView: React.FC = () => {
  const {
    queryClient,
    state,
    data,
    moodBoard,
    handlers,
    goals,
    formattedPeriodTitle,
    subtitleStr,
    activePageIndex,
    setActivePageIndex,
    expandedTasksDay,
    setExpandedTasksDay,
    handleToggleTask,
    handleSelectTaskSummary,
    handleTouchStart,
    handleTouchEnd,
    swipeDirection,
    handlePrevWeek,
    handleNextWeek,
  } = useMobileWeekLogic();

  // Stati di Caricamento ed Errore
  if (state.isLoading && !state.weekData) {
    return <PageLoadingState messages={LOADING_MESSAGES.week} />;
  }

  if (state.isError && !state.weekData) {
    return (
      <PageErrorState
        message={ERROR_MESSAGES.week}
        onRetry={() => queryClient.refetchQueries()}
      />
    );
  }

  return (
    <div className="h-full w-full flex flex-col justify-between gap-1.5 overflow-hidden animate-fadeIn relative select-none">
      {/* 1. Header Periodo Settimanale */}
      <MobileAgendaPeriodHeader
        title={formattedPeriodTitle}
        subtitle={subtitleStr}
        currentDate={state.targetDate}
        isCurrent={state.isCurrentWeek}
        onResetToday={handlers.handleResetCurrentWeek}
        onChangeDate={state.setTargetDate}
        viewMode="week"
        onOpenNotes={() => state.setIsNotesOpen(true)}
        notesCount={data.mappedNotes.length}
      />

      {/* 2. Container 2 Slide in Sliding Carousel */}
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
        {/* Slide 0: Focus Obiettivi/Priorità & Calendario Settimanale */}
        <MobileWeekCalendarSlide
          activePageIndex={activePageIndex}
          goalText={goals.goalEntry?.testo}
          priorities={goals.prioritiesEntries}
          onSaveGoal={goals.handleSaveGoal}
          onSavePriority={goals.handleSavePriority}
          monday={state.monday}
          events={data.mappedEvents}
          tasks={data.filteredTasks}
          onDayClick={handlers.handleGoToDay}
          onSelectEvent={handlers.handleSelectEvent}
          onSelectTask={handlers.handleSelectTask}
          onOpenExpandedTasks={(dateStr, dayTasks) =>
            setExpandedTasksDay({ dateStr, tasks: dayTasks })
          }
        />

        {/* Slide 1: Eventi Emotivi (Cose Positive & Negative) */}
        <MobileWeekMoodSlide
          activePageIndex={activePageIndex}
          positiveEvents={moodBoard.positiveEvents}
          negativeEvents={moodBoard.negativeEvents}
          onAddMoodEvent={moodBoard.addMood}
          onUpdateMoodEvent={moodBoard.updateMood}
          onDeleteMoodEvent={moodBoard.deleteMood}
        />
      </div>

      {/* 3. Indicatore di Paginazione Dots */}
      <div className="shrink-0 flex items-center justify-center gap-2 py-1 select-none">
        <button
          type="button"
          onClick={() => setActivePageIndex(0)}
          className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
            activePageIndex === 0
              ? 'w-6 bg-blue-600 shadow-xs'
              : 'w-1.5 bg-gray-300 hover:bg-gray-400'
          }`}
          title="Pagina 1: Focus & Calendario"
          aria-label="Pagina 1"
        />
        <button
          type="button"
          onClick={() => setActivePageIndex(1)}
          className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
            activePageIndex === 1
              ? 'w-6 bg-blue-600 shadow-xs'
              : 'w-1.5 bg-gray-300 hover:bg-gray-400'
          }`}
          title="Pagina 2: Eventi Emotivi"
          aria-label="Pagina 2"
        />
      </div>

      {/* 4. Modale Task Espanse per il giorno selezionato */}
      <MobileExpandedDayTasksModal
        expandedTasksDay={expandedTasksDay}
        onClose={() => setExpandedTasksDay(null)}
        onSelectTask={handleSelectTaskSummary}
        onToggleTask={handleToggleTask}
      />

      {/* 5. Note Settimanali (Bottom Sheet) */}
      <MobileNotesBottomSheet
        isOpen={state.isNotesOpen}
        notes={data.mappedNotes}
        editingNoteId={state.editingNoteId}
        onClose={() => state.setIsNotesOpen(false)}
        onAddNote={handlers.handleAddNote}
        onAutoSaveNote={handlers.handleAutoSaveNote}
        onDeleteNote={handlers.handleDeleteNote}
        clearEditingNoteId={() => state.setEditingNoteId(null)}
      />

      {/* 6. Overlay Onda Luminosa e Frecce Test Desktop */}
      <MobileDateSwipeOverlay
        swipeDirection={swipeDirection}
        onSwipePrev={handlePrevWeek}
        onSwipeNext={handleNextWeek}
      />
    </div>
  );
};

export default MobileWeekView;
