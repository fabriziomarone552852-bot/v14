// src/mobile/views/MobileYearView.tsx
import React from 'react';

// Hooks & Logica Centralizzata
import { useMobileYearLogic } from '../hooks/useMobileYearLogic';

// Componenti Mobile Standardizzati
import MobileAgendaPeriodHeader from '../components/MobileAgendaPeriodHeader';
import { MobileYearCalendarSlide } from '../components/year/MobileYearCalendarSlide';
import { MobileYearBingoSlide } from '../components/year/MobileYearBingoSlide';
import MobileBingoModal from '../components/modals/MobileBingoModal';
import MobileYearReviewModal from '../components/modals/MobileYearReviewModal';
import { MobileDateSwipeOverlay } from '../components/common/MobileDateSwipeOverlay';

// Feedback & Loading
import PageLoadingState from '@/components/shared/feedback/PageLoadingState';
import PageErrorState from '@/components/shared/feedback/PageErrorState';
import { LOADING_MESSAGES, ERROR_MESSAGES } from '@/data/loadingMessages';

export const MobileYearView: React.FC = () => {
  const {
    queryClient,
    state,
    handlers,
    nav,
    apiData,
    highlights,
    bingo,
    review,
    activePageIndex,
    setActivePageIndex,
    isBingoModalOpen,
    setIsBingoModalOpen,
    mappedPriorities,
    handleMonthClick,
    handleSavePriority,
    handleTouchStart,
    handleTouchEnd,
    swipeDirection,
    handlePrevYear,
    handleNextYear,
  } = useMobileYearLogic();

  // Stati di Caricamento ed Errore
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
      {/* 1. Header Periodo Annuale */}
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

      {/* 2. Container 2 Slide in Carousel */}
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
        {/* Slide 0: Obiettivi/Priorità + Calendario 12 Mesi */}
        <MobileYearCalendarSlide
          activePageIndex={activePageIndex}
          goalText={apiData.entries.obiettivo?.yearly_field}
          priorities={mappedPriorities}
          onSaveGoal={apiData.entries.handleSaveObiettivo}
          onSavePriority={handleSavePriority}
          year={state.selectedYear}
          events={highlights.events}
          tasks={highlights.tasks}
          taskDays={highlights.taskDays}
          eventDays={highlights.eventDays}
          highlightedDays={highlights.highlightedDays}
          onMonthClick={handleMonthClick}
        />

        {/* Slide 1: Mini Bingo & Buoni Propositi */}
        <MobileYearBingoSlide
          activePageIndex={activePageIndex}
          cells={bingo.cells}
          onOpenBingoModal={() => setIsBingoModalOpen(true)}
          propositi={apiData.entries.propositi}
          onAddProposito={apiData.entries.handleAddProposito}
          onUpdateProposito={apiData.entries.handleUpdateProposito}
          onDeleteProposito={apiData.entries.handleDeleteProposito}
        />
      </div>

      {/* 3. Indicatore di Paginazione Dots */}
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

      {/* 4. Modale Fullscreen Bingo Card */}
      <MobileBingoModal
        isOpen={isBingoModalOpen}
        onClose={() => setIsBingoModalOpen(false)}
        cells={bingo.cells}
        onCreateCell={bingo.handleCreateCell}
        onUpdateText={bingo.handleUpdateText}
        onToggleDone={bingo.handleToggleDone}
        onDeleteCell={bingo.handleDeleteCell}
      />

      {/* 5. Modale Review Annuale */}
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

      {/* 6. Overlay Onda Luminosa e Frecce Test Desktop */}
      <MobileDateSwipeOverlay
        swipeDirection={swipeDirection}
        onSwipePrev={handlePrevYear}
        onSwipeNext={handleNextYear}
      />
    </div>
  );
};

export default MobileYearView;
