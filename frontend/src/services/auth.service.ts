import api from './api';
import type { BaseResponse } from '@/types/api.types';
import type {
  CompanyProfile,
  CompanyDetail,
  CompanyRegistrationUpdateRequest,
  LoginRequest,
  LoginResponse,
  OnboardingRequest,
  RegisterRequest,
  RegistrationResponse,
  User,
} from '@/types/auth.types';

export const AuthService = {
  initializeCsrf: async (): Promise<void> => {
    await api.get<BaseResponse<string>>('/auth/csrf');
  },

  register: async (data: RegisterRequest): Promise<RegistrationResponse> => {
    const response = await api.post<BaseResponse<RegistrationResponse>>('/auth/register', data);
    return response.data.data;
  },

  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<BaseResponse<LoginResponse>>('/auth/login', data);
    return response.data.data;
  },

  googleLogin: async (idToken: string): Promise<LoginResponse> => {
    const response = await api.post<BaseResponse<LoginResponse>>('/auth/google', { idToken });
    return response.data.data;
  },

  adminLogin: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<BaseResponse<LoginResponse>>('/admin/auth/login', data);
    return response.data.data;
  },

  getMe: async (): Promise<User> => {
    const response = await api.get<BaseResponse<User>>('/auth/me');
    return response.data.data;
  },

  getCompanyProfile: async (): Promise<CompanyProfile> => {
    const response = await api.get<BaseResponse<CompanyProfile>>('/company-profiles/me');
    return response.data.data;
  },

  updateCompanyProfile: async (data: OnboardingRequest): Promise<CompanyProfile> => {
    const response = await api.patch<BaseResponse<import('@/types/auth.types').CompanyDetail>>('/company-profiles/me', data);
    if (!response.data.data.profile) throw new Error('Phản hồi hồ sơ công ty không hợp lệ');
    return response.data.data.profile;
  },

  uploadCompanyLogo: async (file: File): Promise<CompanyProfile> => {
    const body = new FormData();
    body.append('file', file);
    const response = await api.post<BaseResponse<import('@/types/auth.types').CompanyDetail>>('/company-profiles/me/logo', body, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    if (!response.data.data.profile) throw new Error('Phản hồi hồ sơ công ty không hợp lệ');
    return response.data.data.profile;
  },

  completeOnboarding: async (skip = false): Promise<CompanyProfile> => {
    const response = await api.patch<BaseResponse<import('@/types/auth.types').CompanyDetail>>(
      '/company-profiles/me/onboarding',
      { skip },
    );
    if (!response.data.data.profile) throw new Error('Phản hồi hồ sơ công ty không hợp lệ');
    return response.data.data.profile;
  },

  getOwnRegistration: async (): Promise<CompanyDetail> => {
    const response = await api.get<BaseResponse<CompanyDetail>>('/company-registration/me');
    return response.data.data;
  },

  updateOwnRegistration: async (data: CompanyRegistrationUpdateRequest): Promise<CompanyDetail> => {
    const response = await api.patch<BaseResponse<CompanyDetail>>('/company-registration/me', data);
    return response.data.data;
  },

  resubmitOwnRegistration: async (): Promise<CompanyDetail> => {
    const response = await api.post<BaseResponse<CompanyDetail>>('/company-registration/me/resubmit');
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },
};
