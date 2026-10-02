import { api } from './api';
import type { BaseResponse } from '@/types/api.types';
import type {
  AiMatchingContactResult,
  AiMatchingContactTemplate,
  AiMatchingRun,
  AiSuggestion,
} from '@/types/ai-matching.types';

export const aiMatchingService = {
  trigger: async (jobId: string, payload: { forceRerun: boolean; minScore: number; limit: number }) => {
    const response = await api.post<BaseResponse<AiMatchingRun>>(
      `/jobs/${jobId}/ai-matching/trigger`,
      payload,
    );
    return response.data.data;
  },

  latestRun: async (jobId: string) => {
    const response = await api.get<BaseResponse<AiMatchingRun | null>>(
      `/jobs/${jobId}/ai-matching/status`,
    );
    return response.data.data;
  },

  suggestions: async (jobId: string) => {
    const response = await api.get<BaseResponse<AiSuggestion[]>>(
      `/jobs/${jobId}/ai-suggestions`,
    );
    return response.data.data;
  },

  contactTemplate: async (jobId: string, suggestionId: number) => {
    const response = await api.get<BaseResponse<AiMatchingContactTemplate>>(
      `/jobs/${jobId}/ai-suggestions/${suggestionId}/contact-template`,
    );
    return response.data.data;
  },

  contact: async (jobId: string, suggestionId: number, payload: { subject: string; body: string }) => {
    const response = await api.post<BaseResponse<AiMatchingContactResult>>(
      `/jobs/${jobId}/ai-suggestions/${suggestionId}/contact`,
      payload,
    );
    return response.data.data;
  },
};
