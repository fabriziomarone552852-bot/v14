// src/components/shared/shopping/ShoppingGroupsColumn.tsx
import React, { useState } from 'react';
import type { ShoppingGroupSummary } from '@/types/shopping';
import { AddButton } from '@/components/shared/utils/AddButton';
import { UsersIcon, LockIcon, EditIcon, TrashIcon, MailIcon, PlusIcon } from '@/components/shared/utils/Icons';

interface ShoppingGroupsColumnProps {
  groups: ShoppingGroupSummary[];
  loading?: boolean;
  selectedGroupId?: number | null;
  onSelectGroup?: (groupId: number | null) => void;
  onCreateGroup?: () => void;
  onOpenMembers?: (group: ShoppingGroupSummary) => void;
  onEditGroup?: (group: ShoppingGroupSummary) => void;
  onDeleteGroup?: (group: ShoppingGroupSummary) => void;
  onInviteGroup?: (group: ShoppingGroupSummary) => void;
  className?: string;
}

const getGroupInitials = (name: string) => {
  const trimmed = name.trim();
  if (!trimmed) return 'GP';
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return trimmed.slice(0, 2).toUpperCase();
};

const getAvatarBg = (id: number) => {
  const palettes = [
    'bg-blue-100 text-blue-700 border-blue-200',
    'bg-indigo-100 text-indigo-700 border-indigo-200',
    'bg-purple-100 text-purple-700 border-purple-200',
    'bg-emerald-100 text-emerald-700 border-emerald-200',
    'bg-amber-100 text-amber-700 border-amber-200',
    'bg-rose-100 text-rose-700 border-rose-200',
    'bg-teal-100 text-teal-700 border-teal-200',
  ];
  return palettes[id % palettes.length];
};

const ShoppingGroupsColumn: React.FC<ShoppingGroupsColumnProps> = ({
  groups,
  loading = false,
  selectedGroupId = null,
  onSelectGroup,
  onCreateGroup,
  onOpenMembers,
  onEditGroup,
  onDeleteGroup,
  onInviteGroup,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // La colonna è contratta se un gruppo (o Personale = 0) è selezionato e l'utente non è in hover
  const isCollapsed = selectedGroupId !== null;
  const isCompact = isCollapsed && !isHovered;

  const isPersonalSelected = selectedGroupId === 0;

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`h-full min-h-0 flex flex-col justify-between transition-all duration-300 ease-in-out ${
        isCompact ? 'w-16 items-center px-1' : 'w-full min-w-0'
      } ${className}`}
    >
      <div className="flex flex-col flex-1 min-h-0 w-full min-w-0">
        {/* Header Section nello stile TaskColumn */}
        <div className="flex items-center justify-between border-b pb-2 mb-3 shrink-0 w-full">
          {!isCompact ? (
            <>
              <h3 className="text-lg font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                <UsersIcon className="w-5 h-5 text-gray-500" />
                <span>Gruppi</span>
              </h3>
              {selectedGroupId !== null && (
                <button
                  type="button"
                  onClick={() => onSelectGroup?.(null)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                  title="Deseleziona e mostra tutte le liste"
                >
                  Tutte le liste
                </button>
              )}
            </>
          ) : (
            <div className="w-full flex justify-center py-0.5">
              <UsersIcon className="w-5 h-5 text-gray-400" />
            </div>
          )}
        </div>

        {/* List Section con padding per evitare tagli ai bordi */}
        <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 w-full min-w-0 p-1 pr-1.5 custom-scrollbar">
          
          {/* Voce "Privata" (Liste private senza gruppo) */}
          {isCompact ? (
            <button
              type="button"
              onClick={() => onSelectGroup?.(isPersonalSelected ? null : 0)}
              title="Liste Personali (Private)"
              className={`w-11 h-11 mx-auto rounded-xl flex items-center justify-center border transition-all duration-200 cursor-pointer ${
                isPersonalSelected
                  ? 'border-blue-500 bg-blue-600 text-white font-bold shadow-sm scale-105 ring-2 ring-blue-200'
                  : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-white hover:scale-105 text-gray-600'
              }`}
            >
              <LockIcon className="w-4 h-4" />
            </button>
          ) : (
            <div
              onClick={() => onSelectGroup?.(isPersonalSelected ? null : 0)}
              className={`w-full flex items-center justify-between border min-h-[54px] p-3 rounded-xl shadow-xs transition-all cursor-pointer ${
                isPersonalSelected
                  ? 'bg-blue-50/70 border-blue-400 ring-1 ring-blue-400 shadow-sm'
                  : 'bg-gray-50 border-gray-200 hover:border-blue-300 hover:bg-white'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center border border-gray-200 bg-white text-gray-600">
                  <LockIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm font-semibold ${isPersonalSelected ? 'text-blue-950' : 'text-gray-800'}`}>
                    Private
                  </p>
                  <p className="truncate text-xs text-gray-400">
                    Solo per te
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Elenco Gruppi */}
          {loading ? (
            <p className="py-6 text-center text-xs text-gray-400 animate-pulse">
              {!isCompact ? 'Caricamento...' : '...'}
            </p>
          ) : (
            groups.map((group) => {
              const isSelected = selectedGroupId === group.id;
              const initials = getGroupInitials(group.name);
              const avatarClass = getAvatarBg(group.id);

              if (isCompact) {
                return (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => onSelectGroup?.(isSelected ? null : group.id)}
                    title={`${group.name}${group.description ? ` - ${group.description}` : ''}`}
                    className={`w-11 h-11 mx-auto rounded-xl flex items-center justify-center border transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 bg-blue-600 text-white font-bold shadow-sm scale-105 ring-2 ring-blue-200'
                        : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-white hover:scale-105 text-gray-700'
                    }`}
                  >
                    <span className="text-xs font-bold">{initials}</span>
                  </button>
                );
              }

              return (
                <div
                  key={group.id}
                  onClick={() => onSelectGroup?.(isSelected ? null : group.id)}
                  className={`w-full flex flex-col justify-between border rounded-xl shadow-xs transition-all cursor-pointer overflow-hidden ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-400 ring-1 ring-blue-400 shadow-sm'
                      : 'bg-gray-50 border-gray-200 hover:border-blue-300 hover:bg-white'
                  }`}
                >
                  <div className="p-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center border text-xs font-bold ${avatarClass}`}
                      >
                        {initials}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className={`truncate text-sm font-semibold ${isSelected ? 'text-blue-950' : 'text-gray-800'}`}>
                          {group.name}
                        </p>

                        {group.description && (
                          <p className="truncate text-xs text-gray-400 mt-0.5">
                            {group.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Barra azioni interna al gruppo */}
                  <div
                    className="flex items-center justify-between border-t border-gray-200/60 bg-gray-100/60 px-3 py-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => onOpenMembers?.(group)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 transition cursor-pointer"
                      title="Membri e ruoli"
                    >
                      <UsersIcon className="w-3.5 h-3.5" />
                      <span>Membri</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {onInviteGroup && (
                        <button
                          type="button"
                          onClick={() => onInviteGroup(group)}
                          className="p-1 text-gray-400 hover:text-indigo-600 transition cursor-pointer"
                          title="Invita collaboratore"
                        >
                          <MailIcon className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onEditGroup && (
                        <button
                          type="button"
                          onClick={() => onEditGroup(group)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition cursor-pointer"
                          title="Modifica"
                        >
                          <EditIcon className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onDeleteGroup && (
                        <button
                          type="button"
                          onClick={() => onDeleteGroup(group)}
                          className="p-1 text-gray-400 hover:text-red-600 transition cursor-pointer"
                          title="Elimina"
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer Section nello stile TaskColumn */}
      {onCreateGroup && (
        <div className="flex flex-col gap-2 mt-3 shrink-0 w-full">
          {isCompact ? (
            <button
              type="button"
              onClick={onCreateGroup}
              title="Nuovo Gruppo"
              className="w-11 h-11 mx-auto shrink-0 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50/60 active:scale-95 transition-all flex justify-center items-center cursor-pointer"
            >
              <PlusIcon className="w-5 h-5" />
            </button>
          ) : (
            <AddButton
              label="Nuovo Gruppo"
              onClick={onCreateGroup}
            />
          )}
        </div>
      )}
    </aside>
  );
};

export default ShoppingGroupsColumn;