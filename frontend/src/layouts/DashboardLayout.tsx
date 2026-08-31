import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { useAuth } from '@/contexts/useAuth';
import { getPostLoginPath } from '@/utils/authRouting';

export const DashboardLayout: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const lockCurrentWorkspaceEntry = () => {
      const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      window.history.replaceState({ ...window.history.state, easyTechWorkspace: true }, '', currentPath);
      window.history.pushState({ ...window.history.state, easyTechWorkspace: true }, '', currentPath);
    };

    lockCurrentWorkspaceEntry();

    const handleBackNavigation = () => {
      const target = getPostLoginPath(user);
      navigate(target, { replace: true });
      window.setTimeout(lockCurrentWorkspaceEntry, 0);
    };

    window.addEventListener('popstate', handleBackNavigation);
    return () => window.removeEventListener('popstate', handleBackNavigation);
  }, [navigate, user]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar currentTab="" onTabChange={() => undefined} />
      <div className="ml-64 min-w-0 flex-1">
        <Topbar />
        <main className="min-h-[calc(100vh-64px)] overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
