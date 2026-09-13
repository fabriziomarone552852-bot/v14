// src/components/archive/tags/useTagsPageLogic.ts
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiService';
import { useCategories, useUpdateCategory } from '@/hooks/useCategories';
import { useDynamicPageSize } from '@/hooks/useDynamicPageSize';
import { useArchiveHeader } from '@/context/ArchiveHeaderContext';
import {
  useTagArchiveData,
  type EnrichedTagItem,
  type AssociatedReview,
  type TagSortField,
  type TagSortDirection,
} from '@/hooks/useTagArchiveData';
import type { TagViewTab } from './TagActionBar';
import type { MonthlyEntryResponse } from '@/types/monthlyentries';
import type { DbYearlyEntry } from '@/types/yearlyentries';
import { logger } from '@/utils/logger';

export const useTagsPageLogic = () => {
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

  // 2. STATO TAB VISUALIZZAZIONE, ORDINAMENTO E RICERCA
  const [activeTab, setActiveTab] = useState<TagViewTab>('cloud');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<TagSortField>('name');
  const [sortDirection, setSortDirection] = useState<TagSortDirection>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // 3. CALCOLO DINAMICO DELLE RIGHE PER LA TABELLA
  const { containerRef, pageSize } = useDynamicPageSize({
    rowHeight: 46,
    defaultPageSize: 8,
    minItems: 3,
    maxItems: 25,
  });

  // 4. ELABORAZIONE DATI IN RAM
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
    sortField,
    sortDirection,
  });

  // 5. STATO MODALE REVIEW COLLEGATE (DOPPIO CLICK)
  const [tagForReviews, setTagForReviews] = useState<EnrichedTagItem | null>(null);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);

  // 6. STATO MODALI DI REVISIONE DIRETTA
  const [selectedMonthDate, setSelectedMonthDate] = useState<Date | null>(null);
  const [isMonthReviewOpen, setIsMonthReviewOpen] = useState(false);

  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [isYearReviewOpen, setIsYearReviewOpen] = useState(false);

  // Gestione Modifica Nome Tag Inline
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

  const handleOpenTagReviews = (tag: EnrichedTagItem) => {
    setTagForReviews(tag);
    setIsReviewsModalOpen(true);
  };

  const handleOpenReviewFromTag = (review: AssociatedReview) => {
    if (review.type === 'month') {
      setSelectedMonthDate(review.date);
      setIsMonthReviewOpen(true);
    } else {
      setSelectedYear(review.year);
      setIsYearReviewOpen(true);
    }
  };

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

  const handleSort = (field: TagSortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Registrazione header archivio per mobile
  useArchiveHeader({
    title: 'Tag & Etichette',
  });

  return {
    queryClient,
    activeTab,
    setActiveTab,
    searchQuery,
    sortField,
    sortDirection,
    currentPage,
    setCurrentPage,
    isLoading,
    isError,
    allTags,
    filteredTags,
    paginatedTags,
    totalPages,
    containerRef,
    tagForReviews,
    setTagForReviews,
    isReviewsModalOpen,
    setIsReviewsModalOpen,
    selectedMonthDate,
    setSelectedMonthDate,
    isMonthReviewOpen,
    setIsMonthReviewOpen,
    selectedYear,
    setSelectedYear,
    isYearReviewOpen,
    setIsYearReviewOpen,
    handleSaveTagName,
    handleOpenTagReviews,
    handleOpenReviewFromTag,
    handleSearchChange,
    handleResetSearch,
    handleSort,
  };
};
