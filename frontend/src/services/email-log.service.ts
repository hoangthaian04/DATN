import { api } from './api';
import type { BasePagination, BaseResponse } from '@/types/api.types';
import type { EmailLog, EmailLogStatus } from '@/types/email-log.types';

export const emailLogService = {
  list: async (params: { page?: number; limit?: number; status?: EmailLogStatus; templateCode?: string }) =>
    (await api.get<BaseResponse<BasePagination<EmailLog>>>('/email-logs', { params })).data.data,
  get: async (id: number) =>
    (await api.get<BaseResponse<EmailLog>>(`/email-logs/${id}`)).data.data,
  retry: async (id: number) =>
    (await api.post<BaseResponse<{ logId: number; status: EmailLogStatus; retriedAt: string }>>(`/email-logs/${id}/retry`)).data.data,
};
