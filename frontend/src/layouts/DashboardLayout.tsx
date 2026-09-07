import { Outlet } from 'react-router-dom';

import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';

/**
 * Layout cho HR Dashboard — bao gồm Sidebar bên trái và Topbar phía trên.
 * Tất cả các route /dashboard/* sẽ render bên trong <Outlet />.
 */
export const DashboardLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 hidden w-64 bg-white shadow-sm lg:block">
        <Sidebar />
      </aside>

      {/* Main content */}
      <div className="flex min-h-screen flex-col lg:pl-64">
        <Topbar />
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
