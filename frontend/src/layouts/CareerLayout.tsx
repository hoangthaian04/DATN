import { Outlet } from 'react-router-dom';

export const CareerLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Public Header placeholder */}
      <header className="border-b bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className="text-lg font-bold text-blue-600">EasyTech Jobs</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t bg-slate-50 px-6 py-8 text-center text-sm text-slate-500">
        © 2026 EasyTech. Nền tảng tuyển dụng thông minh.
      </footer>
    </div>
  );
};
