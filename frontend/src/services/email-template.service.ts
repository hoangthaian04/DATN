import { api } from './api';
import type { BaseResponse } from '@/types/api.types';
import type { EmailTemplateApi, EmailTemplatePayload, EmailTemplateType } from '@/types/email-template.types';

type SpringPage<T> = { content: T[]; totalElements: number; totalPages: number; number: number; size: number };

export const emailTemplateService = {
  list: async (params?: { keyword?: string; type?: EmailTemplateType; activeOnly?: boolean }) => {
    const response = await api.get<BaseResponse<SpringPage<EmailTemplateApi>>>('/email-templates', { params: { page: 1, size: 100, ...params } });
    return response.data.data;
  },
  create: async (payload: EmailTemplatePayload) => (await api.post<BaseResponse<EmailTemplateApi>>('/email-templates', payload)).data.data,
  update: async (id: number, payload: Pick<EmailTemplatePayload, 'bodyHtml'> & { isActive?: boolean }) => (await api.patch<BaseResponse<EmailTemplateApi>>(`/email-templates/${id}`, payload)).data.data,
  remove: async (id: number) => (await api.delete<BaseResponse>(`/email-templates/${id}`)).data,
};
