import api from './api';
import type { BasePagination, BaseResponse } from '@/types/api.types';
import type {
  CompanyDetail,
  CompanyFilterParams,
  CompanySummary,
} from '@/types/auth.types';

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
    const res = await api.put<BaseResponse<CompanySummary>>(`/admin/companies/${id}/approve`);
    return res.data.data;
  },

  /** Từ chối doanh nghiệp (chuyển sang REJECTED kèm lý do) */
  rejectCompany: async (id: number, reason: string): Promise<CompanySummary> => {
    const res = await api.put<BaseResponse<CompanySummary>>(`/admin/companies/${id}/reject`, {
      reason,
    });
    return res.data.data;
  },

  /** Khóa doanh nghiệp (chuyển sang BLOCKED) */
  blockCompany: async (id: number): Promise<CompanySummary> => {
    const res = await api.put<BaseResponse<CompanySummary>>(`/admin/companies/${id}/block`);
    return res.data.data;
  },
};
