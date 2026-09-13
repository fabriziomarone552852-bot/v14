// src/views/Archive/TagsPage.tsx
import React from 'react';
import { ArchiveHeader } from '@/components/shared/layout/ArchiveHeader';
import { TagIcon } from '@/components/shared/utils/Icons';
import { TagActionBar } from '@/components/archive/tags/TagActionBar';
import { TagCloudBoard } from '@/components/archive/tags/TagCloudBoard';
import { TagsTableContainer } from '@/components/archive/tags/TagsTableContainer';
import { TagsPageModals } from '@/components/archive/tags/TagsPageModals';
import { useTagsPageLogic } from '@/components/archive/tags/useTagsPageLogic';
import { ERROR_MESSAGES } from '@/data/loadingMessages';

const PANEL_CLASS = 'rounded-2xl border border-slate-200/90 bg-white shadow-xs';

export const TagsPage: React.FC = () => {
  const logic = useTagsPageLogic();

  return (
    <div className="h-full flex flex-col gap-2 sm:gap-3.5 w-full max-w-[1600px] mx-auto relative z-10 pb-1">
      {/* 1. HEADER STANDARD */}
      <ArchiveHeader
        title="TAG & ETICHETTE"
        subtitle="Bacheca di frequenza ed elenco alfabetico dei tag associati alle tue revisioni periodiche."
        icon={<TagIcon className="w-5 h-5 text-white" />}
        className={PANEL_CLASS}
      />

      {/* 2. BARRA AZIONI: SLIDER A SINISTRA E RICERCA A DESTRA */}
      <TagActionBar
        activeTab={logic.activeTab}
        onTabChange={(tab) => {
          logic.setActiveTab(tab);
          logic.setCurrentPage(1);
        }}
        searchQuery={logic.searchQuery}
        onSearchChange={logic.handleSearchChange}
        onResetSearch={logic.handleResetSearch}
        panelClass={PANEL_CLASS}
      />

      {/* 3. VISTA ATTIVA: BACHECA O TABELLA */}
      {logic.isError ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <div className="text-3xl mb-3">⚠️</div>
          <p className="text-sm font-bold text-rose-700">{ERROR_MESSAGES.archive}</p>
          <div className="mt-4 p-1.5 bg-rose-50 border border-rose-200 rounded-2xl">
            <button
              type="button"
              onClick={() => logic.queryClient.refetchQueries()}
              className="px-4 py-2 text-xs font-bold text-red-600 hover:bg-rose-100 rounded-xl transition cursor-pointer"
            >
              🔄 Riprova
            </button>
          </div>
        </div>
      ) : logic.activeTab === 'cloud' ? (
        <TagCloudBoard
          tags={logic.allTags}
          onSaveTagName={logic.handleSaveTagName}
          onDoubleClick={logic.handleOpenTagReviews}
          panelClass={PANEL_CLASS}
        />
      ) : (
        <TagsTableContainer
          sortField={logic.sortField}
          sortDirection={logic.sortDirection}
          onSort={logic.handleSort}
          isLoading={logic.isLoading}
          isError={Boolean(logic.isError)}
          onRetry={() => logic.queryClient.refetchQueries()}
          filteredTags={logic.filteredTags}
          paginatedTags={logic.paginatedTags}
          searchQuery={logic.searchQuery}
          onResetSearch={logic.handleResetSearch}
          currentPage={logic.currentPage}
          totalPages={logic.totalPages}
          onPageChange={logic.setCurrentPage}
          containerRef={logic.containerRef}
          onSaveTagName={logic.handleSaveTagName}
          onDoubleClick={logic.handleOpenTagReviews}
          panelClass={PANEL_CLASS}
        />
      )}

      {/* 4. MODALI */}
      <TagsPageModals
        tagForReviews={logic.tagForReviews}
        isReviewsModalOpen={logic.isReviewsModalOpen}
        onCloseReviewsModal={() => {
          logic.setIsReviewsModalOpen(false);
          logic.setTagForReviews(null);
        }}
        onOpenReviewFromTag={logic.handleOpenReviewFromTag}
        selectedMonthDate={logic.selectedMonthDate}
        isMonthReviewOpen={logic.isMonthReviewOpen}
        onCloseMonthReview={() => {
          logic.setIsMonthReviewOpen(false);
          logic.setSelectedMonthDate(null);
        }}
        selectedYear={logic.selectedYear}
        isYearReviewOpen={logic.isYearReviewOpen}
        onCloseYearReview={() => {
          logic.setIsYearReviewOpen(false);
          logic.setSelectedYear(null);
        }}
      />
    </div>
  );
};

export default TagsPage;
