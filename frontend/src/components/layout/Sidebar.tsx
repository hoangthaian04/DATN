import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Briefcase, FileText, Settings, Rocket, LogOut, Key, X, Eye, EyeOff } from 'lucide-react';
import { AuthService } from '@/services/auth.service';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const navItems = [
    { id: 'dashboard', href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { id: 'jobs', href: '/dashboard/jobs', label: 'Tin tuyển dụng', icon: Briefcase },
    {
      id: 'applications',
      href: '/dashboard/applications/kanban',
      label: 'Ứng viên',
      icon: FileText,
      subItems: [
        { id: 'kanban', href: '/dashboard/applications/kanban', label: 'Kanban Pipeline' },
        { id: 'list', href: '/dashboard/applications/list', label: 'Danh sách' },
      ],
    },
    { id: 'settings', href: '/dashboard/settings', label: 'Cài đặt', icon: Settings },
  ];

  const handleLogout = async () => {
    await AuthService.logout();
    navigate('/login');
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError('Vui lòng nhập đầy đủ các trường bắt buộc.');
      return;
    }
    if (newPassword.length < 8 || newPassword.length > 72 || !/[A-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setPasswordError('Mật khẩu mới phải từ 8 đến 72 ký tự, có ít nhất 1 chữ hoa và 1 chữ số.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Mật khẩu xác nhận không khớp.');
      return;
    }
    try {
      setPasswordLoading(true);
      setPasswordError('');
      await AuthService.changePassword({ currentPassword: oldPassword, newPassword, confirmPassword });
      setPasswordModalOpen(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      setPasswordError((err as { customMessage?: string })?.customMessage || 'Đổi mật khẩu thất bại. Vui lòng thử lại.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col h-screen fixed left-0 top-0 z-20">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center text-white shrink-0">
          <Rocket className="w-6 h-6" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-[17px] font-bold text-slate-900 leading-tight">EazyHire</h1>
          <span className="text-xs text-slate-500 font-medium">HR Platform</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.id === 'applications' ? '/dashboard/applications' : item.href);

          const Icon = item.icon;
          const hasSubItems = item.subItems && item.subItems.length > 0;

          return (
            <div key={item.href} className="mb-2">
              <Link
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-[15px] ${
                  isActive && !hasSubItems
                    ? 'bg-primary-500 text-white shadow-sm shadow-primary-500/20'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className="w-[22px] h-[22px]" />
                <span>{item.label}</span>
              </Link>

              {hasSubItems && isActive && (
                <div className="ml-[22px] mt-1 pl-4 border-l border-slate-200 flex flex-col gap-1">
                  {item.subItems?.map((sub) => {
                    const isSubActive = pathname === sub.href;
                    return (
                      <Link
                        key={sub.href}
                        to={sub.href}
                        className={`px-3 py-2 rounded-lg text-[14px] transition-colors ${
                          isSubActive
                            ? 'bg-primary-50/80 text-primary-600 font-semibold'
                            : 'text-slate-500 hover:text-slate-900 font-medium'
                        }`}
                      >
                        {sub.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 relative">
        <div 
          onClick={() => setProfileMenuOpen(!profileMenuOpen)}
          className="flex items-center gap-3 px-2 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors select-none"
        >
          <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0 relative flex items-center justify-center">
            {/* Fallback avatar */}
            <span className="text-slate-500 font-bold">HR</span>
          </div>
          <div className="flex flex-col overflow-hidden">
            <p className="text-sm font-semibold text-slate-900 truncate">HR Admin</p>
            <p className="text-[13px] text-slate-500 truncate">Công ty</p>
          </div>
        </div>

        {/* Profile Dropdown */}
        {profileMenuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setProfileMenuOpen(false)}></div>
            <div className="absolute bottom-full left-4 mb-2 w-[calc(100%-2rem)] bg-white border border-slate-100 rounded-xl shadow-xl shadow-slate-200/50 z-50 py-2">
              <button 
                onClick={() => {
                  setProfileMenuOpen(false);
                  setPasswordModalOpen(true);
                }}
                className="w-full px-4 py-2.5 text-left text-[13px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center gap-2"
              >
                <Key className="w-4 h-4" /> Đổi mật khẩu
              </button>
              <button 
                onClick={handleLogout}
                className="w-full px-4 py-2.5 text-left text-[13px] font-semibold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Đăng xuất
              </button>
            </div>
          </>
        )}
      </div>

      {/* Change Password Modal */}
      {passwordModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Key className="w-4.5 h-4.5 text-blue-500" />
                Đổi mật khẩu
              </h3>
              <button 
                onClick={() => setPasswordModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-700">Mật khẩu cũ <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={e => setOldPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                    placeholder="Nhập mật khẩu hiện tại"
                    maxLength={72}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-700">Mật khẩu mới <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                    placeholder="Nhập mật khẩu mới"
                    maxLength={72}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-700">Xác nhận mật khẩu mới <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                    placeholder="Nhập lại mật khẩu mới"
                    maxLength={72}
                  />
                </div>
              </div>
              {passwordError && <p className="text-xs font-medium text-red-600">{passwordError}</p>}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
              <button 
                onClick={() => setPasswordModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleChangePassword}
                disabled={passwordLoading}
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20 cursor-pointer"
              >
                {passwordLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
