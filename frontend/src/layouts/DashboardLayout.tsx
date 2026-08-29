import { Outlet } from 'react-router-dom';

// TODO: Import Sidebar, Topbar khi implement
// import { Sidebar } from '@/components/layout/Sidebar';
// import { Topbar } from '@/components/layout/Topbar';

/**
 * Layout cho HR Dashboard — bao gồm Sidebar bên trái và Topbar phía trên.
 * Tất cả các route /dashboard/* sẽ render bên trong <Outlet />.
 */
export const DashboardLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar placeholder */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 bg-white shadow-sm lg:block">
        {/* <Sidebar /> */}
        <div className="flex h-full items-center justify-center text-slate-400 text-sm">
          Sidebar
        </div>
      </aside>

      {/* Main content */}
      <div className="flex min-h-screen flex-col lg:pl-64">
        {/* Topbar placeholder */}
        <header className="sticky top-0 z-10 border-b bg-white px-6 py-4">
          {/* <Topbar /> */}
          <span className="text-sm text-slate-400">Topbar</span>
        </header>
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
