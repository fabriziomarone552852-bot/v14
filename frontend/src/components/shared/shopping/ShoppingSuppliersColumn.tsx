// src/components/shared/shopping/ShoppingSuppliersColumn.tsx
import React, { useState } from 'react';
import { useShoppingMutations } from '@/hooks/shopping/useShoppingMutations';
import { useModal } from '@/hooks/useModals';
import { useConfirm } from '@/context/ConfirmContext';
import type {
  ConfigOption,
  ShoppingSupplierOption,
} from '@/types/shopping';
import {
  shoppingButtonPrimaryClass,
  shoppingButtonSecondaryClass,
  shoppingCardClass,
  shoppingInputClass,
} from './shoppingUi';

interface SupplierFormState {
  name: string;
  status_id: string;
}

interface ShoppingSuppliersColumnProps {
  suppliers: ShoppingSupplierOption[];
  supplierStatusOptions: ConfigOption[];
}

const makeEmptyForm = (): SupplierFormState => ({
  name: '',
  status_id: '',
});

const renderCatalogOptions = (options: ConfigOption[]) =>
  options.map((option) => (
    <option key={option.id} value={String(option.id)}>
      {option.displayName || option.codeName}
    </option>
  ));

const ShoppingSuppliersColumn: React.FC<ShoppingSuppliersColumnProps> = ({
  suppliers,
  supplierStatusOptions,
}) => {
  const mutations = useShoppingMutations();
  const { confirm } = useConfirm();
  const createModal = useModal<null>();
  const editModal = useModal<ShoppingSupplierOption>();

  const [form, setForm] = useState<SupplierFormState>(makeEmptyForm());
  const [editForm, setEditForm] = useState<SupplierFormState>(makeEmptyForm());

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    await mutations.createSupplier({
      name: form.name.trim(),
      statusId: form.status_id ? Number(form.status_id) : undefined,
    });

    setForm(makeEmptyForm());
    createModal.close();
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal.data) return;

    await mutations.updateSupplier({
      id: editModal.data.id,
      data: {
        name: editForm.name.trim(),
        statusId: editForm.status_id ? Number(editForm.status_id) : undefined,
      },
    });

    editModal.close();
  };

  const handleDelete = (supplier: ShoppingSupplierOption) => {
    confirm({
      title: 'Elimina fornitore',
      message: `Eliminare il fornitore "${supplier.name}"?`,
      confirmText: 'Elimina',
      isDestructive: true,
      onConfirm: async () => {
        await mutations.deleteSupplier(supplier.id);
      },
    });
  };

  const startEdit = (supplier: ShoppingSupplierOption) => {
    setEditForm({
      name: supplier.name,
      status_id: supplier.statusId == null ? '' : String(supplier.statusId),
    });
    editModal.open(supplier);
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="shrink-0 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700">
          Fornitori
        </h2>
        <button
          type="button"
          onClick={() => {
            setForm(makeEmptyForm());
            createModal.open(null);
          }}
          className={`${shoppingButtonSecondaryClass} text-xs cursor-pointer`}
        >
          + Nuovo
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto custom-scrollbar">
        {suppliers.length === 0 ? (
          <p className="py-4 text-center text-xs text-gray-400">
            Nessun fornitore.
          </p>
        ) : (
          suppliers.map((supplier) => (
            <div
              key={supplier.id}
              className={`${shoppingCardClass} flex items-center justify-between p-3`}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-800">
                  {supplier.name}
                </p>
                <p className="text-xs text-gray-400">ID: {supplier.id}</p>
              </div>

              <div className="ml-2 flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => startEdit(supplier)}
                  className="text-xs text-gray-400 hover:text-blue-500 cursor-pointer"
                  aria-label={`Modifica fornitore ${supplier.name}`}
                >
                  ✎
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(supplier)}
                  className="text-xs text-gray-400 hover:text-red-500 cursor-pointer"
                  aria-label={`Elimina fornitore ${supplier.name}`}
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {createModal.isOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-sm">
          <div className={`${shoppingCardClass} w-full max-w-md p-5 bg-white`}>
            <h2 className="mb-4 text-lg font-bold text-gray-900">Nuovo fornitore</h2>

            <form onSubmit={handleCreate} className="space-y-3">
              <input
                className={shoppingInputClass}
                placeholder="Nome fornitore"
                value={form.name}
                onChange={(e) =>
                  setForm((prev: SupplierFormState) => ({ ...prev, name: e.target.value }))
                }
                required
              />

              <select
                className={shoppingInputClass}
                value={form.status_id}
                onChange={(e) =>
                  setForm((prev: SupplierFormState) => ({ ...prev, status_id: e.target.value }))
                }
              >
                <option value="">Default backend</option>
                {renderCatalogOptions(supplierStatusOptions)}
              </select>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={createModal.close}
                  className={`${shoppingButtonSecondaryClass} cursor-pointer`}
                >
                  Annulla
                </button>
                <button type="submit" className={`${shoppingButtonPrimaryClass} cursor-pointer`}>
                  Crea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editModal.isOpen && editModal.data && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-sm">
          <div className={`${shoppingCardClass} w-full max-w-md p-5 bg-white`}>
            <h2 className="mb-4 text-lg font-bold text-gray-900">Modifica fornitore</h2>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <input
                className={shoppingInputClass}
                placeholder="Nome"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((prev: SupplierFormState) => ({ ...prev, name: e.target.value }))
                }
                required
              />

              <select
                className={shoppingInputClass}
                value={editForm.status_id}
                onChange={(e) =>
                  setEditForm((prev: SupplierFormState) => ({ ...prev, status_id: e.target.value }))
                }
              >
                <option value="">Default backend</option>
                {renderCatalogOptions(supplierStatusOptions)}
              </select>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={editModal.close}
                  className={`${shoppingButtonSecondaryClass} cursor-pointer`}
                >
                  Annulla
                </button>
                <button type="submit" className={`${shoppingButtonPrimaryClass} cursor-pointer`}>
                  Salva
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingSuppliersColumn;