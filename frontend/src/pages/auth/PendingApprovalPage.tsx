import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Building2, Clock, Loader2, LogOut, Mail, RefreshCw, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import type { RegistrationResponse } from '@/types/auth.types';
import { getPostLoginPath } from '@/utils/authRouting';

export const PendingApprovalPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { user, refreshUser, logout } = useAuth();
  const registration = state as RegistrationResponse | null;
  const [checking, setChecking] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const companyName = user?.companyName || registration?.companyName;
  const email = user?.email || registration?.email;
  const statusLabel = user?.companyStatus === 'PENDING' || registration?.companyStatus === 'PENDING'
    ? 'Đang chờ phê duyệt'
    : user?.companyStatus || registration?.companyStatus || 'Đang chờ phê duyệt';

  const checkStatus = async () => {
    try {
      setChecking(true);
      setMessage(null);
      const latestUser = await refreshUser();
      const target = getPostLoginPath(latestUser);
      if (target === '/pending') {
        setMessage('Hồ sơ vẫn đang chờ Admin phê duyệt.');
        return;
      }
      navigate(target, { replace: true });
    } catch (error: unknown) {
      setMessage((error as { customMessage?: string })?.customMessage || 'Không thể kiểm tra trạng thái. Vui lòng thử lại.');
    } finally {
      setChecking(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
    } catch {
      // Vẫn điều hướng về màn đăng nhập/đăng ký nếu API logout lỗi.
    } finally {
      navigate('/login', { replace: true });
      setLoggingOut(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-50 text-amber-500 ring-8 ring-amber-50/50">
          <Clock className="h-10 w-10" />
        </div>
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
          <ShieldCheck className="h-3.5 w-3.5" />
          Hồ sơ đang chờ phê duyệt
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
          Đăng ký đã được tiếp nhận
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Bạn đã đăng nhập thành công nhưng chưa được truy cập HR Workspace khi hồ sơ còn chờ duyệt.
        </p>

        <div className="mt-6 space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-left text-sm text-slate-600">
          <div className="flex items-center justify-between gap-3">
            <span className="font-bold text-slate-500">Trạng thái</span>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-800">
              {statusLabel}
            </span>
          </div>
          {companyName && (
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-slate-400" />
              <span>{companyName}</span>
            </div>
          )}
          {email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-slate-400" />
              <span>{email}</span>
            </div>
          )}
        </div>

        {message && (
          <p className="mt-4 rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
            {message}
          </p>
        )}

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => void checkStatus()}
            disabled={checking || loggingOut}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Kiểm tra trạng thái
          </button>
          <button
            type="button"
            onClick={() => void handleLogout()}
            disabled={checking || loggingOut}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
          >
            {loggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
};
