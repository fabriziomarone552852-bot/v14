// src/views/Archive/TagsPage.tsx
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiService';
import { useCategories, useUpdateCategory } from '@/hooks/useCategories';
import { ArchiveHeader } from '@/components/shared/layout/ArchiveHeader';
import { TagIcon } from '@/components/shared/utils/Icons';
import { ArchiveTableContainer } from '@/components/shared/layout/ArchiveTableContainer';
import { TagActionBar, type TagViewTab } from '@/components/archive/tags/TagActionBar';
import { TagCloudBoard } from '@/components/archive/tags/TagCloudBoard';
import { TagTableHeader } from '@/components/archive/tags/TagTableHeader';
import { TagTableRow } from '@/components/archive/tags/TagTableRow';
import { TagReviewsModal } from '@/components/archive/tags/TagReviewsModal';
import { MonthReviewArchiveModal } from '@/components/archive/reviews/MonthReviewArchiveModal';
import { YearReviewArchiveModal } from '@/components/archive/reviews/YearReviewArchiveModal';
import { useTagArchiveData, type EnrichedTagItem, type AssociatedReview } from '@/hooks/useTagArchiveData';
import { useDynamicPageSize } from '@/hooks/useDynamicPageSize';
import { ERROR_MESSAGES } from '@/data/loadingMessages';
import type { MonthlyEntryResponse } from '@/types/monthlyentries';
import type { DbYearlyEntry } from '@/types/yearlyentries';
import { logger } from '@/utils/logger';

const PANEL_CLASS = 'rounded-2xl border border-slate-200/90 bg-white shadow-xs';

export const TagsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const updateCategoryMutation = useUpdateCategory();

  // 1. CARICAMENTO DATI (Categorie, Revisioni Mensili e Annuali)
  const { data: rawCategories = [], isLoading: loadingCategories, isError: catError } = useCategories();

  const { data: rawMonthlyEntries = [], isLoading: loadingMonthly, isError: monthError } = useQuery<MonthlyEntryResponse[]>({
    queryKey: ['monthly_entries'],
    queryFn: async () => {
      const res = await api.get<MonthlyEntryResponse[]>('/monthly-entries');
      return res || [];
    },
  });

  const { data: rawYearlyEntries = [], isLoading: loadingYearly, isError: yearError } = useQuery<DbYearlyEntry[]>({
    queryKey: ['yearly_entries'],
    queryFn: async () => {
      const res = await api.get<DbYearlyEntry[]>('/yearly-entries');
      return res || [];
    },
  });

  const isLoading = loadingCategories || loadingMonthly || loadingYearly;
  const isError = catError || monthError || yearError;

  // 2. STATO TAB VISUALIZZAZIONE (BACHECA / TABELLA) E RICERCA
  const [activeTab, setActiveTab] = useState<TagViewTab>('cloud');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // 3. CALCOLO DINAMICO DELLE RIGHE PER LA TABELLA INFERIORE
  const { containerRef, pageSize } = useDynamicPageSize({
    rowHeight: 52,
    defaultPageSize: 8,
    minItems: 3,
    maxItems: 25,
  });

  // 4. ELABORAZIONE DATI IN RAM CON SUPPORTO MOCK DATA
  const {
    allTags,
    filteredTags,
    paginatedTags,
    totalPages,
  } = useTagArchiveData({
    categories: rawCategories,
    rawMonthlyEntries,
    rawYearlyEntries,
    searchQuery,
    currentPage,
    pageSize,
  });

  // 5. STATO MODALE REVIEW COLLEGATE (DOPPIO CLICK)
  const [tagForReviews, setTagForReviews] = useState<EnrichedTagItem | null>(null);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);

  // 6. STATO MODALI DI REVISIONE DIRETTA DALL'ELENCO DEL TAG
  const [selectedMonthDate, setSelectedMonthDate] = useState<Date | null>(null);
  const [isMonthReviewOpen, setIsMonthReviewOpen] = useState(false);

  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [isYearReviewOpen, setIsYearReviewOpen] = useState(false);

  // Gestione Modifica Nome Tag Inline (Click Singolo)
  const handleSaveTagName = async (tagId: number, newName: string) => {
    const existingReal = rawCategories.find((c) => c.id === tagId);
    if (existingReal) {
      try {
        await updateCategoryMutation.mutateAsync({
          id: tagId,
          data: { category_name: newName },
        });
      } catch (err: unknown) {
        logger.error('Errore durante l\'aggiornamento del tag:', err);
      }
    }
  };

  // Gestione Doppio Click -> Dettaglio Review Collegate
  const handleOpenTagReviews = (tag: EnrichedTagItem) => {
    setTagForReviews(tag);
    setIsReviewsModalOpen(true);
  };

  // Gestione Apertura Review Diretta dal Modale dei Tag
  const handleOpenReviewFromTag = (review: AssociatedReview) => {
    if (review.type === 'month') {
      setSelectedMonthDate(review.date);
      setIsMonthReviewOpen(true);
    } else {
      setSelectedYear(review.year);
      setIsYearReviewOpen(true);
    }
  };

  // Gestione Ricerca: alla digitazione porta automaticamente nella Tabella
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    if (query.trim()) {
      setActiveTab('table');
    }
  };

  const handleResetSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
  };

  return (
    <div className="h-full flex flex-col gap-3.5 max-w-[1600px] mx-auto relative z-10 pb-1">
      {/* 1. HEADER STANDARD */}
      <ArchiveHeader
        title="TAG & ETICHETTE"
        subtitle="Bacheca di frequenza ed elenco alfabetico dei tag associati alle tue revisioni periodiche."
        icon={<TagIcon className="w-5 h-5 text-white" />}
        className={PANEL_CLASS}
      />

      {/* 2. BARRA AZIONI: SLIDER A SINISTRA E RICERCA A DESTRA */}
      <TagActionBar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setCurrentPage(1);
        }}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onResetSearch={handleResetSearch}
        panelClass={PANEL_CLASS}
      />

      {/* 3. VISTA ATTIVA: BACHECA DEI TOP 25 O TABELLA COMPLETA A 4 COLONNE */}
      {isError ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <div className="text-3xl mb-3">⚠️</div>
          <p className="text-sm font-bold text-rose-700">{ERROR_MESSAGES.archive}</p>
          <div className="mt-4 p-1.5 bg-rose-50 border border-rose-200 rounded-2xl">
            <button
              type="button"
              onClick={() => queryClient.refetchQueries()}
              className="px-4 py-2 text-xs font-bold text-red-600 hover:bg-rose-100 rounded-xl transition cursor-pointer"
            >
              🔄 Riprova
            </button>
          </div>
        </div>
      ) : activeTab === 'cloud' ? (
        <TagCloudBoard
          tags={allTags}
          onSaveTagName={handleSaveTagName}
          onDoubleClick={handleOpenTagReviews}
          panelClass={PANEL_CLASS}
        />
      ) : (
        <ArchiveTableContainer
          header={<TagTableHeader />}
          loading={isLoading}
          loadingMessage="Caricamento tag in corso..."
          isError={isError}
          errorMessage={ERROR_MESSAGES.archive}
          onRetry={() => queryClient.refetchQueries()}
          isEmpty={filteredTags.length === 0}
          emptyIcon={<TagIcon className="w-8 h-8 text-slate-400" />}
          emptyTitle="Nessun tag trovato"
          emptyDescription={
            searchQuery.trim()
              ? 'Nessun tag corrisponde alla parola chiave cercata.'
              : 'Non ci sono tag configurati nel sistema.'
          }
          hasActiveFilters={searchQuery.trim().length > 0}
          onResetFilters={handleResetSearch}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          className={PANEL_CLASS}
          bodyRef={containerRef}
        >
          {paginatedTags.map((tag) => (
            <TagTableRow
              key={tag.id}
              tag={tag}
              onSaveTagName={handleSaveTagName}
              onDoubleClick={handleOpenTagReviews}
            />
          ))}
        </ArchiveTableContainer>
      )}

      {/* 4. MODALE REVIEW COLLEGATE (DOPPIO CLICK) */}
      <TagReviewsModal
        isOpen={isReviewsModalOpen}
        onClose={() => {
          setIsReviewsModalOpen(false);
          setTagForReviews(null);
        }}
        tag={tagForReviews}
        onOpenReview={handleOpenReviewFromTag}
      />

      {/* 5. MODALI DI REVISIONE PERIODICA (DALL'APERTURA DIRETTA) */}
      <MonthReviewArchiveModal
        isOpen={isMonthReviewOpen}
        onClose={() => {
          setIsMonthReviewOpen(false);
          setSelectedMonthDate(null);
        }}
        monthDate={selectedMonthDate}
      />

      <YearReviewArchiveModal
        isOpen={isYearReviewOpen}
        onClose={() => {
          setIsYearReviewOpen(false);
          setSelectedYear(null);
        }}
        year={selectedYear}
      />
    </div>
  );
};

export default TagsPage;
