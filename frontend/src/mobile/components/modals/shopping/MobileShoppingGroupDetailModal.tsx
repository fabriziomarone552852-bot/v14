// src/mobile/components/modals/shopping/MobileShoppingGroupDetailModal.tsx
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { ShoppingGroupSummary, ShoppingGroupMember, ShoppingListSummary } from '@/types/shopping';
import MobileBaseModal from '../MobileBaseModal';
import ConfirmDialog from '@/components/shared/dialog/ConfirmDialog';
import {
  UsersIcon,
  EditIcon,
  TrashIcon,
  ArchiveIcon,
  PlusIcon,
  ShoppingIcon,
} from '@/components/shared/utils/Icons';
import { fetchGroupMembers, updateGroupMemberRole, removeGroupMember, shoppingQueryKeys } from '@/api/shoppingApi';
import { extractErrorMessage } from '@/utils/errorUtils';
import ShoppingRoleSelect from '@/components/shared/shopping/ShoppingRoleSelect';
import { getRoleBadgeClass } from '@/components/shared/shopping/shoppingUi';

interface MobileShoppingGroupDetailModalProps {
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

export const MobileShoppingGroupDetailModal: React.FC<MobileShoppingGroupDetailModalProps> = ({
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

  const openListsCount = groupLists.filter((l) => !l.isCompleted).length;
  const completedListsCount = groupLists.filter((l) => l.isCompleted).length;

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
            className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
            title={isArchived ? 'Ripristina Gruppo' : 'Archivia Gruppo'}
          >
            <ArchiveIcon className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => {
              onEditClick?.(group);
            }}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
            title="Modifica Gruppo"
          >
            <EditIcon className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            title="Elimina Gruppo"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );

  return (
    <>
      <MobileBaseModal
        isOpen={isOpen}
        onClose={onClose}
        title={
          <div className="flex items-center gap-2">
            <span className="text-xl">{group.icon || '👥'}</span>
            <span className="truncate">{group.name}</span>
          </div>
        }
        headerActions={headerActions}
      >
        <div className="h-full flex flex-col gap-3 max-w-lg mx-auto overflow-hidden">
          
          {/* Badge Stato e Ruolo */}
          <div className="shrink-0 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${getRoleBadgeClass(
                  currentUserRole
                )}`}
              >
                Tuo Ruolo: {currentUserRole.toUpperCase()}
              </span>
              {isArchived && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  Archiviato
                </span>
              )}
            </div>

            {/* Descrizione Gruppo */}
            {group.description && (
              <div className="bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-xs text-gray-600">
                {group.description}
              </div>
            )}
          </div>

          {/* SEZIONE 1: LISTE NEL GRUPPO (50% Spazio con scroll interno) */}
          <div className="flex-1 min-h-[160px] flex flex-col bg-white border border-gray-200 rounded-2xl p-3.5 shadow-2xs overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingIcon className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  {groupLists.length === 1 ? '1 Lista nel gruppo' : `${groupLists.length} Liste nel gruppo`}
                </h4>
              </div>

              {canInvite && onCreateListInGroup && (
                <button
                  type="button"
                  onClick={() => {
                    onCreateListInGroup(group.id);
                  }}
                  className="px-2.5 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  + Nuova Lista
                </button>
              )}
            </div>

            {/* Filtro Stato Liste */}
            {groupLists.length > 0 && (
              <div className="flex gap-1 p-1 bg-gray-100 rounded-xl my-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setFilterListStatus('all')}
                  className={`flex-1 py-1 px-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    filterListStatus === 'all'
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <span>Tutte</span>
                  <span
                    className={`min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full text-[10px] font-extrabold ${
                      filterListStatus === 'all'
                        ? 'bg-gray-200 text-gray-800'
                        : 'bg-gray-200/70 text-gray-600'
                    }`}
                  >
                    {groupLists.length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setFilterListStatus('open')}
                  className={`flex-1 py-1 px-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    filterListStatus === 'open'
                      ? 'bg-white text-amber-700 shadow-xs'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <span>Aperte</span>
                  <span
                    className={`min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full text-[10px] font-extrabold ${
                      filterListStatus === 'open'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-gray-200/70 text-gray-600'
                    }`}
                  >
                    {openListsCount}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setFilterListStatus('completed')}
                  className={`flex-1 py-1 px-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    filterListStatus === 'completed'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <span>Completate</span>
                  <span
                    className={`min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full text-[10px] font-extrabold ${
                      filterListStatus === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-gray-200/70 text-gray-600'
                    }`}
                  >
                    {completedListsCount}
                  </span>
                </button>
              </div>
            )}

            {/* Elenco Liste */}
            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar space-y-1.5 pr-0.5">
              {filteredGroupLists.length === 0 ? (
                <p className="text-xs text-gray-400 italic py-4 text-center">
                  Nessuna lista trovata per questo filtro.
                </p>
              ) : (
                filteredGroupLists.map((list) => {
                  const isListEmpty =
                    (list.openItemsCount ?? 0) === 0 && (list.purchasedItemsCount ?? 0) === 0;

                  return (
                    <div
                      key={list.id}
                      onClick={() => {
                        onSelectList?.(list.id);
                        onClose();
                      }}
                      className="p-3 bg-gray-50 hover:bg-blue-50/50 border border-gray-200/80 hover:border-blue-300 rounded-xl flex items-center justify-between gap-3 transition-colors cursor-pointer select-none active:scale-[0.99]"
                    >
                      {/* Sinistra: Titolo Lista e badge completata */}
                      <div className="min-w-0 flex-1 flex items-center gap-1.5">
                        <span className="text-xs font-bold text-gray-900 truncate">{list.name}</span>
                        {list.isCompleted && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-semibold shrink-0">
                            ✓
                          </span>
                        )}
                      </div>

                      {/* Destra: Articoli o Vuota all'estrema destra sulla stessa riga */}
                      <div className="shrink-0 text-right">
                        <span className="text-[11px] text-gray-500 font-medium">
                          {isListEmpty
                            ? 'Vuota'
                            : `${list.openItemsCount} da comprare • ${list.purchasedItemsCount} presi`}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* SEZIONE 2: COLLABORATORI & MEMBRI (50% Spazio con scroll interno) */}
          <div className="flex-1 min-h-[160px] flex flex-col bg-white border border-gray-200 rounded-2xl p-3.5 shadow-2xs overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2">
                <UsersIcon className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  {members.length === 1 ? '1 Collaboratore' : `${members.length} Collaboratori`}
                </h4>
              </div>

              {canInvite && onOpenInvite && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenInvite(group);
                  }}
                  className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                  <span>Aggiungi</span>
                </button>
              )}
            </div>

            {memberError && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 mb-2 shrink-0">
                {memberError}
              </div>
            )}

            {/* Elenco Membri */}
            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar space-y-2 pr-0.5 pt-1">
              {isLoadingMembers ? (
                <p className="text-xs text-gray-400 italic py-4 text-center">Caricamento membri...</p>
              ) : members.length === 0 ? (
                <p className="text-xs text-gray-400 italic py-4 text-center">Nessun membro nel gruppo.</p>
              ) : (
                members.map((member) => {
                  const memberIsOwner = member.roleCode === 'owner';
                  return (
                    <div
                      key={member.id}
                      className="p-2.5 bg-gray-50 border border-gray-200/80 rounded-xl flex items-center justify-between gap-2 relative"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-gray-900 truncate">
                            {member.username}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase ${getRoleBadgeClass(
                              member.roleCode
                            )}`}
                          >
                            {member.roleDisplayName || member.roleCode}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400 block truncate mt-0.5">
                          {member.email}
                        </span>
                      </div>

                      {/* Azioni Membro (solo se Owner e non è se stesso) */}
                      {isOwner && !memberIsOwner && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <ShoppingRoleSelect
                            value={member.roleCode}
                            onChange={(newRole) => handleRoleChange(member.userId, newRole)}
                            compact
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(member.userId)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Rimuovi membro"
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
      </MobileBaseModal>

      {/* Dialog Conferma Eliminazione Gruppo */}
      {isDeleteDialogOpen && (
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          title="Elimina Gruppo Spesa"
          message={`Sei sicuro di voler eliminare definitivamente il gruppo "${group.name}" e tutte le sue liste? L'operazione non può essere annullata.`}
          confirmText="Elimina Definitivamente"
          cancelText="Annulla"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setIsDeleteDialogOpen(false)}
        />
      )}
    </>
  );
};

export default MobileShoppingGroupDetailModal;
