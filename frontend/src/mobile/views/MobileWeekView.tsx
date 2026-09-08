// src/mobile/views/MobileWeekView.tsx
import React, { useState, useMemo, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

// Logica e Hooks Centralizzati
import { useWeekPageLogic } from '@/hooks/uiWeek/useWeekPageLogic';

// Componenti Mobile Standardizzati
import MobileAgendaPeriodHeader from '../components/MobileAgendaPeriodHeader';
import MobileGoalsAndPrioritiesChips from '../components/MobileGoalsAndPrioritiesChips';
import MobileWeekCalendar from '../components/MobileWeekCalendar';
import MobileMoodEventsBoard from '../components/MobileMoodEventsBoard';
import MobileNotesBottomSheet from '../components/MobileNotesBottomSheet';
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

export const MobileWeekView: React.FC = () => {
  const queryClient = useQueryClient();
  const { state, data, moodBoard, handlers, goals } = useWeekPageLogic();

  // 1. FORMATTAZIONE TITOLO & SOTTOTITOLO SETTIMANALE
  const formattedPeriodTitle = useMemo(() => {
    const startStr = format(state.monday, 'd MMM', { locale: it });
    const endStr = format(state.sunday, 'd MMM yyyy', { locale: it });
    return `${startStr} - ${endStr}`;
  }, [state.monday, state.sunday]);

  const subtitleStr = useMemo(() => {
    return state.isCurrentWeek
      ? `QUESTA SETTIMANA • SETT. ${state.weekNumber}`
      : `SETTIMANA ${state.weekNumber}`;
  }, [state.isCurrentWeek, state.weekNumber]);

  // 2. STATO SLIDING & GESTURE TOUCH (0 = Calendario, 1 = Mood Events)
  const [activePageIndex, setActivePageIndex] = useState<0 | 1>(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // 3. STATO MODALE TASK ESPANSE (quando un giorno ha > 1 task)
  const [expandedTasksDay, setExpandedTasksDay] = useState<{
    dateStr: string;
    tasks: DbTask[];
  } | null>(null);

  const formattedExpandedTasksDate = useMemo(() => {
    if (!expandedTasksDay?.dateStr) return '';
    const [y, m, d] = expandedTasksDay.dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const formatted = format(dateObj, 'EEEE d MMMM', { locale: it });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }, [expandedTasksDay?.dateStr]);

  const handleToggleTask = async (id: number, currentStatus: boolean, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const targetTask = data.filteredTasks.find((t) => t.id === id);
    if (targetTask) {
      await handlers.handleToggleTaskFromGrid(targetTask, !currentStatus);
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

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    // Se lo swipe orizzontale è predominante rispetto a quello verticale
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0 && activePageIndex === 0) {
        setActivePageIndex(1); // Swipe sinistra -> Pagina 2 (Mood Events)
      } else if (deltaX > 0 && activePageIndex === 1) {
        setActivePageIndex(0); // Swipe destra -> Pagina 1 (Calendario)
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // 4. STATI DI CARICAMENTO ED ERRORE
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
      
      {/* ========================================================================= */}
      {/* 1. HEADER COMUNE STANDARDIZZATO (Data periodo a sx, Icone Azione a dx)    */}
      {/* ========================================================================= */}
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

      {/* ========================================================================= */}
      {/* 2. CORPO PRINCIPALE IN SLIDING A 2 PAGINE (Transizione Assoluta Simmetrica)*/}
      {/* ========================================================================= */}
      <div
        className="flex-1 min-h-0 w-full overflow-hidden relative"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* --------------------------------------------------------------------- */}
        {/* PAGINA 1: FOCUS & CALENDARIO SETTIMANALE COMPRESSO (Lunedì - Domenica) */}
        {/* --------------------------------------------------------------------- */}
        <div
          className={`absolute inset-0 w-full h-full flex flex-col gap-2 overflow-hidden transition-transform duration-300 ease-out ${
            activePageIndex === 0
              ? 'translate-x-0 pointer-events-auto'
              : '-translate-x-full pointer-events-none'
          }`}
        >
          {/* OBIETTIVO E PRIORITÀ SETTIMANALI COMPATTI A CHIPS */}
          <MobileGoalsAndPrioritiesChips
            goalText={goals.goalEntry?.testo}
            priorities={goals.prioritiesEntries}
            onSaveGoal={goals.handleSaveGoal}
            onSavePriority={goals.handleSavePriority}
            goalPlaceholder="Qual è il tuo obiettivo per la settimana?"
          />

          {/* VISTA CALENDARIO SETTIMANALE COMPRESSA (Lun - Dom senza scrollbar esterne) */}
          <MobileWeekCalendar
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
        </div>

        {/* --------------------------------------------------------------------- */}
        {/* PAGINA 2: EVENTI EMOTIVI / MOOD (Cose Positive in alto, Negative sotto) */}
        {/* --------------------------------------------------------------------- */}
        <div
          className={`absolute inset-0 w-full h-full flex flex-col gap-2.5 overflow-hidden transition-transform duration-300 ease-out ${
            activePageIndex === 1
              ? 'translate-x-0 pointer-events-auto'
              : 'translate-x-full pointer-events-none'
          }`}
        >
          <MobileMoodEventsBoard
            positiveEvents={moodBoard.positiveEvents}
            negativeEvents={moodBoard.negativeEvents}
            onAddMoodEvent={moodBoard.addMood}
            onUpdateMoodEvent={moodBoard.updateMood}
            onDeleteMoodEvent={moodBoard.deleteMood}
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. INDICATORE DI PAGINAZIONE (CAROUSEL DOTS & PILL: [ ▬▬ ] [ ● ])         */}
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
                  handlers.handleSelectTask(t);
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
      {/* 5. NOTE SETTIMANALI (BOTTOM SHEET)                                        */}
      {/* ========================================================================= */}
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
    </div>
  );
};

export default MobileWeekView;
