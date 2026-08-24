// src/components/shared/shopping/ShoppingListModal.tsx
import React from 'react';
import type { ShoppingGroupSummary } from '@/types/shopping';
import BaseModal from '@/components/shared/dialog/BaseModal';
import { ShoppingIcon } from '@/components/shared/utils/Icons';
import ShoppingDestinationSelect from './ShoppingDestinationSelect';

export interface ListFormState {
  destinationValue: string; // "" = Personale/Privata, oppure String(groupId)
  name: string;
  description: string;
}

export const makeEmptyForm = (defaultDestination = ''): ListFormState => ({
  destinationValue: defaultDestination,
  name: '',
  description: '',
});

export interface ShoppingListModalProps {
  title: string;
  form: ListFormState;
  setForm: React.Dispatch<React.SetStateAction<ListFormState>>;
  groups: ShoppingGroupSummary[];
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void> | void;
  submitLabel: string;
}

export const ShoppingListModal: React.FC<ShoppingListModalProps> = ({
  title,
  form,
  setForm,
  groups,
  onClose,
  onSubmit,
  submitLabel,
}) => {
  return (
    <BaseModal
      isOpen={true}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2 text-base font-bold text-gray-800">
          <ShoppingIcon className="w-5 h-5 text-blue-600" />
          <span>{title}</span>
        </span>
      }
      formId="shopping-list-form"
      confirmText={submitLabel}
      cancelText="Annulla"
      maxWidthClass="max-w-md"
      overflowVisible={true}
    >
      <form id="shopping-list-form" onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
            Nome Lista
          </label>
          <input
            type="text"
            placeholder="es. Spesa Settimanale, Brico, Festa"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-colors"
            required
            autoFocus
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
            Descrizione
          </label>
          <textarea
            rows={2}
            placeholder="Note o dettagli sulla lista"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
            Condivisione (Gruppo o Privata)
          </label>
          <ShoppingDestinationSelect
            value={form.destinationValue}
            onChange={(val) => setForm((prev) => ({ ...prev, destinationValue: val }))}
            groups={groups}
          />
          <p className="text-[11px] text-gray-400 mt-1">
            {form.destinationValue
              ? 'Questa lista sarà visibile a tutti i collaboratori del gruppo selezionato.'
              : 'Lista privata accessibile esclusivamente da te.'}
          </p>
        </div>
      </form>
    </BaseModal>
  );
};
