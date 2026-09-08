// src/mobile/components/modals/MobileEventNewModal.tsx
import React, { useState, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { CategoryGenre, type DbEvent, type CalendarEvent } from '@/types';
import DatePicker from '@/components/shared/utils/DatePicker/DatePicker';
import CategorySelect from '@/components/shared/utils/CategorySelect';
import MobileBaseModal from './MobileBaseModal';
import { CancelIcon, CloseIcon, DropdownIcon, CheckCircleIcon } from '@/components/shared/utils/Icons';
import TimeInput from '@/components/shared/utils/TimeInput';
import { FormInput, FormTextarea, LocationAutocompleteInput } from '@/components/shared/form';
import { useEventFormLogic } from '@/hooks/forms/useEventFormLogic';

interface MobileEventNewModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventToEdit?: CalendarEvent | null;
  onEventSaved?: (savedEvent?: DbEvent) => void;
  initialDate?: string | null;
}

const FREQ_OPTIONS = [
  { value: 'DAILY', labelSingular: 'giorno', labelPlural: 'giorni' },
  { value: 'WEEKLY', labelSingular: 'settimana', labelPlural: 'settimane' },
  { value: 'MONTHLY', labelSingular: 'mese', labelPlural: 'mesi' },
  { value: 'YEARLY', labelSingular: 'anno', labelPlural: 'anni' },
];

export const MobileEventNewModal: React.FC<MobileEventNewModalProps> = ({
  isOpen,
  onClose,
  eventToEdit,
  initialDate,
  onEventSaved,
}) => {
  const {
    newEventForm,
    setNewEventForm,
    dynamicFormId,
    activeDatePicker,
    setActiveDatePicker,
    isRecurrent,
    setIsRecurrent,
    rruleInterval,
    setRruleInterval,
    rruleFreq,
    setRruleFreq,
    rruleUntil,
    setRruleUntil,
    isSaving,
    handleSalvaNuovoEvento,
    isConfirmDisabled,
  } = useEventFormLogic({
    isOpen,
    onClose,
    eventToEdit,
    initialDate,
    onEventSaved,
  });

  const [isFreqModalOpen, setIsFreqModalOpen] = useState(false);

  // Calcolo dinamico delle dimensioni per la nuvoletta ad L continua unificata
  const lShapeContainerRef = useRef<HTMLDivElement>(null);
  const [lShapeMetrics, setLShapeMetrics] = useState({ width: 340, height: 104, midX: 176 });

  useLayoutEffect(() => {
    if (!isRecurrent || !lShapeContainerRef.current) return;

    const updateMetrics = () => {
      if (lShapeContainerRef.current) {
        const rect = lShapeContainerRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        // In un grid a 2 colonne con gap-3 (12px): la colonna 2 inizia a (width + 12) / 2
        const midX = (width + 12) / 2;
        setLShapeMetrics({ width, height, midX });
      }
    };

    updateMetrics();
    window.addEventListener('resize', updateMetrics);
    return () => window.removeEventListener('resize', updateMetrics);
  }, [isRecurrent, isOpen]);

  if (!isOpen) return null;

  const currentFreqObj = FREQ_OPTIONS.find((f) => f.value === rruleFreq) || FREQ_OPTIONS[1];
  const freqLabel =
    parseInt(rruleInterval, 10) > 1
      ? currentFreqObj.labelPlural
      : currentFreqObj.labelSingular;

  // Coordinate per il tracciato SVG ad L unificato
  const { width: W, height: H, midX } = lShapeMetrics;
  const R = 12; // raggio di curvatura angoli
  const Y = 54; // h1 (46px) + gap (8px)

  const lPathD = W > 0 && H > 0 ? `
    M ${midX + R} 0.5
    H ${W - R}
    A ${R} ${R} 0 0 1 ${W - 0.5} ${R}
    V ${H - R}
    A ${R} ${R} 0 0 1 ${W - R} ${H - 0.5}
    H ${R}
    A ${R} ${R} 0 0 1 0.5 ${H - R}
    V ${Y + R}
    A ${R} ${R} 0 0 1 ${R} ${Y + 0.5}
    H ${midX}
    V ${R}
    A ${R} ${R} 0 0 1 ${midX + R} 0.5
    Z
  ` : '';

  return (
    <>
      <MobileBaseModal
        isOpen={isOpen}
        onClose={onClose}
        title={eventToEdit ? 'Modifica Evento' : 'Nuovo Evento'}
        formId={dynamicFormId}
        confirmText={eventToEdit ? 'Aggiorna Evento' : 'Salva Evento'}
        isLoading={isSaving}
        isConfirmDisabled={isConfirmDisabled}
      >
        <form
          id={dynamicFormId}
          onSubmit={handleSalvaNuovoEvento}
          className="space-y-4"
        >
          {/* Rigo 1: Titolo */}
          <div className="w-full">
            <FormInput
              label="Titolo Evento"
              type="text"
              required
              placeholder="Es. Visita Medica, Riunione..."
              value={newEventForm.titolo}
              onChange={(e) =>
                setNewEventForm({ ...newEventForm, titolo: e.target.value })
              }
            />
          </div>

          {/* Rigo 2: Descrizione */}
          <div className="w-full">
            <FormTextarea
              label="Descrizione"
              placeholder="Aggiungi dettagli..."
              value={newEventForm.descrizione}
              onChange={(e) =>
                setNewEventForm({ ...newEventForm, descrizione: e.target.value })
              }
              className="h-20"
            />
          </div>

          {/* Rigo 3: Data Inizio & Ora Inizio sullo stesso rigo */}
          <div className="grid grid-cols-2 gap-3 items-end">
            <div className="w-full">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Data Inizio
              </label>
              <DatePicker
                value={newEventForm.data_inizio}
                onChange={(date) =>
                  setNewEventForm({ ...newEventForm, data_inizio: date })
                }
                isOpen={activeDatePicker === 'start'}
                onToggle={() =>
                  setActiveDatePicker(activeDatePicker === 'start' ? null : 'start')
                }
                onClose={() => setActiveDatePicker(null)}
                overlay={true}
              />
            </div>

            <div className="w-full">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Ora Inizio
              </label>
              <TimeInput
                value={newEventForm.ora_inizio}
                onChange={(newTime: string) =>
                  setNewEventForm({ ...newEventForm, ora_inizio: newTime })
                }
                disabled={newEventForm.tutto_il_giorno}
              />
            </div>
          </div>

          {/* Rigo 4: Data Fine & Ora Fine sullo stesso rigo */}
          <div className="grid grid-cols-2 gap-3 items-end">
            <div className="w-full">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Data Fine
              </label>
              <div className="flex items-center gap-1.5">
                <div className="flex-1 min-w-0">
                  <DatePicker
                    value={newEventForm.data_fine}
                    onChange={(date) =>
                      setNewEventForm({ ...newEventForm, data_fine: date })
                    }
                    isOpen={activeDatePicker === 'end'}
                    onToggle={() =>
                      setActiveDatePicker(activeDatePicker === 'end' ? null : 'end')
                    }
                    onClose={() => setActiveDatePicker(null)}
                    placeholder="Stesso giorno"
                    overlay={true}
                  />
                </div>
                {newEventForm.data_fine && (
                  <button
                    type="button"
                    onClick={() =>
                      setNewEventForm({ ...newEventForm, data_fine: '' })
                    }
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                    title="Rimuovi data fine"
                  >
                    <CancelIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="w-full">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Ora Fine
              </label>
              <TimeInput
                value={newEventForm.ora_fine}
                onChange={(newTime: string) =>
                  setNewEventForm({ ...newEventForm, ora_fine: newTime })
                }
                disabled={newEventForm.tutto_il_giorno}
              />
            </div>
          </div>

          {/* Rigo 5: Opzioni Tutto il giorno / Evento ricorrente con nuvoletta ad L unificata senza righe interne */}
          <div className="w-full relative" ref={lShapeContainerRef}>
            {/* Se RICORRENTE è attivo: Disegna la nuvoletta ad L come un unico percorso continuo (senza linee interne o giunture) */}
            {isRecurrent && W > 0 && (
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
                viewBox={`0 0 ${W} ${H}`}
              >
                <path
                  d={lPathD}
                  fill="#f9fafb"
                  stroke="#e5e7eb"
                  strokeWidth="1"
                  strokeLinejoin="round"
                />
              </svg>
            )}

            {/* Riga 1: Checkbox Tutto il giorno (sx) e Evento ricorrente (dx) */}
            <div className="grid grid-cols-2 gap-3 items-start relative z-10">
              {/* Card Tutto il giorno (completamente autonoma sui 4 lati) */}
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200/80 flex items-center gap-2 h-[46px] shadow-2xs">
                <input
                  type="checkbox"
                  id="mobileAllDayToggle"
                  checked={newEventForm.tutto_il_giorno}
                  onChange={(e) =>
                    setNewEventForm({
                      ...newEventForm,
                      tutto_il_giorno: e.target.checked,
                      ora_inizio: '',
                      ora_fine: '',
                    })
                  }
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer shrink-0"
                />
                <label
                  htmlFor="mobileAllDayToggle"
                  className="text-xs sm:text-sm font-bold text-gray-800 cursor-pointer select-none truncate"
                >
                  Tutto il giorno
                </label>
              </div>

              {/* Card Evento ricorrente */}
              {!isRecurrent ? (
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200/80 flex items-center gap-2 h-[46px] shadow-2xs">
                  <input
                    type="checkbox"
                    id="mobileRecurrenceToggle"
                    checked={isRecurrent}
                    onChange={(e) => setIsRecurrent(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer shrink-0"
                  />
                  <label
                    htmlFor="mobileRecurrenceToggle"
                    className="text-xs sm:text-sm font-bold text-gray-800 cursor-pointer select-none truncate"
                  >
                    Evento ricorrente
                  </label>
                </div>
              ) : (
                /* Quando ricorrente è attivo: il background è fornito dalla nuvoletta ad L SVG sottostante */
                <div className="p-3 flex items-center gap-2 h-[46px]">
                  <input
                    type="checkbox"
                    id="mobileRecurrenceToggle"
                    checked={isRecurrent}
                    onChange={(e) => setIsRecurrent(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer shrink-0"
                  />
                  <label
                    htmlFor="mobileRecurrenceToggle"
                    className="text-xs sm:text-sm font-bold text-gray-800 cursor-pointer select-none truncate"
                  >
                    Evento ricorrente
                  </label>
                </div>
              )}
            </div>

            {/* Riga 2: Controlli Frequenza (inclusi nella nuvoletta ad L con distacco bianco da Tutto il giorno) */}
            {isRecurrent && (
              <div className="w-full mt-2 pt-2.5 px-3 pb-3 text-xs text-gray-700 relative z-10 animate-fadeIn">
                <div className="flex items-center gap-1.5 w-full flex-nowrap">
                  <span className="font-bold text-gray-700 shrink-0">Ripeti ogni</span>
                  <input
                    type="number"
                    min="1"
                    value={rruleInterval}
                    onChange={(e) => setRruleInterval(e.target.value)}
                    className="w-9 px-1 py-1.5 border border-gray-300 rounded-lg text-center font-extrabold bg-white text-gray-800 focus:outline-none focus:border-blue-500 shadow-2xs shrink-0"
                  />
                  <button
                    type="button"
                    onClick={() => setIsFreqModalOpen(true)}
                    className="px-2 py-1.5 bg-white border border-gray-300 rounded-lg font-extrabold text-gray-800 text-xs flex items-center gap-1 hover:border-blue-500 transition-colors shadow-2xs cursor-pointer shrink-0"
                  >
                    <span>{freqLabel}</span>
                    <DropdownIcon isDropdownOpen={isFreqModalOpen} />
                  </button>
                  <span className="font-bold text-gray-700 shrink-0 ml-0.5">fino a</span>
                  <div className="flex-1 min-w-[85px] flex items-center gap-1">
                    <div className="flex-1 min-w-0">
                      <DatePicker
                        value={rruleUntil}
                        onChange={setRruleUntil}
                        isOpen={activeDatePicker === 'until'}
                        onToggle={() =>
                          setActiveDatePicker(activeDatePicker === 'until' ? null : 'until')
                        }
                        onClose={() => setActiveDatePicker(null)}
                        placeholder="Senza limite"
                        overlay={true}
                      />
                    </div>
                    {rruleUntil && (
                      <button
                        type="button"
                        onClick={() => setRruleUntil('')}
                        className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                        title="Rimuovi data limite"
                      >
                        <CancelIcon className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Rigo 6: Categoria con overlay centrato */}
          <div className="w-full">
            <CategorySelect
              value={newEventForm.category}
              onChange={(catName) =>
                setNewEventForm({ ...newEventForm, category: catName })
              }
              genreType={CategoryGenre.EVENTS}
              overlay={true}
            />
          </div>

          {/* Rigo 7: Luogo */}
          <div className="w-full">
            <LocationAutocompleteInput
              label="Luogo"
              placeholder="Es. Via Roma 10, Milano o Ufficio..."
              value={newEventForm.luogo}
              onChange={(val) =>
                setNewEventForm({ ...newEventForm, luogo: val })
              }
            />
          </div>

        </form>
      </MobileBaseModal>

      {/* MODALE OVERLAY PER SCELTA FREQUENZA RIPETIZIONE */}
      {isFreqModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4 animate-fadeIn pointer-events-auto select-none"
            onClick={() => setIsFreqModalOpen(false)}
            aria-hidden="true"
          >
            <div
              className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-72 max-w-[90vw] animate-fadeIn max-h-[75vh] flex flex-col pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center pb-3 border-b border-gray-100 shrink-0">
                <h4 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">
                  Frequenza Ripetizione
                </h4>
                <button
                  type="button"
                  onClick={() => setIsFreqModalOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                >
                  <CloseIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="py-2 space-y-1">
                {FREQ_OPTIONS.map((f) => {
                  const isSelected = rruleFreq === f.value;
                  const itemLabel =
                    parseInt(rruleInterval, 10) > 1 ? f.labelPlural : f.labelSingular;
                  return (
                    <div
                      key={f.value}
                      onClick={() => {
                        setRruleFreq(f.value);
                        setIsFreqModalOpen(false);
                      }}
                      className={`px-3 py-2.5 rounded-xl text-sm font-bold capitalize cursor-pointer flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-blue-50 text-blue-900'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span>{itemLabel}</span>
                      {isSelected && (
                        <CheckCircleIcon className="w-4 h-4 text-blue-600 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default MobileEventNewModal;
