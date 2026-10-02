import { api } from './api';
import type { BaseResponse } from '@/types/api.types';
import type {
  CvAnalysisRequest,
  CvAnalysisResult,
  JobDescriptionSuggestion,
  JobDescriptionSuggestionRequest,
} from '@/types/ai.types';

export const aiService = {
  suggestJobDescription: async (payload: JobDescriptionSuggestionRequest) => {
    const response = await api.post<BaseResponse<JobDescriptionSuggestion>>(
      '/ai/job-description/suggest',
      payload,
    );
    return response.data.data;
  },

  analyzeCv: async (applicationId: number, payload: CvAnalysisRequest = { rerun: false }) => {
    const response = await api.post<BaseResponse<CvAnalysisResult>>(
      `/applications/${applicationId}/cv-analysis`,
      payload,
    );
    return response.data.data;
  },

  getLatestCvAnalysis: async (applicationId: number) => {
    const response = await api.get<BaseResponse<CvAnalysisResult | null>>(
      `/applications/${applicationId}/cv-analysis`,
    );
    return response.data.data;
  },
};
