import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { AuthService } from '@/services/auth.service';
import { Mail, KeyRound, Lock, Loader2 } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email không được để trống').email('Email không hợp lệ'),
});

const verifyOtpSchema = z.object({
  otp: z.string().length(6, 'Mã OTP phải bao gồm 6 chữ số').regex(/^\d+$/, 'Mã OTP chỉ chứa số'),
});

const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
  confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const form1 = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const form2 = useForm<z.infer<typeof verifyOtpSchema>>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { otp: '' },
  });

  const form3 = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const onForgotSubmit = async (data: z.infer<typeof forgotPasswordSchema>) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      await AuthService.forgotPassword({ email: data.email });
      setEmail(data.email);
      setStep(2);
      setSuccessMsg('Mã OTP đã được gửi đến email của bạn.');
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifySubmit = async (data: z.infer<typeof verifyOtpSchema>) => {
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await AuthService.verifyOtp({ email, otp: data.otp });
      setResetToken(res.resetToken);
      setStep(3);
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Mã OTP không hợp lệ.');
    } finally {
      setIsLoading(false);
    }
  };

  const onResetSubmit = async (data: z.infer<typeof resetPasswordSchema>) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      await AuthService.resetPassword({ 
        resetToken, 
        newPassword: data.newPassword, 
        confirmPassword: data.confirmPassword 
      });
      setSuccessMsg('Đổi mật khẩu thành công! Chuyển hướng đến đăng nhập...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 mb-4">
            {step === 1 ? <Mail className="h-6 w-6" /> : step === 2 ? <KeyRound className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
          </div>
          <h2 className="text-2xl font-bold text-slate-800">
            {step === 1 ? 'Quên mật khẩu?' : step === 2 ? 'Xác thực OTP' : 'Tạo mật khẩu mới'}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {step === 1 
              ? 'Nhập email của bạn để nhận mã khôi phục.' 
              : step === 2 
              ? `Mã xác thực gồm 6 chữ số đã được gửi tới ${email}` 
              : 'Vui lòng nhập mật khẩu mới của bạn dưới đây.'}
          </p>
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

        {step === 1 && (
          <form onSubmit={form1.handleSubmit(onForgotSubmit)} className="space-y-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                {...form1.register('email')}
                className="w-full rounded-lg border border-slate-300 p-3 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="name@company.com"
              />
              {form1.formState.errors.email && (
                <p className="mt-1 text-sm text-red-500">{form1.formState.errors.email.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 p-3 font-medium text-white transition hover:bg-blue-700 disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Gửi mã khôi phục'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={form2.handleSubmit(onVerifySubmit)} className="space-y-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Mã OTP (6 chữ số)</label>
              <input
                type="text"
                maxLength={6}
                {...form2.register('otp')}
                className="w-full rounded-lg border border-slate-300 p-3 text-center text-2xl tracking-widest outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="------"
              />
              {form2.formState.errors.otp && (
                <p className="mt-1 text-sm text-red-500">{form2.formState.errors.otp.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 p-3 font-medium text-white transition hover:bg-blue-700 disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Xác thực'}
            </button>
            <div className="text-center">
              <button 
                type="button" 
                onClick={() => setStep(1)} 
                className="text-sm font-medium text-slate-500 hover:text-slate-800"
              >
                Nhập lại email
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={form3.handleSubmit(onResetSubmit)} className="space-y-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Mật khẩu mới</label>
              <input
                type="password"
                {...form3.register('newPassword')}
                className="w-full rounded-lg border border-slate-300 p-3 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="••••••••"
              />
              {form3.formState.errors.newPassword && (
                <p className="mt-1 text-sm text-red-500">{form3.formState.errors.newPassword.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Xác nhận mật khẩu</label>
              <input
                type="password"
                {...form3.register('confirmPassword')}
                className="w-full rounded-lg border border-slate-300 p-3 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="••••••••"
              />
              {form3.formState.errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">{form3.formState.errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 p-3 font-medium text-white transition hover:bg-blue-700 disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Đổi mật khẩu'}
            </button>
          </form>
        )}

        {step === 1 && (
          <div className="mt-8 text-center text-sm text-slate-600">
            Nhớ mật khẩu?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:underline">
              Quay lại đăng nhập
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
