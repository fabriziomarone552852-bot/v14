// src/mobile/views/MobileDayView.tsx
import React, { useState, useMemo, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';

// Contesti & Hooks
import { useDay } from '@/context/DayContext';
import { useAgendaDay } from '@/hooks/useAgendaDay';
import { useTaskModals } from '@/context/TaskModalContext';
import { useEventModals } from '@/context/EventModalContext';
import { useRoutineModals } from '@/context/RoutineModalContext';
import { useModal } from '@/hooks/useModals';

// Componenti Condivisi & Mobile
import MobileAgendaPeriodHeader from '../components/MobileAgendaPeriodHeader';
import MobileGoalsAndPrioritiesChips from '../components/MobileGoalsAndPrioritiesChips';
import MobileRoutineColumn from '../components/MobileRoutineColumn';
import { TaskItem } from '@/components/shared/tasks/TaskItem';
import { TruncatedTitle } from '@/components/shared/utils/TruncatedTitle';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import MobileNotesBottomSheet from '../components/MobileNotesBottomSheet';

// Sezioni Tracker & Habit
import HabitsBar, { type HabitItem } from '@/components/day/HabitsBar';
import HabitNewModal from '@/components/day/HabitNewModal';
import { type RoutineItem } from '@/components/day/RoutineColumn';

// Sezioni Countdowns
import CountdownWidget, { type CountdownItem } from '@/components/day/CountdownWidget';
import MobileCountdownHubModal from '../components/modals/MobileCountdownHubModal';
import MobileCountdownNewModal, { type CountdownSavePayload } from '../components/modals/MobileCountdownNewModal';
import MobileCountdownDetailModal from '../components/modals/MobileCountdownDetailModal';

// Icone & Feedback
import {
  ArrowDownIcon,
  CalendarIcon,
  CalendarXIcon,
  TaskListIcon,
  RepeatIcon,
  CheckIcon,
  SwitchIcon,
  CloseIcon,
} from '@/components/shared/utils/Icons';
import PageLoadingState from '@/components/shared/feedback/PageLoadingState';
import PageErrorState from '@/components/shared/feedback/PageErrorState';
import { LOADING_MESSAGES, ERROR_MESSAGES } from '@/data/loadingMessages';

// Utilities & Types
import { formatDateString, getAgendaDateLabels, getLocalTodayStr } from '@/utils/dateUtils';
import { buildTaskTreeForDay, filterAndSortTree, filterTreeByDeadlineMode } from '@/utils/taskUtils';
import { mapDbEventsToCalendarEvents, isEventInDay } from '@/utils/eventUtils';
import { mapHabitsToRoutines, mapHabitsToItems } from '@/utils/habitUtils';
import { mapToCountdownItems } from '@/utils/countdownUtils';
import { filterNotes, getRandomVariant } from '@/utils/noteUtils';
import type { CalendarEvent, NoteVariant } from '@/types';
import { startOfDay, isBefore, format } from 'date-fns';
import { it } from 'date-fns/locale';
import { DEFAULT_COVER_IMAGE } from '@/utils/constants';
import { useResizeObserver } from '@/hooks/useResizeObserver';

export const MobileDayView: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  // 1. STATO DATA
  const { dataRiferimento: targetDate, changeDate: setTargetDate } = useDay();
  const { isToday } = getAgendaDateLabels(targetDate);
  const weekdayName = useMemo(() => format(targetDate, 'EEEE', { locale: it }).toUpperCase(), [targetDate]);
  const formattedDateStr = useMemo(() => format(targetDate, 'd MMMM yyyy', { locale: it }), [targetDate]);

  // Intercetta eventuale navigazione con state
  React.useEffect(() => {
    const state = location.state as { selectedDate?: string } | null;
    if (state?.selectedDate) {
      const [y, m, d] = state.selectedDate.split('-').map(Number);
      setTargetDate(new Date(y, m - 1, d));
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, setTargetDate, navigate, location.pathname]);

  const targetDateStr = useMemo(() => formatDateString(targetDate), [targetDate]);

  // 2. FETCH DATI GIORNO
  const {
    dayData,
    isLoading,
    isError,
    toggleTask,
    saveNote,
    deleteNote,
    updateHabitLog,
    saveCountdown,
    deleteCountdown,
    saveHabit,
    updateHabitCount,
    saveObiettivo,
    savePriorita,
  } = useAgendaDay(targetDateStr);

  // 3. STATO VISTA SLIDING & PAGINAZIONE
  const [activePageIndex, setActivePageIndex] = useState<0 | 1>(0);

  // Touch Swipe Gestures
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

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
      if (deltaX < 0 && activePageIndex === 0) {
        setActivePageIndex(1); // Swipe sinistra -> Pagina 2
      } else if (deltaX > 0 && activePageIndex === 1) {
        setActivePageIndex(0); // Swipe destra -> Pagina 1
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // 4. STATO FILTRI & VISTA ESPANSA
  const [sortMode, setSortMode] = useState<'chrono' | 'priority'>('chrono');
  const [showWithDeadline, setShowWithDeadline] = useState<boolean>(true);
  const [expandedView, setExpandedView] = useState<'none' | 'events' | 'tasks' | 'routines'>('none');

  // Modali Eventi, Task & Routine
  const { openTaskDetail } = useTaskModals();
  const { openEventDetail } = useEventModals();
  const { openRoutineDetail } = useRoutineModals();

  // Modali Countdowns & Abitudini
  const habitFormModal = useModal();
  const countdownHubModal = useModal();
  const countdownDetailModal = useModal<CountdownItem>();
  const countdownFormModal = useModal<CountdownItem>();

  // Note Sidebar / Sheet
  const [isNotesOpen, setIsNotesOpen] = useState<boolean>(false);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);

  // 5. MAPPATURA DEI DATI
  const rawTree = useMemo(() => {
    return buildTaskTreeForDay(dayData?.tasks, targetDateStr);
  }, [dayData?.tasks, targetDateStr]);

  const showNotificationDot = useMemo(() => {
    return showWithDeadline
      ? rawTree.some((t) => !t.deadline && !t.done)
      : rawTree.some((t) => !!t.deadline && !t.done);
  }, [rawTree, showWithDeadline]);

  const sortedTasks = useMemo(() => {
    const deadlineFiltered = filterTreeByDeadlineMode(rawTree, showWithDeadline);
    return filterAndSortTree(deadlineFiltered, false, sortMode, targetDateStr);
  }, [rawTree, showWithDeadline, sortMode, targetDateStr]);

  const mappedEvents: CalendarEvent[] = useMemo(() => {
    const all = mapDbEventsToCalendarEvents(dayData?.events, targetDateStr);
    return all.filter((ev) => isEventInDay(ev, targetDateStr));
  }, [dayData?.events, targetDateStr]);

  const mappedCountdowns: CountdownItem[] = useMemo(() => {
    return mapToCountdownItems(dayData?.countdowns);
  }, [dayData?.countdowns]);

  const todayDateObj = startOfDay(new Date());
  const widgetCountdowns = useMemo(() => {
    return mappedCountdowns.filter((cd) => {
      const tDate = startOfDay(new Date(cd.targetDateStr));
      return !isBefore(tDate, todayDateObj);
    });
  }, [mappedCountdowns, todayDateObj]);

  const mappedRoutines: RoutineItem[] = useMemo(() => {
    return mapHabitsToRoutines(dayData?.habits ?? [], targetDateStr);
  }, [dayData?.habits, targetDateStr]);

  const mappedHabits: HabitItem[] = useMemo(() => {
    return mapHabitsToItems(dayData?.habits ?? [], targetDateStr);
  }, [dayData?.habits, targetDateStr]);

  const mappedNotes = useMemo(() => {
    return filterNotes(dayData?.note);
  }, [dayData?.note]);

  // Misura dinamica dello spazio per Eventi e Task compatte
  const eventsListRef = useRef<HTMLDivElement>(null);
  const tasksListRef = useRef<HTMLDivElement>(null);

  const { clientHeight: eventsContainerHeight } = useResizeObserver(eventsListRef, 50);
  const { clientHeight: tasksContainerHeight } = useResizeObserver(tasksListRef, 50);

  // Calcolo dinamico degli elementi visibili prima dell'indicatore '•••'
  const EVENT_SLOT_HEIGHT = 50; // Riga evento (~44px) + gap (6px)
  const TASK_SLOT_HEIGHT = 70;  // Riga task (64px) + gap (6px)
  const INDICATOR_HEIGHT = 32;  // Altezza riservata all'indicatore '•••'

  const maxEventsFit = useMemo(() => {
    if (eventsContainerHeight <= 0) return 2;
    if (mappedEvents.length * EVENT_SLOT_HEIGHT <= eventsContainerHeight) {
      return mappedEvents.length;
    }
    const availableForItems = eventsContainerHeight - INDICATOR_HEIGHT;
    return Math.max(1, Math.floor(availableForItems / EVENT_SLOT_HEIGHT));
  }, [eventsContainerHeight, mappedEvents.length]);

  const visibleCompactEvents = useMemo(() => {
    return mappedEvents.slice(0, maxEventsFit);
  }, [mappedEvents, maxEventsFit]);

  const hasMoreEvents = mappedEvents.length > maxEventsFit;

  const maxTasksFit = useMemo(() => {
    if (tasksContainerHeight <= 0) return 2;
    if (sortedTasks.length * TASK_SLOT_HEIGHT <= tasksContainerHeight) {
      return sortedTasks.length;
    }
    const availableForItems = tasksContainerHeight - INDICATOR_HEIGHT;
    return Math.max(1, Math.floor(availableForItems / TASK_SLOT_HEIGHT));
  }, [tasksContainerHeight, sortedTasks.length]);

  const visibleCompactTasks = useMemo(() => {
    return sortedTasks.slice(0, maxTasksFit);
  }, [sortedTasks, maxTasksFit]);

  const hasMoreTasks = sortedTasks.length > maxTasksFit;

  // 6. HANDLER RESET DATA
  const handleResetToday = useCallback(() => {
    setTargetDate(new Date());
  }, [setTargetDate]);

  // 7. HANDLERS TASK & NOTE
  const handleToggleTask = useCallback(
    (id: number, currentStatus: boolean, e?: React.MouseEvent) => {
      e?.stopPropagation();
      toggleTask({ id, isDone: !currentStatus });
    },
    [toggleTask]
  );

  const handleAddNote = useCallback(() => {
    const tempId = Date.now();
    saveNote({
      id: tempId,
      data_riferimento: targetDateStr,
      testo: '',
      tipo: getRandomVariant(),
      isNew: true,
    });
    setEditingNoteId(tempId);
  }, [saveNote, targetDateStr]);

  const handleAutoSaveNote = useCallback(
    (id: number, testo: string, tipo: NoteVariant, isNew?: boolean) => {
      saveNote({ id, testo, data_riferimento: targetDateStr, tipo, isNew });
    },
    [saveNote, targetDateStr]
  );

  const handleDeleteNote = useCallback(
    (id: number) => {
      deleteNote(id);
    },
    [deleteNote]
  );

  // LOADING & ERROR
  if (isLoading && !dayData) {
    return <PageLoadingState messages={LOADING_MESSAGES.day} />;
  }

  if (isError && !dayData) {
    return (
      <PageErrorState
        message={ERROR_MESSAGES.day}
        onRetry={() => queryClient.refetchQueries({ queryKey: ['daySync', targetDateStr] })}
      />
    );
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
      {/* 2. CORPO PRINCIPALE IN SLIDING A 2 PAGINE (Transizione Assoluta Simmetrica)*/}
      {/* ========================================================================= */}
      <div
        className="flex-1 min-h-0 w-full overflow-hidden relative"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* --------------------------------------------------------------------- */}
        {/* PAGINA 1: FOCUS & AZIONE (Obiettivo/Priorità + Eventi + Task)         */}
        {/* --------------------------------------------------------------------- */}
        <div
          className={`absolute inset-0 w-full h-full flex flex-col gap-2 overflow-hidden transition-transform duration-300 ease-out ${
            activePageIndex === 0
              ? 'translate-x-0 pointer-events-auto'
              : '-translate-x-full pointer-events-none'
          }`}
        >
          {/* OBIETTIVO E PRIORITÀ COMPATTI A CHIPS */}
          <MobileGoalsAndPrioritiesChips
            goalText={dayData?.obiettivi?.[0]?.testo}
            priorities={dayData?.priorita}
            onSaveGoal={(testo) =>
              saveObiettivo({ id: dayData?.obiettivi?.[0]?.id, text: testo })
            }
            onSavePriority={(id, testo) => savePriorita({ id, text: testo })}
          />

            {/* CARD EVENTI DEL GIORNO */}
            <div
              onClick={() => setExpandedView('events')}
              className="flex-1 min-h-0 flex flex-col justify-between bg-white rounded-2xl border border-gray-200/90 shadow-xs p-2.5 overflow-hidden cursor-pointer active:border-blue-300 transition-colors select-none"
              title="Tocca per espandere gli eventi a schermo intero"
            >
              <div className="flex items-center justify-between pb-1.5 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                    <CalendarIcon className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Eventi
                  </h3>
                  <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    {mappedEvents.length}
                  </span>
                </div>
              </div>

              {/* Contenitore Body con Ref di Misurazione Dinamica */}
              <div
                ref={eventsListRef}
                className="flex-1 min-h-0 flex flex-col justify-between overflow-hidden pt-1.5"
              >
                <div className="flex flex-col gap-1.5 overflow-hidden">
                  {visibleCompactEvents.map((ev) => (
                    <div
                      key={ev.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        openEventDetail(ev);
                      }}
                      className="flex items-center gap-2 bg-gray-50/80 hover:bg-blue-50/40 border border-gray-200/70 hover:border-blue-300 rounded-xl p-2 cursor-pointer active:scale-[0.99] transition-all shadow-2xs shrink-0"
                    >
                      <div className="w-10 flex flex-col items-center justify-center shrink-0 text-center leading-tight">
                        {ev.time && (
                          <span className="text-[10px] font-black text-gray-700">{ev.time}</span>
                        )}
                        {ev.endTime && (
                          <>
                            <ArrowDownIcon className="h-2 w-2 text-gray-400 my-0.2" />
                            <span className="text-[9px] font-semibold text-gray-500">{ev.endTime}</span>
                          </>
                        )}
                      </div>

                      <div
                        className="w-1.5 h-6 rounded-full shrink-0"
                        style={{
                          backgroundColor: ev.categoryColor?.startsWith('#')
                            ? ev.categoryColor
                            : '#3b82f6',
                        }}
                      />

                      <div className="flex-1 min-w-0">
                        <TruncatedTitle title={ev.title} />
                      </div>
                    </div>
                  ))}

                  {mappedEvents.length === 0 && (
                    <div className="h-full flex items-center justify-center py-2">
                      <EmptyState message="Nessun evento per questo giorno" />
                    </div>
                  )}
                </div>

                {/* Indicatore '...' Grande ed Evidente se ci sono più eventi */}
                {hasMoreEvents && (
                  <div className="shrink-0 h-7 flex items-center justify-center select-none pt-0.5">
                    <span className="text-xl font-black tracking-widest text-blue-500 hover:text-blue-600 leading-none">
                      •••
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* CARD TASK DEL GIORNO */}
            <div
              onClick={() => setExpandedView('tasks')}
              className="flex-1 min-h-0 flex flex-col justify-between bg-white rounded-2xl border border-gray-200/90 shadow-xs p-2.5 overflow-hidden cursor-pointer active:border-emerald-300 transition-colors select-none"
              title="Tocca per espandere le task a schermo intero"
            >
              <div className="flex items-center justify-between pb-1.5 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                    <TaskListIcon className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Task
                  </h3>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {sortedTasks.length}
                  </span>
                </div>

                {/* Tasti Filtro & Ordinamento */}
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <div className="relative flex">
                    <button
                      type="button"
                      onClick={() => setShowWithDeadline((prev) => !prev)}
                      className="p-1 rounded-lg border transition-colors flex items-center justify-center w-6 h-6 bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-blue-600 cursor-pointer"
                      title={showWithDeadline ? 'Mostra Senza Data' : 'Mostra Con Data'}
                      aria-label="Filtra scadenza"
                    >
                      {showWithDeadline ? (
                        <CalendarIcon className="h-3 w-3" />
                      ) : (
                        <CalendarXIcon className="h-3 w-3" />
                      )}
                    </button>
                    {showNotificationDot && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white shadow-xs border border-white pointer-events-none">
                        !
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setSortMode((prev) => (prev === 'chrono' ? 'priority' : 'chrono'))}
                    className="p-1 rounded-lg border transition-colors flex items-center justify-center w-6 h-6 bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-blue-600 cursor-pointer"
                    title={sortMode === 'priority' ? 'Ordinato per Priorità' : 'Ordinato Cronologicamente'}
                    aria-label="Cambia ordinamento"
                  >
                    <SwitchIcon sortMode={sortMode} className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Contenitore Body con Ref di Misurazione Dinamica */}
              <div
                ref={tasksListRef}
                className="flex-1 min-h-0 flex flex-col justify-between overflow-hidden pt-1.5"
              >
                <div className="flex flex-col gap-1.5 overflow-hidden">
                  {visibleCompactTasks.map((task) => (
                    <div key={task.id} onClick={(e) => e.stopPropagation()} className="shrink-0">
                      <TaskItem
                        task={task}
                        onSelect={openTaskDetail}
                        onToggle={handleToggleTask}
                      />
                    </div>
                  ))}

                  {sortedTasks.length === 0 && (
                    <div className="h-full flex items-center justify-center py-2">
                      <EmptyState message="Nessuna task per questo giorno" />
                    </div>
                  )}
                </div>

                {/* Indicatore '...' Grande ed Evidente se ci sono più task */}
                {hasMoreTasks && (
                  <div className="shrink-0 h-7 flex items-center justify-center select-none pt-0.5">
                    <span className="text-xl font-black tracking-widest text-emerald-500 hover:text-emerald-600 leading-none">
                      •••
                    </span>
                  </div>
                )}
              </div>
            </div>

        </div>

        {/* --------------------------------------------------------------------- */}
        {/* PAGINA 2: TRACKER & MINDSET (Countdowns + Habits + Routine)           */}
        {/* --------------------------------------------------------------------- */}
        <div
          className={`absolute inset-0 w-full h-full flex flex-col gap-2.5 overflow-hidden transition-transform duration-300 ease-out ${
            activePageIndex === 1
              ? 'translate-x-0 pointer-events-auto'
              : 'translate-x-full pointer-events-none'
          }`}
        >
          {/* 1. COUNTDOWN HERO WIDGET */}
          <div className="shrink-0">
            <CountdownWidget
              countdowns={widgetCountdowns}
              onClick={() => countdownHubModal.open()}
            />
          </div>

          {/* 2. HABITS BAR (ABITUDINI VELOCI TOUCH - SENZA SFONDO BIANCO) */}
          <div className="p-1 shrink-0 flex items-center justify-center">
            <HabitsBar
              habits={mappedHabits}
              onToggleHabit={(id) => {
                const targetHabit = mappedHabits.find((h) => h.id === id);
                if (targetHabit) {
                  const delta = targetHabit.done ? -1 : 1;
                  updateHabitLog({ habitId: id, delta });
                }
              }}
              onAddHabitClick={() => habitFormModal.open()}
            />
          </div>

          {/* 3. ROUTINE COLUMN MOBILE */}
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <MobileRoutineColumn
              routines={mappedRoutines}
              onUpdateRoutine={(id, delta) => updateHabitCount({ habitId: id, delta })}
              onSelectRoutine={(routine) => openRoutineDetail(routine)}
              onExpandClick={() => setExpandedView('routines')}
            />
          </div>
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
      {/* 4. MODALI A TUTTO SCHERMO: EVENTI ESPANSI                                 */}
      {/* ========================================================================= */}
      {expandedView === 'events' && (
        <div className="absolute inset-0 z-40 bg-gray-50 flex flex-col p-3 rounded-2xl animate-fadeIn shadow-2xl border border-gray-200">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200 shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
                  Tutti gli Eventi del Giorno
                </h3>
                <p className="text-xs text-gray-500 font-medium">{formattedDateStr}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setExpandedView('none')}
              className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-200 hover:text-red-500 transition-colors cursor-pointer"
              title="Chiudi visualizzazione estesa"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-2.5 pt-3 pr-1">
            {mappedEvents.map((ev) => (
              <div
                key={ev.id}
                onClick={() => {
                  setExpandedView('none');
                  openEventDetail(ev);
                }}
                className="flex items-center gap-3 bg-white border border-gray-200 hover:border-blue-400 rounded-xl p-3 cursor-pointer shadow-xs active:scale-[0.99] transition-all"
              >
                <div className="w-14 flex flex-col items-center justify-center shrink-0 text-center leading-tight">
                  {ev.time ? (
                    <span className="text-xs font-black text-gray-800">{ev.time}</span>
                  ) : (
                    <span className="text-[11px] font-bold text-gray-400">Tutto il giorno</span>
                  )}
                  {ev.endTime && (
                    <>
                      <ArrowDownIcon className="h-3 w-3 text-gray-400 my-0.5" />
                      <span className="text-[11px] font-bold text-gray-500">{ev.endTime}</span>
                    </>
                  )}
                </div>

                <div
                  className="w-2 h-9 rounded-full shrink-0"
                  style={{
                    backgroundColor: ev.categoryColor?.startsWith('#')
                      ? ev.categoryColor
                      : '#3b82f6',
                  }}
                />

                <div className="flex-1 min-w-0">
                  <TruncatedTitle title={ev.title} />
                  {ev.location && (
                    <p className="text-[11px] text-gray-500 truncate mt-0.5">📍 {ev.location}</p>
                  )}
                </div>
              </div>
            ))}

            {mappedEvents.length === 0 && (
              <div className="h-full flex items-center justify-center py-8">
                <EmptyState message="Nessun evento in programma per questo giorno" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODALE A TUTTO SCHERMO: TASK ESPANSE                                   */}
      {/* ========================================================================= */}
      {expandedView === 'tasks' && (
        <div className="absolute inset-0 z-40 bg-gray-50 flex flex-col p-3 rounded-2xl animate-fadeIn shadow-2xl border border-gray-200">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200 shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600">
                <TaskListIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
                  Tutte le Task ({sortedTasks.length})
                </h3>
                <p className="text-xs text-gray-500 font-medium">
                  {showWithDeadline ? 'Con Scadenza' : 'Senza Scadenza'} •{' '}
                  {sortMode === 'priority' ? 'Per Priorità' : 'Cronologico'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex">
                <button
                  type="button"
                  onClick={() => setShowWithDeadline((prev) => !prev)}
                  className="p-1.5 rounded-lg border transition-colors flex items-center justify-center w-8 h-8 bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-blue-600 cursor-pointer"
                  title={showWithDeadline ? 'Mostra Senza Data' : 'Mostra Con Data'}
                >
                  {showWithDeadline ? (
                    <CalendarIcon className="h-4 w-4" />
                  ) : (
                    <CalendarXIcon className="h-4 w-4" />
                  )}
                </button>
                {showNotificationDot && (
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-xs border-2 border-white pointer-events-none">
                    !
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSortMode((prev) => (prev === 'chrono' ? 'priority' : 'chrono'))}
                className="p-1.5 rounded-lg border transition-colors flex items-center justify-center w-8 h-8 bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-blue-600 cursor-pointer"
                title={sortMode === 'priority' ? 'Ordinato per Priorità' : 'Ordinato Cronologicamente'}
              >
                <SwitchIcon sortMode={sortMode} className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setExpandedView('none')}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-200 hover:text-red-500 transition-colors cursor-pointer ml-1"
                title="Chiudi visualizzazione estesa"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-2.5 pt-3 pr-1">
            {sortedTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onSelect={(t) => {
                  setExpandedView('none');
                  openTaskDetail(t);
                }}
                onToggle={handleToggleTask}
              />
            ))}

            {sortedTasks.length === 0 && (
              <div className="h-full flex items-center justify-center py-8">
                <EmptyState message="Nessuna task in programma per questo giorno" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODALE A TUTTO SCHERMO: ROUTINE ESPANSE                                */}
      {/* ========================================================================= */}
      {expandedView === 'routines' && (
        <div className="absolute inset-0 z-40 bg-gray-50 flex flex-col p-3 rounded-2xl animate-fadeIn shadow-2xl border border-gray-200">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200 shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-100 text-purple-600">
                <RepeatIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
                  Tutte le Routine ({mappedRoutines.length})
                </h3>
                <p className="text-xs text-gray-500 font-medium">{formattedDateStr}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setExpandedView('none')}
              className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-200 hover:text-red-500 transition-colors cursor-pointer"
              title="Chiudi visualizzazione estesa"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-2.5 pt-3 pr-1">
            {mappedRoutines.map((routine) => {
              const isCompleted = routine.currentCompletions >= routine.targetCompletions;
              const isSingle = routine.targetCompletions === 1;

              return (
                <div
                  key={routine.id}
                  onClick={() => {
                    setExpandedView('none');
                    openRoutineDetail(routine);
                  }}
                  className={`relative h-20 w-full rounded-2xl overflow-hidden shadow-xs border border-gray-200 hover:border-purple-400 cursor-pointer active:scale-[0.99] transition-all flex items-center justify-between px-4 ${
                    isCompleted ? 'opacity-75 grayscale-[25%]' : ''
                  }`}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${routine.imageUrl || DEFAULT_COVER_IMAGE})`,
                      backgroundPosition: routine.immaginePosizione || 'center',
                    }}
                  />
                  <div
                    className={`absolute inset-0 transition-colors ${
                      isCompleted
                        ? 'bg-black/65'
                        : 'bg-gradient-to-r from-black/85 via-black/55 to-black/40'
                    }`}
                  />

                  <div className="relative z-10 flex-1 min-w-0 pr-3 pointer-events-none">
                    <h4
                      className={`text-sm font-extrabold uppercase tracking-wide truncate transition-colors drop-shadow-sm ${
                        isCompleted ? 'text-gray-300 line-through' : 'text-white'
                      }`}
                    >
                      {routine.title}
                    </h4>
                  </div>

                  <div
                    className="relative z-10 flex items-center gap-1.5 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {isSingle ? (
                      <button
                        type="button"
                        onClick={() =>
                          updateHabitCount({
                            habitId: routine.id,
                            delta: isCompleted ? -1 : 1,
                          })
                        }
                        className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all shadow-xs cursor-pointer active:scale-90 ${
                          isCompleted
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-white/60 bg-white/20 text-white hover:bg-white/40'
                        }`}
                        title={isCompleted ? 'Annulla completamento' : 'Segna come completata'}
                      >
                        {isCompleted && <CheckIcon className="w-4 h-4 text-white" />}
                      </button>
                    ) : (
                      <div className="flex items-center bg-black/45 backdrop-blur-xs rounded-xl border border-white/20 overflow-hidden shadow-xs">
                        <button
                          type="button"
                          onClick={() => updateHabitCount({ habitId: routine.id, delta: -1 })}
                          disabled={routine.currentCompletions <= 0}
                          className="px-3 py-1.5 text-sm font-black text-white hover:bg-white/20 active:bg-white/30 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                          title="Diminuisci conteggio"
                        >
                          -
                        </button>
                        <span className="px-2 py-1.5 text-xs font-black text-white min-w-[2.8rem] text-center border-x border-white/10">
                          {routine.currentCompletions}/{routine.targetCompletions}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateHabitCount({ habitId: routine.id, delta: 1 })}
                          disabled={routine.currentCompletions >= routine.targetCompletions}
                          className="px-3 py-1.5 text-sm font-black text-white hover:bg-white/20 active:bg-white/30 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                          title="Aumenta conteggio"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {mappedRoutines.length === 0 && (
              <div className="h-full flex items-center justify-center py-8">
                <EmptyState message="Nessuna routine in programma per questo giorno" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. MODALI MOBILE COUNTDOWN & ABITUDINI                                    */}
      {/* ========================================================================= */}
      <MobileCountdownHubModal
        isOpen={countdownHubModal.isOpen}
        onClose={countdownHubModal.close}
        countdowns={mappedCountdowns}
        onSelectCountdown={(cd) => countdownDetailModal.open(cd)}
        onNewClick={() => countdownFormModal.open(null)}
      />

      <MobileCountdownDetailModal
        isOpen={countdownDetailModal.isOpen}
        onClose={countdownDetailModal.close}
        countdown={countdownDetailModal.data}
        onEditClick={() => {
          countdownFormModal.open(countdownDetailModal.data);
          countdownDetailModal.close();
        }}
        onDeleteClick={(id) => {
          deleteCountdown(id);
          countdownDetailModal.close();
        }}
        onRenewClick={(renewedCountdown) => {
          saveCountdown(renewedCountdown);
          countdownDetailModal.open(renewedCountdown);
        }}
      />

      <MobileCountdownNewModal
        isOpen={countdownFormModal.isOpen}
        onClose={countdownFormModal.close}
        countdownToEdit={countdownFormModal.data}
        onSave={(newCd: CountdownSavePayload) => {
          saveCountdown(newCd);
          countdownFormModal.close();
        }}
      />

      <HabitNewModal
        isOpen={habitFormModal.isOpen}
        onClose={habitFormModal.close}
        onSave={(newHabit) => {
          saveHabit({
            data: {
              titolo: newHabit.titolo,
              tipo: 'H',
              immagine_url: newHabit.immagine_url,
              rrule: 'FREQ=DAILY;INTERVAL=1',
              data_inizio: getLocalTodayStr(),
              target_completamenti: 1,
            },
          });
          habitFormModal.close();
        }}
      />

      {/* ========================================================================= */}
      {/* 7. NOTE DEL GIORNO (BOTTOM SHEET)                                         */}
      {/* ========================================================================= */}
      <MobileNotesBottomSheet
        isOpen={isNotesOpen}
        notes={mappedNotes}
        editingNoteId={editingNoteId}
        onClose={() => setIsNotesOpen(false)}
        onAddNote={handleAddNote}
        onAutoSaveNote={handleAutoSaveNote}
        onDeleteNote={handleDeleteNote}
        clearEditingNoteId={() => setEditingNoteId(null)}
      />
    </div>
  );
};

export default MobileDayView;
