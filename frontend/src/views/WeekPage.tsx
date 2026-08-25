// frontend/src/views/WeekPage.tsx
import React from 'react';
import { useQueryClient } from '@tanstack/react-query';

// --- IMPORT COMPONENTI ---
import { GoalsAndPrioritiesPanel } from '@/components/shared/GoalsAndPrioritiesPanel';
import CalendarColumn from '@/components/dashboard/CalendarColumn';
import NotesSidebar from '@/components/day/NotesSidebar';
import { SharedAgendaHeader } from '@/components/shared/SharedAgendaHeader';
import MoodEventsBoard from '@/components/weekmonth/MoodEventsBoard';

// --- LOGICA E HOOKS ---
import { useWeekPageLogic } from '@/hooks/uiWeek/useWeekPageLogic';
import { useTaskModals } from '@/context/TaskModalContext';
import { useEventModals } from '@/context/EventModalContext';

import PageLoadingState from '@/components/shared/feedback/PageLoadingState';
import PageErrorState from '@/components/shared/feedback/PageErrorState';
import { LOADING_MESSAGES, ERROR_MESSAGES } from '@/data/loadingMessages';

const WeekPage: React.FC = () => {
  // Consumiamo lo stato centralizzato e tipizzato dal nostro custom hook esterno
  const { state, data, moodBoard, handlers, goals } = useWeekPageLogic();
  const queryClient = useQueryClient();
  const { openTaskForm } = useTaskModals();
  const { openEventForm } = useEventModals();

  if (state.isLoading && !state.weekData) {
    return <PageLoadingState messages={LOADING_MESSAGES.week} />;
  }

  if (state.isError) {
    return <PageErrorState message={ERROR_MESSAGES.week} onRetry={() => queryClient.refetchQueries()} />;
  }

  return (
    <div className="flex flex-col gap-4 max-w-[1600px] mx-auto min-h-full xl:h-full xl:overflow-hidden relative">
      
      {/* 1. SEZIONE SUPERIORE (HEADER E PRIORITÀ) */}
      <div className="flex flex-col xl:flex-row gap-6 shrink-0 items-stretch">
        <SharedAgendaHeader 
          title={`SETT. ${state.weekNumber}`} 
          subtitle={`${state.monday.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })} - ${state.sunday.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })}`} 
          currentDate={state.targetDate} 
          isToday={state.isCurrentWeek}
          onPrev={handlers.handlePrevWeek} 
          onNext={handlers.handleNextWeek} 
          onResetToday={handlers.handleResetCurrentWeek} 
          onChangeDate={state.setTargetDate} 
          viewMode="week"
        />

        <GoalsAndPrioritiesPanel
          goalTitle="Obiettivo della Settimana"
          placeholder="Qual è il tuo obiettivo per la settimana?"
          prioritiesTitle="Top 3 Priorità Settimanali"
          dateKey={state.mondayStr}
          goalEntry={goals.goalEntry}
          prioritiesEntries={goals.prioritiesEntries}
          onSaveGoal={goals.handleSaveGoal}
          onSavePriority={goals.handleSavePriority}
        />
      </div>

      {/* 2. AREA GRIGLIA CALENDARIO GENERALE */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        <div className="xl:col-span-12 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 p-5 h-full min-h-0 w-full min-w-0 overflow-hidden relative">
           <CalendarColumn 
             events={data.mappedEvents} 
             tasks={data.filteredTasks}
             hideHeader={true}        
             forceView="Settimana"   
             targetDate={state.targetDate} 
             variant="detailed"    
             onDayClick={handlers.handleGoToDay}
             onToggleTask={handlers.handleToggleTaskFromGrid}
             onSelectEvent={handlers.handleSelectEvent}
             onSelectTask={handlers.handleSelectTask}
             onAddEventClick={(dateStr) => openEventForm(null, dateStr ?? null)}
             onAddTaskClick={(dateStr) => openTaskForm(null, dateStr ?? null)}
           />
        </div>
      </div>
      
      {/* 3. MONITORAGGIO EVENTI EMOTIVI / MOOD */}
      <MoodEventsBoard 
        positiveEvents={moodBoard.positiveEvents}
        negativeEvents={moodBoard.negativeEvents}
        onAddMoodEvent={moodBoard.addMood}      
        onUpdateMoodEvent={moodBoard.updateMood} 
        onDeleteMoodEvent={moodBoard.deleteMood}  
      />

      {/* 4. CASSETTO RETRATTILE DELLE NOTE */}
      <NotesSidebar 
        isOpen={state.isNotesOpen} 
        notes={data.mappedNotes} 
        editingNoteId={state.editingNoteId}
        onOpen={() => state.setIsNotesOpen(true)} 
        onClose={() => state.setIsNotesOpen(false)}
        onAddNote={handlers.handleAddNote} 
        onAutoSaveNote={handlers.handleAutoSaveNote}
        onDeleteNote={handlers.handleDeleteNote}
        clearEditingNoteId={() => state.setEditingNoteId(null)}
      />

    </div>
  );
};

export default WeekPage;