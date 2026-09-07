import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AuthService } from '@/services/auth.service';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Loader2, ShieldCheck } from 'lucide-react';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
  newPassword: z.string().min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự'),
  confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
}).refine((data) => data.newPassword !== data.currentPassword, {
  message: 'Mật khẩu mới không được trùng với mật khẩu hiện tại',
  path: ['newPassword'],
});

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof changePasswordSchema>>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async (data: z.infer<typeof changePasswordSchema>) => {
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await AuthService.changePassword(data);
      setSuccessMsg('Đổi mật khẩu thành công. Vui lòng đăng nhập lại...');
      setTimeout(() => {
        AuthService.logout();
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng kiểm tra lại mật khẩu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center gap-3 border-b border-slate-200 pb-4">
        <ShieldCheck className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Cài đặt & Bảo mật</h1>
          <p className="text-sm text-slate-500">Quản lý mật khẩu và các thiết lập tài khoản của bạn.</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-slate-600" />
          <h2 className="text-lg font-semibold text-slate-800">Đổi mật khẩu</h2>
        </div>

        {errorMsg && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 rounded-lg bg-green-50 p-4 text-sm text-green-600">
            {successMsg}
          </div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-md space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Mật khẩu hiện tại</label>
            <input
              type="password"
              {...form.register('currentPassword')}
              className="w-full rounded-lg border border-slate-300 p-2.5 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="••••••••"
            />
            {form.formState.errors.currentPassword && (
              <p className="mt-1 text-sm text-red-500">{form.formState.errors.currentPassword.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Mật khẩu mới</label>
            <input
              type="password"
              {...form.register('newPassword')}
              className="w-full rounded-lg border border-slate-300 p-2.5 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="••••••••"
            />
            {form.formState.errors.newPassword && (
              <p className="mt-1 text-sm text-red-500">{form.formState.errors.newPassword.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Xác nhận mật khẩu mới</label>
            <input
              type="password"
              {...form.register('confirmPassword')}
              className="w-full rounded-lg border border-slate-300 p-2.5 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="••••••••"
            />
            {form.formState.errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">{form.formState.errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 p-2.5 font-medium text-white transition hover:bg-blue-700 disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Cập nhật mật khẩu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
