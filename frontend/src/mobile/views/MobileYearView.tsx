// src/mobile/views/MobileYearView.tsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

// Contesti & Hooks Centralizzati
import { useDay } from '@/context/DayContext';
import { useYearPageLogic } from '@/hooks/uiYear/useYearPageLogic';

// Componenti Mobile Standardizzati
import MobileAgendaPeriodHeader from '../components/MobileAgendaPeriodHeader';
import MobileGoalsAndPrioritiesChips from '../components/MobileGoalsAndPrioritiesChips';
import MobileYearCalendar from '../components/MobileYearCalendar';
import MobileYearResolutionsColumn from '../components/MobileYearResolutionsColumn';
import MiniBingoCard from '@/components/year/MiniBingoCard';
import MobileBingoModal from '../components/modals/MobileBingoModal';
import MobileYearReviewModal from '../components/modals/MobileYearReviewModal';

// Feedback & Loading
import PageLoadingState from '@/components/shared/feedback/PageLoadingState';
import PageErrorState from '@/components/shared/feedback/PageErrorState';
import { LOADING_MESSAGES, ERROR_MESSAGES } from '@/data/loadingMessages';

export const MobileYearView: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { changeDate } = useDay();
  const { state, handlers, nav, apiData, highlights, bingo, review } = useYearPageLogic();

  // 1. STATO SLIDING & GESTURE TOUCH (0 = Calendario 12 Mesi, 1 = Bingo & Propositi)
  const [activePageIndex, setActivePageIndex] = useState<0 | 1>(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // 2. STATO MODALE BINGO
  const [isBingoModalOpen, setIsBingoModalOpen] = useState(false);

  // Handlers Navigazione Calendario
  const handleMonthClick = (yr: number, monthIndex: number) => {
    const d = new Date(yr, monthIndex, 1);
    changeDate(d);
    const monthStr = String(monthIndex + 1).padStart(2, '0');
    navigate(`/mese?date=${yr}-${monthStr}-01`);
  };

  // Touch Swipe Gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    // Solo se lo swipe orizzontale è predominante rispetto a quello verticale
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0 && activePageIndex === 0) {
        setActivePageIndex(1); // Swipe sinistra -> Pagina 2 (Bingo & Propositi)
      } else if (deltaX > 0 && activePageIndex === 1) {
        setActivePageIndex(0); // Swipe destra -> Pagina 1 (Calendario Annuale)
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // 3. STATI DI CARICAMENTO ED ERRORE
  if (state.isLoading && !state.yearData) {
    return <PageLoadingState messages={LOADING_MESSAGES.year} />;
  }

  if (state.isError && !state.yearData) {
    return (
      <PageErrorState
        message={ERROR_MESSAGES.year}
        onRetry={() => queryClient.refetchQueries()}
      />
    );
  }

  return (
    <div className="h-full w-full flex flex-col justify-between gap-1.5 overflow-hidden animate-fadeIn relative select-none">
      
      {/* ========================================================================= */}
      {/* 1. HEADER COMUNE STANDARDIZZATO (Anno a sx, Icone Azione a dx)            */}
      {/* ========================================================================= */}
      <MobileAgendaPeriodHeader
        title={String(state.selectedYear)}
        currentDate={new Date(state.selectedYear, 0, 1)}
        isCurrent={nav.isCurrentYear}
        onResetToday={handlers.handleResetCurrentYear}
        onChangeDate={(newDate) => handlers.handleSelectYear(newDate.getFullYear())}
        viewMode="year"
        reviewStatus={review.reviewStatus}
        onOpenReview={review.openReview}
      />

      {/* ========================================================================= */}
      {/* 2. CORPO PRINCIPALE IN SLIDING A 2 PAGINE                                 */}
      {/* ========================================================================= */}
      <div
        className="flex-1 min-h-0 w-full overflow-hidden relative"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* --------------------------------------------------------------------- */}
        {/* SLIDE 1 (PRINCIPALE): OBIETTIVO/PRIORITÀ + CALENDARIO 12 MESI         */}
        {/* --------------------------------------------------------------------- */}
        <div
          className={`absolute inset-0 w-full h-full flex flex-col gap-2 overflow-hidden transition-transform duration-300 ease-out ${
            activePageIndex === 0
              ? 'translate-x-0 pointer-events-auto'
              : '-translate-x-full pointer-events-none'
          }`}
        >
          {/* OBIETTIVO E PRIORITÀ ANNUALI COMPATTI A CHIPS */}
          <MobileGoalsAndPrioritiesChips
            goalText={apiData.entries.obiettivo?.yearly_field}
            priorities={apiData.entries.priorita.map((p) =>
              p ? { id: p.id, testo: p.yearly_field ?? null } : null
            )}
            onSaveGoal={apiData.entries.handleSaveObiettivo}
            onSavePriority={(id, text, index) => {
              const idx = typeof index === 'number' ? index : apiData.entries.priorita.findIndex((p) => p?.id === id);
              if (idx >= 0) {
                apiData.entries.handleSavePriority(idx, id, text);
              }
            }}
            goalPlaceholder="Qual è il tuo obiettivo per quest'anno?"
          />

          {/* CALENDARIO ANNUALE 12 MESI ZERO-SCROLL */}
          <MobileYearCalendar
            year={state.selectedYear}
            events={highlights.events}
            tasks={highlights.tasks}
            taskDays={highlights.taskDays}
            eventDays={highlights.eventDays}
            highlightedDays={highlights.highlightedDays}
            onMonthClick={handleMonthClick}
          />
        </div>

        {/* --------------------------------------------------------------------- */}
        {/* SLIDE 2: MINI BINGO IN ANTEPRIMA + COLONNA BUONI PROPOSITI             */}
        {/* --------------------------------------------------------------------- */}
        <div
          className={`absolute inset-0 w-full h-full flex flex-col gap-2.5 overflow-hidden transition-transform duration-300 ease-out ${
            activePageIndex === 1
              ? 'translate-x-0 pointer-events-auto'
              : 'translate-x-full pointer-events-none'
          }`}
        >
          {/* MINI BINGO CENTRATO IN ALTO */}
          <div className="flex justify-center w-full shrink-0">
            <MiniBingoCard
              cells={bingo.cells}
              onOpenModal={() => setIsBingoModalOpen(true)}
            />
          </div>

          {/* COLONNA ADATTATA DEI BUONI PROPOSITI */}
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <MobileYearResolutionsColumn
              propositi={apiData.entries.propositi}
              onAdd={apiData.entries.handleAddProposito}
              onUpdate={apiData.entries.handleUpdateProposito}
              onDelete={apiData.entries.handleDeleteProposito}
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
          title="Slide 1: Calendario Annuale"
          aria-label="Slide 1: Calendario Annuale"
        />
        <button
          type="button"
          onClick={() => setActivePageIndex(1)}
          className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
            activePageIndex === 1
              ? 'w-6 bg-blue-600 shadow-xs'
              : 'w-1.5 bg-gray-300 hover:bg-gray-400'
          }`}
          title="Slide 2: Bingo & Propositi"
          aria-label="Slide 2: Bingo e Propositi"
        />
      </div>

      {/* ========================================================================= */}
      {/* 4. MODALE FULLSCREEN BINGO CARD                                           */}
      {/* ========================================================================= */}
      <MobileBingoModal
        isOpen={isBingoModalOpen}
        onClose={() => setIsBingoModalOpen(false)}
        cells={bingo.cells}
        onCreateCell={bingo.handleCreateCell}
        onUpdateText={bingo.handleUpdateText}
        onToggleDone={bingo.handleToggleDone}
        onDeleteCell={bingo.handleDeleteCell}
      />

      {/* ========================================================================= */}
      {/* 5. MODALE ANALISI/REVIEW ANNUALE                                          */}
      {/* ========================================================================= */}
      <MobileYearReviewModal
        isOpen={review.isOpen}
        onClose={review.closeReview}
        year={state.selectedYear}
        reviewData={review.reviewData}
        moodsUI={apiData.entries.moodsUI}
        spheresUI={apiData.entries.spheresUI}
        onUpdateMood={apiData.entries.handleUpdateMood}
        onUpdateSphere={apiData.entries.handleUpdateSphere}
        onSaveAnswer={apiData.entries.handleSaveAnswer}
        tasksCompleted={apiData.tasksCompleted}
        tasksTotal={apiData.tasksTotal}
        tasksByMonth={apiData.tasksByMonth}
        tasksByWeekday={apiData.tasksByWeekday}
        habits={apiData.habits}
        dailyEntries={apiData.dailyEntries}
      />
    </div>
  );
};

export default MobileYearView;
