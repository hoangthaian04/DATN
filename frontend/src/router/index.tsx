import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PrivateRoute } from '@/components/auth/PrivateRoute';

// ─── Layouts ─────────────────────────────────────────────────────────────────
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { CareerLayout } from '@/layouts/CareerLayout';

// ─── Auth Pages ───────────────────────────────────────────────────────────────
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { OnboardingPage } from '@/pages/auth/OnboardingPage';
import { PendingApprovalPage } from '@/pages/auth/PendingApprovalPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';

// ─── HR Dashboard Pages ───────────────────────────────────────────────────────
import { DashboardPage } from '@/pages/hr/DashboardPage';
import { JobsPage } from '@/pages/hr/JobsPage';
import { JobCreateWizardPage } from '@/pages/hr/JobCreateWizardPage';
import { JobDetailPage } from '@/pages/hr/JobDetailPage';
import { RoundsConfigPage } from '@/pages/hr/RoundsConfigPage';
import { KanbanPage } from '@/pages/hr/KanbanPage';
import { CandidatesListPage } from '@/pages/hr/CandidatesListPage';
import { SettingsPage } from '@/pages/hr/SettingsPage';
import { CareerSiteSettingsPage } from '@/pages/hr/CareerSiteSettingsPage';
import { NotificationsPage } from '@/pages/hr/NotificationsPage';

// ─── Admin Pages ──────────────────────────────────────────────────────────────
import { AdminLoginPage } from '@/pages/admin/AdminLoginPage';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminJobCategories } from '@/pages/admin/AdminJobCategories';
import { AdminAuditLogs } from '@/pages/admin/AdminAuditLogs';
import { AdminUsers } from '@/pages/admin/AdminUsers';

// ─── Career Site Pages (Public) ───────────────────────────────────────────────
import { CareerHomePage } from '@/pages/career/CareerHomePage';
import { CompanyCareerSitePage } from '@/pages/career/CompanyCareerSitePage';
import { CareerJobDetailPage } from '@/pages/career/CareerJobDetailPage';
import { CareerApplyFormPage } from '@/pages/career/CareerApplyFormPage';
import { InterviewResponsePage } from '@/pages/career/InterviewResponsePage';
import { CandidateTrackPage } from '@/pages/career/CandidateTrackPage';
import { CandidateStatusPage } from '@/pages/career/CandidateStatusPage';

export const router = createBrowserRouter([
  // ── Redirect root ──
  { path: '/', element: <Navigate to="/login" replace /> },

  // ── Auth ──
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/onboarding', element: <OnboardingPage /> },
  { path: '/pending', element: <PendingApprovalPage /> },

  // ── HR Dashboard (yêu cầu đăng nhập, role HR) ──
  {
    path: '/dashboard',
    element: (
      <PrivateRoute role="HR">
        <DashboardLayout />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'jobs', element: <JobsPage /> },
      { path: 'jobs/create', element: <JobCreateWizardPage /> },
      { path: 'jobs/:id', element: <JobDetailPage /> },
      { path: 'jobs/:id/rounds', element: <RoundsConfigPage /> },
      { path: 'applications/kanban', element: <KanbanPage /> },
      { path: 'applications/list', element: <CandidatesListPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'career-site', element: <CareerSiteSettingsPage /> },
      { path: 'notifications', element: <NotificationsPage /> },
    ],
  },

  // ── Admin (yêu cầu role ADMIN) ──
  { path: '/admin/login', element: <AdminLoginPage /> },
  {
    path: '/admin',
    element: (
      <PrivateRoute role="ADMIN" redirectTo="/admin/login">
        <AdminLayout />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'companies', element: <AdminDashboardPage /> },
      { path: 'categories', element: <AdminJobCategories /> },
      { path: 'logs', element: <AdminAuditLogs /> },
      { path: 'users', element: <AdminUsers /> },
    ],
  },

  // ── Career Site (Public — không cần đăng nhập) ──
  {
    path: '/careers',
    element: <CareerLayout />,
    children: [
      { index: true, element: <CareerHomePage /> },
      { path: 'jobs/:slug', element: <CareerJobDetailPage /> },
      { path: 'jobs/:slug/apply', element: <CareerApplyFormPage /> },
      { path: 'applications/track', element: <CandidateTrackPage /> },
      { path: 'applications/status', element: <CandidateStatusPage /> },
      { path: 'interviews/respond', element: <InterviewResponsePage /> },
    ],
  },
  { path: '/company/:companySlug', element: <CompanyCareerSitePage /> },

  // ── Catch-all ──
  { path: '*', element: <Navigate to="/login" replace /> },
]);
