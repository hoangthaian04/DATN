import { Outlet } from 'react-router-dom';

export const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-slate-900 px-6 py-4">
        <span className="text-white font-semibold">EasyTech Admin</span>
      </header>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
};
