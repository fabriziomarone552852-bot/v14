// src/views/Archive/CategoriesPage.tsx
import React, { useMemo, useState } from 'react';
import { useCategories, useDeleteCategory } from '@/hooks/useCategories';
import { useConfirm } from '@/context/ConfirmContext';
import { useCategoryArchiveData } from '@/hooks/useCategoryArchiveData';
import { useDynamicPageSize } from '@/hooks/useDynamicPageSize';
import { useModal } from '@/hooks/useModals';
import { CategoryIcon } from '@/components/shared/utils/Icons';
import { ArchiveTableContainer } from '@/components/shared/layout/ArchiveTableContainer';
import { CategoryStatsOverview } from '@/components/archive/categories/CategoryStatsOverview';
import { CategoryFilterBar } from '@/components/archive/categories/CategoryFilterBar';
import {
  CategoryTableHeader,
  type CategorySortField,
  type CategorySortDirection,
} from '@/components/archive/categories/CategoryTableHeader';
import { CategoryTableRow } from '@/components/archive/categories/CategoryTableRow';
import {
  CategoryFilterModal,
  type CategoryFilterState,
} from '@/components/archive/categories/CategoryFilterModal';
import { CategoryModal } from '@/components/archive/categories/CategoryModal';
import { CategoryDetailModal } from '@/components/archive/categories/CategoryDetailModal';
import type { Category } from '@/types/categories';

export const ARCHIVE_PANEL_CLASS = 'rounded-2xl border border-slate-200/90 bg-white shadow-xs';

const initialFilterState: CategoryFilterState = {
  keyword: '',
  genre: 'all',
};

export const CategoriesPage: React.FC = () => {
  const { data: rawCategories = [], isLoading: loading } = useCategories();
  const deleteCategoryMutation = useDeleteCategory();
  const { confirm } = useConfirm();

  // 1. STATO FILTRI, ORDINAMENTO E PAGINAZIONE
  const [filters, setFilters] = useState<CategoryFilterState>(initialFilterState);
  const [sortField, setSortField] = useState<CategorySortField>('name');
  const [sortDirection, setSortDirection] = useState<CategorySortDirection>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // 2. MODALI — useModal<T> al posto di coppie useState separate
  const filterModal = useModal();
  const detailModal = useModal<Category>();
  const formModal = useModal<Category>();

  // 3. CALCOLO DINAMICO DEL PAGE SIZE IN BASE ALL'ALTEZZA
  const { containerRef, pageSize } = useDynamicPageSize({
    rowHeight: 46,
    defaultPageSize: 8,
    minItems: 3,
    maxItems: 30,
  });

  // 4. HOOK PER ELABORAZIONE AD ALTE PRESTAZIONI IN RAM
  const { filteredCategories, paginatedCategories, stats, totalPages } =
    useCategoryArchiveData({
      rawCategories,
      filters,
      sortField,
      sortDirection,
      currentPage,
      pageSize,
    });

  // Conteggio filtri attivi
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.keyword.trim()) count++;
    if (filters.genre !== 'all') count++;
    return count;
  }, [filters]);

  const hasActiveFilters = activeFiltersCount > 0;

  const handleResetFilters = () => {
    setFilters(initialFilterState);
    setCurrentPage(1);
  };

  const handleSort = (field: CategorySortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const handleOpenNewCategory = () => formModal.open(null);

  const handleSelectCategory = (category: Category) => detailModal.open(category);

  const handleEditFromDetail = () => {
    if (!detailModal.data) return;
    formModal.open(detailModal.data);
    detailModal.close();
  };

  const handleDeleteFromDetail = () => {
    if (!detailModal.data) return;
    const catToDelete = detailModal.data;

    confirm({
      title: 'Elimina Categoria',
      message: `Sei sicuro di voler eliminare definitivamente la categoria "${catToDelete.category_name}"? Eventuali task ed eventi associati perderanno il riferimento alla categoria.`,
      confirmText: 'Elimina',
      isDestructive: true,
      onConfirm: async () => {
        await deleteCategoryMutation.mutateAsync(catToDelete.id);
        detailModal.close();
      },
    });
  };

  return (
    <div className="h-full flex flex-col gap-3.5 max-w-[1600px] mx-auto relative z-10 pb-1">
      {/* 1. HEADER COMPATTO CON PANORAMICA STATS */}
      <CategoryStatsOverview stats={stats} panelClass={ARCHIVE_PANEL_CLASS} />

      {/* 2. RIGA AZIONI: TASTO NUOVA CATEGORIA E LENTE DI RICERCA */}
      <CategoryFilterBar
        onOpenNewCategory={handleOpenNewCategory}
        onOpenSearch={filterModal.open}
        activeFiltersCount={activeFiltersCount}
        panelClass={ARCHIVE_PANEL_CLASS}
      />

      {/* 3. TABELLA CATEGORIE CON ORDINAMENTO E PAGINAZIONE */}
      <ArchiveTableContainer
        header={
          <CategoryTableHeader
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        }
        loading={loading}
        loadingMessage="Caricamento categorie in corso..."
        isEmpty={filteredCategories.length === 0}
        emptyIcon={<CategoryIcon className="w-8 h-8 text-slate-400" />}
        emptyTitle="Nessuna categoria trovata"
        emptyDescription={
          hasActiveFilters
            ? 'Nessuna categoria corrisponde ai filtri selezionati. Prova ad azzerarli.'
            : 'Non ci sono categorie registrate nel sistema.'
        }
        hasActiveFilters={hasActiveFilters}
        onResetFilters={handleResetFilters}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        className={ARCHIVE_PANEL_CLASS}
        bodyRef={containerRef}
      >
        {paginatedCategories.map((cat) => (
          <CategoryTableRow
            key={cat.id}
            category={cat}
            onSelect={handleSelectCategory}
          />
        ))}
      </ArchiveTableContainer>

      {/* 4. MODALE FILTRI & RICERCA IN OVERLAY GLOBALE */}
      <CategoryFilterModal
        isOpen={filterModal.isOpen}
        onClose={filterModal.close}
        filters={filters}
        onFilterChange={(newFilters) => {
          setFilters(newFilters);
          setCurrentPage(1);
        }}
        onReset={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* 5. MODALE DI DETTAGLIO CATEGORIA (Al click sulla riga) */}
      <CategoryDetailModal
        isOpen={detailModal.isOpen}
        onClose={detailModal.close}
        category={detailModal.data}
        onEditClick={handleEditFromDetail}
        onDeleteClick={handleDeleteFromDetail}
      />

      {/* 6. MODALE CREAZIONE / MODIFICA CATEGORIA */}
      <CategoryModal
        isOpen={formModal.isOpen}
        onClose={formModal.close}
        categoryToEdit={formModal.data}
      />
    </div>
  );
};

export default CategoriesPage;