// src/mobile/components/modals/MobileRoutineDetailModal.tsx
import React, { useMemo } from 'react';
import type { RoutineItem, RoutinePeriod } from '@/components/day/RoutineColumn';
import MobileBaseModal from './MobileBaseModal';
import { useHabitLogs } from '@/hooks/useHabitLogs';
import { translateRRule } from '@/utils/rruleUtils';
import { useConfirm } from '@/context/ConfirmContext';
import {
  EditIcon,
  TrashIcon,
  PauseIcon,
  PlayIcon,
} from '@/components/shared/utils/Icons';
import { formatToItalianShortDate } from '@/utils/dateUtils';
import { Badge } from '@/components/shared/utils/Badges';
import { DEFAULT_COVER_IMAGE } from '@/utils/constants';

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

  const periodsList = useMemo(() => {
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

  const ModalFooter = (
    <div className="w-full">
      {isAttiva ? (
        <button
          type="button"
          onClick={onSuspendClick}
          className="w-full py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 hover:text-orange-600 active:scale-[0.99] transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <PauseIcon className="h-4 w-4" />
          Sospendi Routine
        </button>
      ) : (
        <button
          type="button"
          onClick={onResumeClick}
          className="w-full py-3 bg-purple-600 border border-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 active:scale-[0.99] transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <PlayIcon className="h-4 w-4" />
          Riattiva Routine
        </button>
      )}
    </div>
  );

  return (
    <MobileBaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={HeaderTags}
      headerActions={HeaderActions}
      footer={ModalFooter}
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
        <div className="bg-purple-50/70 p-3.5 rounded-2xl border border-purple-100 flex items-center justify-between shadow-2xs">
          <div>
            <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider mb-0.5">
              Target Attuale
            </h4>
            <p className="text-xs text-purple-700 font-medium">
              Numero di completamenti richiesti al giorno
            </p>
          </div>
          <div className="flex items-center justify-center w-11 h-11 bg-white rounded-xl shadow-xs border border-purple-200 shrink-0">
            <span className="text-lg font-black text-purple-700">
              {selectedRoutine.targetCompletions}x
            </span>
          </div>
        </div>

        {/* Cronologia Obiettivi */}
        {periodsList.length > 0 && (
          <div className="flex flex-col">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Cronologia Obiettivi
            </h4>
            <div className="max-h-40 overflow-y-auto custom-scrollbar bg-gray-50 border border-gray-200/80 rounded-2xl p-3 shadow-inner">
              <div className="space-y-2">
                {periodsList.map((p, idx) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between bg-white border border-gray-200/80 rounded-xl p-2.5 shadow-2xs"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-black text-xs">
                        {p.target}x
                      </div>
                      <div className="text-xs font-medium text-gray-700">
                        Dal {p.start} al {p.end}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        idx === 0
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {idx === 0 ? 'Attuale' : 'Storico'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Registro Storico dei Completamenti */}
        <div className="flex flex-col">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Registro Storico Completamenti
          </h4>
          <div className="max-h-48 overflow-y-auto custom-scrollbar bg-gray-50 border border-gray-200/80 rounded-2xl p-3 shadow-inner">
            {isLogsLoading ? (
              <div className="p-4 text-center text-xs text-gray-400">
                Caricamento storico in corso...
              </div>
            ) : groupedLogs.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-400 italic">
                Nessun completamento registrato.
              </div>
            ) : (
              groupedLogs.map((monthGroup, idx) => (
                <div key={idx} className="mb-3 last:mb-0">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 sticky top-0 bg-gray-50 z-10 py-0.5">
                    {monthGroup.month}
                  </div>
                  <div className="space-y-1.5">
                    {monthGroup.logs.map((log, logIdx) => {
                      const completato = log.done >= log.target;
                      return (
                        <div
                          key={logIdx}
                          className="flex justify-between items-center bg-white border border-gray-200/70 px-3 py-2 rounded-xl text-xs font-medium shadow-2xs"
                        >
                          <span
                            className={`font-semibold ${
                              completato ? 'text-gray-800' : 'text-gray-500'
                            }`}
                          >
                            {log.date}
                          </span>
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-black ${
                                completato ? 'text-green-600' : 'text-purple-600'
                              }`}
                            >
                              {log.done}/{log.target}
                            </span>
                            <div
                              className={`w-2.5 h-2.5 rounded-full ${
                                completato ? 'bg-green-500' : 'bg-gray-300'
                              }`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </MobileBaseModal>
  );
};

export default MobileRoutineDetailModal;
