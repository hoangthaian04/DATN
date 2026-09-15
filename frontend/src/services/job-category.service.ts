import api from './api';
import type { BaseResponse } from '@/types/api.types';

export interface JobCategoryOption {
  id: number;
  name: string;
  slug: string;
}

export const jobCategoryService = {
  getActiveOptions: async (): Promise<JobCategoryOption[]> => {
    const response = await api.get<BaseResponse<JobCategoryOption[]>>('/job-categories');
    return response.data.data;
  },
};
