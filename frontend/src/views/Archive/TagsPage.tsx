// src/views/TagsPage.tsx
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '@/hooks/useCategories';
import { TagIcon, BackIcon, LoadingIcon, CategoryIcon } from '@/components/shared/utils/Icons';
import type { Category } from '@/types/categories';

const panelClass =
  'rounded-[28px] border border-white/70 bg-white/95 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur';

export const TagsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: categories = [], isLoading, isError } = useCategories();

  // I tag corrispondono alle categorie di tipo genre = 5 (TAG) o tutte le categorie come filtri
  const tags = useMemo(() => {
    return categories.filter((c: Category) => c.genre === 5 || c.genre === 3);
  }, [categories]);

  return (
    <div className="h-full flex flex-col justify-between gap-4 max-w-[1600px] mx-auto overflow-hidden">
      {/* HEADER */}
      <section className={`${panelClass} p-5 sm:p-6 shrink-0`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={() => navigate('/archivio')}
              className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
              title="Torna all'archivio"
            >
              <BackIcon className="w-5 h-5" />
            </button>
            <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl">
              <TagIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                Tag & Etichette
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Organizza e consulta i tag trasversali associati alle tue attività ed eventi.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/categories')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition cursor-pointer shadow-sm"
          >
            <CategoryIcon className="w-4 h-4" />
            <span>Gestisci in Categorie</span>
          </button>
        </div>
      </section>

      {/* CONTENUTO PRINCIPALE */}
      <div className={`${panelClass} p-6 flex-1 min-h-0 overflow-y-auto custom-scrollbar`}>
        {isLoading ? (
          <div className="flex items-center justify-center h-48 gap-3 text-slate-500">
            <LoadingIcon className="w-6 h-6 animate-spin text-teal-600" />
            <span className="text-sm font-semibold">Caricamento tag in corso...</span>
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center text-rose-700 text-sm">
            Errore nel caricamento dei tag.
          </div>
        ) : tags.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="p-4 rounded-3xl bg-teal-50 text-teal-500 mb-3">
              <TagIcon className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Nessun tag configurato</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Crea le tue categorie ed etichette per filtrare rapidamente le informazioni.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200/80 bg-white shadow-xs"
              >
                <div
                  className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                  style={{ backgroundColor: tag.colore || '#94a3b8' }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 truncate">{tag.category_name}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">
                    {tag.genre === 5 ? 'Tag' : 'Comune'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TagsPage;
