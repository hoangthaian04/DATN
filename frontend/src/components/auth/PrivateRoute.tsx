import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import type { UserRole } from '@/types/auth.types';
import { getPostLoginPath, isHrWorkspaceAllowed } from '@/utils/authRouting';

interface PrivateRouteProps {
  children: React.ReactNode;
  /** Nếu có, chỉ cho phép role này truy cập */
  role?: UserRole;
  roles?: UserRole[];
  requireOnboarding?: boolean;
  /** Redirect đến đây nếu chưa đăng nhập (mặc định: /login) */
  redirectTo?: string;
}

/**
 * Bảo vệ route — redirect về /login nếu chưa đăng nhập,
 * hoặc 403 nếu không đúng role.
 */
export const PrivateRoute: React.FC<PrivateRouteProps> = ({
  children,
  role,
  roles,
  requireOnboarding = false,
  redirectTo = '/login',
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Đang kiểm tra token → hiển thị loading toàn màn hình
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-sm text-slate-500">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  const allowedRoles = roles || (role ? [role] : undefined);
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : getPostLoginPath(user)} replace />;
  }

  if (user && (user.status === 'INACTIVE' || user.status === 'BLOCKED')) {
    return <Navigate to="/403" replace />;
  }

  if (
    user
    && user.role !== 'ADMIN'
    && (location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/onboarding'))
    && !isHrWorkspaceAllowed(user)
  ) {
    return <Navigate to={getPostLoginPath(user)} replace />;
  }

  if (requireOnboarding && user && user.role !== 'ADMIN' && !user.onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};
