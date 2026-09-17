import React from 'react';
import type { UseModalResult } from '@/hooks/useModals';
import type {
  ShoppingGroupSummary,
  ShoppingListSummary,
  ShoppingProductOption,
  ShoppingSupplierOption,
  ShoppingConfigBundle,
  ShoppingGroupCreatePayload,
} from '@/types/shopping';
import type { ListFormState } from '@/components/shared/shopping/ShoppingListModal';
import ShoppingGroupCreateModal from '@/components/shared/shopping/ShoppingGroupCreateModal';
import ShoppingQuickPriceModal from '@/components/archive/shopping/ShoppingQuickPriceModal';
import { ShoppingListModal } from '@/components/shared/shopping/ShoppingListModal';
import MobileShoppingGroupCreateModal from '@/mobile/components/modals/shopping/MobileShoppingGroupCreateModal';
import MobileShoppingQuickPriceModal from '@/mobile/components/modals/shopping/MobileShoppingQuickPriceModal';
import { MobileShoppingListModal } from '@/mobile/components/modals/shopping/MobileShoppingListModal';

interface ShoppingArchivePageModalsProps {
  isMobile: boolean;
  groupCreateModal: UseModalResult<null>;
  listCreateModal: UseModalResult<null>;
  quickPriceModal: UseModalResult<null>;
  groups: ShoppingGroupSummary[];
  lists?: ShoppingListSummary[];
  products: ShoppingProductOption[];
  brands: ShoppingSupplierOption[];
  suppliers: ShoppingSupplierOption[];
  config?: ShoppingConfigBundle | null;
  listForm: ListFormState;
  setListForm: React.Dispatch<React.SetStateAction<ListFormState>>;
  onCreateGroup: (data: ShoppingGroupCreatePayload) => Promise<unknown>;
  onCreateListSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

export const ShoppingArchivePageModals: React.FC<ShoppingArchivePageModalsProps> = ({
  isMobile,
  groupCreateModal,
  listCreateModal,
  quickPriceModal,
  groups,
  lists,
  products,
  brands,
  suppliers,
  config,
  listForm,
  setListForm,
  onCreateGroup,
  onCreateListSubmit,
}) => {
  return (
    <>
      {/* Modal Creazione Gruppo */}
      {groupCreateModal.isOpen && (
        isMobile ? (
          <MobileShoppingGroupCreateModal
            isOpen={true}
            onClose={groupCreateModal.close}
            onSubmit={async (data) => {
              await onCreateGroup(data);
              groupCreateModal.close();
            }}
          />
        ) : (
          <ShoppingGroupCreateModal
            isOpen={true}
            onClose={groupCreateModal.close}
            onSubmit={async (data) => {
              await onCreateGroup(data);
              groupCreateModal.close();
            }}
          />
        )
      )}

      {/* Modal Creazione Lista */}
      {listCreateModal.isOpen && (
        isMobile ? (
          <MobileShoppingListModal
            title="Nuova Lista Spesa"
            form={listForm}
            setForm={setListForm}
            groups={groups}
            onClose={listCreateModal.close}
            onSubmit={onCreateListSubmit}
            submitLabel="Crea Lista"
          />
        ) : (
          <ShoppingListModal
            title="Nuova Lista Spesa"
            form={listForm}
            setForm={setListForm}
            groups={groups}
            onClose={listCreateModal.close}
            onSubmit={onCreateListSubmit}
            submitLabel="Crea Lista"
          />
        )
      )}

      {/* Modal Aggiunta Rapida Prezzi */}
      {quickPriceModal.isOpen && (
        isMobile ? (
          <MobileShoppingQuickPriceModal
            isOpen={true}
            onClose={quickPriceModal.close}
            lists={lists}
            products={products}
            brands={brands}
            suppliers={suppliers}
            unitOptions={config?.unitOptions}
          />
        ) : (
          <ShoppingQuickPriceModal
            isOpen={true}
            onClose={quickPriceModal.close}
            lists={lists}
            products={products}
            brands={brands}
            suppliers={suppliers}
            unitOptions={config?.unitOptions}
          />
        )
      )}
    </>
  );
};
