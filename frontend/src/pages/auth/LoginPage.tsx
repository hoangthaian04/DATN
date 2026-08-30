import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle, ArrowRight, Building2, CheckCircle2, Lock, Mail, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const user = await login({ email, password });

      // Kiểm tra trạng thái doanh nghiệp để điều hướng phù hợp
      if (user.companyStatus === 'PENDING') {
        navigate('/pending', { replace: true });
      } else if (user.companyStatus === 'REJECTED') {
        setErrorMessage('Hồ sơ doanh nghiệp của bạn đã bị từ chối. Vui lòng liên hệ hỗ trợ.');
      } else if (user.companyStatus === 'BLOCKED') {
        setErrorMessage('Tài khoản doanh nghiệp của bạn đã bị khóa.');
      } else {
        const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      }
    } catch (err: unknown) {
      const msg = (err as { customMessage?: string })?.customMessage || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel - Decorative Branding */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-slate-900 p-12 text-white lg:flex">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-indigo-900/40" />
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-500/30">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">EasyTech HRM</span>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-300 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" />
            Nền tảng tuyển dụng thông minh với AI
          </div>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white">
            Tối ưu hóa toàn diện quy trình tuyển dụng nhân sự
          </h1>
          <p className="text-base text-slate-300 leading-relaxed max-w-lg">
            Tự động hóa pipeline tuyển dụng, sàng lọc CV bằng AI và xây dựng Career Site chuyên nghiệp cho doanh nghiệp của bạn.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="flex items-center gap-2.5 text-sm text-slate-300">
              <CheckCircle2 className="h-4 w-4 text-blue-400" />
              <span>Phân tích CV tự động</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-slate-300">
              <CheckCircle2 className="h-4 w-4 text-blue-400" />
              <span>Career Site tùy biến</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-slate-300">
              <CheckCircle2 className="h-4 w-4 text-blue-400" />
              <span>Pipeline & Email Trigger</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-slate-300">
              <CheckCircle2 className="h-4 w-4 text-blue-400" />
              <span>Gợi ý câu hỏi phỏng vấn</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-400">
          © 2026 EasyTech Platform. All rights reserved.
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:px-20 bg-white">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile branding */}
          <div className="mb-8 lg:hidden flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">EasyTech HRM</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Đăng nhập HR Portal
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Chưa có tài khoản doanh nghiệp?{' '}
              <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-500 underline underline-offset-4">
                Đăng ký ngay
              </Link>
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 animate-in fade-in duration-200">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email công việc
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hr@company.com"
                  required
                  className="w-full rounded-xl border border-slate-300 pl-11 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100 transition duration-150"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-700">
                  Mật khẩu
                </label>
                <a href="#" className="text-xs font-medium text-blue-600 hover:text-blue-500">
                  Quên mật khẩu?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-slate-300 pl-11 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100 transition duration-150"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 px-4 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-60 transition duration-150 cursor-pointer"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>Đăng nhập</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 border-t border-slate-100 pt-6 text-center">
            <Link to="/admin/login" className="text-xs text-slate-400 hover:text-slate-600 transition">
              Đăng nhập dành cho Quản trị viên hệ thống &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
