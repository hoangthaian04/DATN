import { api } from './api';
import type { BaseResponse } from '@/types/api.types';
import type { FormField, FormFieldRequest } from '@/types/form-field.types';

export const formFieldService = {
  getFormFields: async (jobId: number | string) => (
    await api.get<BaseResponse<FormField[]>>(`/jobs/${jobId}/form-fields`)
  ).data.data,

  createFormField: async (jobId: number | string, data: FormFieldRequest) => (
    await api.post<BaseResponse<FormField>>(`/jobs/${jobId}/form-fields`, data)
  ).data.data,

  updateFormField: async (jobId: number | string, fieldId: number, data: FormFieldRequest) => (
    await api.put<BaseResponse<FormField>>(`/jobs/${jobId}/form-fields/${fieldId}`, data)
  ).data.data,

  deleteFormField: async (jobId: number | string, fieldId: number) => (
    await api.delete<BaseResponse>(`/jobs/${jobId}/form-fields/${fieldId}`)
  ).data,

  reorderFormFields: async (jobId: number | string, orderedIds: number[]) => (
    await api.put<BaseResponse<FormField[]>>(`/jobs/${jobId}/form-fields/reorder`, { orderedIds })
  ).data.data,
};
