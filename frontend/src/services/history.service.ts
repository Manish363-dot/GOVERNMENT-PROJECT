import { api } from './api';
import { HistoryResult } from '@/types';

export const historyService = {
  getHistory: (vehicleId: string, date: string) =>
    api.get<HistoryResult>(`/history?vehicleId=${vehicleId}&date=${date}`),
};
