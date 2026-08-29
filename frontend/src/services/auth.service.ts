import api from './api';
import type { LoginRequest, LoginResponse, RegisterBusinessRequest, User } from '@/types/auth.types';

export const AuthService = {
  /** Đăng nhập HR */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>('/auth/login', data);
    return res.data;
  },

  /** Đăng nhập Admin */
  adminLogin: async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>('/auth/admin/login', data);
    return res.data;
  },

  /** Đăng ký doanh nghiệp mới */
  register: async (data: RegisterBusinessRequest): Promise<void> => {
    await api.post('/auth/register', data);
  },

  /** Đăng nhập bằng Google OAuth2 */
  loginWithGoogle: async (idToken: string): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>('/auth/google', { idToken });
    return res.data;
  },

  /** Lấy thông tin user hiện tại */
  getMe: async (): Promise<User> => {
    const res = await api.get<User>('/auth/me');
    return res.data;
  },

  /** Đăng xuất */
  logout: async (): Promise<void> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await api.post('/auth/logout', { refreshToken });
      } catch {
        // Bỏ qua lỗi khi logout
      }
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  /** Lưu tokens vào localStorage */
  saveTokens: (tokens: { accessToken: string; refreshToken: string }): void => {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  },

  /** Kiểm tra đã có token chưa */
  hasToken: (): boolean => {
    return !!localStorage.getItem('accessToken');
  },
};
