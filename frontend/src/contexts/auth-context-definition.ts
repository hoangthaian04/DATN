import { createContext } from 'react';
import type {
  LoginRequest,
  OnboardingRequest,
  RegisterRequest,
  RegistrationResponse,
  User,
} from '@/types/auth.types';

export interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<User>;
  loginWithGoogle: (idToken: string) => Promise<User>;
  adminLogin: (data: LoginRequest) => Promise<User>;
  register: (data: RegisterRequest) => Promise<RegistrationResponse>;
  onboarding: (data: OnboardingRequest, skip?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
