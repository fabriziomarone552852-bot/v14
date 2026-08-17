// src/components/shared/shopping/ShoppingGroupMembersModal.tsx
import React, { useEffect, useState } from 'react';
import { fetchGroupMembers, updateGroupMemberRole, removeGroupMember } from '@/api/shoppingApi';
import type { ShoppingGroupMember } from '@/types/shopping';
import { shoppingButtonPrimaryClass, shoppingButtonSecondaryClass } from './shoppingUi';

interface ShoppingGroupMembersModalProps {
  isOpen: boolean;
  groupId: number | null;
  groupName: string;
  currentUserRole?: string; // 'owner' | 'admin' | 'editor' | 'reader'
  onClose: () => void;
  onOpenInvite: () => void;
}

const roleBadgeColor: Record<string, string> = {
  owner: 'bg-purple-100 text-purple-800 border-purple-200',
  admin: 'bg-blue-100 text-blue-800 border-blue-200',
  editor: 'bg-green-100 text-green-800 border-green-200',
  reader: 'bg-gray-100 text-gray-700 border-gray-200',
};

const ShoppingGroupMembersModal: React.FC<ShoppingGroupMembersModalProps> = ({
  isOpen,
  groupId,
  groupName,
  currentUserRole = 'reader',
  onClose,
  onOpenInvite,
}) => {
  const [members, setMembers] = useState<ShoppingGroupMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionUserId, setActionUserId] = useState<number | null>(null);

  const canInvite = currentUserRole === 'owner' || currentUserRole === 'admin';
  const isOwner = currentUserRole === 'owner';

  const loadMembers = async () => {
    if (!groupId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchGroupMembers(groupId);
      setMembers(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Errore nel caricamento dei membri.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && groupId) {
      loadMembers();
    }
  }, [isOpen, groupId]);

  if (!isOpen || !groupId) return null;

  const handleRoleChange = async (userId: number, newRoleCode: string) => {
    setActionUserId(userId);
    setError(null);
    try {
      await updateGroupMemberRole(groupId, userId, newRoleCode);
      await loadMembers();
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Errore nella modifica del ruolo.');
    } finally {
      setActionUserId(null);
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!window.confirm('Sei sicuro di voler rimuovere questo collaboratore dal gruppo spesa?')) return;
    setActionUserId(userId);
    setError(null);
    try {
      await removeGroupMember(groupId, userId);
      await loadMembers();
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Errore nella rimozione del membro.');
    } finally {
      setActionUserId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl transition-all max-h-[90vh] flex flex-col">
        <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-gray-800">👥 Collaboratori Gruppo</h3>
            <p className="text-xs text-gray-500">
              Gruppo: <span className="font-semibold text-blue-600">{groupName}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {error ? (
          <div className="mb-4 shrink-0 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600">
            {error}
          </div>
        ) : null}

        <div className="mb-3 shrink-0 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Membri attivi ({members.length})
          </span>
          {canInvite ? (
            <button
              type="button"
              onClick={onOpenInvite}
              className={`${shoppingButtonPrimaryClass} text-xs py-1.5 px-3`}
            >
              + Invita Collaboratore
            </button>
          ) : null}
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[200px]">
          {isLoading ? (
            <div className="py-8 text-center text-xs text-gray-400">Caricamento membri in corso...</div>
          ) : members.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400">Nessun membro collaboratore trovato.</div>
          ) : (
            members.map((m) => {
              const badgeClass = roleBadgeColor[m.roleCode] || roleBadgeColor.reader;

              return (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/70 p-3 transition hover:bg-gray-50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-gray-800">{m.username}</p>
                      <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeClass}`}>
                        {m.roleDisplayName || m.roleCode}
                      </span>
                    </div>
                    {m.email ? <p className="truncate text-xs text-gray-500">{m.email}</p> : null}
                  </div>

                  {isOwner && m.roleCode !== 'owner' ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={m.roleCode}
                        onChange={(e) => handleRoleChange(m.userId, e.target.value)}
                        disabled={actionUserId === m.userId}
                        className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none"
                      >
                        <option value="admin">Admin</option>
                        <option value="editor">Editor</option>
                        <option value="reader">Lettore</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => handleRemoveMember(m.userId)}
                        disabled={actionUserId === m.userId}
                        className="rounded-lg p-1.5 text-xs text-red-500 hover:bg-red-50 hover:text-red-700 transition"
                        title="Rimuovi dal gruppo"
                      >
                        🗑️
                      </button>
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </div>

        <div className="mt-4 shrink-0 border-t border-gray-100 pt-3 flex justify-end">
          <button type="button" onClick={onClose} className={shoppingButtonSecondaryClass}>
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShoppingGroupMembersModal;
