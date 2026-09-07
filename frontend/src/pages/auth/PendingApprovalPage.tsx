import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { errorMessage } from '@/services/api';
import { Building2, Clock, LogOut, Mail, RefreshCw, ShieldCheck } from 'lucide-react';

export const PendingApprovalPage: React.FC = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [error,setError]=React.useState('');
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refreshUser();

    } catch(e){setError(errorMessage(e));} finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = async () => {
    try{await logout();navigate('/login', {replace:true});}catch(e){setError(errorMessage(e));}
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-12 shadow-sm text-center">
        {/* Animated Icon badge */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-50 text-amber-500 ring-8 ring-amber-50/50 mb-6">
          <Clock className="h-10 w-10 animate-pulse" />
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100/70 px-3 py-1 text-xs font-semibold text-amber-800 mb-3">
          <ShieldCheck className="h-3.5 w-3.5" />
          Hồ sơ đang chờ phê duyệt
        </div>

        {error&&<p role="alert" className="text-red-600">{error}</p>}
        <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
          Chào mừng {user?.fullName || 'bạn'}!
        </h1>

        <p className="mt-3 text-sm text-slate-600 leading-relaxed">
          Hồ sơ doanh nghiệp <strong className="font-semibold text-slate-900">{user?.companyName || 'của bạn'}</strong> đã được gửi thành công và đang được Quản trị viên hệ thống kiểm duyệt.
        </p>

        <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-left text-xs text-slate-500 space-y-2 border border-slate-100">
          <div className="flex items-center gap-2 font-medium text-slate-700">
            <Building2 className="h-4 w-4 text-slate-400" />
            <span>Doanh nghiệp: {user?.companyName || 'Chưa cập nhật'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-slate-400" />
            <span>Email HR: {user?.email}</span>
          </div>
          <div className="flex items-center gap-2 text-amber-700 font-medium">
            <Clock className="h-4 w-4 text-amber-500" />
            <span>Bạn sẽ nhận email khi có kết quả xét duyệt.</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Kiểm tra trạng thái</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            <LogOut className="h-4 w-4 text-slate-400" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>
    </div>
  );
};
