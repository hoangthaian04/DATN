import api from './api';
import type { BaseResponse } from '@/types/api.types';
import type {
  PublicApplicationStatus,
  PublicCompany,
  PublicJobDetail,
  PublicJobPage,
} from '@/types/career.types';

export interface PublicJobFilters {
  keyword?: string;
  location?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export interface PublicApplicationAnswer {
  questionId: number;
  answer: string;
}

export interface PublicApplicationPayload {
  fullName: string;
  email: string;
  phone: string;
  coverLetter?: string;
  cvFile: File;
  answers: PublicApplicationAnswer[];
  consentAccepted: boolean;
}

export interface PublicApplicationConfirmation {
  id: number;
  applicationStatus: string;
  trackingToken: string;
  submittedAt: string;
}

export const careerService = {
  getCompany: async (companySlug: string) => {
    const response = await api.get<BaseResponse<PublicCompany>>(
      `/public/companies/${encodeURIComponent(companySlug)}`
    );
    return response.data.data;
  },

  getJobs: async (companySlug: string, filters: PublicJobFilters = {}) => {
    const response = await api.get<BaseResponse<PublicJobPage>>(
      `/public/companies/${encodeURIComponent(companySlug)}/jobs`,
      { params: filters }
    );
    return response.data.data;
  },

  getJob: async (companySlug: string, jobSlug: string) => {
    const response = await api.get<BaseResponse<PublicJobDetail>>(
      `/public/companies/${encodeURIComponent(companySlug)}/jobs/${encodeURIComponent(jobSlug)}`
    );
    return response.data.data;
  },

  submitApplication: async (jobId: number, payload: PublicApplicationPayload) => {
    const body = new FormData();
    body.append('fullName', payload.fullName);
    body.append('email', payload.email);
    body.append('phone', payload.phone);
    if (payload.coverLetter) body.append('coverLetter', payload.coverLetter);
    body.append('cvFile', payload.cvFile);
    body.append('answers', JSON.stringify(payload.answers));
    body.append('consentAccepted', String(payload.consentAccepted));
    const response = await api.post<BaseResponse<PublicApplicationConfirmation>>(
      `/public/jobs/${jobId}/applications`,
      body
    );
    return response.data.data;
  },

  verifyMagicLink: async (token: string, email: string) => {
    const response = await api.post<BaseResponse<PublicApplicationStatus>>(
      '/candidates/verify-magic-link',
      { token, email }
    );
    return response.data.data;
  },

  getApplicationStatus: async (token: string, email: string) => {
    const response = await api.get<BaseResponse<PublicApplicationStatus>>(
      '/candidates/application-status',
      { params: { token, email } }
    );
    return response.data.data;
  },

  requestMagicLink: async (companySlug: string, email: string) => {
    const response = await api.post<BaseResponse<null>>(
      '/public/applications/magic-link/request',
      { companySlug, email }
    );
    return response.data;
  },
};
