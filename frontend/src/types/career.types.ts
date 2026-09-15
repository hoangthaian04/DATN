import type { BasePagination } from './api.types';
import type { FormFieldType } from './form-field.types';

export interface PublicCategoryOption {
  id: number;
  name: string;
  slug: string;
}

export interface PublicCompany {
  id: number;
  companyName: string;
  companySlug: string;
  logoUrl?: string;
  bannerUrl?: string;
  siteTitle?: string;
  tagline?: string;
  description?: string;
  website?: string;
  publicEmail?: string;
  publicPhone?: string;
  primaryColor?: string;
  accentColor?: string;
  categories: PublicCategoryOption[];
}

export interface PublicJobSummary {
  id: number;
  title: string;
  slug: string;
  location?: string;
  workingType?: string;
  employmentType?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  categoryName?: string;
  categorySlug?: string;
  publishedAt?: string;
}

export interface PublicCompanySummary {
  id: number;
  companyName: string;
  companySlug: string;
  logoUrl?: string;
}

export interface PublicJobDetail extends PublicJobSummary {
  description?: string;
  requirements?: string;
  benefits?: string;
  experienceLevel?: string;
  experienceYearsMin?: number;
  company: PublicCompanySummary;
  applicationForm: PublicApplicationForm;
}

export interface PublicApplicationForm {
  fields: PublicFormField[];
}

export interface PublicFormField {
  id: number;
  fieldName: string;
  label: string;
  fieldType: FormFieldType;
  required: boolean;
  options: string[];
  displayOrder: number;
}

export type PublicJobPage = BasePagination<PublicJobSummary>;
