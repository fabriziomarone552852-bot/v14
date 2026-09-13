// src/mobile/views/MobileDayView.tsx
import React from 'react';
import MobileAgendaPeriodHeader from '../components/MobileAgendaPeriodHeader';
import MobileGoalsAndPrioritiesChips from '../components/MobileGoalsAndPrioritiesChips';
import PageLoadingState from '@/components/shared/feedback/PageLoadingState';
import PageErrorState from '@/components/shared/feedback/PageErrorState';
import { LOADING_MESSAGES, ERROR_MESSAGES } from '@/data/loadingMessages';

// Hook & Sub-componenti Modulari
import { useMobileDayLogic } from '../hooks/useMobileDayLogic';
import { MobileDateSwipeOverlay } from '../components/common/MobileDateSwipeOverlay';
import {
  MobileDayEventsCompact,
  MobileDayEventsExpanded,
} from '../components/day/MobileDayEventsSection';
import {
  MobileDayTasksCompact,
  MobileDayTasksExpanded,
} from '../components/day/MobileDayTasksSection';
import {
  MobileDayTrackerPage,
  MobileDayRoutinesExpanded,
} from '../components/day/MobileDayTrackerSection';
import { MobileDayModals } from '../components/day/MobileDayModals';

export const MobileDayView: React.FC = () => {
  const {
    // Stato Data
    targetDate,
    setTargetDate,
    isToday,
    weekdayName,
    formattedDateStr,
    handleResetToday,

    // Stato Query
    dayData,
    isLoading,
    isError,
    handleRetry,

    // Paginazione e Gesture
    activePageIndex,
    setActivePageIndex,
    handleTouchStart,
    handleTouchEnd,
    swipeDirection,
    handlePrevDay,
    handleNextDay,

    // Filtri e Viste
    sortMode,
    setSortMode,
    showWithDeadline,
    setShowWithDeadline,
    showNotificationDot,
    expandedView,
    handleSetExpandedView,

    // Dati Mappati
    sortedTasks,
    mappedEvents,
    mappedCountdowns,
    widgetCountdowns,
    mappedRoutines,
    mappedHabits,
    mappedNotes,

    // Dimensionamento
    eventsListRef,
    tasksListRef,
    visibleCompactEvents,
    hasMoreEvents,
    visibleCompactTasks,
    hasMoreTasks,

    // Selezione
    selectionState,
    isEventsSelection,
    isTasksSelection,
    isRoutinesSelection,
    handleToggleSelectEvent,
    handleToggleSelectTask,
    handleToggleSelectRoutine,

    // Azioni Elementi
    handleToggleTask,
    openTaskDetail,
    openEventDetail,
    openRoutineDetail,
    handleToggleHabitLog,
    handleUpdateRoutineCount,
    saveObiettivo,
    savePriorita,

    // Modali
    habitFormModal,
    countdownHubModal,
    countdownDetailModal,
    countdownFormModal,
    handleSaveCountdown,
    deleteCountdown,
    handleSaveHabit,

    // Note Sheet
    isNotesOpen,
    setIsNotesOpen,
    editingNoteId,
    setEditingNoteId,
    handleAddNote,
    handleAutoSaveNote,
    handleDeleteNote,
  } = useMobileDayLogic();

  // 1. STATI DI CARICAMENTO ED ERRORE
  if (isLoading && !dayData) {
    return <PageLoadingState messages={LOADING_MESSAGES.day} />;
  }

  if (isError && !dayData) {
    return <PageErrorState message={ERROR_MESSAGES.day} onRetry={handleRetry} />;
  }

  return (
    <div className="h-full w-full flex flex-col justify-between gap-1.5 overflow-hidden animate-fadeIn relative select-none">
      {/* ========================================================================= */}
      {/* 1. HEADER COMUNE STANDARDIZZATO (Data a sx, Icone Azione a dx)            */}
      {/* ========================================================================= */}
      <MobileAgendaPeriodHeader
        title={formattedDateStr}
        subtitle={isToday ? `OGGI • ${weekdayName}` : weekdayName}
        currentDate={targetDate}
        isCurrent={isToday}
        onResetToday={handleResetToday}
        onChangeDate={setTargetDate}
        viewMode="day"
        onOpenNotes={() => setIsNotesOpen(true)}
        notesCount={mappedNotes.length}
      />

      {/* ========================================================================= */}
      {/* 2. CORPO PRINCIPALE IN SLIDING A 2 PAGINE                                 */}
      {/* ========================================================================= */}
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
        {/* PAGINA 1: FOCUS & AZIONE (Obiettivo/Priorità + Eventi + Task) */}
        <div
          className={`absolute inset-0 w-full h-full flex flex-col gap-2 overflow-hidden transition-transform duration-300 ease-out ${
            activePageIndex === 0
              ? 'translate-x-0 pointer-events-auto'
              : '-translate-x-full pointer-events-none'
          }`}
        >
          {/* Obiettivo e Priorità a Chips */}
          <MobileGoalsAndPrioritiesChips
            goalText={dayData?.obiettivi?.[0]?.testo}
            priorities={dayData?.priorita}
            onSaveGoal={(testo) =>
              saveObiettivo({ id: dayData?.obiettivi?.[0]?.id, text: testo })
            }
            onSavePriority={(id, testo) => savePriorita({ id, text: testo })}
          />

          {/* Card Compatta Eventi */}
          <MobileDayEventsCompact
            events={mappedEvents}
            visibleEvents={visibleCompactEvents}
            hasMoreEvents={hasMoreEvents}
            eventsListRef={eventsListRef}
            onExpandEvents={() => handleSetExpandedView('events')}
            onOpenEventDetail={openEventDetail}
          />

          {/* Card Compatta Task */}
          <MobileDayTasksCompact
            tasks={sortedTasks}
            visibleTasks={visibleCompactTasks}
            hasMoreTasks={hasMoreTasks}
            tasksListRef={tasksListRef}
            showWithDeadline={showWithDeadline}
            showNotificationDot={showNotificationDot}
            sortMode={sortMode}
            onToggleDeadlineFilter={() => setShowWithDeadline((prev) => !prev)}
            onToggleSortMode={() =>
              setSortMode((prev) => (prev === 'chrono' ? 'priority' : 'chrono'))
            }
            onExpandTasks={() => handleSetExpandedView('tasks')}
            onOpenTaskDetail={openTaskDetail}
            onToggleTask={handleToggleTask}
          />
        </div>

        {/* PAGINA 2: TRACKER & MINDSET (Countdowns + Habits + Routine) */}
        <div
          className={`absolute inset-0 w-full h-full flex flex-col gap-2.5 overflow-hidden transition-transform duration-300 ease-out ${
            activePageIndex === 1
              ? 'translate-x-0 pointer-events-auto'
              : 'translate-x-full pointer-events-none'
          }`}
        >
          <MobileDayTrackerPage
            widgetCountdowns={widgetCountdowns}
            habits={mappedHabits}
            routines={mappedRoutines}
            onOpenCountdownHub={() => countdownHubModal.open()}
            onToggleHabit={handleToggleHabitLog}
            onAddHabitClick={() => habitFormModal.open()}
            onUpdateRoutineCount={handleUpdateRoutineCount}
            onSelectRoutine={openRoutineDetail}
            onExpandRoutines={() => handleSetExpandedView('routines')}
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. INDICATORE DI PAGINAZIONE (DOTS [ ▬▬ ] [ ● ])                           */}
      {/* ========================================================================= */}
      <div className="shrink-0 flex items-center justify-center gap-2 py-1 select-none">
        <button
          type="button"
          onClick={() => setActivePageIndex(0)}
          className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
            activePageIndex === 0
              ? 'w-6 bg-blue-600 shadow-xs'
              : 'w-1.5 bg-gray-300 hover:bg-gray-400'
          }`}
          title="Pagina 1: Focus & Task"
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
          title="Pagina 2: Routine & Tracker"
          aria-label="Pagina 2"
        />
      </div>

      {/* ========================================================================= */}
      {/* 4. MODALI A TUTTO SCHERMO PER VISTE ESPANSE                               */}
      {/* ========================================================================= */}
      {expandedView === 'events' && (
        <MobileDayEventsExpanded
          events={mappedEvents}
          formattedDateStr={formattedDateStr}
          isEventsSelection={isEventsSelection}
          selectedIds={selectionState.selectedIds}
          onToggleSelectEvent={handleToggleSelectEvent}
          onOpenEventDetail={openEventDetail}
          onCloseExpanded={() => handleSetExpandedView('none')}
        />
      )}

      {expandedView === 'tasks' && (
        <MobileDayTasksExpanded
          tasks={sortedTasks}
          showWithDeadline={showWithDeadline}
          showNotificationDot={showNotificationDot}
          sortMode={sortMode}
          isTasksSelection={isTasksSelection}
          selectedIds={selectionState.selectedIds}
          onToggleDeadlineFilter={() => setShowWithDeadline((prev) => !prev)}
          onToggleSortMode={() =>
            setSortMode((prev) => (prev === 'chrono' ? 'priority' : 'chrono'))
          }
          onToggleSelectTask={handleToggleSelectTask}
          onOpenTaskDetail={openTaskDetail}
          onToggleTask={handleToggleTask}
          onCloseExpanded={() => handleSetExpandedView('none')}
        />
      )}

      {expandedView === 'routines' && (
        <MobileDayRoutinesExpanded
          routines={mappedRoutines}
          formattedDateStr={formattedDateStr}
          isRoutinesSelection={isRoutinesSelection}
          selectedIds={selectionState.selectedIds}
          onToggleSelectRoutine={handleToggleSelectRoutine}
          onOpenRoutineDetail={openRoutineDetail}
          onUpdateRoutineCount={handleUpdateRoutineCount}
          onCloseExpanded={() => handleSetExpandedView('none')}
        />
      )}

      {/* ========================================================================= */}
      {/* 5. MODALI (COUNTDOWNS, ABITUDINI, NOTE SHEET)                             */}
      {/* ========================================================================= */}
      <MobileDayModals
        countdownHubModal={countdownHubModal}
        countdownDetailModal={countdownDetailModal}
        countdownFormModal={countdownFormModal}
        countdowns={mappedCountdowns}
        onSaveCountdown={handleSaveCountdown}
        onDeleteCountdown={(id) => deleteCountdown(id)}
        habitFormModal={habitFormModal}
        onSaveHabit={handleSaveHabit}
        isNotesOpen={isNotesOpen}
        notes={mappedNotes}
        editingNoteId={editingNoteId}
        onCloseNotes={() => setIsNotesOpen(false)}
        onAddNote={handleAddNote}
        onAutoSaveNote={handleAutoSaveNote}
        onDeleteNote={handleDeleteNote}
        clearEditingNoteId={() => setEditingNoteId(null)}
      />

      {/* ========================================================================= */}
      {/* 6. OVERLAY ONDA LUMINOSA E FRECCE TEMPORANEE DI TEST DESKTOP              */}
      {/* ========================================================================= */}
      <MobileDateSwipeOverlay
        swipeDirection={swipeDirection}
        onSwipePrev={handlePrevDay}
        onSwipeNext={handleNextDay}
      />
    </div>
  );
};

export default MobileDayView;
