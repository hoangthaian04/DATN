import { api } from './api';
import type { BaseResponse } from '../types/api.types';

// Defining types that correspond to the PublicCompanyDTO and PublicJobDTO

export interface PublicCompanyDTO {
  name: string;
  slug: string;
  website: string;
  location: string;
  size: string;
  founded: string;
  email: string;
  slogan: string;
  averageAge: string;
  businessSectors: string[];
  mainSector: string[];
  services: string[];
  description: string;
  fullDescription: string[];
  footer: {
    description: string;
    facebook: string;
    linkedin: string;
    copyright: string;
  };
  logoUrl?: string;
  bannerUrl?: string;
  primaryColor?: string;
}

export interface PublicJobDTO {
  id: string;
  slug: string;
  title: string;
  location: string;
  type: string;
  salary: string;
  category: string;
  postedAt: string;
  tags: string[];
  description: string;
  requirements: string[];
  benefits: string[];
  requiresCv: boolean;
}

export const publicService = {
  getCompanySite: async (companySlug: string) => {
    const response = await api.get<BaseResponse<PublicCompanyDTO>>(`/public/companies/${companySlug}`);
    return response.data.data;
  },
  getCompanyJobs: async (companySlug: string, search?: string) => {
    const params = search ? { search } : {};
    const response = await api.get<BaseResponse<PublicJobDTO[]>>(`/public/companies/${companySlug}/jobs`, { params });
    return response.data.data;
  },
  getJobDetail: async (companySlug: string, jobSlug: string) => {
    const response = await api.get<BaseResponse<PublicJobDTO>>(`/public/companies/${companySlug}/jobs/${jobSlug}`);
    return response.data.data;
  },
};
