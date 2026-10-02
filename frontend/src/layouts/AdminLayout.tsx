import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  const adminNavItems = [
    { id: 'companies', label: 'Quản lý Doanh nghiệp', path: '/admin' },
    { id: 'categories', label: 'Danh mục (Job)', path: '/admin/job-categories' },
    { id: 'logs', label: 'Audit Logs', path: '/admin/audit-logs' },
    { id: 'users', label: 'Tài khoản Admin', path: '/admin/users' },
  ];

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex flex-col font-sans">
      {/* Admin Header */}
      <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between shrink-0 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-sm font-extrabold text-slate-800 tracking-wider">EasyHire</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="h-6 w-6 rounded-full bg-[#0052cc] flex items-center justify-center text-white text-xs font-bold">
              {user?.fullName?.charAt(0) || 'A'}
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-slate-800">{user?.fullName || 'System Administrator'}</p>
              <p className="text-[9px] text-slate-500 font-semibold">{user?.email || 'admin@EasyHire.vn'}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="text-sm font-semibold text-slate-500 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 border border-transparent transition-all cursor-pointer"
          >
            Đăng xuất
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Admin Sidebar */}
        <aside className="w-60 bg-white border-r border-slate-200 flex flex-col py-6 px-3 shrink-0 overflow-y-auto">
          <nav className="space-y-1.5">
            {adminNavItems.map((item) => {
              const active = item.path === '/admin'
                ? location.pathname === '/admin' || location.pathname === '/admin/'
                : location.pathname.startsWith(item.path);

              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  aria-current={active ? 'page' : undefined}
                  className={`w-full px-4 py-3 rounded-xl border-l-2 cursor-pointer transition-colors text-left ${
                    active
                      ? 'border-[#0052cc] bg-blue-50 text-[#0052cc]'
                      : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span className={`text-sm ${active ? 'font-bold' : 'font-semibold'}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
