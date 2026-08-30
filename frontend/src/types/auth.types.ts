export type UserRole = 'HR' | 'HR_ADMIN' | 'ADMIN';
export type CompanyStatus = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'BLOCKED';
export type UserStatus = 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'BLOCKED';

export interface User {
  id: number;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: UserRole;
  status: UserStatus;
  companyId?: number;
  companyName?: string;
  companySlug?: string;
  companyStatus?: CompanyStatus;
  onboardingCompleted?: boolean;
  profileCompleted?: boolean;
  createdAt: string;
}

export interface LoginRequest { email: string; password: string; }
export interface GoogleLoginRequest { idToken: string; }

export interface LoginResponse {
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  companyName: string;
  taxCode: string;
}

export interface RegistrationResponse {
  email: string;
  companyName: string;
  companyStatus: CompanyStatus;
}

export interface OnboardingRequest {
  companyName?: string;
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
  businessType?: string;
  industry?: string;
  companySize?: string;
}

export interface CompanyProfile {
  id: number;
  companyName?: string;
  taxCode?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  logoUrl?: string;
  bannerUrl?: string;
  primaryColor?: string;
  description?: string;
  benefits?: string;
  socialLinks?: string;
  businessType?: string;
  industry?: string;
  companySize?: string;
  onboardingCompleted: boolean;
  profileCompleted: boolean;
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
  duplicateWarnings?: string[];
}

export interface CompanyFilterParams {
  status?: CompanyStatus;
  searchText?: string;
  page?: number;
  limit?: number;
  orderBy?: string;
}

export interface CompanyRegistrationUpdateRequest {
  fullName?: string;
  companyName?: string;
  taxCode?: string;
}
