export type UserRole = 'HR' | 'ADMIN';

export type CompanyStatus = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'BLOCKED';

export interface User {
  id: number;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: UserRole;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  companyId?: number;
  companyName?: string;
  companySlug?: string;
  companyStatus?: CompanyStatus;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse extends AuthTokens {
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  companyName: string;
  phone?: string;
}

export interface OnboardingRequest {
  companyName: string;
  taxCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  logoUrl?: string;
  bannerUrl?: string;
  primaryColor?: string;
  description?: string;
  benefits?: string;
}

export interface CompanyProfile {
  id: number;
  logoUrl?: string;
  bannerUrl?: string;
  primaryColor?: string;
  description?: string;
  benefits?: string;
  socialLinks?: string;
}

export interface CareerSiteSettings {
  id: number;
  siteTitle?: string;
  tagline?: string;
  heroImageUrl?: string;
  accentColor?: string;
  fontFamily?: string;
  showCompanyDescription?: boolean;
  showBenefits?: boolean;
  footerText?: string;
}

export interface CompanySummary {
  id: number;
  name: string;
  slug: string;
  subdomain?: string;
  taxCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  status: CompanyStatus;
  approvedById?: number;
  approvedByName?: string;
  approvedAt?: string;
  rejectedReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyDetail extends CompanySummary {
  profile?: CompanyProfile;
  careerSite?: CareerSiteSettings;
}

export interface CompanyFilterParams {
  status?: CompanyStatus;
  searchText?: string;
  page?: number;
  limit?: number;
  orderBy?: string;
}
