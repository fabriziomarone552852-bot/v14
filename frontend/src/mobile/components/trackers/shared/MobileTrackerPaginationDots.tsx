// src/mobile/components/trackers/shared/MobileTrackerPaginationDots.tsx

export interface MobileTrackerPaginationDotsProps<TPage extends number = number> {
  activePageIndex: TPage;
  onSelectPage: (index: TPage) => void;
  labels?: string[];
}

export const MobileTrackerPaginationDots = <TPage extends number = number>({
  activePageIndex,
  onSelectPage,
  labels = ['Uscite', 'Diario', 'Dashboard'],
}: MobileTrackerPaginationDotsProps<TPage>) => {
  return (
    <div className="shrink-0 flex items-center justify-center gap-2 py-1.5 select-none bg-white/80 backdrop-blur-xs border-t border-gray-100 rounded-b-2xl">
      {labels.map((label, idx) => {
        const isActive = activePageIndex === idx;
        return (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectPage(idx as TPage)}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
              isActive
                ? 'w-6 bg-blue-600 shadow-xs'
                : 'w-1.5 bg-gray-300 hover:bg-gray-400'
            }`}
            title={`Pagina ${idx + 1}: ${label}`}
            aria-label={`Pagina ${idx + 1}: ${label}`}
          />
        );
      })}
    </div>
  );
};

export default MobileTrackerPaginationDots;
