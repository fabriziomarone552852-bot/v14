// src/mobile/components/modals/MobileHabitDetailModal.tsx
import React, { useMemo } from 'react';
import type { HabitItem, HabitPeriod } from '@/components/day/HabitDetailModal';
import MobileBaseModal from './MobileBaseModal';
import { useHabitLogs } from '@/hooks/useHabitLogs';
import { useConfirm } from '@/context/ConfirmContext';
import { EditIcon, TrashIcon } from '@/components/shared/utils/Icons';
import { formatToItalianShortDate } from '@/utils/dateUtils';
import { Badge } from '@/components/shared/utils/Badges';
import { MobileHabitTargetCard } from './routine/MobileHabitTargetCard';
import { MobileHabitPeriodsHistory, type FormattedPeriodItem } from './routine/MobileHabitPeriodsHistory';
import { MobileHabitLogsHistory } from './routine/MobileHabitLogsHistory';
import { MobileHabitDetailFooter } from './routine/MobileHabitDetailFooter';

interface MobileHabitDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedHabit: HabitItem | null;
  onEditClick: () => void;
  onDeleteClick: (id: number) => void;
  isAttiva?: boolean;
  onSuspendClick?: () => void;
  onResumeClick?: () => void;
}

export const MobileHabitDetailModal: React.FC<MobileHabitDetailModalProps> = ({
  isOpen,
  onClose,
  selectedHabit,
  onEditClick,
  onDeleteClick,
  isAttiva = true,
  onSuspendClick,
  onResumeClick,
}) => {
  const { confirm } = useConfirm();
  const { groupedLogs, isLoading: isLogsLoading } = useHabitLogs(
    isOpen ? selectedHabit?.id : undefined,
    selectedHabit?.periods
  );

  const periodsList: FormattedPeriodItem[] = useMemo(() => {
    if (!selectedHabit?.periods || !Array.isArray(selectedHabit.periods)) return [];

    const sortedPeriods = [...selectedHabit.periods].sort((a, b) => {
      if (!a || !b) return 0;
      if (!a.data_fine && b.data_fine) return -1;
      if (a.data_fine && !b.data_fine) return 1;
      const timeB = b.data_inizio ? new Date(b.data_inizio).getTime() : 0;
      const timeA = a.data_inizio ? new Date(a.data_inizio).getTime() : 0;
      return timeB - timeA;
    });

    return sortedPeriods.filter(Boolean).map((p: HabitPeriod) => ({
      id: p.id,
      start: p.data_inizio ? formatToItalianShortDate(p.data_inizio) : '',
      end: p.data_fine ? formatToItalianShortDate(p.data_fine) : 'Presente',
      target: p.target ?? 1,
    }));
  }, [selectedHabit]);

  if (!isOpen || !selectedHabit) return null;

  const handleDelete = () => {
    confirm({
      title: 'Elimina Abitudine',
      message:
        "Vuoi eliminare questa abitudine e tutto il suo storico? L'azione è irreversibile.",
      confirmText: 'Elimina',
      isDestructive: true,
      onConfirm: () => {
        onDeleteClick(selectedHabit.id);
        onClose();
      },
    });
  };

  const HeaderTags = (
    <div className="flex items-center gap-1.5 flex-wrap">
      <Badge
        className={
          isAttiva
            ? 'bg-green-100 text-green-700 border-green-200 font-bold'
            : 'bg-gray-100 text-gray-500 border-gray-200 font-bold'
        }
      >
        {isAttiva ? 'Attiva' : 'Sospesa'}
      </Badge>

      <Badge className="bg-purple-100 text-purple-700 border-purple-200 font-bold">
        ✨ Abitudine Giornaliera (1x)
      </Badge>
    </div>
  );

  const HeaderActions = (
    <div className="flex items-center gap-1">
      <button
        type="button"
        title="Modifica"
        onClick={onEditClick}
        className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-colors cursor-pointer"
      >
        <EditIcon className="h-5 w-5" />
      </button>
      <button
        type="button"
        title="Elimina"
        onClick={handleDelete}
        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
      >
        <TrashIcon className="h-5 w-5" />
      </button>
    </div>
  );

  return (
    <MobileBaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={HeaderTags}
      headerActions={HeaderActions}
      footer={
        <MobileHabitDetailFooter
          isAttiva={isAttiva}
          entityLabel="Abitudine"
          onSuspendClick={onSuspendClick}
          onResumeClick={onResumeClick}
        />
      }
    >
      <div className="space-y-4 animate-fadeIn">
        {/* Card Profilo Abitudine */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50/80 via-white to-purple-50/40 border border-purple-100/90 shadow-2xs flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-3xl bg-white border-2 border-purple-200 shadow-sm flex items-center justify-center text-4xl mb-3">
            {selectedHabit.icon || '✨'}
          </div>
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-1 leading-snug">
            {selectedHabit.title}
          </h2>
          <p className="text-xs font-semibold text-purple-700 bg-purple-100/80 px-3 py-0.5 rounded-full">
            1 volta al giorno • Tutti i giorni
          </p>
        </div>

        {/* Card Target Attuale */}
        <MobileHabitTargetCard target={1} />

        {/* Cronologia Obiettivi */}
        <MobileHabitPeriodsHistory periods={periodsList} />

        {/* Registro Storico dei Completamenti */}
        <MobileHabitLogsHistory
          isLoading={isLogsLoading}
          groupedLogs={groupedLogs}
        />
      </div>
    </MobileBaseModal>
  );
};

export default MobileHabitDetailModal;
