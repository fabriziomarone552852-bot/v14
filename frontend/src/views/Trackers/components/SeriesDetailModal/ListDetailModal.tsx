import React from 'react';
import BaseModal from '@/components/shared/dialog/BaseModal';
import { useMediaLists } from '@/hooks/queries/useTrackersQueries';
import { useTrackersMutations } from '@/hooks/mutations/useTrackersMutations';

interface ListDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  listId: number | null;
}

export const ListDetailModal: React.FC<ListDetailModalProps> = ({
  isOpen,
  onClose,
  listId
}) => {
  const { data: mediaLists = [] } = useMediaLists();
  const { removeFromList } = useTrackersMutations();

  if (!listId) return null;

  const list = mediaLists.find((l: any) => l.id === listId);

  if (!list) return null;

  const handleRemove = (itemId: number) => {
    removeFromList({ list_id: listId, item_id: itemId });
  };

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose}
      title={
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-200/60 rounded-lg text-gray-600 w-fit">
           {list.visibility === 'public' ? (
             <>
               <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               <span className="text-xs font-bold uppercase tracking-wider">Pubblica</span>
             </>
           ) : (
             <>
               <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
               <span className="text-xs font-bold uppercase tracking-wider">Privata</span>
             </>
           )}
        </div>
      }
    >
      <div className="space-y-4">
        {/* Intestazione della Lista nel body */}
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 leading-tight">
             {list.name}
          </h2>
          <p className="text-sm text-gray-500 font-medium mt-1">
            {list.items?.length || 0} elementi
          </p>
        </div>

        {/* Lista degli elementi */}
        <div className="space-y-3">
          {(!list.items || list.items.length === 0) ? (
            <div className="p-8 text-center text-gray-500 font-medium bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              Questa lista è vuota
            </div>
          ) : (
            list.items.map((item: any) => {
              const title = item.series?.title || 'Sconosciuto';
              const posterPath = item.series?.poster_path;
              return (
                <div key={item.id} className="flex items-center gap-4 p-3 bg-white hover:bg-gray-50 border border-gray-100 rounded-2xl transition-colors group">
                  {posterPath ? (
                    <img src={`https://image.tmdb.org/t/p/w200${posterPath}`} alt={title} className="w-12 h-16 object-cover rounded-xl shrink-0 shadow-sm" />
                  ) : (
                    <div className="w-12 h-16 bg-gray-100 rounded-xl flex items-center justify-center shrink-0 text-gray-400 text-xs font-bold shadow-sm">
                      IMG
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate text-base">{title}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-0.5">{item.series?.status === 'watching' ? 'In visione' : 'In lista'}</p>
                  </div>
                  <button 
                    onClick={() => handleRemove(item.id)}
                    className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all cursor-pointer shrink-0"
                    title="Rimuovi dalla lista"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </BaseModal>
  );
};
