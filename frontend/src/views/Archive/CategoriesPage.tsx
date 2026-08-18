import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CategoryForm, { type CategoryFormValues } from '@/components/CategoryForm';
import type { Category } from '@/types/categories';
import { useCategories, useCreateCategory } from '@/hooks/useCategories';

interface LocationState {
  from?: 'tasks' | 'events';
  genreHint?: 1 | 2;
}

const genreLabel = (genre: number): string => {
  switch (genre) {
    case 1:
      return 'Tasks';
    case 2:
      return 'Events';
    case 3:
      return 'Comune';
    case 4:
      return 'Mood';
    default:
      return `Tipo ${genre}`;
  }
};

const CategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as LocationState;

  const {
    data: categories = [],
    isLoading,
    isError,
    error,
  } = useCategories();

  const createCategoryMutation = useCreateCategory();

  const handleCreate = async (values: CategoryFormValues) => {
    const payload = {
      category_name: values.name,
      colore: values.color || null,
      genre: values.genre,
    };

    const created = await createCategoryMutation.mutateAsync(payload);

    if (state.from === 'tasks') {
      navigate('/tasks', {
        state: { createdCategory: created },
      });
      return;
    }

    if (state.from === 'events') {
      navigate('/events', {
        state: { createdCategory: created },
      });
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Categorie</h1>

      <section style={{ marginBottom: 24 }}>
        <h2>Nuova categoria</h2>
        <CategoryForm
          mode="create"
          initialValues={
            state.genreHint
              ? {
                  name: '',
                  color: '#cccccc',
                  genre: state.genreHint,
                }
              : undefined
          }
          onSubmit={handleCreate}
        />
      </section>

      <section>
        <h2>Categorie esistenti</h2>

        {isLoading ? (
          <p>Caricamento...</p>
        ) : isError ? (
          <p>
            Errore nel caricamento:{' '}
            {error instanceof Error ? error.message : 'errore sconosciuto'}
          </p>
        ) : categories.length === 0 ? (
          <p>Nessuna categoria trovata.</p>
        ) : (
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 14,
            }}
          >
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px 12px' }}>Nome</th>
                <th style={{ textAlign: 'left', padding: '8px 12px' }}>Colore</th>
                <th style={{ textAlign: 'left', padding: '8px 12px' }}>Tipo</th>
                <th style={{ textAlign: 'left', padding: '8px 12px' }}>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c: Category) => (
                <tr key={c.id}>
                  <td style={{ padding: '8px 12px' }}>{c.category_name}</td>
                  <td style={{ padding: '8px 12px' }}>
                    {c.colore ? (
                      <span
                        title={c.colore}
                        style={{
                          display: 'inline-block',
                          width: 16,
                          height: 16,
                          borderRadius: 4,
                          background: c.colore,
                          border: '1px solid #ccc',
                          verticalAlign: 'middle',
                        }}
                      />
                    ) : (
                      '-'
                    )}
                  </td>
                  <td style={{ padding: '8px 12px' }}>{genreLabel(c.genre)}</td>
                  <td style={{ padding: '8px 12px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        navigate(`/categories/${c.id}/edit`);
                      }}
                    >
                      Modifica
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default CategoriesPage;