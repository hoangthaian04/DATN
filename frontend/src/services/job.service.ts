import { api } from './api';
import type { BaseResponse, BasePagination } from '../types/api.types';
import type { JobSummary, JobStats, Job, SaveJobPipelineRequest, UpdateJobRequest } from '../types/job.types';

export interface GetJobsParams {
  page?: number;
  limit?: number;
  keyword?: string;
  status?: string;
}

export const jobService = {
  getJobs: async (params: GetJobsParams) => {
    const response = await api.get<BaseResponse<BasePagination<JobSummary>>>('/jobs', { params });
    return response.data.data;
  },
  
  getStats: async () => {
    const response = await api.get<BaseResponse<JobStats>>('/jobs/stats');
    return response.data.data;
  },

  getJobById: async (jobId: string) => {
    const response = await api.get<BaseResponse<Job>>(`/jobs/${jobId}`);
    return response.data.data;
  },

  updateJob: async (jobId: string, data: UpdateJobRequest) => {
    const response = await api.put<BaseResponse<Job>>(`/jobs/${jobId}`, data);
    return response.data.data;
  },

  saveJobPipeline: async (jobId: string, data: SaveJobPipelineRequest) => {
    const response = await api.put<BaseResponse<Job>>(`/jobs/${jobId}/pipeline`, data);
    return response.data.data;
  },

  deleteJob: async (jobId: string) => {
    const response = await api.delete<BaseResponse>(`/jobs/${jobId}`);
    return response.data;
  }
};
