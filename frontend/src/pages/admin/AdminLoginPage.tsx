import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import {
  Activity,
  AlertCircle,
  KeyRound,
  Loader2,
  Server,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('admin@easytech.vn');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('reason') === 'session-expired') {
      setErrorMessage('Phiên làm việc đã hết hạn.');
    }
  }, [location.search]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Vui lòng nhập đầy đủ email và mật khẩu quản trị');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);

      const user = await adminLogin({ email, password });
      if (user.role !== 'ADMIN') {
        setErrorMessage('Tài khoản không có quyền quản trị hệ thống');
        return;
      }

      navigate('/admin', { replace: true });
    } catch (err: unknown) {
      const msg = (err as { customMessage?: string })?.customMessage || 'Đăng nhập quản trị thất bại';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-white font-sans overflow-hidden">
      <main className="flex-1 flex w-full h-full">
        {/* Left Side: Form */}
        <div className="w-full lg:w-1/2 h-full flex flex-col justify-center px-8 sm:px-16 md:px-24 relative overflow-y-auto bg-white">
          <div className="max-w-[380px] w-full mx-auto my-auto py-10">
            <div className="h-12 w-12 rounded-xl bg-[#0052cc] flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-500/20">
              <ShieldAlert className="h-6 w-6" />
            </div>

            <h1 className="text-[32px] font-bold text-slate-900 mb-2 tracking-tight">System Admin</h1>
            <p className="text-[15px] text-slate-500 mb-8">
              Khu vực hạn chế. Đăng nhập để truy cập hệ thống quản trị lõi của nền tảng EasyTech.
            </p>

            {errorMessage && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 animate-in fade-in">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAdminLogin} className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">
                  ADMIN EMAIL
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@easytech.vn"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-slate-700 bg-slate-50 focus:bg-white"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">
                  MASTER PASSWORD
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-slate-700 bg-slate-50 focus:bg-white"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-[#0052cc] focus:ring-[#0052cc] cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-800 transition-colors">
                    Remember device
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-lg bg-[#0052cc] hover:bg-[#0047b3] text-white text-[15px] font-bold transition-colors mt-4 flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <KeyRound className="h-4.5 w-4.5" />
                    <span>Authenticate</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-12 text-center">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-[11px] text-slate-400 hover:text-slate-600 font-bold underline decoration-slate-300 underline-offset-4 cursor-pointer"
              >
                &larr; Quay lại đăng nhập Doanh nghiệp
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Visual/Feature List */}
        <div className="hidden lg:flex w-1/2 relative bg-[#ebf2ff] items-center justify-center overflow-hidden p-12 shadow-[inset_1px_0_10px_rgba(0,0,0,0.02)]">
          {/* Abstract Background pattern simulation */}
          <div className="absolute inset-0 opacity-70">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[80px] -translate-x-1/4 translate-y-1/4" />

            {/* Tech grid pattern */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(0, 82, 204, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 82, 204, 0.05) 1px, transparent 1px)',
                backgroundSize: '30px 30px',
              }}
            />
          </div>

          {/* Feature Card */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-10 max-w-[440px] w-full shadow-[0_20px_60px_-15px_rgba(0,30,100,0.15)] relative z-10 border border-white">
            <div className="flex items-center gap-3.5 mb-6">
              <Server className="h-8 w-8 text-[#0052cc]" />
              <h2 className="text-2xl font-bold text-slate-800">EasyTech Core Console</h2>
            </div>

            <p className="text-[15px] text-slate-500 mb-10 leading-relaxed font-medium">
              Trung tâm điều hành và quản lý dữ liệu toàn cục. Mọi thao tác tại đây đều được giám sát và lưu trữ lịch sử chặt chẽ (Audit Logging).
            </p>

            <div className="space-y-5">
              {[
                { icon: ShieldCheck, text: 'Bảo mật dữ liệu cấp độ cao' },
                { icon: Activity, text: 'Giám sát hệ thống Real-time' },
                { icon: Server, text: 'Quản lý tài nguyên & Master Data' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <item.icon className="h-5 w-5 text-[#0052cc] shrink-0 stroke-[2.5]" />
                  <span className="text-[15px] text-slate-700 font-semibold">{item.text}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                System Status
              </span>
              <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-50 text-[#0052cc] text-[10px] font-bold border border-blue-100">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                ALL SYSTEMS NOMINAL
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#f4f7fb] py-5 px-8 md:px-16 flex flex-col md:flex-row items-center justify-between text-[12px] text-[#2c3e50] font-bold border-t border-slate-200 shrink-0">
        <div>© 2024 EasyTech Core Systems. Restricted Access.</div>
        <div className="flex items-center gap-8 mt-4 md:mt-0">
          <a href="#" className="hover:text-[#0052cc] transition-colors">Security Policy</a>
          <a href="#" className="hover:text-[#0052cc] transition-colors">Audit Logs</a>
          <a href="#" className="hover:text-[#0052cc] transition-colors">System Status</a>
        </div>
      </footer>
    </div>
  );
};
