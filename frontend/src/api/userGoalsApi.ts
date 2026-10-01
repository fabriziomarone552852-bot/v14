// src/api/userGoalsApi.ts
import { api } from './apiService';

export interface UserYearlyGoal {
  id: number;
  user_id: number;
  year: number;
  tracker_type: string;
  goal_value: number;
  created_at: string;
}

export const userGoalsApi = {
  getYearlyGoal: async (trackerType: string, year: number): Promise<UserYearlyGoal | null> => {
    try {
      const result = await api.get<UserYearlyGoal>(`/users/me/yearly-goals/${trackerType}?year=${year}`);
      return result;
    } catch (e: any) {
      // Se il backend ritorna 404, significa che non c'è un obiettivo
      if (e?.message?.includes('404')) {
        return null;
      }
      throw e;
    }
  },
  
  setYearlyGoal: async (trackerType: string, year: number, goalValue: number): Promise<UserYearlyGoal | null> => {
    return api.put<UserYearlyGoal, { goal_value: number }>(`/users/me/yearly-goals/${trackerType}?year=${year}`, {
      goal_value: goalValue
    });
  }
};
