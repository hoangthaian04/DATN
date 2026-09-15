import { api } from './api';
import type { BaseResponse, BasePagination } from '../types/api.types';
import type { JobSummary, JobStats, Job, CreateJobRequest, SaveJobPipelineRequest, UpdateJobRequest } from '../types/job.types';

export interface GetJobsParams {
  page?: number;
  limit?: number;
  keyword?: string;
  status?: string;
}

export const jobService = {
  createJob: async (data: CreateJobRequest) => {
    const response = await api.post<BaseResponse<Job>>('/jobs', data);
    return response.data.data;
  },

  publishJob: async (jobId: number | string) => {
    const response = await api.post<BaseResponse<Job>>(`/jobs/${jobId}/publish`);
    return response.data.data;
  },

  closeJob: async (jobId: number | string) => {
    const response = await api.post<BaseResponse<Job>>(`/jobs/${jobId}/close`);
    return response.data.data;
  },

  reopenJob: async (jobId: number | string) => {
    const response = await api.post<BaseResponse<Job>>(`/jobs/${jobId}/reopen`);
    return response.data.data;
  },

  getJobs: async (params: GetJobsParams) => {
    const response = await api.get<BaseResponse<BasePagination<JobSummary>>>('/jobs', { params });
    return response.data.data;
  },
  
  getStats: async () => {
    const response = await api.get<BaseResponse<JobStats>>('/jobs/stats');
    return response.data.data;
  },

  getJobById: async (jobId: number | string) => {
    const response = await api.get<BaseResponse<Job>>(`/jobs/${jobId}`);
    return response.data.data;
  },

  updateJob: async (jobId: number | string, data: UpdateJobRequest) => {
    const response = await api.put<BaseResponse<Job>>(`/jobs/${jobId}`, data);
    return response.data.data;
  },

  saveJobPipeline: async (jobId: number | string, data: SaveJobPipelineRequest) => {
    const response = await api.put<BaseResponse<Job>>(`/jobs/${jobId}/pipeline`, data);
    return response.data.data;
  },

  deleteJob: async (jobId: number | string) => {
    const response = await api.delete<BaseResponse>(`/jobs/${jobId}`);
    return response.data;
  }
};
