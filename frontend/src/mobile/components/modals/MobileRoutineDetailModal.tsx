// src/mobile/components/modals/MobileRoutineDetailModal.tsx
import React, { useMemo } from 'react';
import type { RoutineItem, RoutinePeriod } from '@/components/day/RoutineColumn';
import MobileBaseModal from './MobileBaseModal';
import { useHabitLogs } from '@/hooks/useHabitLogs';
import { translateRRule } from '@/utils/rruleUtils';
import { useConfirm } from '@/context/ConfirmContext';
import { EditIcon, TrashIcon } from '@/components/shared/utils/Icons';
import { formatToItalianShortDate } from '@/utils/dateUtils';
import { Badge } from '@/components/shared/utils/Badges';
import { DEFAULT_COVER_IMAGE } from '@/utils/constants';
import { MobileHabitTargetCard } from './routine/MobileHabitTargetCard';
import { MobileHabitPeriodsHistory, type FormattedPeriodItem } from './routine/MobileHabitPeriodsHistory';
import { MobileHabitLogsHistory } from './routine/MobileHabitLogsHistory';
import { MobileHabitDetailFooter } from './routine/MobileHabitDetailFooter';

interface MobileRoutineDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRoutine: RoutineItem | null;
  onEditClick: () => void;
  onDeleteClick: (id: number) => void;
  isAttiva?: boolean;
  onSuspendClick?: () => void;
  onResumeClick?: () => void;
}

export const MobileRoutineDetailModal: React.FC<MobileRoutineDetailModalProps> = ({
  isOpen,
  onClose,
  selectedRoutine,
  onEditClick,
  onDeleteClick,
  isAttiva = true,
  onSuspendClick,
  onResumeClick,
}) => {
  const { confirm } = useConfirm();
  const { groupedLogs, isLoading: isLogsLoading } = useHabitLogs(
    isOpen ? selectedRoutine?.id : undefined,
    selectedRoutine?.periods
  );

  const periodsList: FormattedPeriodItem[] = useMemo(() => {
    if (!selectedRoutine?.periods) return [];

    const sortedPeriods = [...selectedRoutine.periods].sort((a, b) => {
      if (!a.data_fine && b.data_fine) return -1;
      if (a.data_fine && !b.data_fine) return 1;
      return new Date(b.data_inizio).getTime() - new Date(a.data_inizio).getTime();
    });

    return sortedPeriods.map((p: RoutinePeriod) => ({
      id: p.id,
      start: formatToItalianShortDate(p.data_inizio),
      end: p.data_fine ? formatToItalianShortDate(p.data_fine) : 'Presente',
      target: p.target,
    }));
  }, [selectedRoutine]);

  if (!isOpen || !selectedRoutine) return null;

  const handleDelete = () => {
    confirm({
      title: 'Elimina Routine',
      message:
        "Vuoi eliminare questa routine e tutto il suo storico? L'azione è irreversibile.",
      confirmText: 'Elimina',
      isDestructive: true,
      onConfirm: () => {
        onDeleteClick(selectedRoutine.id);
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
        🔄 {translateRRule(selectedRoutine.rrule, selectedRoutine.data_inizio)}
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
          entityLabel="Routine"
          onSuspendClick={onSuspendClick}
          onResumeClick={onResumeClick}
        />
      }
    >
      <div className="space-y-4 animate-fadeIn">
        {/* Immagine di Copertina */}
        <div
          className="w-full h-36 rounded-2xl bg-cover shadow-xs border border-gray-200/80"
          style={{
            backgroundImage: `url(${selectedRoutine.imageUrl || DEFAULT_COVER_IMAGE})`,
            backgroundPosition: selectedRoutine.immaginePosizione || 'center',
          }}
        />

        {/* Titolo Routine */}
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 leading-snug">
            {selectedRoutine.title}
          </h2>
        </div>

        {/* Card Target Attuale */}
        <MobileHabitTargetCard target={selectedRoutine.targetCompletions} />

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

export default MobileRoutineDetailModal;
