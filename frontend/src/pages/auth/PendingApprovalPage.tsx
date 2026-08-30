import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Building2, Clock, Mail, ShieldCheck } from 'lucide-react';
import type { RegistrationResponse } from '@/types/auth.types';

export const PendingApprovalPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const registration = state as RegistrationResponse | null;

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
          EasyTech sẽ gửi email khi hồ sơ được duyệt hoặc cần bổ sung thông tin. Tài khoản chỉ có thể đăng nhập sau khi được duyệt.
        </p>

        {registration && (
          <div className="mt-6 space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-left text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-slate-400" />
              <span>{registration.companyName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-slate-400" />
              <span>{registration.email}</span>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => navigate('/login', { replace: true })}
          className="mt-8 w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Quay lại đăng nhập
        </button>
      </div>
    </div>
  );
};
