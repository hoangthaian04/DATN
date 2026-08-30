import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';

export const DashboardLayout: React.FC = () => (
  <div className="flex min-h-screen bg-slate-50">
    <Sidebar currentTab="" onTabChange={() => undefined} />
    <div className="min-w-0 flex-1">
      <Topbar />
      <main className="min-h-[calc(100vh-64px)] overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  </div>
);
