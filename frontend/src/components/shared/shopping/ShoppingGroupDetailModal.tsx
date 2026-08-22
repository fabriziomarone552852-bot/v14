// src/components/shared/shopping/ShoppingGroupDetailModal.tsx
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { ShoppingGroupSummary, ShoppingGroupMember, ShoppingListSummary } from '@/types/shopping';
import BaseModal from '@/components/shared/dialog/BaseModal';
import ConfirmDialog from '@/components/shared/dialog/ConfirmDialog';
import { AddButton } from '@/components/shared/utils/AddButton';
import {
  UsersIcon,
  EditIcon,
  TrashIcon,
  ArchiveIcon,
  PlusIcon,
  ShoppingIcon,
  CheckCircleIcon,
} from '@/components/shared/utils/Icons';
import { fetchGroupMembers, updateGroupMemberRole, removeGroupMember, shoppingQueryKeys } from '@/api/shoppingApi';
import { extractErrorMessage } from '@/utils/errorUtils';
import ShoppingRoleSelect from './ShoppingRoleSelect';


interface ShoppingGroupDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: ShoppingGroupSummary | null;
  lists?: ShoppingListSummary[];
  onEditClick?: (group: ShoppingGroupSummary) => void;
  onDeleteClick?: (group: ShoppingGroupSummary) => void;
  onArchiveClick?: (group: ShoppingGroupSummary) => void;
  onUnarchiveClick?: (group: ShoppingGroupSummary) => void;
  onOpenInvite?: (group: ShoppingGroupSummary) => void;
  onSelectList?: (listId: number) => void;
  onCreateListInGroup?: (groupId: number) => void;
  currentUserRole?: string;
  refreshKey?: number;
}

const roleBadgeColor: Record<string, string> = {
  owner: 'bg-purple-100 text-purple-800 border-purple-200',
  admin: 'bg-blue-100 text-blue-800 border-blue-200',
  editor: 'bg-green-100 text-green-800 border-green-200',
  reader: 'bg-gray-100 text-gray-700 border-gray-200',
};

const ShoppingGroupDetailModal: React.FC<ShoppingGroupDetailModalProps> = ({
  isOpen,
  onClose,
  group,
  lists = [],
  onEditClick,
  onDeleteClick,
  onArchiveClick,
  onUnarchiveClick,
  onOpenInvite,
  onSelectList,
  onCreateListInGroup,
  currentUserRole = 'owner',
}) => {

  const queryClient = useQueryClient();
  const [memberError, setMemberError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [filterListStatus, setFilterListStatus] = useState<'all' | 'open' | 'completed'>('all');

  const canInvite = currentUserRole === 'owner' || currentUserRole === 'admin';
  const isOwner = currentUserRole === 'owner';

  const groupId = group?.id ?? 0;
  const membersQuery = useQuery<ShoppingGroupMember[]>({
    queryKey: shoppingQueryKeys.groupMembers(groupId),
    queryFn: () => (groupId ? fetchGroupMembers(groupId) : Promise.resolve([])),
    enabled: isOpen && Boolean(group?.id),
    staleTime: 5_000,
  });

  const members = membersQuery.data ?? [];
  const isLoadingMembers = membersQuery.isLoading;

  if (!isOpen || !group) return null;

  const isArchived = Boolean(group.isArchived || group.archivedAt);
  const groupLists = lists.filter((l) => l.groupId === group.id);

  const filteredGroupLists = groupLists.filter((l) => {
    if (filterListStatus === 'open') return !l.isCompleted;
    if (filterListStatus === 'completed') return l.isCompleted;
    return true;
  });

  const handleRoleChange = async (userId: number, newRoleCode: string) => {
    setMemberError(null);
    queryClient.setQueriesData<ShoppingGroupMember[]>(
      { queryKey: shoppingQueryKeys.groupMembers(group.id) },
      (old) => (old || []).map((m) => (m.userId === userId ? { ...m, roleCode: newRoleCode } : m))
    );
    try {
      await updateGroupMemberRole(group.id, userId, newRoleCode);
    } catch (err: unknown) {
      setMemberError(extractErrorMessage(err, 'Errore nella modifica del ruolo.'));
    } finally {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.groupMembers(group.id) }),
        queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.groups() }),
      ]);
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!window.confirm('Sei sicuro di voler rimuovere questo collaboratore dal gruppo?')) return;
    setMemberError(null);
    queryClient.setQueriesData<ShoppingGroupMember[]>(
      { queryKey: shoppingQueryKeys.groupMembers(group.id) },
      (old) => (old || []).filter((m) => m.userId !== userId)
    );
    try {
      await removeGroupMember(group.id, userId);
    } catch (err: unknown) {
      setMemberError(extractErrorMessage(err, 'Errore nella rimozione del membro.'));
    } finally {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.groupMembers(group.id) }),
        queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.groups() }),
      ]);
    }
  };
  const handleDeleteConfirm = () => {
    onDeleteClick?.(group);
    setIsDeleteDialogOpen(false);
    onClose();
  };


  const headerActions = (
    <div className="flex items-center gap-1">
      {isOwner && (
        <>
          <button
            type="button"
            onClick={() => {
              if (isArchived) {
                onUnarchiveClick?.(group);
              } else {
                onArchiveClick?.(group);
              }
              onClose();
            }}
            className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
            title={isArchived ? 'Ripristina Gruppo' : 'Archivia Gruppo'}
          >
            <ArchiveIcon className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onEditClick?.(group);
            }}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
            title="Modifica Gruppo"
          >
            <EditIcon className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            title="Elimina Gruppo"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );

  const groupIcon = group.icon?.trim() || '👥';

  const sidePanel = (
    <div className="bg-white rounded-2xl shadow-2xl p-5 border border-gray-200 flex flex-col h-full max-h-[85vh] w-full">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
        <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
          <ShoppingIcon className="w-4 h-4 text-blue-600" />
          <span>Liste del Gruppo</span>
        </h4>

        <AddButton
          iconOnly={true}
          onClick={() => {
            onClose();
            onCreateListInGroup?.(group.id);
          }}
          label="Nuova Lista nel Gruppo"
        />
      </div>

      {/* Switcher Filtro Stato Liste */}
      <div className="flex rounded-lg bg-gray-100 p-0.5 text-xs mb-3">
        <button
          type="button"
          onClick={() => setFilterListStatus('all')}
          className={`flex-1 py-1 rounded-md font-medium transition cursor-pointer ${
            filterListStatus === 'all' ? 'bg-white text-blue-600 shadow-2xs' : 'text-gray-600'
          }`}
        >
          Tutte ({groupLists.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterListStatus('open')}
          className={`flex-1 py-1 rounded-md font-medium transition cursor-pointer ${
            filterListStatus === 'open' ? 'bg-white text-blue-600 shadow-2xs' : 'text-gray-600'
          }`}
        >
          Aperte ({groupLists.filter((l) => !l.isCompleted).length})
        </button>
        <button
          type="button"
          onClick={() => setFilterListStatus('completed')}
          className={`flex-1 py-1 rounded-md font-medium transition cursor-pointer ${
            filterListStatus === 'completed' ? 'bg-white text-blue-600 shadow-2xs' : 'text-gray-600'
          }`}
        >
          Completate ({groupLists.filter((l) => l.isCompleted).length})
        </button>
      </div>

      {/* Elenco Liste con click di selezione */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar min-h-[220px]">
        {filteredGroupLists.length === 0 ? (
          <p className="py-8 text-center text-xs text-gray-400">
            Nessuna lista trovata per questo filtro.
          </p>
        ) : (
          filteredGroupLists.map((l) => (
            <div
              key={l.id}
              onClick={() => {
                onSelectList?.(l.id);
                onClose();
              }}
              className="p-3 rounded-xl border border-gray-200 bg-gray-50/70 hover:bg-blue-50/70 hover:border-blue-300 transition cursor-pointer group"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-900 truncate">
                  {l.name}
                </p>
                {l.isCompleted ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                    <CheckCircleIcon className="w-3 h-3" />
                    Completata
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-gray-500 bg-white px-2 py-0.5 rounded-md border border-gray-100 shrink-0">
                    {l.openItemsCount ?? 0} da comprare
                  </span>
                )}
              </div>
              {l.description && (
                <p className="text-xs text-gray-400 truncate mt-1">{l.description}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <>
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Elimina Gruppo Spesa"
        message={`Sei sicuro di voler eliminare il gruppo "${group.name}"? Tutte le liste collegate resteranno o verranno dissociate.`}
        confirmText="Elimina"
        isDestructive={true}
        onCancel={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
      />

      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        title={
          <span className="flex items-center gap-2 text-base font-bold text-gray-800">
            <UsersIcon className="w-5 h-5 text-blue-600" />
            <span>Dettaglio Gruppo</span>
          </span>
        }
        headerActions={headerActions}
        sidePanel={sidePanel}
        maxWidthClass="max-w-lg"
      >
        <div className="space-y-4">
          {/* Info Principali Gruppo (Nome mostrato qui) */}
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center border border-blue-200 bg-blue-100 text-blue-700 text-xl font-extrabold shrink-0 shadow-2xs">
              {groupIcon}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-bold text-gray-900 truncate">{group.name}</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {group.description || 'Nessuna descrizione per questo gruppo.'}
              </p>
            </div>
          </div>

          {memberError && (
            <div className="rounded-xl bg-red-50 p-3 text-xs text-red-600 font-medium">
              {memberError}
            </div>
          )}

          {/* Sezione Membri e Collaboratori */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
                Membri ({members.length})
              </span>
              {canInvite && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenInvite?.(group);
                  }}
                  className="py-1 px-2.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition flex items-center gap-1 cursor-pointer"
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                  <span>Aggiungi Membro</span>
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
              {isLoadingMembers ? (
                <p className="py-6 text-center text-xs text-gray-400">Caricamento membri...</p>
              ) : members.length === 0 ? (
                <p className="py-6 text-center text-xs text-gray-400">Nessun membro trovato.</p>
              ) : (
                members.map((m) => {
                  const badgeClass = roleBadgeColor[m.roleCode] || roleBadgeColor.reader;

                  return (
                    <div
                      key={m.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/80 p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-gray-800">
                            {m.username}
                          </p>
                          <span
                            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeClass}`}
                          >
                            {m.roleDisplayName || m.roleCode}
                          </span>
                        </div>
                        {m.email && (
                          <p className="truncate text-xs text-gray-400">{m.email}</p>
                        )}
                      </div>

                      {isOwner && m.roleCode !== 'owner' && (
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="w-28">
                            <ShoppingRoleSelect
                              value={m.roleCode}
                              onChange={(newRole) => handleRoleChange(m.userId, newRole)}
                              compact={true}
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveMember(m.userId)}
                            className="p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition cursor-pointer"
                            title="Rimuovi dal gruppo"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      </BaseModal>
    </>
  );
};

export default ShoppingGroupDetailModal;
