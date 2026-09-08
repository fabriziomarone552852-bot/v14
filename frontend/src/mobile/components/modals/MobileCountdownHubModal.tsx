// src/mobile/components/modals/MobileCountdownHubModal.tsx
import React, { useMemo } from 'react';
import { startOfDay, isBefore } from 'date-fns';
import type { CountdownItem } from '@/components/day/CountdownWidget';
import MobileBaseModal from './MobileBaseModal';
import { CountdownIcon, PlusIcon } from '@/components/shared/utils/Icons';
import { useCurrentTime } from '@/hooks/useCurrentTime';
import starsGif from '@/assets/stars.gif';
import TickDisplay from '@/components/day/utils/TickDisplay';
import { EmptyState } from '@/components/shared/utils/EmptyState';

interface MobileCountdownHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  countdowns: CountdownItem[];
  onSelectCountdown: (cd: CountdownItem) => void;
  onNewClick: () => void;
}

export const MobileCountdownHubModal: React.FC<MobileCountdownHubModalProps> = ({
  isOpen,
  onClose,
  countdowns,
  onSelectCountdown,
  onNewClick,
}) => {
  const now = useCurrentTime(1000);

  const activeCountdowns = useMemo(() => {
    const today = startOfDay(new Date());

    return countdowns
      .filter((cd) => {
        const targetDate = startOfDay(new Date(cd.targetDateStr));
        return !isBefore(targetDate, today);
      })
      .sort((a, b) => new Date(a.targetDateStr).getTime() - new Date(b.targetDateStr).getTime());
  }, [countdowns]);

  if (!isOpen) return null;

  const HeaderTitle = (
    <div className="flex items-center gap-2">
      <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600">
        <CountdownIcon className="w-5 h-5" />
      </div>
      <div>
        <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
          Tutti i Countdown ({activeCountdowns.length})
        </h3>
      </div>
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
      onClose={onClose}
      title={HeaderTitle}
      footer={ModalFooter}
    >
      <div className="space-y-3.5">
        {activeCountdowns.map((cd) => {
          const targetDate = new Date(cd.targetDateStr);
          const isPast = targetDate.getTime() <= now.getTime();

          return (
            <div
              key={cd.id}
              onClick={() => {
                onClose();
                onSelectCountdown(cd);
              }}
              className={`relative h-24 w-full rounded-2xl overflow-hidden cursor-pointer shadow-xs hover:shadow-md border border-gray-200/80 hover:border-blue-400 active:scale-[0.99] transition-all ${
                isPast ? 'opacity-65 grayscale-[25%]' : ''
              }`}
            >
              {/* Background Cover */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${cd.imageUrl})`,
                  backgroundPosition: cd.immaginePosizione || 'center',
                }}
              />

              {/* Stars animation if past */}
              {isPast && (
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-60 z-0 mix-blend-screen"
                  style={{ backgroundImage: `url(${starsGif})` }}
                />
              )}

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent z-10" />

              {/* Stile Webpage: Titolo e Data in Basso a Sinistra, Timer in Basso a Destra */}
              <div className="absolute bottom-0 left-0 w-full p-3.5 z-20 flex justify-between items-end">
                <div className="flex flex-col overflow-hidden mr-3">
                  <h3 className="text-white font-extrabold text-sm uppercase tracking-wide truncate drop-shadow-sm">
                    {cd.title}
                  </h3>
                  <span
                    className={`text-[10px] font-bold tracking-widest uppercase mt-0.5 ${
                      isPast ? 'text-green-400' : 'text-gray-300'
                    }`}
                  >
                    {targetDate.toLocaleDateString('it-IT', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                {!isPast && (
                  <div className="shrink-0 mb-0.5">
                    <TickDisplay targetDateStr={cd.targetDateStr} variant="hub" />
                  </div>
                )}
              </div>
            </div>
          );
        })}

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
