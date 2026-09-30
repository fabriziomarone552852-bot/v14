import React, { useState } from 'react';
import BaseModal from '@/components/shared/dialog/BaseModal';
import { AddButton } from '@/components/shared/utils/AddButton';
import { CloseIcon } from '@/components/shared/utils/Icons';
import { useMediaLists } from '@/hooks/queries/useTrackersQueries';
import { useTrackersMutations } from '@/hooks/mutations/useTrackersMutations';

interface MediaListManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  seriesId?: number; // L'ID della serie che stiamo cercando di aggiungere
}

export const MediaListManagerModal: React.FC<MediaListManagerModalProps> = ({
  isOpen,
  onClose,
  seriesId
}) => {
  const [selectedListId, setSelectedListId] = useState<number | 'new' | null>(null);
  const [isPrivacyDropdownOpen, setIsPrivacyDropdownOpen] = useState(false);
  const [listPrivacy, setListPrivacy] = useState('private');
  const [newListName, setNewListName] = useState('');

  const { data: mediaLists = [] } = useMediaLists();
  const { createList, addToList } = useTrackersMutations();

  const selectedList = selectedListId === 'new' 
    ? { name: '', visibility: listPrivacy, items: [] } 
    : mediaLists.find((l: any) => l.id === selectedListId);

  const handleSave = () => {
    if (selectedListId === 'new') {
      if (!newListName.trim()) {
        alert("Inserisci un nome per la lista.");
        return;
      }
      createList({
        name: newListName,
        visibility: listPrivacy
      }, {
        onSuccess: (newList: any) => {
          if (seriesId && newList?.id) {
             addToList({ list_id: newList.id, payload: { series_tmdb_id: seriesId }});
          }
          onClose();
        }
      });
    } else if (selectedListId && seriesId) {
      addToList({ list_id: selectedListId, payload: { series_tmdb_id: seriesId }}, {
        onSuccess: () => {
          onClose();
        }
      });
    }
  };

  // sidePanel per il dettaglio
  const DetailPanel = selectedList ? (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
        <h4 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider">
           {selectedListId === 'new' ? 'Crea Nuova Lista' : 'Modifica Lista'}
        </h4>
        <button type="button" onClick={() => setSelectedListId(null)} className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer">
          <CloseIcon className="h-5 w-5" />
        </button>
      </div>
      
      <div className="p-6 flex-1 overflow-y-auto space-y-4 custom-scrollbar">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Nome Lista</label>
          <input 
            type="text" 
            defaultValue={selectedList.name}
            onChange={(e) => selectedListId === 'new' && setNewListName(e.target.value)}
            disabled={selectedListId !== 'new'}
            className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all disabled:opacity-70"
            placeholder="Es. Serie preferite..."
          />
        </div>

        <div className="pt-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Contenuto attuale della lista</label>
          {selectedList.items.length === 0 ? (
            <div className="p-4 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-center text-sm text-gray-500">
              La lista è vuota. {selectedListId !== 'new' && "La serie verrà aggiunta salvando."}
            </div>
          ) : (
            <div className="space-y-2">
              {selectedList.items.map((item: any) => {
                const title = item.series?.title || 'Sconosciuto';
                const posterPath = item.series?.poster_path;
                return (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl">
                    {posterPath ? (
                      <img src={`https://image.tmdb.org/t/p/w200${posterPath}`} alt={title} className="w-10 h-10 object-cover rounded-lg shrink-0 shadow-sm" />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center shrink-0 text-gray-500 text-xs font-bold">
                        IMG
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{title}</p>
                      <p className="text-xs text-gray-500 uppercase">SERIE TV</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center gap-3">
        {/* Selettore Privacy (Stile Recensioni) */}
        <div className="relative">
          <div 
            onClick={() => setIsPrivacyDropdownOpen(!isPrivacyDropdownOpen)}
            className="px-3 py-3 border border-gray-200 rounded-xl text-sm bg-white cursor-pointer flex justify-between items-center hover:border-blue-500 transition-colors shadow-sm select-none"
            style={{ width: '130px' }}
          >
            <div className="flex items-center gap-2">
              <span className="text-gray-500">
                {listPrivacy === 'private' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
                {listPrivacy === 'friends' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                {listPrivacy === 'public' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              </span>
              <span className="text-gray-700 font-medium">
                {listPrivacy === 'private' ? 'Solo Io' : listPrivacy === 'friends' ? 'Amici' : 'Pubblico'}
              </span>
            </div>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {isPrivacyDropdownOpen && (
            <div className="absolute bottom-full mb-1 left-0 w-36 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden z-[99]">
              <div 
                onClick={() => { setListPrivacy('private'); setIsPrivacyDropdownOpen(false); }}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                Solo Io
              </div>
              <div 
                onClick={() => { setListPrivacy('friends'); setIsPrivacyDropdownOpen(false); }}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                Solo Amici
              </div>
              <div 
                onClick={() => { setListPrivacy('public'); setIsPrivacyDropdownOpen(false); }}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center gap-2 border-t border-gray-50"
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Pubblico
              </div>
            </div>
          )}
        </div>

        {/* Tasto Salva */}
        <button 
          onClick={handleSave}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md active:scale-[0.98]"
        >
          Salva
        </button>
      </div>
    </div>
  ) : undefined;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Le Tue Liste"
      maxWidthClass="max-w-md"
      sidePanel={DetailPanel}
    >
      <div className="space-y-4">
        
        <AddButton 
          label="Nuova lista" 
          onClick={() => {
            setSelectedListId('new');
            setListPrivacy('private');
          }} 
        />
        
        <div className="space-y-2 mt-4">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Liste Esistenti</label>
          {mediaLists.map((lst: any) => (
            <div 
              key={lst.id}
              onClick={() => {
                setSelectedListId(lst.id);
                setListPrivacy(lst.visibility || 'private');
              }}
              className={`p-4 rounded-xl cursor-pointer transition-all border-2 flex items-center justify-between ${
                selectedListId === lst.id 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-gray-100 bg-white hover:border-gray-300 shadow-sm'
              }`}
            >
              <div>
                <p className={`font-bold ${selectedListId === lst.id ? 'text-blue-700' : 'text-gray-900'}`}>
                  {lst.name}
                </p>
                <p className="text-xs text-gray-500 mt-1 capitalize">{lst.visibility || 'private'} • {lst.items?.length || 0} elementi</p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selectedListId === lst.id ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-300'
              }`}>
                {selectedListId === lst.id && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
              </div>
            </div>
          ))}
        </div>

      </div>
    </BaseModal>
  );
};
