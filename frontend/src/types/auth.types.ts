export type UserRole = 'HR_ADMIN' | 'HR' | 'ADMIN';

export type CompanyStatus = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'BLOCKED';

export interface User {
  id: number;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: UserRole;
  status: 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  companyId?: number;
  companyName?: string;
  companySlug?: string;
  companyStatus?: CompanyStatus;
  onboardingCompleted: boolean;
  profileCompleted: boolean;
  createdAt: string;
}

export interface AuthTokens {
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
  phone: string;
  taxCode: string;
  address: string;
  subdomain: string;
  industry: string;
  companySize: string;
  website?: string;
  description: string;
  logoUrl?: string;
}

export interface OnboardingRequest {
 industry?: string; companySize?: string; website?: string; description?: string;
 phone?: string; address?: string; primaryColor?: string; benefits?: string;
 businessType?: string; contactEmail?: string; onboardingCompleted?: boolean;
}

export interface CompanyProfile {
 industry?: string; companySize?: string; businessType?: string; contactEmail?: string;
 onboardingCompleted: boolean; profileCompleted: boolean; completedSteps: number; careerSiteLogoUrl?: string;
  id: number;
  logoUrl?: string;
  bannerUrl?: string;
  primaryColor?: string;
  description?: string;
  benefits?: string;
  socialLinks?: string;
}

export interface CareerSiteSettings {
 logoUrl?: string;
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

export interface PasswordResetRequest {resetToken:string;newPassword:string;confirmPassword:string;}
export interface PasswordChangeRequest {currentPassword:string;newPassword:string;confirmPassword:string;}
export type RegistrationUpdate=Pick<RegisterRequest,'companyName'|'taxCode'|'phone'|'address'|'subdomain'>;
