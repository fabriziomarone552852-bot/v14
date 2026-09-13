// src/mobile/components/modals/MobileCountdownHubModal.tsx
import React, { useState, useMemo, useCallback } from 'react';
import { startOfDay, isBefore } from 'date-fns';
import type { CountdownItem } from '@/components/day/CountdownWidget';
import MobileBaseModal from './MobileBaseModal';
import { CountdownIcon, PlusIcon } from '@/components/shared/utils/Icons';
import { useCurrentTime } from '@/hooks/useCurrentTime';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import MobileSelectionHeader from '@/mobile/components/MobileSelectionHeader';
import { useBackHandler } from '@/utils/backButtonManager';
import { MobileCountdownHubRow } from './countdown/MobileCountdownHubRow';

export interface MobileCountdownHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  countdowns: CountdownItem[];
  onSelectCountdown: (cd: CountdownItem) => void;
  onNewClick: () => void;
  onDeleteCountdown?: (id: number) => Promise<unknown> | void;
}

export const MobileCountdownHubModal: React.FC<MobileCountdownHubModalProps> = ({
  isOpen,
  onClose,
  countdowns,
  onSelectCountdown,
  onNewClick,
  onDeleteCountdown,
}) => {
  const now = useCurrentTime(1000);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const activeCountdowns = useMemo(() => {
    const today = startOfDay(new Date());
    return countdowns
      .filter((cd) => !isBefore(startOfDay(new Date(cd.targetDateStr)), today))
      .sort((a, b) => new Date(a.targetDateStr).getTime() - new Date(b.targetDateStr).getTime());
  }, [countdowns]);

  const handleToggleSelect = useCallback((id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const handleToggleSelectAll = useCallback(() => {
    setSelectedIds((prev) =>
      prev.length === activeCountdowns.length ? [] : activeCountdowns.map((cd) => cd.id)
    );
  }, [activeCountdowns]);

  const handleDeleteSelected = useCallback(async () => {
    if (selectedIds.length === 0 || !onDeleteCountdown) return;
    if (!window.confirm(`Vuoi eliminare i ${selectedIds.length} countdown selezionati?`)) return;
    for (const id of selectedIds) {
      await onDeleteCountdown(id);
    }
    setSelectedIds([]);
  }, [selectedIds, onDeleteCountdown]);

  // Chiudi selezione con tasto Back hardware
  useBackHandler(selectedIds.length > 0, () => {
    setSelectedIds([]);
    return true;
  }, 35);

  if (!isOpen) return null;

  const HeaderTitle = selectedIds.length > 0 ? (
    <MobileSelectionHeader
      selectedCount={selectedIds.length}
      isAllSelected={selectedIds.length === activeCountdowns.length}
      onClearSelection={() => setSelectedIds([])}
      onToggleSelectAll={handleToggleSelectAll}
      onDelete={onDeleteCountdown ? handleDeleteSelected : undefined}
      isInsideModal={true}
    />
  ) : (
    <div className="flex items-center gap-2">
      <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600">
        <CountdownIcon className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
        Tutti i Countdown ({activeCountdowns.length})
      </h3>
    </div>
  );

  const ModalFooter = (
    <button
      type="button"
      onClick={() => {
        onClose();
        onNewClick();
      }}
      className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 active:scale-[0.99] active:bg-blue-100 transition-all flex justify-center items-center font-bold text-sm gap-2 cursor-pointer"
    >
      <PlusIcon className="h-5 w-5" />
      Crea Nuovo
    </button>
  );

  return (
    <MobileBaseModal
      isOpen={isOpen}
      onClose={() => {
        setSelectedIds([]);
        onClose();
      }}
      title={HeaderTitle}
      footer={ModalFooter}
    >
      <div className="space-y-3.5">
        {activeCountdowns.map((cd) => (
          <MobileCountdownHubRow
            key={cd.id}
            cd={cd}
            now={now}
            isSelected={selectedIds.includes(cd.id)}
            isSelectionMode={selectedIds.length > 0}
            onToggleSelect={handleToggleSelect}
            onSelect={(selectedCd) => {
              onClose();
              onSelectCountdown(selectedCd);
            }}
          />
        ))}

        {activeCountdowns.length === 0 && (
          <div className="py-12 flex items-center justify-center">
            <EmptyState message="Nessun countdown attivo impostato" />
          </div>
        )}
      </div>
    </MobileBaseModal>
  );
};

export default MobileCountdownHubModal;
