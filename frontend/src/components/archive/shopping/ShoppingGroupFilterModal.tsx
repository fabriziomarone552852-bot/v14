// src/components/archive/shopping/ShoppingGroupFilterModal.tsx
import React, { useState } from 'react';
import { UsersIcon, CloseIcon } from '@/components/shared/utils/Icons';
import {
  ArchiveFilterModal,
  ArchiveFilterSearchInput,
  ArchiveFilterSegmentedGroup,
} from '@/components/archive/common';

export interface ShoppingGroupFilterState {
  keyword: string;
  status: 'all' | 'active' | 'archived' | 'empty';
  members: string[];
}

interface ShoppingGroupFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: ShoppingGroupFilterState;
  onFilterChange: (newFilters: ShoppingGroupFilterState) => void;
  onReset: () => void;
  allKnownMembers: string[];
  hasActiveFilters: boolean;
}

export const ShoppingGroupFilterModal: React.FC<ShoppingGroupFilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onReset,
  allKnownMembers,
  hasActiveFilters,
}) => {
  const [memberInput, setMemberInput] = useState('');

  const handleFieldChange = <K extends keyof ShoppingGroupFilterState>(
    field: K,
    value: ShoppingGroupFilterState[K]
  ) => {
    onFilterChange({
      ...filters,
      [field]: value,
    });
  };

  const handleAddMember = (m: string) => {
    if (!filters.members.includes(m)) {
      handleFieldChange('members', [...filters.members, m]);
    }
    setMemberInput('');
  };

  const handleRemoveMember = (m: string) => {
    handleFieldChange(
      'members',
      filters.members.filter((item) => item !== m)
    );
  };

  const memberSuggestions = allKnownMembers.filter(
    (m) =>
      !filters.members.includes(m) &&
      (!memberInput || m.toLowerCase().includes(memberInput.toLowerCase().trim()))
  );

  return (
    <ArchiveFilterModal
      isOpen={isOpen}
      onClose={onClose}
      title="Filtra Gruppi Spesa"
      onReset={onReset}
      hasActiveFilters={hasActiveFilters}
      maxWidthClass="max-w-lg"
    >
      {/* 1. RICERCA PER NOME */}
      <ArchiveFilterSearchInput
        label="Cerca per Nome o Descrizione"
        value={filters.keyword}
        onChange={(val) => handleFieldChange('keyword', val)}
        placeholder="Es. Famiglia, Casa Vacanze..."
      />

      {/* 2. STATO DEL GRUPPO */}
      <ArchiveFilterSegmentedGroup<ShoppingGroupFilterState['status']>
        label="Stato del Gruppo"
        value={filters.status}
        onChange={(val) => handleFieldChange('status', val)}
        gridColsClass="grid-cols-4"
        options={[
          { value: 'all', label: 'Tutti', activeClass: 'bg-blue-50 border-blue-300 text-blue-700 shadow-2xs font-bold' },
          { value: 'active', label: 'Attivi', activeClass: 'bg-blue-50 border-blue-300 text-blue-700 shadow-2xs font-bold' },
          { value: 'archived', label: 'Archiviati', activeClass: 'bg-blue-50 border-blue-300 text-blue-700 shadow-2xs font-bold' },
          { value: 'empty', label: 'Senza Liste', activeClass: 'bg-blue-50 border-blue-300 text-blue-700 shadow-2xs font-bold' },
        ]}
      />

      {/* 3. FILTRO INCROCIATO PER MEMBRI */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
          Filtra per Membri Presenti nel Gruppo
        </label>

        {/* Chip Membri Selezionati */}
        {filters.members.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {filters.members.map((m) => (
              <span
                key={m}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200"
              >
                <UsersIcon className="w-3 h-3" />
                <span>@{m}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveMember(m)}
                  className="text-indigo-400 hover:text-indigo-700 cursor-pointer"
                >
                  <CloseIcon className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="relative">
          <input
            type="text"
            value={memberInput}
            onChange={(e) => setMemberInput(e.target.value)}
            placeholder="Digita per filtrare i membri..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-medium"
          />
        </div>

        {memberSuggestions.length > 0 && (
          <div className="mt-2 max-h-32 overflow-y-auto border border-slate-200 rounded-xl p-1 bg-white custom-scrollbar flex flex-wrap gap-1">
            {memberSuggestions.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => handleAddMember(m)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-700 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-100 transition cursor-pointer"
              >
                + @{m}
              </button>
            ))}
          </div>
        )}
      </div>
    </ArchiveFilterModal>
  );
};

export default ShoppingGroupFilterModal;
