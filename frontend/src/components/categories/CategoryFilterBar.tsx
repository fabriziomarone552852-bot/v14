// src/components/categories/CategoryFilterBar.tsx
import React from 'react';
import { ArchiveActionBar } from '@/components/shared/layout/ArchiveActionBar';

interface CategoryFilterBarProps {
  onOpenNewCategory: () => void;
  onOpenSearch: () => void;
  activeFiltersCount: number;
  panelClass?: string;
}

export const CategoryFilterBar: React.FC<CategoryFilterBarProps> = ({
  onOpenNewCategory,
  onOpenSearch,
  activeFiltersCount,
  panelClass,
}) => {
  return (
    <ArchiveActionBar
      addLabel="Nuova Categoria"
      onAdd={onOpenNewCategory}
      onOpenSearch={onOpenSearch}
      activeFiltersCount={activeFiltersCount}
      className={panelClass}
    />
  );
};

export default CategoryFilterBar;
