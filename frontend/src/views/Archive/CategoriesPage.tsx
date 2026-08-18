// src/views/Archive/CategoriesPage.tsx
import React, { useMemo, useState } from 'react';
import { useCategories, useDeleteCategory } from '@/hooks/useCategories';
import { useConfirm } from '@/context/ConfirmContext';
import { useCategoryArchiveData } from '@/hooks/useCategoryArchiveData';
import { CategoryIcon } from '@/components/shared/utils/Icons';
import { ArchiveTableContainer } from '@/components/shared/layout/ArchiveTableContainer';
import { CategoryStatsOverview } from '@/components/categories/CategoryStatsOverview';
import { CategoryFilterBar } from '@/components/categories/CategoryFilterBar';
import {
  CategoryTableHeader,
  type CategorySortField,
  type CategorySortDirection,
} from '@/components/categories/CategoryTableHeader';
import { CategoryTableRow } from '@/components/categories/CategoryTableRow';
import {
  CategoryFilterModal,
  type CategoryFilterState,
} from '@/components/categories/CategoryFilterModal';
import { CategoryModal } from '@/components/categories/CategoryModal';
import { CategoryDetailModal } from '@/components/categories/CategoryDetailModal';
import type { Category } from '@/types/categories';

const PANEL_CLASS = 'rounded-2xl border border-slate-200/90 bg-white shadow-xs';

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
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const [sortField, setSortField] = useState<CategorySortField>('name');
  const [sortDirection, setSortDirection] = useState<CategorySortDirection>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // 2. STATO MODALI (DETTAGLIO E CREAZIONE/MODIFICA)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  // 3. HOOK PER ELABORAZIONE AD ALTE PRESTAZIONI IN RAM
  const { filteredCategories, paginatedCategories, stats, totalPages } =
    useCategoryArchiveData({
      rawCategories,
      filters,
      sortField,
      sortDirection,
      currentPage,
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

  // Apertura modale per Nuova Categoria
  const handleOpenNewCategory = () => {
    setCategoryToEdit(null);
    setIsFormModalOpen(true);
  };

  // Selezione riga per aprire il Modale di Dettaglio
  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsDetailModalOpen(true);
  };

  // Transizione da Dettaglio a Modifica
  const handleEditFromDetail = () => {
    if (!selectedCategory) return;
    setCategoryToEdit(selectedCategory);
    setIsDetailModalOpen(false);
    setIsFormModalOpen(true);
  };

  // Eliminazione con conferma di sicurezza
  const handleDeleteFromDetail = () => {
    if (!selectedCategory) return;
    const catToDelete = selectedCategory;

    confirm({
      title: 'Elimina Categoria',
      message: `Sei sicuro di voler eliminare definitivamente la categoria "${catToDelete.category_name}"? Eventuali task ed eventi associati perderanno il riferimento alla categoria.`,
      confirmText: 'Elimina',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await deleteCategoryMutation.mutateAsync(catToDelete.id);
          setIsDetailModalOpen(false);
          setSelectedCategory(null);
        } catch (err) {
          console.error('Errore durante l\'eliminazione della categoria:', err);
        }
      },
    });
  };

  return (
    <div className="h-full flex flex-col gap-3.5 max-w-[1600px] mx-auto relative z-10 pb-1">
      {/* 1. HEADER COMPATTO CON PANORAMICA STATS */}
      <CategoryStatsOverview stats={stats} panelClass={PANEL_CLASS} />

      {/* 2. RIGA AZIONI: TASTO NUOVA CATEGORIA E LENTE DI RICERCA */}
      <CategoryFilterBar
        onOpenNewCategory={handleOpenNewCategory}
        onOpenSearch={() => setIsFilterModalOpen(true)}
        activeFiltersCount={activeFiltersCount}
        panelClass={PANEL_CLASS}
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
        className={PANEL_CLASS}
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
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
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
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory}
        onEditClick={handleEditFromDetail}
        onDeleteClick={handleDeleteFromDetail}
      />

      {/* 6. MODALE CREAZIONE / MODIFICA CATEGORIA */}
      <CategoryModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setCategoryToEdit(null);
        }}
        categoryToEdit={categoryToEdit}
      />
    </div>
  );
};

export default CategoriesPage;