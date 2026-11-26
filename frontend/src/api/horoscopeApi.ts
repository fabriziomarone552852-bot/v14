// frontend/src/api/horoscopeApi.ts
import { apiClient } from './client';
import type { DailyHoroscopeCollectionResponse } from '@/types/horoscope';

export const horoscopeApi = {
  getDailyCollection: async (): Promise<DailyHoroscopeCollectionResponse> => {
    const response = await apiClient.get<DailyHoroscopeCollectionResponse>('/horoscope/daily');
    return response.data;
  },
};
