import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDay } from '@/context/DayContext';
import { useYearPageLogic } from '@/hooks/uiYear/useYearPageLogic';
import { SharedAgendaHeader } from '@/components/shared/SharedAgendaHeader';
import { GoalsAndPrioritiesPanel } from '@/components/shared/GoalsAndPrioritiesPanel';
import YearCalendar from '@/components/year/YearCalendar';
import YearResolutionsColumn from '@/components/year/YearResolutionsColumn';
import MiniBingoCard from '@/components/year/MiniBingoCard';
import BingoModal from '@/components/year/BingoModal';
import { YearReviewModal } from '@/components/year/review/YearReviewModal';

const YearPage: React.FC = () => {
  const navigate = useNavigate();
  const { changeDate } = useDay();
  const { state, handlers, nav, apiData, highlights, bingo, review } = useYearPageLogic();
  const [isBingoModalOpen, setIsBingoModalOpen] = useState(false);

  const handleMonthClick = (yr: number, monthIndex: number) => {
    const d = new Date(yr, monthIndex, 1);
    changeDate(d);
    const monthStr = String(monthIndex + 1).padStart(2, '0');
    navigate(`/mese?date=${yr}-${monthStr}-01`);
  };

  const handleDayClick = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    changeDate(new Date(y, m - 1, d));
    navigate(`/giorno?date=${dateStr}`);
  };

  // Caricamento iniziale e gestione errori uniformata a MonthPage, WeekPage e DayPage
  if (state.isLoading) {
    return (
      <div className="flex h-full items-center justify-center font-bold text-gray-500 animate-pulse">
        Caricamento anno...
      </div>
    );
  }

  if (state.isError) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-red-500">
        <h2 className="text-xl font-bold mb-2">Ops! Qualcosa è andato storto.</h2>
        <p>Impossibile caricare i dati dell'anno. Riprova più tardi.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium"
        >
          Ricarica Pagina
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-w-[1600px] mx-auto min-h-full xl:h-full xl:overflow-hidden relative">
      
      {/* HEADER + OBIETTIVO */}
      <div className="flex flex-col xl:flex-row gap-6 shrink-0 items-stretch justify-between w-full relative z-50">
        <SharedAgendaHeader
          title={String(state.selectedYear)}
          subtitle=""
          currentDate={new Date(state.selectedYear, 0, 1)}
          isToday={nav.isCurrentYear} 
          onPrev={handlers.handlePrevYear}
          onNext={handlers.handleNextYear}
          onResetToday={handlers.handleResetCurrentYear}
          onChangeDate={(newDate) => handlers.handleSelectYear(newDate.getFullYear())} 
          viewMode="year"
          reviewStatus={review.reviewStatus}
          onOpenReview={review.openReview}
        />
        
        <div className="flex-1 max-w-[1200px]">
          <GoalsAndPrioritiesPanel
            goalTitle="Obiettivo dell'Anno"
            placeholder="Qual è il tuo obiettivo per quest'anno?"
            prioritiesTitle="Top 3 Priorità Annuali"
            dateKey={String(state.selectedYear)}
            goalEntry={apiData.entries.obiettivo ? {
              id: apiData.entries.obiettivo.id,
              testo: apiData.entries.obiettivo.yearly_field ?? null,
            } : null}
            prioritiesEntries={apiData.entries.priorita.map(p => p ? {
              id: p.id,
              testo: p.yearly_field ?? null,
            } : null)}
            onSaveGoal={apiData.entries.handleSaveObiettivo}
            onSavePriority={(id, text) => {
              const idx = apiData.entries.priorita.findIndex(p => p?.id === id);
              apiData.entries.handleSavePriority(idx >= 0 ? idx : 0, id, text);
            }}
          />
        </div>
      </div>

      {/* DUE COLONNE PRINCIPALI:
          SINISTRA: Mini Bingo centrato in alto, Buoni Propositi sotto (colonna ridotta)
          DESTRA: Calendario dell'anno in grande e fixato alla pagina
      */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* SPAZIO DI SINISTRA */}
        <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-4 h-full min-h-0">
          {/* Mini preview del Bingo CENTRATO */}
          <div className="flex justify-center w-full shrink-0">
            <MiniBingoCard
              cells={bingo.cells}
              onOpenModal={() => setIsBingoModalOpen(true)}
            />
          </div>

          {/* Sotto il bingo: Solo i Buoni Propositi */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <YearResolutionsColumn
              propositi={apiData.entries.propositi}
              onAdd={apiData.entries.handleAddProposito}
              onUpdate={apiData.entries.handleUpdateProposito}
              onDelete={apiData.entries.handleDeleteProposito}
            />
          </div>
        </div>

        {/* SPAZIO DI DESTRA: Calendario dell'anno espanso */}
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col h-full min-h-0">
          <YearCalendar
            year={state.selectedYear}
            events={highlights.events}
            tasks={highlights.tasks}
            taskDays={highlights.taskDays}
            eventDays={highlights.eventDays}
            highlightedDays={highlights.highlightedDays}
            onDayClick={handleDayClick}
            onMonthClick={handleMonthClick}
          />
        </div>
      </div>

      {/* MODAL BINGO CARD INTERATTIVA */}
      <BingoModal
        isOpen={isBingoModalOpen}
        onClose={() => setIsBingoModalOpen(false)}
        cells={bingo.cells}
        onCreateCell={bingo.handleCreateCell}
        onUpdateText={bingo.handleUpdateText}
        onToggleDone={bingo.handleToggleDone}
        onDeleteCell={bingo.handleDeleteCell}
      />

      {/* MODAL REVIEW ANNO */}
      <YearReviewModal
        isOpen={review.isOpen}
        onClose={review.closeReview}
        year={state.selectedYear}
        reviewData={review.reviewData as any}
        activeTab={review.activeTab}
        onSetTab={review.setActiveTab}
        moodsUI={apiData.entries.moodsUI}
        spheresUI={apiData.entries.spheresUI}
        onUpdateMood={apiData.entries.handleUpdateMood}
        onUpdateSphere={apiData.entries.handleUpdateSphere}
        onSaveAnswer={apiData.entries.handleSaveAnswer}
        tasksCompleted={0}
        tasksTotal={0}
        tasksByMonth={{}}
        tasksByWeekday={{}}
        habits={[]}
      />
    </div>
  );
};

export default YearPage;
