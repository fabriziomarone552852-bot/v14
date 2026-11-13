// src/mobile/components/trackers/shared/MobilePersonalListsSelectCard.tsx
import React, { useState } from 'react';
import type { MediaList } from '@/types/trackers';
import { SelectModalDialog } from '@/components/shared/form/SelectModalDialog';
import { DropdownIcon, CheckCircleIcon } from '@/components/shared/utils/Icons';
import { toggleMultiOrValue } from '@/utils/trackerFilterUtils';

const BookmarkIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
    />
  </svg>
);

export interface MobilePersonalListsSelectCardProps {
  myLists?: MediaList[];
  selectedListIds: readonly number[];
  onChange: (nextListIds: number[]) => void;
  allLabel: string;
  itemUnitLabel: string;
  countItemFilter?: (list: MediaList) => number;
}

export const MobilePersonalListsSelectCard: React.FC<
  MobilePersonalListsSelectCardProps
> = ({
  myLists,
  selectedListIds,
  onChange,
  allLabel,
  itemUnitLabel,
  countItemFilter,
}) => {
  const [isListModalOpen, setIsListModalOpen] = useState(false);

  const getCount = (list: MediaList): number => {
    if (countItemFilter) return countItemFilter(list);
    return list.items?.length ?? 0;
  };

  const selectedLists = (myLists || []).filter((l) => selectedListIds.includes(l.id));
  const hasSelection = selectedLists.length > 0;

  const summaryName = !hasSelection
    ? allLabel
    : selectedLists.length === 1
    ? selectedLists[0].name
    : `${selectedLists.length} liste selezionate`;

  const singleListCount =
    selectedLists.length === 1 ? getCount(selectedLists[0]) : null;

  return (
    <>
      <div className="bg-white border border-gray-200/90 rounded-2xl shadow-2xs overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => setIsListModalOpen(true)}
          className="w-full p-3 flex items-center justify-between gap-3 text-left cursor-pointer hover:bg-gray-50/80 active:bg-gray-100/70 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 shadow-2xs">
              <BookmarkIcon className="w-5 h-5" />
            </div>

            <div className="min-w-0">
              <span className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400 leading-tight">
                Liste
              </span>
              <div className="flex items-center gap-2 mt-0.5 min-w-0">
                <span className="text-sm font-extrabold text-gray-900 truncate">
                  {summaryName}
                </span>
                {singleListCount !== null && (
                  <span className="text-[10px] font-bold bg-blue-100/80 text-blue-700 px-1.5 py-0.5 rounded-full shrink-0">
                    {singleListCount} {itemUnitLabel}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center shrink-0 text-gray-400">
            <DropdownIcon className="w-4 h-4 text-gray-400" isDropdownOpen={false} />
          </div>
        </button>
      </div>

      <SelectModalDialog
        isOpen={isListModalOpen}
        onClose={() => setIsListModalOpen(false)}
        title="Liste Personali"
        maxWidthClass="max-w-sm"
        zIndex={10040}
        footerSlot={
          <div className="flex items-center gap-2">
            {hasSelection && (
              <button
                type="button"
                onClick={() => onChange([])}
                className="px-3.5 py-2.5 rounded-2xl bg-red-50 text-red-600 font-extrabold text-xs active:scale-95 transition-all cursor-pointer"
              >
                Azzera
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsListModalOpen(false)}
              className="flex-1 py-2.5 px-4 rounded-2xl bg-blue-600 text-white font-extrabold text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              Conferma{hasSelection ? ` (${selectedLists.length})` : ''}
            </button>
          </div>
        }
      >
        <div className="space-y-1.5 py-1 select-none">
          <button
            type="button"
            onClick={() => {
              onChange([]);
              setIsListModalOpen(false);
            }}
            className={`w-full py-3 px-3.5 rounded-2xl flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
              !hasSelection
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-gray-50 hover:bg-gray-100 text-gray-700 active:scale-[0.99]'
            }`}
          >
            <span className="truncate">{allLabel}</span>
            {!hasSelection && (
              <CheckCircleIcon className="w-4 h-4 shrink-0 text-white" />
            )}
          </button>

          {myLists && myLists.length > 0 ? (
            myLists.map((list) => {
              const isSelected = selectedListIds.includes(list.id);
              const count = getCount(list);
              return (
                <button
                  key={list.id}
                  type="button"
                  onClick={() => onChange(toggleMultiOrValue(selectedListIds, list.id))}
                  className={`w-full py-3 px-3.5 rounded-2xl flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700 active:scale-[0.99]'
                  }`}
                >
                  <span className="truncate mr-2">{list.name}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-white text-gray-600 border border-gray-200'
                      }`}
                    >
                      {count} {itemUnitLabel}
                    </span>
                    {isSelected && (
                      <CheckCircleIcon className="w-4 h-4 shrink-0 text-white" />
                    )}
                  </div>
                </button>
              );
            })
          ) : (
            <div className="text-center py-4 text-xs text-gray-400">
              Nessuna lista creata.
            </div>
          )}
        </div>
      </SelectModalDialog>
    </>
  );
};

export default MobilePersonalListsSelectCard;
