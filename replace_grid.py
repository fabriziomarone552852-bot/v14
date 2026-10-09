import re

path = 'c:/Users/Fabrizio/Desktop/app/smart/v14/frontend/src/views/Trackers/TVSeriesPage.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

target = '''                {debouncedQuery ? (
                  isSearchLoading ? (
                    <div className="col-span-full h-40 flex flex-col items-center justify-center gap-3 text-blue-500">
                      <LoadingIcon className="w-8 h-8 animate-spin" />
                      <p className="text-sm font-medium">Ricerca in corso...</p>
                    </div>
                  ) : searchResults?.results?.length === 0 ? (
                    <div className="col-span-full h-40">
                       <EmptyState 
                         message={`Nessun risultato trovato per "${debouncedQuery}"`} 
                         icon={<TvIcon className="w-12 h-12 opacity-20" />} 
                       />
                    </div>
                  ) : (
                    searchResults?.results?.map((res: any) => {'''

replacement = '''                {debouncedQuery || (filters.globalSearch && (filters.genre !== 'all' || filters.network !== 'all' || filters.year !== 'all')) ? (() => {
                  const isLoading = debouncedQuery ? isSearchLoading : isDiscoverLoading;
                  const results = debouncedQuery ? searchResults?.results : discoverData?.results;
                  
                  if (isLoading) {
                    return (
                      <div className="col-span-full h-40 flex flex-col items-center justify-center gap-3 text-blue-500">
                        <LoadingIcon className="w-8 h-8 animate-spin" />
                        <p className="text-sm font-medium">Ricerca in corso...</p>
                      </div>
                    );
                  }
                  
                  if (!results || results.length === 0) {
                    return (
                      <div className="col-span-full h-40">
                         <EmptyState 
                           message={debouncedQuery ? `Nessun risultato trovato per "${debouncedQuery}"` : `Nessun risultato trovato`} 
                           icon={<TvIcon className="w-12 h-12 opacity-20" />} 
                         />
                      </div>
                    );
                  }
                  
                  return results.map((res: any) => {'''

content = content.replace(target, replacement)

target2 = '''                    })
                  )
                ) : displaySeries.length === 0 ? ('''

replacement2 = '''                    });
                  })()
                ) : displaySeries.length === 0 ? ('''

content = content.replace(target2, replacement2)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
