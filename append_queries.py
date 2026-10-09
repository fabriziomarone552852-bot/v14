import os

queries_path = 'c:/Users/Fabrizio/Desktop/app/smart/v14/frontend/src/hooks/queries/useTrackersQueries.ts'
content = '''

export const useTMDBGenres = () => {
  return useQuery({
    queryKey: ['tmdb', 'genres'],
    queryFn: async () => {
      const data = await api.get<any>('/trackers/tmdb/genres');
      return data?.genres || [];
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};

export const useTMDBProviders = () => {
  return useQuery({
    queryKey: ['tmdb', 'providers'],
    queryFn: async () => {
      const data = await api.get<any>('/trackers/tmdb/providers');
      return data?.results || [];
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};
'''
with open(queries_path, 'a', encoding='utf-8') as f:
    f.write(content)
