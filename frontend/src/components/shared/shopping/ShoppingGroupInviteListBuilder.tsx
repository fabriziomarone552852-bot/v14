// src/components/shared/shopping/ShoppingGroupInviteListBuilder.tsx
import React, { useState } from 'react';
import type { PendingGroupInvite } from '@/types/shopping';
import ShoppingRoleSelect from './ShoppingRoleSelect';
import { getRoleBadgeClass } from './shoppingUi';
import { MailIcon, UsersIcon, PlusIcon, TrashIcon } from '@/components/shared/utils/Icons';

interface ShoppingGroupInviteListBuilderProps {
  invites: PendingGroupInvite[];
  onChange: (invites: PendingGroupInvite[]) => void;
  currentUserRole?: string;
  onError?: (msg: string | null) => void;
  inputPlaceholder?: string;
}

export const ShoppingGroupInviteListBuilder: React.FC<ShoppingGroupInviteListBuilderProps> = ({
  invites,
  onChange,
  currentUserRole = 'owner',
  onError,
  inputPlaceholder = 'Inserisci username o email...',
}) => {
  const [inputVal, setInputVal] = useState('');
  const [roleCode, setRoleCode] = useState<string>('editor');

  const isOwner = currentUserRole === 'owner';
  const effectiveRoleCode = !isOwner && roleCode === 'admin' ? 'editor' : roleCode;

  const handleAdd = () => {
    const clean = inputVal.trim();
    if (!clean) return;

    if (invites.some((inv) => inv.value.toLowerCase() === clean.toLowerCase())) {
      onError?.('Questo utente o email è già presente nella lista.');
      return;
    }

    const isEmail = clean.includes('@');
    const type: 'username' | 'email' = isEmail ? 'email' : 'username';

    onChange([
      ...invites,
      { type, value: clean, roleCode: effectiveRoleCode },
    ]);
    setInputVal('');
    onError?.(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleRemove = (index: number) => {
    onChange(invites.filter((_, i) => i !== index));
    onError?.(null);
  };

  return (
    <div className="space-y-3">
      {/* Barra di inserimento: Input + Selezione Ruolo + Bottone Aggiungi */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-colors"
            placeholder={inputPlaceholder}
            value={inputVal}
            onChange={(e) => {
              setInputVal(e.target.value);
              onError?.(null);
            }}
            onKeyDown={handleKeyDown}
          />
          <span className="absolute left-3 top-2.5 text-gray-400">
            {inputVal.includes('@') ? (
              <MailIcon className="w-4 h-4 text-blue-500" />
            ) : (
              <UsersIcon className="w-4 h-4" />
            )}
          </span>
        </div>

        <div className="w-36 shrink-0">
          <ShoppingRoleSelect
            value={effectiveRoleCode}
            onChange={setRoleCode}
            compact={true}
          />
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="h-[38px] px-3.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs"
          title="Aggiungi collaboratore alla lista"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Aggiungi</span>
        </button>
      </div>

      {/* Lista collaboratori pronti per essere salvati/invitati */}
      {invites.length > 0 && (
        <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar p-1">
          {invites.map((inv, index) => {
            const badgeClass = getRoleBadgeClass(inv.roleCode);
            const roleLabel =
              inv.roleCode === 'admin'
                ? 'Amministratore'
                : inv.roleCode === 'editor'
                ? 'Editor'
                : 'Lettore';

            return (
              <div
                key={`${inv.value}-${index}`}
                className="flex items-center justify-between p-2.5 bg-gray-50/80 hover:bg-gray-100/70 border border-gray-200 rounded-xl text-xs transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                  <div className="w-6 h-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 shrink-0">
                    {inv.type === 'email' ? (
                      <MailIcon className="w-3.5 h-3.5 text-blue-500" />
                    ) : (
                      <UsersIcon className="w-3.5 h-3.5 text-gray-600" />
                    )}
                  </div>
                  <span className="font-semibold text-gray-800 truncate">{inv.value}</span>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider shrink-0">
                    ({inv.type})
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2 py-0.5 rounded-md font-medium border text-[11px] ${badgeClass}`}>
                    {roleLabel}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Rimuovi"
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ShoppingGroupInviteListBuilder;

