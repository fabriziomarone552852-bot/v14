// src/mobile/views/MobileMonthView.tsx
import React, { useState, useMemo, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

// Logica e Hooks Centralizzati
import { useMonthPageLogic } from '@/hooks/uiMonth/useMonthPageLogic';
import { useDay } from '@/context/DayContext';
import { useCategories } from '@/hooks/useCategories';
import { useEventModals } from '@/context/EventModalContext';
import { useTaskModals } from '@/context/TaskModalContext';
import { mapDbEventsToCalendarEvents } from '@/utils/eventUtils';

// Componenti Mobile Standardizzati
import MobileAgendaPeriodHeader from '../components/MobileAgendaPeriodHeader';
import MobileGoalsAndPrioritiesChips from '../components/MobileGoalsAndPrioritiesChips';
import MobileMonthCalendar from '../components/MobileMonthCalendar';
import MobileMoodEventsBoard from '../components/MobileMoodEventsBoard';
import MobileNotesBottomSheet from '../components/MobileNotesBottomSheet';
import { TrackerPanel } from '@/components/weekmonth/TrackerPanel';
import { MobileMonthReviewModal } from '../components/modals/MobileMonthReviewModal';
import { TaskItem } from '@/components/shared/tasks/TaskItem';
import { TaskListIcon, CloseIcon } from '@/components/shared/utils/Icons';
import { EmptyState } from '@/components/shared/utils/EmptyState';

// Feedback & Loading
import PageLoadingState from '@/components/shared/feedback/PageLoadingState';
import PageErrorState from '@/components/shared/feedback/PageErrorState';
import { LOADING_MESSAGES, ERROR_MESSAGES } from '@/data/loadingMessages';
import type { DbTask, Priorita, UITask } from '@/types';

const mapDbTaskToUITask = (t: DbTask): UITask => ({
  id: t.id,
  title: t.titolo || '',
  deadline: t.data_scadenza || '',
  dateStr: t.data_start || '',
  done: !!t.fatto,
  priority: (t.priorita as Priorita) || 'Media',
  category: t.category_name || t.category?.category_name || '',
  categoryColor: t.category?.colore || undefined,
  description: t.descrizione || '',
  location: t.luogo || '',
  parent_id: t.parent_id,
  subtasks: [],
});

export const MobileMonthView: React.FC = () => {
  const queryClient = useQueryClient();
  const { changeDate: setTargetDate } = useDay();
  const { openEventDetail } = useEventModals();
  const { openTaskDetail } = useTaskModals();
  const { data: dbCategories = [] } = useCategories();

  const { state, apiData, handlers, review } = useMonthPageLogic();

  // 1. TITOLO MENSILE
  const monthTitle = useMemo(() => {
    return format(state.monthTargetDate, 'MMMM yyyy', { locale: it }).toUpperCase();
  }, [state.monthTargetDate]);

  const isCurrentMonth = useMemo(() => {
    const now = new Date();
    return (
      now.getMonth() === state.monthTargetDate.getMonth() &&
      now.getFullYear() === state.monthTargetDate.getFullYear()
    );
  }, [state.monthTargetDate]);

  // 2. MAPPATURA EVENTI MENSILI
  const mappedEvents = useMemo(() => {
    return mapDbEventsToCalendarEvents(apiData?.events || [], state.startStr);
  }, [apiData?.events, state.startStr]);

  // 3. STATO SLIDING & GESTURE TOUCH (0 = Grafici, 1 = Calendario, 2 = Eventi Emotivi)
  const [activePageIndex, setActivePageIndex] = useState<0 | 1 | 2>(1);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // 4. STATO MODALE TASK ESPANSE (quando si clicca sul badge task di un giorno)
  const [expandedTasksDay, setExpandedTasksDay] = useState<{
    dateStr: string;
    tasks: DbTask[];
  } | null>(null);

  const formattedExpandedTasksDate = useMemo(() => {
    if (!expandedTasksDay?.dateStr) return '';
    const [y, m, d] = expandedTasksDay.dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const formatted = format(dateObj, 'EEEE d MMMM yyyy', { locale: it });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }, [expandedTasksDay?.dateStr]);

  const handleToggleTask = async (id: number, currentStatus: boolean, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const allTasks = apiData?.tasks || [];
    const targetTask = allTasks.find((t) => t.id === id);
    if (targetTask) {
      await handlers.handleToggleTaskGrid(targetTask, !currentStatus);
      if (expandedTasksDay) {
        setExpandedTasksDay((prev) =>
          prev
            ? {
                ...prev,
                tasks: prev.tasks.map((t) =>
                  t.id === id ? { ...t, fatto: !currentStatus } : t
                ),
              }
            : null
        );
      }
    }
  };

  const handleToggleTaskFromCalendar = async (task: DbTask, newStatus: boolean) => {
    await handlers.handleToggleTaskGrid(task, newStatus);
    if (expandedTasksDay) {
      setExpandedTasksDay((prev) =>
        prev
          ? {
              ...prev,
              tasks: prev.tasks.map((t) =>
                t.id === task.id ? { ...t, fatto: newStatus } : t
              ),
            }
          : null
      );
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    // Solo se lo swipe orizzontale è prevalente e oltre la soglia
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0) {
        // Swipe verso sinistra -> vai avanti
        if (activePageIndex === 0) setActivePageIndex(1);
        else if (activePageIndex === 1) setActivePageIndex(2);
      } else if (deltaX > 0) {
        // Swipe verso destra -> vai indietro
        if (activePageIndex === 2) setActivePageIndex(1);
        else if (activePageIndex === 1) setActivePageIndex(0);
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // 5. STATI DI CARICAMENTO ED ERRORE
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
      
      {/* ========================================================================= */}
      {/* 1. HEADER COMUNE STANDARDIZZATO (Data periodo a sx, Icone Azione a dx)    */}
      {/* ========================================================================= */}
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

      {/* ========================================================================= */}
      {/* 2. CORPO PRINCIPALE IN SLIDING A 3 PAGINE (Transizioni Fluide Simmetriche)*/}
      {/* ========================================================================= */}
      <div
        className="flex-1 min-h-0 w-full overflow-hidden relative"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* --------------------------------------------------------------------- */}
        {/* SLIDE 0 (SINISTRA): GRAFICI RADAR MOOD & SFERE DEL MESE CORRENTE      */}
        {/* --------------------------------------------------------------------- */}
        <div
          className={`absolute inset-0 w-full h-full flex flex-col gap-2 overflow-hidden transition-transform duration-300 ease-out ${
            activePageIndex === 0
              ? 'translate-x-0 pointer-events-auto'
              : activePageIndex === 1
              ? '-translate-x-full pointer-events-none'
              : '-translate-x-[200%] pointer-events-none'
          }`}
        >
          {/* Card 1: Grafico Umore (Come mi sento) */}
          <div className="flex-1 min-h-0 bg-white rounded-2xl border border-gray-200/90 shadow-xs p-1.5 overflow-hidden flex flex-col items-center">
            <TrackerPanel
              titleTop="Come mi sento"
              showBottom={false}
              items={state.moodsUI}
              onUpdateValue={handlers.handleUpdateMood}
            />
          </div>

          {/* Card 2: Grafico Sfere di Influenza */}
          <div className="flex-1 min-h-0 bg-white rounded-2xl border border-gray-200/90 shadow-xs p-1.5 overflow-hidden flex flex-col items-center">
            <TrackerPanel
              titleTop="Sfere di Influenza"
              showBottom={false}
              items={state.spheresUI}
              onUpdateValue={handlers.handleUpdateSphere}
            />
          </div>
        </div>

        {/* --------------------------------------------------------------------- */}
        {/* SLIDE 1 (CENTRO / PRINCIPALE): FOCUS & CALENDARIO MENSILE COMPRESSO   */}
        {/* --------------------------------------------------------------------- */}
        <div
          className={`absolute inset-0 w-full h-full flex flex-col gap-2 overflow-hidden transition-transform duration-300 ease-out ${
            activePageIndex === 1
              ? 'translate-x-0 pointer-events-auto'
              : activePageIndex === 0
              ? 'translate-x-full pointer-events-none'
              : '-translate-x-full pointer-events-none'
          }`}
        >
          {/* OBIETTIVO E PRIORITÀ MENSILI COMPATTI A CHIPS */}
          <MobileGoalsAndPrioritiesChips
            goalText={apiData?.obiettivi?.[0]?.monthly_field}
            priorities={apiData?.priorita}
            onSaveGoal={handlers.handleSaveGoal}
            onSavePriority={handlers.handleSavePriority}
            goalPlaceholder="Qual è il tuo obiettivo per il mese?"
          />

          {/* CALENDARIO MENSILE ZERO-SCROLL */}
          <MobileMonthCalendar
            targetDate={state.monthTargetDate}
            events={mappedEvents}
            tasks={apiData?.tasks || []}
            dailyEntries={apiData?.daily_entries || []}
            allCategories={dbCategories}
            onDayClick={handlers.handleGoToDay}
            onSelectEvent={openEventDetail}
            onSelectTask={(task) => openTaskDetail(mapDbTaskToUITask(task))}
            onToggleTask={handleToggleTaskFromCalendar}
            onOpenExpandedTasks={(dateStr, dayTasks) =>
              setExpandedTasksDay({ dateStr, tasks: dayTasks })
            }
          />
        </div>

        {/* --------------------------------------------------------------------- */}
        {/* SLIDE 2 (DESTRA): EVENTI EMOTIVI / MOOD (Cose Positive & Negative)   */}
        {/* --------------------------------------------------------------------- */}
        <div
          className={`absolute inset-0 w-full h-full flex flex-col gap-2.5 overflow-hidden transition-transform duration-300 ease-out ${
            activePageIndex === 2
              ? 'translate-x-0 pointer-events-auto'
              : activePageIndex === 1
              ? 'translate-x-full pointer-events-none'
              : 'translate-x-[200%] pointer-events-none'
          }`}
        >
          <MobileMoodEventsBoard
            positiveEvents={apiData?.eventi_positivi || []}
            negativeEvents={apiData?.eventi_negativi || []}
            periodLabel="questo mese"
            onAddMoodEvent={handlers.handleAddMoodEvent}
            onUpdateMoodEvent={handlers.handleUpdateMoodEvent}
            onDeleteMoodEvent={handlers.handleDeleteMoodEvent}
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. INDICATORE DI PAGINAZIONE (3 PILLOLE: [ ● ] [ ▬▬ ] [ ● ])              */}
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

      {/* ========================================================================= */}
      {/* 4. MODALE A SCHERMO INTERO: TASK ESPANSE DEL GIORNO SELEZIONATO            */}
      {/* ========================================================================= */}
      {expandedTasksDay && (
        <div className="absolute inset-0 z-50 bg-gray-50 flex flex-col p-3 rounded-2xl animate-fadeIn shadow-2xl border border-gray-200">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200 shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600">
                <TaskListIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
                  Task ({expandedTasksDay.tasks.length})
                </h3>
                <p className="text-xs text-gray-500 font-medium">
                  {formattedExpandedTasksDate}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setExpandedTasksDay(null)}
              className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-200 hover:text-red-500 transition-colors cursor-pointer"
              title="Chiudi visualizzazione task"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-2.5 pt-3 pr-1">
            {expandedTasksDay.tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={mapDbTaskToUITask(task)}
                onSelect={(t) => {
                  setExpandedTasksDay(null);
                  openTaskDetail(t);
                }}
                onToggle={handleToggleTask}
              />
            ))}

            {expandedTasksDay.tasks.length === 0 && (
              <div className="h-full flex items-center justify-center py-8">
                <EmptyState message="Nessuna task in programma per questo giorno" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. REVIEW MENSILE (MODALE FULLSCREEN MOBILE)                              */}
      {/* ========================================================================= */}
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

      {/* ========================================================================= */}
      {/* 6. NOTE MENSILI (BOTTOM SHEET)                                            */}
      {/* ========================================================================= */}
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
    </div>
  );
};

export default MobileMonthView;
