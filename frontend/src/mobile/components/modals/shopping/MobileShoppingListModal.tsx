// src/mobile/components/modals/shopping/MobileShoppingListModal.tsx
import React from 'react';
import type { ShoppingGroupSummary } from '@/types/shopping';
import MobileBaseModal from '../MobileBaseModal';
import { ShoppingIcon } from '@/components/shared/utils/Icons';
import ShoppingDestinationSelect from '@/components/shared/shopping/ShoppingDestinationSelect';
import type { ListFormState } from '@/components/shared/shopping/ShoppingListModal';

interface MobileShoppingListModalProps {
  title: string;
  form: ListFormState;
  setForm: React.Dispatch<React.SetStateAction<ListFormState>>;
  groups: ShoppingGroupSummary[];
  isDefault?: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void> | void;
  submitLabel: string;
  zIndexClass?: string;
}

export const MobileShoppingListModal: React.FC<MobileShoppingListModalProps> = ({
  title,
  form,
  setForm,
  groups,
  isDefault = false,
  onClose,
  onSubmit,
  submitLabel,
  zIndexClass = 'z-[10010]',
}) => {
  return (
    <MobileBaseModal
      isOpen={true}
      onClose={onClose}
      zIndexClass={zIndexClass}
      title={
        <div className="flex items-center gap-2">
          <ShoppingIcon className="w-5 h-5 text-blue-600" />
          <span>{title}</span>
        </div>
      }
      formId="mobile-shopping-list-form"
      confirmText={submitLabel}
      cancelText="Annulla"
      isConfirmDisabled={!form.name.trim()}
    >
      <form id="mobile-shopping-list-form" onSubmit={onSubmit} className="space-y-4 max-w-lg mx-auto pb-6">
        
        {/* Nome Lista */}
        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
            Nome Lista
          </label>
          <input
            type="text"
            required
            autoFocus
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Es. Spesa Settimanale, Brico, Farmacia..."
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        {/* Destinazione / Gruppo */}
        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
            Destinazione Lista
          </label>
          <div className={isDefault ? 'pointer-events-none opacity-60' : ''}>
            <ShoppingDestinationSelect
              value={form.destinationValue}
              onChange={(val) => setForm((p) => ({ ...p, destinationValue: val }))}
              groups={groups}
            />
          </div>
          {isDefault && (
            <p className="text-[11px] text-gray-400 mt-1">
              La lista predefinita non può cambiare gruppo.
            </p>
          )}
        </div>

        {/* Descrizione Lista */}
        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
            Descrizione
          </label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            placeholder="Aggiungi una nota o descrizione per questa lista..."
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white resize-none"
          />
        </div>

      </form>
    </MobileBaseModal>
  );
};

export default MobileShoppingListModal;
