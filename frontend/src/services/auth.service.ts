import api from './api';
import type { BaseResponse } from '@/types/api.types';
import type {
  CompanyDetail,
  LoginRequest,
  LoginResponse,
  OnboardingRequest,
  RegisterRequest,
  User,
} from '@/types/auth.types';

export const AuthService = {
  /** Đăng ký tài khoản HR mới */
  register: async (data: RegisterRequest): Promise<LoginResponse> => {
    const res = await api.post<BaseResponse<LoginResponse>>('/auth/register', data);
    return res.data.data;
  },

  /** Đăng nhập HR */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await api.post<BaseResponse<LoginResponse>>('/auth/login', data);
    return res.data.data;
  },

  /** Đăng nhập Quản trị viên (Admin) */
  adminLogin: async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await api.post<BaseResponse<LoginResponse>>('/admin/auth/login', data);
    return res.data.data;
  },

  /** Hoàn tất Onboarding công ty (chuyển trạng thái sang PENDING) */
  onboarding: async (data: OnboardingRequest): Promise<CompanyDetail> => {
    const res = await api.post<BaseResponse<CompanyDetail>>('/auth/onboarding', data);
    return res.data.data;
  },

  /** Lấy thông tin user hiện tại */
  getMe: async (): Promise<User> => {
    const res = await api.get<BaseResponse<User>>('/auth/me');
    return res.data.data;
  },

  /** Đăng xuất */
  logout: async (): Promise<void> => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  /** Lưu tokens vào localStorage */
  saveTokens: (tokens: { accessToken: string; refreshToken: string }): void => {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  },

  /** Kiểm tra có token hay không */
  hasToken: (): boolean => {
    return !!localStorage.getItem('accessToken');
  },
};
