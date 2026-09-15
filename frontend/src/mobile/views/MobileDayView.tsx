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
import { MobileDayEventsCompact } from '../components/day/MobileDayEventsSection';
import { MobileDayTasksCompact } from '../components/day/MobileDayTasksSection';
import { MobileDayTrackerPage } from '../components/day/MobileDayTrackerSection';
import { MobileDayModals } from '../components/day/MobileDayModals';
import MobileDayPaginationDots from '../components/day/MobileDayPaginationDots';
import MobileDayExpandedViews from '../components/day/MobileDayExpandedViews';

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
      {/* 1. Header Standardizzato */}
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

      {/* 2. Corpo Principale in Sliding a 2 Pagine */}
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
        {/* Pagina 1: Focus & Task */}
        <div
          className={`absolute inset-0 w-full h-full flex flex-col gap-2 overflow-hidden transition-transform duration-300 ease-out ${
            activePageIndex === 0
              ? 'translate-x-0 pointer-events-auto'
              : '-translate-x-full pointer-events-none'
          }`}
        >
          <MobileGoalsAndPrioritiesChips
            goalText={dayData?.obiettivi?.[0]?.testo}
            priorities={dayData?.priorita}
            onSaveGoal={(testo) =>
              saveObiettivo({ id: dayData?.obiettivi?.[0]?.id, text: testo })
            }
            onSavePriority={(id, testo) => savePriorita({ id, text: testo })}
          />

          <MobileDayEventsCompact
            events={mappedEvents}
            visibleEvents={visibleCompactEvents}
            hasMoreEvents={hasMoreEvents}
            eventsListRef={eventsListRef}
            onExpandEvents={() => handleSetExpandedView('events')}
            onOpenEventDetail={openEventDetail}
          />

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

        {/* Pagina 2: Tracker & Routine */}
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

      {/* 3. Indicatore di Paginazione Touch */}
      <MobileDayPaginationDots
        activePageIndex={activePageIndex}
        onSelectPage={setActivePageIndex}
      />

      {/* 4. Viste Espanse a Schermo Intero */}
      <MobileDayExpandedViews
        expandedView={expandedView}
        onCloseExpanded={() => handleSetExpandedView('none')}
        formattedDateStr={formattedDateStr}
        mappedEvents={mappedEvents}
        isEventsSelection={isEventsSelection}
        onToggleSelectEvent={handleToggleSelectEvent}
        openEventDetail={openEventDetail}
        sortedTasks={sortedTasks}
        showWithDeadline={showWithDeadline}
        setShowWithDeadline={setShowWithDeadline}
        showNotificationDot={showNotificationDot}
        sortMode={sortMode}
        setSortMode={setSortMode}
        isTasksSelection={isTasksSelection}
        onToggleSelectTask={handleToggleSelectTask}
        openTaskDetail={openTaskDetail}
        handleToggleTask={handleToggleTask}
        mappedRoutines={mappedRoutines}
        isRoutinesSelection={isRoutinesSelection}
        onToggleSelectRoutine={handleToggleSelectRoutine}
        openRoutineDetail={openRoutineDetail}
        handleUpdateRoutineCount={handleUpdateRoutineCount}
        selectedIds={selectionState.selectedIds}
      />

      {/* 5. Modali Standard */}
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

      {/* 6. Overlay Animazione Swipe */}
      <MobileDateSwipeOverlay
        swipeDirection={swipeDirection}
        onSwipePrev={handlePrevDay}
        onSwipeNext={handleNextDay}
      />
    </div>
  );
};

export default MobileDayView;
