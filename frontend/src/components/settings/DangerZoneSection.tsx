// src/components/settings/DangerZoneSection.tsx
import React from 'react';
import { useConfirm } from '@/context/ConfirmContext';

interface DangerZoneSectionProps {
  onDeactivateAccount: () => Promise<void>;
  isDeleting?: boolean;
}

export const DangerZoneSection: React.FC<DangerZoneSectionProps> = ({
  onDeactivateAccount,
  isDeleting = false,
}) => {
  const { confirm } = useConfirm();

  const handleConfirmDeactivate = () => {
    confirm({
      title: 'Disattivare l\'account?',
      message: (
        <div className="space-y-2 text-left">
          <p>
            Sei sicuro di voler disattivare il tuo account?
          </p>
          <p className="text-xs text-rose-600 font-medium">
            Questa operazione disabiliterà l&apos;accesso alla tua agenda e ai tuoi task personali.
          </p>
        </div>
      ),
      confirmText: 'Sì, disattiva',
      cancelText: 'Annulla',
      isDestructive: true,
      onConfirm: async () => {
        await onDeactivateAccount();
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-rose-900">Zona di Pericolo</h3>
        <p className="text-sm text-slate-500 mt-0.5">
          Operazioni irreversibili relative alla persistenza e all&apos;accesso del tuo account.
        </p>
      </div>

      <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-rose-900">
              Disattiva il tuo Account
            </h4>
            <p className="text-xs text-rose-700 max-w-md">
              Il tuo account verrà disattivato. Non potrai più accedere a questa sessione a meno di un ripristino amministrativo.
            </p>
          </div>

          <button
            type="button"
            onClick={handleConfirmDeactivate}
            disabled={isDeleting}
            className="inline-flex items-center justify-center px-4 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 rounded-xl transition shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
          >
            {isDeleting ? 'Disattivazione...' : 'Disattiva Account'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DangerZoneSection;
