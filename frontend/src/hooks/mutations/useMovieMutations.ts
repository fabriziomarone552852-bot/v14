// src/hooks/mutations/useMovieMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiService';
import type {
  Movie,
  UserMovieLog,
  MovieQuote,
} from '@/types/movies';

export const useMovieMutations = () => {
  const queryClient = useQueryClient();

  // 1. Aggiunta Film alla libreria
  const addMovieMutation = useMutation({
    mutationFn: async ({
      tmdb_id,
      status = 'to_watch',
    }: {
      tmdb_id: number;
      status?: string;
      movieDetails?: Partial<Movie>;
    }) => {
      return await api.post<Movie>('/trackers/movies', { tmdb_id, status });
    },
    onMutate: async ({ tmdb_id, status = 'to_watch', movieDetails }) => {
      await queryClient.cancelQueries({ queryKey: ['trackers', 'movies'] });
      const previousMovies = queryClient.getQueryData<Movie[]>(['trackers', 'movies']);

      // Aggiornamento ottimistico a 0ms (sia se esiste già che se è un film nuovo)
      queryClient.setQueryData<Movie[]>(['trackers', 'movies'], (old = []) => {
        const match = old.find((m) => m.tmdb_id === tmdb_id);
        if (match) {
          return old.map((m) =>
            m.tmdb_id === tmdb_id ? { ...m, status: status ?? m.status } : m
          );
        }

        // Nuovo film aggiunto alla libreria: inserimento ottimistico immediato a 0ms in RAM
        const optimisticMovie: Movie = {
          id: -Math.floor(Math.random() * 100000),
          tmdb_id,
          movie_tmdb_id: tmdb_id,
          title: movieDetails?.title || 'Film aggiunto',
          original_title: movieDetails?.original_title || '',
          overview: movieDetails?.overview || '',
          poster_path: movieDetails?.poster_path || '',
          backdrop_path: movieDetails?.backdrop_path || '',
          status,
          is_rewatching: false,
          watch_count: 0,
          added_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          logs: [],
          quotes: [],
          ...movieDetails,
        };

        return [optimisticMovie, ...old];
      });

      return { previousMovies };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousMovies) {
        queryClient.setQueryData(['trackers', 'movies'], context.previousMovies);
      }
    },
    onSuccess: (savedMovie) => {
      queryClient.setQueryData<Movie[]>(['trackers', 'movies'], (old) => {
        if (!old) return savedMovie ? [savedMovie] : [];
        if (!savedMovie) return old;
        const exists = old.some((m) => m.tmdb_id === savedMovie.tmdb_id);
        if (exists) {
          return old.map((m) => (m.tmdb_id === savedMovie.tmdb_id ? savedMovie : m));
        }
        return [savedMovie, ...old];
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['trackers', 'movies'] });
      queryClient.invalidateQueries({ queryKey: ['trackers', 'movies', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['trackers', 'movies', 'full-stats'] });
      queryClient.invalidateQueries({ queryKey: ['trackers', 'movies', 'upcoming'] });
    },
  });

  // 2. Aggiornamento stato film (status, poster, rewatch)
  const updateMovieMutation = useMutation({
    mutationFn: async ({
      tmdb_id,
      updates,
    }: {
      tmdb_id: number;
      updates: {
        status?: string;
        is_rewatching?: boolean;
        custom_poster_path?: string;
        custom_backdrop_path?: string;
        obtained_at?: string | null;
        is_obtained?: boolean;
      };
    }) => {
      return await api.patch<Movie>(`/trackers/movies/${tmdb_id}`, updates);
    },
    onMutate: async ({ tmdb_id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['trackers', 'movies'] });
      const previousMovies = queryClient.getQueryData<Movie[]>(['trackers', 'movies']);

      if (previousMovies) {
        queryClient.setQueryData<Movie[]>(['trackers', 'movies'], (old) => {
          if (!old) return old;
          return old.map((m) => {
            if (m.tmdb_id !== tmdb_id) return m;
            const updated = { ...m, ...updates };
            if ('obtained_at' in updates) {
              updated.is_obtained = Boolean(updates.obtained_at);
            } else if (updates.is_obtained !== undefined) {
              updated.is_obtained = updates.is_obtained;
              updated.obtained_at = updates.is_obtained ? new Date().toISOString() : null;
            }
            return updated;
          });
        });
      }

      return { previousMovies };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousMovies) {
        queryClient.setQueryData(['trackers', 'movies'], context.previousMovies);
      }
    },
    onSettled: (data) => {
      if (data?.tmdb_id) {
        queryClient.invalidateQueries({ queryKey: ['trackers', 'movies', data.tmdb_id] });
      }
      queryClient.invalidateQueries({ queryKey: ['trackers', 'movies'] });
      queryClient.invalidateQueries({ queryKey: ['trackers', 'movies', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['trackers', 'movies', 'full-stats'] });
      queryClient.invalidateQueries({ queryKey: ['trackers', 'movies', 'upcoming'] });
    },
  });

  // 3. Rimozione film dalla libreria
  const deleteMovieMutation = useMutation({
    mutationFn: async (tmdb_id: number) => {
      return await api.delete<void>(`/trackers/movies/${tmdb_id}`);
    },
    onMutate: async (tmdb_id) => {
      await queryClient.cancelQueries({ queryKey: ['trackers', 'movies'] });
      const previousMovies = queryClient.getQueryData<Movie[]>(['trackers', 'movies']);

      if (previousMovies) {
        queryClient.setQueryData<Movie[]>(['trackers', 'movies'], (old) => {
          if (!old) return old;
          return old.filter((m) => m.tmdb_id !== tmdb_id);
        });
      }

      return { previousMovies };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousMovies) {
        queryClient.setQueryData(['trackers', 'movies'], context.previousMovies);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['trackers', 'movies'] });
      queryClient.invalidateQueries({ queryKey: ['trackers', 'movies', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['trackers', 'movies', 'full-stats'] });
      queryClient.invalidateQueries({ queryKey: ['trackers', 'movies', 'upcoming'] });
    },
  });

  // 4. Aggiunta visione/recensione film (Diario)
  const addMovieLogMutation = useMutation({
    mutationFn: async ({
      tmdb_id,
      payload,
    }: {
      tmdb_id: number;
      payload: {
        rating?: number | null;
        notes?: string | null;
        review_visibility?: string;
        viewing_platform_id?: number | null;
        viewing_platform_name?: string | null;
        watched_at?: string | null;
      };
    }) => {
      return await api.post<Movie>(`/trackers/movies/${tmdb_id}/logs`, payload);
    },
    onMutate: async ({ tmdb_id, payload }) => {
      await queryClient.cancelQueries({ queryKey: ['trackers', 'movies'] });
      const previousMovies = queryClient.getQueryData<Movie[]>(['trackers', 'movies']);

      if (previousMovies) {
        queryClient.setQueryData<Movie[]>(['trackers', 'movies'], (old) => {
          if (!old) return old;
          return old.map((m) => {
            if (m.tmdb_id !== tmdb_id) return m;

            const fakeLog: UserMovieLog = {
              id: Date.now(),
              user_id: 0,
              movie_tmdb_id: tmdb_id,
              rating: payload.rating,
              notes: payload.notes,
              review_visibility: payload.review_visibility || 'friends_only',
              viewing_platform_id: payload.viewing_platform_id,
              viewing_platform_name: payload.viewing_platform_name,
              watched_at: payload.watched_at || new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              comments: [],
            };

            return {
              ...m,
              status: 'watched',
              my_rating: payload.rating ?? m.my_rating,
              my_last_watched_at: payload.watched_at || new Date().toISOString(),
              watch_count: (m.watch_count || 0) + 1,
              logs: [fakeLog, ...(m.logs || [])],
            };
          });
        });
      }

      return { previousMovies };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousMovies) {
        queryClient.setQueryData(['trackers', 'movies'], context.previousMovies);
      }
    },
    onSuccess: (updatedMovie) => {
      if (updatedMovie) {
        queryClient.setQueryData<Movie[]>(['trackers', 'movies'], (old) => {
          if (!old) return [updatedMovie];
          const exists = old.some((m) => m.tmdb_id === updatedMovie.tmdb_id);
          if (exists) {
            return old.map((m) => (m.tmdb_id === updatedMovie.tmdb_id ? updatedMovie : m));
          }
          return [updatedMovie, ...old];
        });
      }
    },
    onSettled: (data) => {
      if (data?.tmdb_id) {
        queryClient.invalidateQueries({ queryKey: ['trackers', 'movies', data.tmdb_id] });
      }
      queryClient.invalidateQueries({ queryKey: ['trackers', 'movies'] });
      queryClient.invalidateQueries({ queryKey: ['trackers', 'movies', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['trackers', 'movies', 'full-stats'] });
      queryClient.invalidateQueries({ queryKey: ['trackers', 'movies', 'upcoming'] });
    },
  });

  // 5. Modifica log di visione
  const updateMovieLogMutation = useMutation({
    mutationFn: async ({
      log_id,
      payload,
    }: {
      log_id: number;
      payload: {
        rating?: number | null;
        notes?: string | null;
        review_visibility?: string;
        viewing_platform_id?: number | null;
        viewing_platform_name?: string | null;
        watched_at?: string | null;
      };
    }) => {
      return await api.patch<Movie>(`/trackers/movies/logs/${log_id}`, payload);
    },
    onSuccess: (updatedMovie) => {
      if (updatedMovie) {
        queryClient.setQueryData<Movie[]>(['trackers', 'movies'], (old) => {
          if (!old) return [updatedMovie];
          return old.map((m) => (m.tmdb_id === updatedMovie.tmdb_id ? updatedMovie : m));
        });
      }
    },
    onSettled: (data) => {
      if (data?.tmdb_id) {
        queryClient.invalidateQueries({ queryKey: ['trackers', 'movies', data.tmdb_id] });
      }
      queryClient.invalidateQueries({ queryKey: ['trackers', 'movies'] });
      queryClient.invalidateQueries({ queryKey: ['trackers', 'movies', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['trackers', 'movies', 'full-stats'] });
      queryClient.invalidateQueries({ queryKey: ['trackers', 'platforms'] });
    },
  });

  // 6. Cancellazione log di visione
  const deleteMovieLogMutation = useMutation({
    mutationFn: async ({ log_id }: { log_id: number }) => {
      return await api.delete<Movie>(`/trackers/movies/logs/${log_id}`);
    },
    onSuccess: (updatedMovie) => {
      if (updatedMovie) {
        queryClient.setQueryData<Movie[]>(['trackers', 'movies'], (old) => {
          if (!old) return [updatedMovie];
          return old.map((m) => (m.tmdb_id === updatedMovie.tmdb_id ? updatedMovie : m));
        });
      }
    },
    onSettled: (data) => {
      if (data?.tmdb_id) {
        queryClient.invalidateQueries({ queryKey: ['trackers', 'movies', data.tmdb_id] });
      }
      queryClient.invalidateQueries({ queryKey: ['trackers', 'movies'] });
      queryClient.invalidateQueries({ queryKey: ['trackers', 'movies', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['trackers', 'movies', 'full-stats'] });
    },
  });

  // 7. Segna come visto rapido
  const markMovieWatchedMutation = useMutation({
    mutationFn: async (tmdb_id: number) => {
      return await api.post<Movie>(`/trackers/movies/${tmdb_id}/watched-all`, {});
    },
    onMutate: async (tmdb_id) => {
      await queryClient.cancelQueries({ queryKey: ['trackers', 'movies'] });
      const previousMovies = queryClient.getQueryData<Movie[]>(['trackers', 'movies']);

      if (previousMovies) {
        queryClient.setQueryData<Movie[]>(['trackers', 'movies'], (old) => {
          if (!old) return old;
          return old.map((m) => {
            if (m.tmdb_id !== tmdb_id) return m;
            return {
              ...m,
              status: 'watched',
              watch_count: (m.watch_count || 0) + 1,
              my_last_watched_at: new Date().toISOString(),
            };
          });
        });
      }

      return { previousMovies };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousMovies) {
        queryClient.setQueryData(['trackers', 'movies'], context.previousMovies);
      }
    },
    onSettled: (data) => {
      if (data?.tmdb_id) {
        queryClient.invalidateQueries({ queryKey: ['trackers', 'movies', data.tmdb_id] });
      }
      queryClient.invalidateQueries({ queryKey: ['trackers', 'movies'] });
      queryClient.invalidateQueries({ queryKey: ['trackers', 'movies', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['trackers', 'movies', 'full-stats'] });
      queryClient.invalidateQueries({ queryKey: ['trackers', 'movies', 'upcoming'] });
    },
  });

  // 8. Citazioni
  const addMovieQuoteMutation = useMutation({
    mutationFn: async ({ tmdb_id, quote_text }: { tmdb_id: number; quote_text: string }) => {
      return await api.post<MovieQuote>(`/trackers/movies/${tmdb_id}/quotes`, { quote_text });
    },
    onMutate: async ({ tmdb_id, quote_text }) => {
      await queryClient.cancelQueries({ queryKey: ['trackers', 'movies'] });
      const previousMovies = queryClient.getQueryData<Movie[]>(['trackers', 'movies']);
      if (previousMovies) {
        queryClient.setQueryData<Movie[]>(['trackers', 'movies'], (old) => {
          if (!old) return old;
          return old.map((m) => {
            if (m.tmdb_id !== tmdb_id) return m;
            const fakeQuote: MovieQuote = {
              id: Date.now(),
              user_id: 0,
              movie_tmdb_id: tmdb_id,
              quote_text,
              created_at: new Date().toISOString(),
            };
            return {
              ...m,
              quotes: [fakeQuote, ...(m.quotes || [])],
            };
          });
        });
      }
      return { previousMovies };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousMovies) {
        queryClient.setQueryData(['trackers', 'movies'], context.previousMovies);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['trackers', 'movies', 'quotes'] });
      queryClient.invalidateQueries({ queryKey: ['trackers', 'movies'] });
    },
  });

  const updateMovieQuoteMutation = useMutation({
    mutationFn: async ({ quote_id, quote_text }: { quote_id: number; quote_text: string }) => {
      return await api.patch<MovieQuote>(`/trackers/movies/quotes/${quote_id}`, { quote_text });
    },
    onMutate: async ({ quote_id, quote_text }) => {
      await queryClient.cancelQueries({ queryKey: ['trackers', 'movies'] });
      const previousMovies = queryClient.getQueryData<Movie[]>(['trackers', 'movies']);
      if (previousMovies) {
        queryClient.setQueryData<Movie[]>(['trackers', 'movies'], (old) => {
          if (!old) return old;
          return old.map((m) => {
            if (!m.quotes?.some((q) => q.id === quote_id)) return m;
            return {
              ...m,
              quotes: m.quotes.map((q) => (q.id === quote_id ? { ...q, quote_text } : q)),
            };
          });
        });
      }
      return { previousMovies };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousMovies) {
        queryClient.setQueryData(['trackers', 'movies'], context.previousMovies);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['trackers', 'movies', 'quotes'] });
      queryClient.invalidateQueries({ queryKey: ['trackers', 'movies'] });
    },
  });

  const deleteMovieQuoteMutation = useMutation({
    mutationFn: async (quote_id: number) => {
      return await api.delete<void>(`/trackers/movies/quotes/${quote_id}`);
    },
    onMutate: async (quote_id) => {
      await queryClient.cancelQueries({ queryKey: ['trackers', 'movies'] });
      const previousMovies = queryClient.getQueryData<Movie[]>(['trackers', 'movies']);
      if (previousMovies) {
        queryClient.setQueryData<Movie[]>(['trackers', 'movies'], (old) => {
          if (!old) return old;
          return old.map((m) => {
            if (!m.quotes?.some((q) => q.id === quote_id)) return m;
            return {
              ...m,
              quotes: m.quotes.filter((q) => q.id !== quote_id),
            };
          });
        });
      }
      return { previousMovies };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousMovies) {
        queryClient.setQueryData(['trackers', 'movies'], context.previousMovies);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['trackers', 'movies', 'quotes'] });
      queryClient.invalidateQueries({ queryKey: ['trackers', 'movies'] });
    },
  });

  return {
    addMovieMutation,
    updateMovieMutation,
    deleteMovieMutation,
    addMovieLogMutation,
    updateMovieLogMutation,
    deleteMovieLogMutation,
    markMovieWatchedMutation,
    addMovieQuoteMutation,
    updateMovieQuoteMutation,
    deleteMovieQuoteMutation,
  };
};
