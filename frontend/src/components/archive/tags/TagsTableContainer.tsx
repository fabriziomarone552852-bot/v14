// src/components/archive/tags/TagsTableContainer.tsx
import React from 'react';
import { TagIcon } from '@/components/shared/utils/Icons';
import { ArchiveTableContainer } from '@/components/shared/layout/ArchiveTableContainer';
import { TagTableHeader } from './TagTableHeader';
import { TagTableRow } from './TagTableRow';
import { ERROR_MESSAGES } from '@/data/loadingMessages';
import type { EnrichedTagItem, TagSortField, TagSortDirection } from '@/hooks/useTagArchiveData';

interface TagsTableContainerProps {
  sortField: TagSortField;
  sortDirection: TagSortDirection;
  onSort: (field: TagSortField) => void;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  filteredTags: EnrichedTagItem[];
  paginatedTags: EnrichedTagItem[];
  searchQuery: string;
  onResetSearch: () => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  containerRef: React.Ref<HTMLDivElement>;
  onSaveTagName: (tagId: number, newName: string) => Promise<void>;
  onDoubleClick: (tag: EnrichedTagItem) => void;
  panelClass: string;
}

export const TagsTableContainer: React.FC<TagsTableContainerProps> = ({
  sortField,
  sortDirection,
  onSort,
  isLoading,
  isError,
  onRetry,
  filteredTags,
  paginatedTags,
  searchQuery,
  onResetSearch,
  currentPage,
  totalPages,
  onPageChange,
  containerRef,
  onSaveTagName,
  onDoubleClick,
  panelClass,
}) => {
  return (
    <ArchiveTableContainer
      header={
        <TagTableHeader
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={onSort}
        />
      }
      loading={isLoading}
      loadingMessage="Caricamento tag in corso..."
      isError={isError}
      errorMessage={ERROR_MESSAGES.archive}
      onRetry={onRetry}
      isEmpty={filteredTags.length === 0}
      emptyIcon={<TagIcon className="w-8 h-8 text-slate-400" />}
      emptyTitle="Nessun tag trovato"
      emptyDescription={
        searchQuery.trim()
          ? 'Nessun tag corrisponde alla parola chiave cercata.'
          : 'Non ci sono tag configurati nel sistema.'
      }
      hasActiveFilters={searchQuery.trim().length > 0}
      onResetFilters={onResetSearch}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={onPageChange}
      className={panelClass}
      bodyRef={containerRef}
    >
      {paginatedTags.map((tag) => (
        <TagTableRow
          key={tag.id}
          tag={tag}
          onSaveTagName={onSaveTagName}
          onDoubleClick={onDoubleClick}
        />
      ))}
    </ArchiveTableContainer>
  );
};
