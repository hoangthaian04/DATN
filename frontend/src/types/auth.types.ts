export type UserRole = 'HR' | 'ADMIN';

export type BusinessStatus = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'BLOCKED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  businessId: string;
  businessName?: string;
  businessStatus: BusinessStatus;
  avatarUrl?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse extends AuthTokens {
  user: User;
}

export interface RegisterBusinessRequest {
  email: string;
  password: string;
  fullName: string;
  businessName: string;
  industry: string;
  phone: string;
}
