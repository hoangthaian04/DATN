import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import {
  Building2,
  LogOut,
  LayoutDashboard,
  ScrollText,
  ShieldAlert,
  Tags,
  Users,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  const adminNavItems = [
    { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard, path: '/admin/dashboard' },
    { id: 'companies', label: 'Quản lý Doanh nghiệp', icon: Building2, path: '/admin/companies' },
    { id: 'categories', label: 'Danh mục (Job)', icon: Tags, path: '/admin/categories' },
    { id: 'logs', label: 'Audit Logs', icon: ScrollText, path: '/admin/logs' },
    { id: 'users', label: 'Tài khoản Admin', icon: Users, path: '/admin/users' },
  ];

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex flex-col font-sans">
      {/* Admin Header */}
      <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between shrink-0 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-[#0052cc] flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-extrabold text-slate-800 tracking-wider">EasyTech</p>
            <p className="text-[9px] font-bold text-[#0052cc] uppercase tracking-widest -mt-0.5">
              Admin Command Panel
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="h-6 w-6 rounded-full bg-[#0052cc] flex items-center justify-center text-white text-xs font-bold">
              {user?.fullName?.charAt(0) || 'A'}
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-slate-800">{user?.fullName || 'System Administrator'}</p>
              <p className="text-[9px] text-slate-500 font-semibold">{user?.email || 'admin@easytech.vn'}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 border border-transparent transition-all cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            Đăng xuất
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Admin Sidebar */}
        <aside className="w-60 bg-white border-r border-slate-200 flex flex-col py-6 px-3 shrink-0 overflow-y-auto">
          <nav className="space-y-1.5">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path
                || (item.id === 'companies' && location.pathname.startsWith('/admin/companies/'));

              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors text-left ${
                    active
                      ? 'bg-blue-50 text-[#0052cc]'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
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
