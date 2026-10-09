import os

queries_path = 'c:/Users/Fabrizio/Desktop/app/smart/v14/frontend/src/hooks/queries/useTrackersQueries.ts'
content = '''

export const useTMDBDiscover = (filters: any) => {
  return useQuery({
    queryKey: ['tmdb', 'discover', filters.genre, filters.network, filters.year],
    queryFn: async () => {
      const params: any = {};
      if (filters.genre && filters.genre !== 'all') params.with_genres = filters.genre;
      if (filters.network && filters.network !== 'all') params.with_networks = filters.network;
      if (filters.year && filters.year !== 'all') params.first_air_date_year = filters.year;
      
      const data = await api.get<any>('/trackers/tmdb/discover', { params });
      return data;
    },
    enabled: !!filters.globalSearch && (filters.genre !== 'all' || filters.network !== 'all' || filters.year !== 'all'),
  });
};
'''
with open(queries_path, 'a', encoding='utf-8') as f:
    f.write(content)
