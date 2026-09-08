// src/mobile/views/MobileHomeView.tsx
import React, { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiService';

// Hooks
import { useAgendaHome } from '@/hooks/useAgendaHome';
import { useTaskMutations } from '@/hooks/mutations/useTaskMutations';
import { useTaskModals } from '@/context/TaskModalContext';
import { useEventModals } from '@/context/EventModalContext';

// Components
import MobileYearProgress from '../components/MobileYearProgress';
import MobileQuoteCard from '../components/MobileQuoteCard';
import { TaskItem } from '@/components/shared/tasks/TaskItem';
import { TruncatedTitle } from '@/components/shared/utils/TruncatedTitle';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import {
  ArrowDownIcon,
  CalendarIcon,
  CalendarXIcon,
  TaskListIcon,
  SwitchIcon,
  CloseIcon,
  SyncIcon,
} from '@/components/shared/utils/Icons';
import PageLoadingState from '@/components/shared/feedback/PageLoadingState';
import PageErrorState from '@/components/shared/feedback/PageErrorState';
import { LOADING_MESSAGES, ERROR_MESSAGES } from '@/data/loadingMessages';

// Utilities & Types
import { buildTaskTreeForHome, filterAndSortTree, filterTreeByDeadlineMode } from '@/utils/taskUtils';
import { calculateYearProgress, formatDateString, getAgendaDateLabels } from '@/utils/dateUtils';
import { mapDbEventsToCalendarEvents } from '@/utils/eventUtils';
import type { CalendarEvent, UITask, TaskSummary } from '@/types';

export const MobileHomeView: React.FC = () => {
  const queryClient = useQueryClient();
  const [currentMonth] = useState<Date>(() => new Date());
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => formatDateString(today), [today]);
  const { formattedDate } = getAgendaDateLabels(today);

  // Stato Filtro e Ordinamento Task (stesse funzioni di TaskColumn.tsx)
  const [sortMode, setSortMode] = useState<'chrono' | 'priority'>('chrono');
  const [showWithDeadline, setShowWithDeadline] = useState<boolean>(true);

  // Stato Finestra a Tutto Schermo per Eventi o Task ('none' | 'events' | 'tasks')
  const [expandedView, setExpandedView] = useState<'none' | 'events' | 'tasks'>('none');

  // Stato Sincronizzazione Google Calendar
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Data fetching
  const { events: rawEvents, tasks: rawTasks, isLoading, isError } = useAgendaHome(currentMonth);
  const { toggleTask } = useTaskMutations(['tasks']);

  // Modals Context
  const { openTaskDetail } = useTaskModals();
  const { openEventDetail } = useEventModals();

  // Calcolo Progresso Anno
  const yearProgress: number = useMemo(() => calculateYearProgress(), []);

  // Costruzione albero Task base (UITask)
  const rawTree: UITask[] = useMemo(() => {
    return buildTaskTreeForHome(rawTasks ?? [], todayStr);
  }, [rawTasks, todayStr]);

  // Notifica pallino rosso per Task senza data
  const showNotificationDot = useMemo(() => {
    return showWithDeadline
      ? rawTree.some((t) => !t.deadline && !t.done)
      : rawTree.some((t) => !!t.deadline && !t.done);
  }, [rawTree, showWithDeadline]);

  // Albero Task filtrato per modalità scadenza e ordinamento
  const displayedTaskTree: UITask[] = useMemo(() => {
    const deadlineFiltered = filterTreeByDeadlineMode(rawTree, showWithDeadline);
    return filterAndSortTree(deadlineFiltered, false, sortMode, todayStr);
  }, [rawTree, showWithDeadline, sortMode, todayStr]);

  // Mappatura eventi del giorno corrente
  const todayEvents: CalendarEvent[] = useMemo(() => {
    const all = mapDbEventsToCalendarEvents(rawEvents ?? []);
    return all.filter((e) => {
      if (!e.dateStr) return true;
      const fine = e.endDateStr || e.dateStr;
      return todayStr >= e.dateStr && todayStr <= fine;
    });
  }, [rawEvents, todayStr]);

  // Toggle stato completamento task
  const handleToggleTask = (id: number, currentStatus: boolean, e?: React.MouseEvent) => {
    e?.stopPropagation();
    toggleTask({ id, isDone: !currentStatus });
  };

  // Sincronizzazione Google Calendar
  const handleSyncGoogle = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await api.post<{ message: string }>('/google-calendar/sync');
      if (res?.message) {
        setSyncFeedback(res.message);
        setTimeout(() => setSyncFeedback(null), 3500);
      }
      await queryClient.invalidateQueries({ queryKey: ['events'] });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Errore durante la sincronizzazione';
      setSyncFeedback(msg);
      setTimeout(() => setSyncFeedback(null), 3500);
    } finally {
      setIsSyncing(false);
    }
  };

  // Schermata di caricamento iniziale
  const isInitialLoad: boolean =
    isLoading &&
    (!rawTasks || rawTasks.length === 0) &&
    (!rawEvents || rawEvents.length === 0);

  if (isInitialLoad) {
    return <PageLoadingState messages={LOADING_MESSAGES.home} />;
  }

  // Schermata di errore
  if (isError) {
    return (
      <PageErrorState
        message={ERROR_MESSAGES.home}
        onRetry={() => queryClient.refetchQueries()}
      />
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#fafafa] p-3 gap-3 relative select-none">
      {/* ========================================================================= */}
      {/* 1. SEZIONE SUPERIORE: PROGRESS BAR DELL'ANNO & CITAZIONE DEL GIORNO      */}
      {/* ========================================================================= */}
      <div className="shrink-0 flex flex-col gap-2">
        {/* Barra Verde con Percentuale Centrata Sovrapposta */}
        <MobileYearProgress progress={yearProgress} />

        {/* Citazione del Giorno integrata nello sfondo (tocca per espandere se lunga) */}
        <MobileQuoteCard />
      </div>

      {/* ========================================================================= */}
      {/* 2. CARD EVENTI DI OGGI (Tocca l'header per espandere a tutta pagina) */}
      {/* ========================================================================= */}
      <div className="flex-1 min-h-0 flex flex-col bg-white rounded-2xl border border-gray-200/90 shadow-xs p-3 overflow-hidden">
        {/* Header pulito e saldo: tocca l'area sinistra per espandere, tasto sync a destra */}
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 shrink-0 select-none">
          <div
            onClick={() => setExpandedView('events')}
            className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
            title="Tocca per visualizzare tutti gli eventi a schermo intero"
          >
            <div className="p-1 rounded-lg bg-blue-50 text-blue-600 shrink-0">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider truncate">
              Eventi di Oggi
            </h3>
            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full shrink-0">
              {todayEvents.length}
            </span>
          </div>

          {/* Tasto Sincronizzazione Google Calendar (stesso stile del desktop) */}
          <div className="flex items-center gap-1.5 relative shrink-0">
            {syncFeedback && (
              <div className="absolute right-0 bottom-full mb-1.5 z-50 whitespace-nowrap bg-slate-900 text-white text-[10px] font-semibold py-1 px-2.5 rounded-xl shadow-lg border border-slate-700 animate-fadeIn pointer-events-none">
                {syncFeedback}
              </div>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSyncGoogle();
              }}
              disabled={isSyncing}
              title="Sincronizza con Google Calendar"
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors border border-gray-200 shadow-xs bg-white flex items-center justify-center disabled:opacity-50 cursor-pointer"
            >
              <SyncIcon className={`w-3.5 h-3.5 text-gray-500 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Lista Eventi: tocca un evento per aprire il modale di dettaglio */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-2 pt-2 pr-0.5">
          {todayEvents.map((ev) => (
            <div
              key={ev.id}
              onClick={() => openEventDetail(ev)}
              className="flex items-center gap-2.5 bg-gray-50/80 hover:bg-blue-50/40 border border-gray-200/70 hover:border-blue-300 rounded-xl p-2.5 cursor-pointer active:scale-[0.99] transition-all shadow-2xs"
            >
              {/* Orario evento */}
              <div className="w-11 flex flex-col items-center justify-center shrink-0 text-center leading-tight">
                {ev.time && (
                  <span className="text-[11px] font-black text-gray-700">{ev.time}</span>
                )}
                {ev.endTime && (
                  <>
                    <ArrowDownIcon className="h-2.5 w-2.5 text-gray-400 my-0.2" />
                    <span className="text-[10px] font-semibold text-gray-500">{ev.endTime}</span>
                  </>
                )}
              </div>

              {/* Indicatore Colore Categoria */}
              <div
                className="w-1.5 h-7 rounded-full shrink-0"
                style={{
                  backgroundColor: ev.categoryColor?.startsWith('#')
                    ? ev.categoryColor
                    : '#3b82f6',
                }}
              />

              {/* Titolo */}
              <div className="flex-1 min-w-0">
                <TruncatedTitle title={ev.title} />
                {ev.location && (
                  <p className="text-[10px] text-gray-400 truncate mt-0.5">📍 {ev.location}</p>
                )}
              </div>
            </div>
          ))}

          {todayEvents.length === 0 && (
            <div className="h-full flex items-center justify-center py-6">
              <EmptyState message="Nessun evento oggi" />
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. CARD ATTIVITÀ DI OGGI (Tocca l'header per espandere a tutta pagina)    */}
      {/* ========================================================================= */}
      <div className="flex-1 min-h-0 flex flex-col bg-white rounded-2xl border border-gray-200/90 shadow-xs p-3 overflow-hidden">
        {/* Header con pulsanti per filtrare e ordinare */}
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 shrink-0 select-none">
          <div
            onClick={() => setExpandedView('tasks')}
            className="flex items-center gap-2 cursor-pointer flex-1"
            title="Tocca per visualizzare tutte le task a schermo intero"
          >
            <div className="p-1 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
              <TaskListIcon className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
              Task
            </h3>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {displayedTaskTree.length}
            </span>
          </div>

          {/* Azioni Filtro / Ordinamento (senza jump o layout shift) */}
          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            {/* Tasto 1: Toggle Filtro Scadenza */}
            <button
              type="button"
              onClick={() => setShowWithDeadline((prev) => !prev)}
              className={`relative p-1.5 rounded-lg border transition-all cursor-pointer ${
                showWithDeadline
                  ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-2xs'
                  : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
              }`}
              title={
                showWithDeadline
                  ? 'Mostra task senza data'
                  : 'Mostra task con data di scadenza'
              }
            >
              <CalendarXIcon className="w-3.5 h-3.5" />
              {showNotificationDot && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
              )}
            </button>

            {/* Tasto 2: Toggle Ordinamento Priorità / Cronologico */}
            <button
              type="button"
              onClick={() =>
                setSortMode((prev) => (prev === 'chrono' ? 'priority' : 'chrono'))
              }
              className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                sortMode === 'priority'
                  ? 'bg-orange-50 border-orange-200 text-orange-600 shadow-2xs'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
              title={`Ordinamento attuale: ${
                sortMode === 'priority' ? 'Priorità' : 'Data di scadenza'
              }`}
            >
              <SwitchIcon className="w-3 h-3 rotate-90" sortMode={sortMode} />
              <span>{sortMode === 'priority' ? 'Priorità' : 'Data'}</span>
            </button>
          </div>
        </div>

        {/* Lista Task: tocca un task per aprire il modale di dettaglio */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-1 pt-1.5 pr-0.5">
          {displayedTaskTree.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={handleToggleTask}
              onSelect={openTaskDetail}
            />
          ))}

          {displayedTaskTree.length === 0 && (
            <div className="h-full flex items-center justify-center py-6">
              <EmptyState message="Nessuna task trovata" />
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MODALE A TUTTO SCHERMO: EVENTI ESPANSI                                 */}
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
                  Tutti gli Eventi di Oggi
                </h3>
                <p className="text-xs text-gray-500 font-medium">{formattedDate}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="relative">
                {syncFeedback && (
                  <div className="absolute right-0 bottom-full mb-1.5 z-50 whitespace-nowrap bg-slate-900 text-white text-[10px] font-semibold py-1 px-2.5 rounded-xl shadow-lg border border-slate-700 animate-fadeIn pointer-events-none">
                    {syncFeedback}
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleSyncGoogle}
                  disabled={isSyncing}
                  title="Sincronizza con Google Calendar"
                  className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors border border-gray-200 shadow-xs bg-white flex items-center justify-center disabled:opacity-50 cursor-pointer"
                >
                  <SyncIcon className={`w-4 h-4 text-gray-500 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setExpandedView('none')}
                className="p-2 rounded-xl bg-gray-200/80 text-gray-700 hover:bg-gray-300 transition-colors cursor-pointer"
                title="Chiudi visualizzazione estesa"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-2.5 pt-3 pr-1">
            {todayEvents.map((ev) => (
              <div
                key={ev.id}
                onClick={() => {
                  setExpandedView('none');
                  openEventDetail(ev);
                }}
                className="flex items-center gap-3 bg-white border border-gray-200 hover:border-blue-400 rounded-xl p-3 cursor-pointer shadow-xs active:scale-[0.99] transition-all"
              >
                <div className="w-14 flex flex-col items-center justify-center shrink-0 text-center leading-tight">
                  {ev.time && (
                    <span className="text-xs font-black text-gray-800">{ev.time}</span>
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

            {todayEvents.length === 0 && (
              <div className="h-full flex items-center justify-center py-8">
                <EmptyState message="Nessun evento in programma" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODALE A TUTTO SCHERMO: TASK ESPANSE */}
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
                  Tutte le Task
                </h3>
                <p className="text-xs text-gray-500 font-medium">{formattedDate}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setExpandedView('none')}
              className="p-2 rounded-xl bg-gray-200/80 text-gray-700 hover:bg-gray-300 transition-colors cursor-pointer"
              title="Chiudi visualizzazione estesa"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-1.5 pt-3 pr-1">
            {displayedTaskTree.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={handleToggleTask}
                onSelect={(t: TaskSummary) => {
                  setExpandedView('none');
                  openTaskDetail(t);
                }}
              />
            ))}

            {displayedTaskTree.length === 0 && (
              <div className="h-full flex items-center justify-center py-8">
                <EmptyState message="Nessuna task presente" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileHomeView;
