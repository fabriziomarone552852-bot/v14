// src/views/HomePage.tsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// Hooks
import { useAgendaHome } from '@/hooks/useAgendaHome';
import { useTaskMutations } from '@/hooks/mutations/useTaskMutations';
import { useTaskModals } from '@/context/TaskModalContext';
import { useEventModals } from '@/context/EventModalContext';
import { useCategories } from '@/hooks/useCategories';

// Componenti visivi
import CalendarColumn from '@/components/dashboard/CalendarColumn';
import TaskColumn from '@/components/shared/tasks/TaskColumn';
import EventsColumn from '@/components/shared/events/EventsColumn';
import { YearProgressWidget } from '@/components/dashboard/YearProgressWidget';
import { DailyQuoteWidget } from '@/components/dashboard/DailyQuoteWidget';
import { LoadingIcon } from '@/components/shared/utils/Icons';

// Utilities
import { buildTaskTreeForHome, filterAndSortTree } from '@/utils/taskUtils';
import { calculateYearProgress, formatDateString } from '@/utils/dateUtils';
import { mapDbEventsToCalendarEvents } from '@/utils/eventUtils';

// Tipi rigorosi (Zero any)
import type { CalendarEvent, UITask } from '@/types';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const today = useMemo(() => new Date(), []);

  const { data: dbCategories = [] } = useCategories();
  const { events: eventiDalServer, tasks, isLoading, isFetching, isError } = useAgendaHome(currentMonth);
  const { toggleTask } = useTaskMutations(['tasks']);

  const { openTaskDetail, openTaskForm } = useTaskModals();
  
  // 🪄 MAGIA: Teniamo solo i comandi per aprire i modali, il resto lo fa il Context!
  const { openEventDetail, openEventForm } = useEventModals();

  // --- FILTRAGGIO DATI (Frontend) ---
  
  const yearProgress: number = useMemo(() => calculateYearProgress(), []);
  
  const taskTree: UITask[] = useMemo(() => {
    const todayStr = formatDateString(today);
    const rawTree = buildTaskTreeForHome(tasks ?? [], todayStr);
    return filterAndSortTree(rawTree, false, 'priority', todayStr);
  }, [tasks, today]);
  
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    return mapDbEventsToCalendarEvents(eventiDalServer ?? []);
  }, [eventiDalServer]);

  // --- HANDLERS ---

  const handleGoToDay = (dateStr: string): void => {
    navigate('/giorno', { state: { selectedDate: dateStr } }); 
  };

  const handleToggleTask = (id: number, currentStatus: boolean, e?: React.MouseEvent): void => {
    e?.stopPropagation();
    toggleTask({ id, isDone: !currentStatus });
  };

  const isInitialLoad: boolean = isLoading && (!tasks || tasks.length === 0) && (!eventiDalServer || eventiDalServer.length === 0);

  if (isInitialLoad) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingIcon className="w-6 h-6 text-gray-500 animate-spin" />
        <span className="ml-2">Caricamento in corso...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col justify-center items-center h-full text-red-500">
        <span className="text-4xl mb-4">⚠️</span>
        <h2 className="text-xl font-bold">Ops! Qualcosa è andato storto.</h2>
        <p className="text-gray-500">Impossibile caricare i dati dell'agenda. Riprova più tardi.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-w-[1600px] mx-auto min-h-full xl:h-full xl:overflow-hidden relative">
      {/* Barra Progresso Anno (Dimensione fissa shrink-0) */}
      <YearProgressWidget progress={yearProgress} />

      {/* Griglia Centrale a 3 Colonne (Occupa tutto lo spazio verticale residuo) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        <div className="xl:col-span-3 flex flex-col h-full min-h-0">
          <TaskColumn 
            tasks={taskTree} 
            onToggleTask={handleToggleTask} 
            onSelectTask={openTaskDetail} 
            onAddTaskClick={() => openTaskForm()} 
          />
        </div>

        <div className="xl:col-span-6 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 p-5 h-full min-h-0 overflow-visible relative z-50">
          {isFetching && !isInitialLoad && (
            <div className="absolute inset-0 z-50 bg-white/50 backdrop-blur-[1px] flex justify-center items-center rounded-xl">
               <LoadingIcon className="w-6 h-6 text-gray-500 animate-spin" />
               <span className="text-sm font-bold text-gray-500 animate-pulse ml-2">Aggiornamento...</span>
            </div>
          )}
          
          <CalendarColumn 
            hideHeader={false}
            events={calendarEvents} 
            tasks={tasks ?? []}
            allCategories={dbCategories} 
            onMonthChange={setCurrentMonth}
            onSelectEvent={(event: CalendarEvent) => openEventDetail(event)} 
            onDayClick={handleGoToDay} 
            onAddEventClick={(dataCliccata?: string) => {
              openEventForm(null, dataCliccata ?? null); 
            }} 
          />
        </div>

        <div className="xl:col-span-3 flex flex-col h-full min-h-0">
          <EventsColumn 
            events={calendarEvents} 
            selectedDate={today} 
            onSelectEvent={(event: CalendarEvent) => openEventDetail(event)} 
          />
        </div>
      </div>

      {/* Barra Citazioni Giornaliere (Altezza fissa bloccata) */}
      <DailyQuoteWidget />
    </div>
  );
};

export default HomePage;