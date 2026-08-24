// src/components/shared/shopping/ShoppingListsColumn.tsx
import React, { useEffect, useId, useMemo, useState } from 'react';
import { useShoppingMutations } from '@/hooks/shopping/useShoppingMutations';
import { useModal } from '@/hooks/useModals';
import type { ConfigOption, ShoppingGroupSummary, ShoppingListSummary } from '@/types/shopping';
import { shoppingButtonPrimaryClass, shoppingButtonSecondaryClass, shoppingCardClass, shoppingInputClass } from './shoppingUi';
import { AddButton } from '@/components/shared/utils/AddButton';
import { ShoppingIcon, LockIcon, UsersIcon, CheckCircleIcon } from '@/components/shared/utils/Icons';
import ShoppingListDetailModal from './ShoppingListDetailModal';

interface ListFormState {
  destinationValue: string; // "" = Personale/Privata, oppure String(groupId)
  name: string;
  description: string;
}

interface ShoppingListsColumnProps {
  lists: ShoppingListSummary[];
  loadingLists: boolean;
  activeListId: number | null;
  setActiveListId: (id: number | null) => void;
  groups: ShoppingGroupSummary[];
  listVisibilityOptions: ConfigOption[];
  listStatusOptions: ConfigOption[];
  className?: string;
}

const makeEmptyForm = (): ListFormState => ({
  destinationValue: '',
  name: '',
  description: '',
});

interface ListModalProps {
  title: string;
  form: ListFormState;
  setForm: React.Dispatch<React.SetStateAction<ListFormState>>;
  groups: ShoppingGroupSummary[];
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void> | void;
  submitLabel: string;
}

const ListModal: React.FC<ListModalProps> = ({
  title,
  form,
  setForm,
  groups,
  onClose,
  onSubmit,
  submitLabel,
}) => {
  const titleId = useId();
  const nameId = useId();
  const descriptionId = useId();
  const destinationId = useId();

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" aria-labelledby={titleId} className={`${shoppingCardClass} w-full max-w-md p-6 bg-white shadow-2xl rounded-2xl`}>
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
          <h2 id={titleId} className="text-base font-bold text-gray-900 flex items-center gap-2">
            <ShoppingIcon className="w-5 h-5 text-blue-600" />
            <span>{title}</span>
          </h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer">
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor={nameId} className="mb-1 block text-xs font-semibold text-gray-700">
              Nome lista
            </label>
            <input
              id={nameId}
              className={shoppingInputClass}
              placeholder="es. Spesa Settimanale, Farmacia, Fai da te"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
              autoFocus
            />
          </div>

          <div>
            <label htmlFor={descriptionId} className="mb-1 block text-xs font-semibold text-gray-700">
              Descrizione o Note
            </label>
            <input
              id={descriptionId}
              className={shoppingInputClass}
              placeholder="es. Da fare sabato mattina"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />
          </div>

          <div>
            <label htmlFor={destinationId} className="mb-1 block text-xs font-semibold text-gray-700">
              Condivisione
            </label>
            <select
              id={destinationId}
              className={shoppingInputClass}
              value={form.destinationValue}
              onChange={(e) => setForm((p) => ({ ...p, destinationValue: e.target.value }))}
            >
              <option value="">Privata</option>
              {groups.map((group) => (
                <option key={group.id} value={String(group.id)}>
                  Gruppo: {group.name}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-gray-400 mt-1">
              {form.destinationValue
                ? 'Questa lista sarà visibile a tutti i collaboratori del gruppo selezionato.'
                : 'Lista privata accessibile esclusivamente da te.'}
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className={`${shoppingButtonSecondaryClass} cursor-pointer`}>Annulla</button>
            <button type="submit" className={`${shoppingButtonPrimaryClass} cursor-pointer`}>{submitLabel}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ShoppingListsColumn: React.FC<ShoppingListsColumnProps> = ({
  lists,
  loadingLists,
  activeListId,
  setActiveListId,
  groups,
  listVisibilityOptions,
  listStatusOptions,
  className = '',
}) => {
  const mutations = useShoppingMutations();
  const createModal = useModal<null>();
  const editModal = useModal<ShoppingListSummary>();
  const detailModal = useModal<ShoppingListSummary>();

  const [form, setForm] = useState<ListFormState>(makeEmptyForm);
  const [editForm, setEditForm] = useState<ListFormState>(makeEmptyForm);

  const groupVisibilityId = useMemo(() => {
    const opt = listVisibilityOptions.find((o) => o.codeValue?.toLowerCase() === 'group' || o.codeName?.toLowerCase() === 'group');
    return opt ? Number(opt.id) : 2;
  }, [listVisibilityOptions]);

  const privateVisibilityId = useMemo(() => {
    const opt = listVisibilityOptions.find((o) => o.codeValue?.toLowerCase() === 'private' || o.codeName?.toLowerCase() === 'private');
    return opt ? Number(opt.id) : 1;
  }, [listVisibilityOptions]);

  const activeStatusId = useMemo(() => {
    const opt = listStatusOptions.find((o) => o.codeValue?.toLowerCase() === 'active' || o.codeName?.toLowerCase() === 'active');
    return opt ? Number(opt.id) : undefined;
  }, [listStatusOptions]);

  const openCreateModal = () => {
    setForm(makeEmptyForm());
    createModal.open(null);
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedName = form.name.trim();
    if (!trimmedName) return;

    const isGroup = Boolean(form.destinationValue);
    const visibilityId = isGroup ? groupVisibilityId : privateVisibilityId;
    const groupId = isGroup ? Number(form.destinationValue) : null;

    const newList = await mutations.createList({
      name: trimmedName,
      description: form.description.trim() || undefined,
      groupId,
      visibilityId,
      statusId: activeStatusId,
      isCompleted: false,
    });

    if (newList?.id) {
      setActiveListId(newList.id);
    }

    setForm(makeEmptyForm());
    createModal.close();
  };

  const handleSaveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editModal.data) return;
    const trimmedName = editForm.name.trim();
    if (!trimmedName) return;

    const isGroup = Boolean(editForm.destinationValue);
    const visibilityId = isGroup ? groupVisibilityId : privateVisibilityId;
    const groupId = isGroup ? Number(editForm.destinationValue) : null;

    await mutations.updateList({
      id: editModal.data.id,
      data: {
        name: trimmedName,
        description: editForm.description.trim() || undefined,
        groupId,
        visibilityId,
      },
    });

    editModal.close();
  };

  const handleDeleteList = async (list: ShoppingListSummary) => {
    await mutations.deleteList(list.id);
    if (activeListId === list.id) {
      const remaining = lists.filter((l) => l.id !== list.id);
      setActiveListId(remaining[0]?.id ?? null);
    }
  };

  const handleToggleComplete = async (list: ShoppingListSummary, isCompleted: boolean) => {
    await mutations.updateList({
      id: list.id,
      data: { isCompleted },
    });
    detailModal.close();
  };

  const handleListClick = (list: ShoppingListSummary) => {
    if (activeListId === list.id) {
      detailModal.open(list);
    } else {
      setActiveListId(list.id);
    }
  };

  const handleOpenEditFromDetail = (list: ShoppingListSummary) => {
    setEditForm({
      name: list.name,
      description: list.description ?? '',
      destinationValue: list.groupId ? String(list.groupId) : '',
    });
    editModal.open(list);
  };

  return (
    <div className={`h-full min-h-0 flex flex-col justify-between ${className}`}>
      <div className="flex flex-col flex-1 min-h-0 w-full min-w-0">
        {/* Header Section nello stile TaskColumn con badge al centro */}
        <div className="flex items-center border-b pb-2 mb-3 shrink-0 w-full">
          <h3 className="text-lg font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
            <ShoppingIcon className="w-5 h-5 text-gray-500" />
            <span>Liste Spesa</span>
          </h3>
          
          {/* Numero posizionato al centro dello spazio rimanente */}
          <div className="flex-1 flex justify-center">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200 shadow-2xs">
              {lists.length}
            </span>
          </div>
        </div>

        {/* List Section con padding per evitare tagli ai bordi */}
        <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 w-full min-w-0 p-1 pr-1.5 custom-scrollbar">
          {loadingLists ? (
            <p className="py-6 text-center text-xs text-gray-400 animate-pulse">Caricamento liste...</p>
          ) : lists.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-400">
              <p className="font-semibold text-gray-500">Nessuna lista trovata</p>
              <p className="mt-1">Crea la tua prima lista spesa con il tasto qui sotto.</p>
            </div>
          ) : (
            lists.map((list) => {
              const isActive = activeListId === list.id;
              const isGroupList = Boolean(list.groupId || list.groupName);

              return (
                <div
                  key={list.id}
                  onClick={() => handleListClick(list)}
                  className={`w-full flex items-center justify-between group cursor-pointer border min-h-[58px] p-3 rounded-xl shadow-xs transition-all gap-2 ${
                    isActive
                      ? 'bg-blue-50/70 border-blue-400 ring-1 ring-blue-400 shadow-sm'
                      : 'bg-gray-50 border-gray-200 hover:border-blue-300 hover:bg-white'
                  }`}
                  title={isActive ? 'Clicca di nuovo per aprire i dettagli della lista' : list.name}
                >
                  <div className="min-w-0 flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <p className={`truncate text-sm font-semibold ${isActive ? 'text-blue-950' : 'text-gray-800'}`}>
                        {list.name}
                      </p>
                    </div>

                    {list.description && (
                      <p className="truncate text-xs text-gray-400 mt-0.5">{list.description}</p>
                    )}

                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                      {list.isCompleted ? (
                        <span className="inline-flex items-center gap-1 font-medium px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircleIcon className="w-3 h-3 text-emerald-600" />
                          <span>Completata</span>
                        </span>
                      ) : null}

                      {isGroupList ? (
                        <span className="inline-flex items-center gap-1 font-medium px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                          <UsersIcon className="w-3 h-3 text-blue-600" />
                          <span>{list.groupName || 'Gruppo'}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-medium px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-600 border border-gray-200">
                          <LockIcon className="w-3 h-3 text-gray-400" />
                          <span>Privata</span>
                        </span>
                      )}

                      <span className="font-semibold text-gray-500 px-1.5 py-0.5 rounded-md bg-white border border-gray-100">
                        {list.openItemsCount ?? 0} da comprare
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer Section nello stile TaskColumn */}
      <div className="flex flex-col gap-2 mt-3 shrink-0">
        <AddButton
          label="Nuova Lista"
          onClick={openCreateModal}
        />
      </div>

      {/* Modal Dettaglio Lista Spesa (Stile TaskDetailModal) */}
      <ShoppingListDetailModal
        isOpen={detailModal.isOpen}
        onClose={detailModal.close}
        list={detailModal.data}
        onEditClick={handleOpenEditFromDetail}
        onDeleteClick={handleDeleteList}
        onToggleComplete={handleToggleComplete}
        canEdit={detailModal.data?.canEdit ?? true}
        canDelete={detailModal.data?.canDelete ?? true}
      />

      {/* Modal Creazione Lista */}
      {createModal.isOpen && (
        <ListModal
          title="Nuova Lista Spesa"
          form={form}
          setForm={setForm}
          groups={groups}
          onClose={createModal.close}
          onSubmit={handleCreate}
          submitLabel="Crea Lista"
        />
      )}

      {/* Modal Modifica Lista */}
      {editModal.isOpen && editModal.data && (
        <ListModal
          title="Modifica Lista Spesa"
          form={editForm}
          setForm={setEditForm}
          groups={groups}
          onClose={editModal.close}
          onSubmit={handleSaveEdit}
          submitLabel="Salva Modifiche"
        />
      )}
    </div>
  );
};

export default ShoppingListsColumn;