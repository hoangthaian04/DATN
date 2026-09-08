import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PrivateRoute, PublicOnlyRoute } from '@/components/auth/PrivateRoute';

// ─── Layouts ─────────────────────────────────────────────────────────────────
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { CareerLayout } from '@/layouts/CareerLayout';

// ─── Auth Pages ───────────────────────────────────────────────────────────────
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { RejectedRegistrationPage } from '@/pages/auth/RejectedRegistrationPage';
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
  { path: '/login', element: <PublicOnlyRoute><LoginPage /></PublicOnlyRoute> },
  { path: '/register', element: <PublicOnlyRoute><RegisterPage /></PublicOnlyRoute> },
  { path: '/forgot-password', element: <PublicOnlyRoute><ForgotPasswordPage /></PublicOnlyRoute> },
  { path: '/onboarding', element: <PrivateRoute role="HR" restricted><OnboardingPage /></PrivateRoute> },
  { path: '/pending', element: <PrivateRoute role="HR" restricted><PendingApprovalPage /></PrivateRoute> },

  {path:'/registration/rejected',element:<PrivateRoute role="HR" restricted><RejectedRegistrationPage/></PrivateRoute>},
  {path:'/403',element:<div className="p-8">Tài khoản không có quyền truy cập. Vui lòng liên hệ quản trị viên.</div>},
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
      { path: 'settings/company', element: <Navigate to="/dashboard/settings" replace /> },
      { path: 'career-site', element: <CareerSiteSettingsPage /> },
      { path: 'notifications', element: <NotificationsPage /> },
    ],
  },

  // ── Admin (yêu cầu role ADMIN) ──
  { path: '/admin/login', element: <PublicOnlyRoute><AdminLoginPage /></PublicOnlyRoute> },
  {
    path: '/admin',
    element: (
      <PrivateRoute role="ADMIN" redirectTo="/admin/login">
        <AdminLayout />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      {path:'dashboard',element:<AdminDashboardPage/>},
      {path:'companies/pending',element:<AdminDashboardPage/>},
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
