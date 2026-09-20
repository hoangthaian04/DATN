export type JobStatus = 'INACTIVE' | 'ACTIVE' | 'CLOSED';
export type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
export type ExperienceLevel = 'INTERN' | 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD';

export interface JobCategory {
  id: number;
  name: string;
  slug: string;
}

export interface Job {
  id: number;
  title: string;
  slug: string;
  categoryId?: number;
  categoryName?: string;
  categorySlug?: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  employmentType: JobType;
  workingType?: string;
  experienceLevel: ExperienceLevel;
  experienceYearsMin?: number;
  roundCount?: number;
  description?: string;
  requirements?: string;
  benefits?: string;
  status: JobStatus;
  applicantCount?: number;
  publishedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobSummary {
  id: number;
  title: string;
  location: string;
  employmentType: JobType;
  roundCount: number;
  status: JobStatus;
  applicantCount: number;
  publishedAt?: string;
  createdAt: string;
}

export interface CreateJobRequest {
  title: string;
  categoryId: number;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  workingType?: string;
  employmentType: JobType;
  experienceLevel?: ExperienceLevel;
  experienceYearsMin?: number;
  description?: string;
  requirements?: string;
  benefits?: string;
}

export interface JobStats {
  total: number;
  active: number;
  inactive: number;
  closed: number;
}

export interface UpdateJobRequest {
  categoryId?: number;
  title: string;
  description?: string;
  requirements?: string;
  benefits?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  location?: string;
  workingType?: string;
  employmentType?: string;
  experienceLevel?: string;
  experienceYearsMin?: number;
  roundCount?: number;
}

export interface SaveJobPipelineRequest {
  job: UpdateJobRequest;
  rounds: import('./hiring-round.types').HiringRoundRequest[];
}
