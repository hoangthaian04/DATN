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

export interface AuditActor {
  id?: number;
  email?: string;
  fullName?: string;
  role?: string;
}

export interface AuditLog {
  id: number;
  actor?: AuditActor;
  companyId?: number;
  companyName?: string;
  action: string;
  targetType: string;
  targetId?: number;
  ipAddress?: string;
  createdAt: string;
}

export interface AuditLogDetail extends AuditLog {
  userAgent?: string;
  requestId?: string;
  metadata?: string;
}

export interface AuditLogFilterParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  action?: string;
  email?: string;
}

export type AdminUserRole = 'ADMIN' | 'HR_ADMIN' | 'HR';
export type AdminUserStatus = 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'BLOCKED';

export interface AdminUserSummary {
  id: number;
  fullName: string;
  email: string;
  companyId?: number;
  companyName?: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  createdAt: string;
  lastLoginAt?: string;
}

export interface AdminUserLogin {
  ipAddress?: string;
  userAgent?: string;
  loginAt: string;
}

export interface AdminUserDetail extends AdminUserSummary {
  avatarUrl?: string;
  company?: { id: number; name: string };
  jobsCreatedCount: number;
  recentLogins: AdminUserLogin[];
}

export interface AdminUserFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  companyId?: number;
  role?: AdminUserRole;
  status?: AdminUserStatus;
}

export interface AdminUserStatusRequest {
  status: 'ACTIVE' | 'INACTIVE';
  reason?: string;
}
