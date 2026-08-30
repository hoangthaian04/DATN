import type { User } from '@/types/auth.types';

export const getPostLoginPath = (user: User, fallback = '/dashboard') => {
  if (user.role === 'ADMIN') return '/admin/dashboard';
  if (user.status === 'INACTIVE' || user.status === 'BLOCKED') return '/403';
  if (user.companyStatus === 'PENDING') return '/pending';
  if (user.companyStatus === 'REJECTED') return '/registration/rejected';
  if (!user.onboardingCompleted) return '/onboarding';
  return fallback;
};

export const isHrWorkspaceAllowed = (user: User) =>
  (user.role === 'HR' || user.role === 'HR_ADMIN')
  && user.status === 'ACTIVE'
  && user.companyStatus === 'ACTIVE';
