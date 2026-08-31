import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

interface RetryableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
});

let refreshRequest: Promise<void> | null = null;

const isSessionEndpoint = (url = '') =>
  ['/auth/login', '/auth/register', '/auth/google', '/auth/refresh', '/admin/auth/login']
    .some((endpoint) => url.includes(endpoint));

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string }>) => {
    const request = error.config as RetryableRequest | undefined;
    Object.assign(error, {
      customMessage: error.response?.data?.message || error.message || 'Đã có lỗi xảy ra',
    });

    if (error.response?.status !== 401 || !request || request._retry || isSessionEndpoint(request.url)) {
      return Promise.reject(error);
    }

    request._retry = true;
    refreshRequest ??= api.post('/auth/refresh').then(() => undefined).finally(() => {
      refreshRequest = null;
    });

    try {
      await refreshRequest;
      return api(request);
    } catch (refreshError) {
      const adminPath = window.location.pathname.startsWith('/admin');
      const loginPath = adminPath ? '/admin/login?reason=session-expired' : '/login?reason=session-expired';
      if (!window.location.pathname.includes('/login')) {
        window.location.assign(loginPath);
      }
      return Promise.reject(refreshError);
    }
  },
);

export default api;
