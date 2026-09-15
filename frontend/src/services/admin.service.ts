import api from './api';
import type { BasePagination, BaseResponse } from '@/types/api.types';
import type {
  CompanyDetail,
  CompanyFilterParams,
  CompanySummary,
} from '@/types/auth.types';
import type {
  CreateJobCategoryRequest,
  JobCategory,
  JobCategoryFilterParams,
  JobCategoryPage,
  UpdateJobCategoryRequest,
} from '@/types/admin.types';

export const AdminService = {
  /** Lấy danh sách doanh nghiệp (phân trang + lọc theo trạng thái, từ khóa) */
  getCompanies: async (params?: CompanyFilterParams): Promise<BasePagination<CompanySummary>> => {
    const res = await api.get<BaseResponse<BasePagination<CompanySummary>>>('/admin/companies', {
      params,
    });
    return res.data.data;
  },

  /** Xem chi tiết doanh nghiệp */
  getCompanyDetail: async (id: number): Promise<CompanyDetail> => {
    const res = await api.get<BaseResponse<CompanyDetail>>(`/admin/companies/${id}`);
    return res.data.data;
  },

  /** Duyệt doanh nghiệp (chuyển sang ACTIVE) */
  approveCompany: async (id: number): Promise<CompanySummary> => {
    const res = await api.patch<BaseResponse<CompanySummary>>(`/admin/companies/${id}/status`, {status:'ACTIVE'});
    return res.data.data;
  },

  /** Từ chối doanh nghiệp (chuyển sang REJECTED kèm lý do) */
  rejectCompany: async (id: number, reason: string): Promise<CompanySummary> => {
    const res = await api.patch<BaseResponse<CompanySummary>>(`/admin/companies/${id}/status`, {status:'REJECTED',
      reason,
    });
    return res.data.data;
  },

  /** Khóa doanh nghiệp (chuyển sang BLOCKED) */
  blockCompany: async (id: number): Promise<CompanySummary> => {
    const res = await api.patch<BaseResponse<CompanySummary>>(`/admin/companies/${id}/status`, {status:'BLOCKED'});
    return res.data.data;
  },

  getJobCategories: async (params?: JobCategoryFilterParams): Promise<JobCategoryPage> => {
    const res = await api.get<BaseResponse<JobCategoryPage>>('/admin/job-categories', { params });
    return res.data.data;
  },

  createJobCategory: async (data: CreateJobCategoryRequest): Promise<JobCategory> => {
    const res = await api.post<BaseResponse<JobCategory>>('/admin/job-categories', data);
    return res.data.data;
  },

  updateJobCategory: async (id: number, data: UpdateJobCategoryRequest): Promise<JobCategory> => {
    const res = await api.put<BaseResponse<JobCategory>>(`/admin/job-categories/${id}`, data);
    return res.data.data;
  },

  deleteJobCategory: async (id: number): Promise<void> => {
    await api.delete<BaseResponse<null>>(`/admin/job-categories/${id}`);
  },

  reorderJobCategories: async (orderedIds: number[]): Promise<JobCategory[]> => {
    const res = await api.put<BaseResponse<JobCategory[]>>('/admin/job-categories/reorder', { orderedIds });
    return res.data.data;
  },
};
