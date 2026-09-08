import { api } from './api';
import type { BaseResponse } from '@/types/api.types';
import type { HiringRound, HiringRoundRequest } from '@/types/hiring-round.types';

export const hiringRoundService = {
  getRounds: async (jobId: string) => (await api.get<BaseResponse<HiringRound[]>>(`/jobs/${jobId}/rounds`)).data.data,
  createRound: async (jobId: string, data: HiringRoundRequest) => (await api.post<BaseResponse<HiringRound>>(`/jobs/${jobId}/rounds`, data)).data.data,
  updateRound: async (jobId: string, roundId: number, data: HiringRoundRequest) => (await api.put<BaseResponse<HiringRound>>(`/jobs/${jobId}/rounds/${roundId}`, data)).data.data,
  deleteRound: async (jobId: string, roundId: number) => (await api.delete<BaseResponse>(`/jobs/${jobId}/rounds/${roundId}`)).data,
  reorderRounds: async (jobId: string, orderedIds: number[]) => (await api.put<BaseResponse<HiringRound[]>>(`/jobs/${jobId}/rounds/reorder`, { orderedIds })).data.data,
};
