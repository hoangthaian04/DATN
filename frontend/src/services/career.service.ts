import api from './api';
import type { BaseResponse } from '@/types/api.types';
import type { PublicCompany, PublicJobDetail, PublicJobPage } from '@/types/career.types';

export interface PublicJobFilters {
  keyword?: string;
  location?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export const careerService = {
  getCompany: async (companySlug: string) => {
    const response = await api.get<BaseResponse<PublicCompany>>(
      `/public/companies/${encodeURIComponent(companySlug)}`
    );
    return response.data.data;
  },

  getJobs: async (companySlug: string, filters: PublicJobFilters = {}) => {
    const response = await api.get<BaseResponse<PublicJobPage>>(
      `/public/companies/${encodeURIComponent(companySlug)}/jobs`,
      { params: filters }
    );
    return response.data.data;
  },

  getJob: async (companySlug: string, jobSlug: string) => {
    const response = await api.get<BaseResponse<PublicJobDetail>>(
      `/public/companies/${encodeURIComponent(companySlug)}/jobs/${encodeURIComponent(jobSlug)}`
    );
    return response.data.data;
  },
};
