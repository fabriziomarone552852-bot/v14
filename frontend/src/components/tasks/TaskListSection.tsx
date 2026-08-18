import React from 'react';

interface TaskListSectionProps {
  loading?: boolean;
  totalItems?: number;
  startIndex?: number;
  endIndex?: number;
  rowsPerPage?: number;
  setRowsPerPage?: (value: number) => void;
  safeCurrentPage?: number;
  totalPages?: number;
  setCurrentPage?: React.Dispatch<React.SetStateAction<number>>;
  rowsContent?: React.ReactNode;
  rowsPerPageOptions?: number[];
  children?: React.ReactNode;
}

const TaskListSection: React.FC<TaskListSectionProps> = ({
  loading = false,
  totalItems = 0,
  startIndex = 0,
  endIndex = 0,
  rowsPerPage = 10,
  setRowsPerPage,
  safeCurrentPage = 1,
  totalPages = 1,
  setCurrentPage,
  rowsContent,
  rowsPerPageOptions = [10, 20, 50],
  children,
}) => {
  // Se è usato con children diretti (come in TasksPage)
  if (children) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm text-slate-600">
          <thead className="border-b border-slate-100 bg-slate-50/75 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            <tr>
              <th className="py-3.5 pl-5 pr-3 lg:pl-6 text-left">Titolo</th>
              <th className="px-3 py-3.5 text-left">Descrizione</th>
              <th className="px-3 py-3.5 text-center">Inizio</th>
              <th className="px-3 py-3.5 text-center">Scadenza</th>
              <th className="px-3 py-3.5 text-center">Priorità</th>
              <th className="px-3 py-3.5 text-center">Categoria</th>
              <th className="px-3 py-3.5 text-center">Luogo</th>
              <th className="px-3 py-3.5 text-center">Fatto</th>
              <th className="py-3.5 pl-3 pr-5 text-right lg:pr-6">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400">
                  Caricamento attività...
                </td>
              </tr>
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>
    );
  }

  // Fallback con tabella autonoma
  return (
    <section>
      <h2>Elenco tasks</h2>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          marginBottom: 12,
          flexWrap: 'wrap',
        }}
      >
        <div>
          {totalItems === 0
            ? 'Nessun task trovato'
            : `Mostrando ${startIndex + 1}-${endIndex} di ${totalItems} task`}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label htmlFor="rowsPerPageTasks">Righe per pagina</label>
          <select
            id="rowsPerPageTasks"
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage && setRowsPerPage(Number(e.target.value))}
          >
            {(rowsPerPageOptions || [10, 20, 50]).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <p>Caricamento...</p>
      ) : totalItems === 0 ? (
        <p>Nessun risultato trovato con i filtri correnti.</p>
      ) : (
        <>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 14,
            }}
          >
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Titolo</th>
                <th style={{ textAlign: 'left' }}>Descrizione</th>
                <th>Data inizio</th>
                <th>Scadenza</th>
                <th>Priorità</th>
                <th>Categoria</th>
                <th>Luogo</th>
                <th>Fatto</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>{rowsContent}</tbody>
          </table>

          {totalPages > 1 && setCurrentPage && (
            <nav
              aria-label="Paginazione tasks"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
                marginTop: 16,
                flexWrap: 'wrap',
              }}
            >
              <div>
                Pagina {safeCurrentPage} di {totalPages}
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safeCurrentPage === 1 || loading}
                >
                  Precedente
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage === totalPages || loading}
                >
                  Successiva
                </button>
              </div>
            </nav>
          )}
        </>
      )}
    </section>
  );
};

export default TaskListSection;