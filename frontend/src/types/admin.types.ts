import type { BasePagination } from './api.types';

export type JobCategoryStatus = 'ACTIVE' | 'INACTIVE';

export interface JobCategory {
  id: number;
  name: string;
  slug: string;
  sortOrder: number;
  status: JobCategoryStatus;
  jobCount: number;
  createdAt: string;
}

export interface JobCategoryFilterParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CreateJobCategoryRequest {
  name: string;
}

export interface UpdateJobCategoryRequest {
  name?: string;
  status?: JobCategoryStatus;
}

export type JobCategoryPage = BasePagination<JobCategory>;
