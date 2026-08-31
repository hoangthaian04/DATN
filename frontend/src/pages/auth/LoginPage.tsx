import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, Building2, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import { AuthService } from '@/services/auth.service';
import type { RegisterRequest } from '@/types/auth.types';
import { getPostLoginPath } from '@/utils/authRouting';

type RegisterErrors = Partial<Record<keyof RegisterRequest, string>>;

const PASSWORD_MAX_LENGTH = 72;
const passwordIsValid = (value: string) => value.length >= 8 && value.length <= PASSWORD_MAX_LENGTH && /[A-Z]/.test(value) && /\d/.test(value);
const emailIsValid = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

interface LoginPageProps {
  initialTab?: 'login' | 'register';
}

export const LoginPage: React.FC<LoginPageProps> = ({ initialTab }) => {
  const { login, register, user: sessionUser, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const defaultTab = useMemo(() => {
    if (initialTab) return initialTab;
    const queryParams = new URLSearchParams(location.search);
    return queryParams.get('tab') === 'register' ? 'register' : 'login';
  }, [initialTab, location.search]);

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [registerErrors, setRegisterErrors] = useState<RegisterErrors>({});

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registerForm, setRegisterForm] = useState<RegisterRequest>({
    fullName: '',
    email: '',
    password: '',
    companyName: '',
    taxCode: '',
  });

  useEffect(() => {
    if (isLoading || !sessionUser) return;
    navigate(getPostLoginPath(sessionUser), { replace: true });
  }, [isLoading, navigate, sessionUser]);

  useEffect(() => {
    const redirectAuthenticatedUser = async () => {
      try {
        const currentUser = sessionUser || await AuthService.getMe();
        navigate(getPostLoginPath(currentUser), { replace: true });
      } catch {
        // Không có session hợp lệ thì giữ nguyên màn đăng nhập/đăng ký.
      }
    };

    void redirectAuthenticatedUser();

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        void redirectAuthenticatedUser();
      }
    };
    const handlePopState = () => {
      void redirectAuthenticatedUser();
    };

    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate, sessionUser]);

  const updateRegisterField = (field: keyof RegisterRequest, value: string) => {
    setRegisterForm((current) => ({ ...current, [field]: value }));
    setRegisterErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validateRegister = () => {
    const normalized = normalizeRegister(registerForm);
    const errors: RegisterErrors = {};
    if (!normalized.fullName) errors.fullName = 'Vui lòng nhập họ và tên.';
    if (!normalized.email) errors.email = 'Vui lòng nhập email.';
    else if (!emailIsValid(normalized.email)) errors.email = 'Email không đúng định dạng.';
    if (!normalized.password) errors.password = 'Vui lòng nhập mật khẩu.';
    else if (normalized.password.length > PASSWORD_MAX_LENGTH) {
      errors.password = `Mật khẩu không được vượt quá ${PASSWORD_MAX_LENGTH} ký tự.`;
    }
    else if (!passwordIsValid(normalized.password)) {
      errors.password = 'Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa và chữ số.';
    }
    if (!normalized.companyName) errors.companyName = 'Vui lòng nhập tên công ty.';
    if (!normalized.taxCode) errors.taxCode = 'Vui lòng nhập mã số thuế.';
    setRegisterErrors(errors);
    return { isValid: Object.keys(errors).length === 0, normalized };
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      const user = await login({ email: email.trim().toLowerCase(), password });
      const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;
      navigate(getPostLoginPath(user, from || '/dashboard'), { replace: true });
    } catch (err: unknown) {
      setErrorMessage((err as { customMessage?: string })?.customMessage || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const { isValid, normalized } = validateRegister();
    if (!isValid) return;

    try {
      setLoading(true);
      setErrorMessage(null);
      const registration = await register(normalized);
      navigate('/pending', { replace: true, state: registration });
    } catch (err: unknown) {
      const message = (err as { customMessage?: string })?.customMessage || 'Đăng ký tài khoản thất bại. Vui lòng thử lại.';
      const fieldErrors = mapRegisterBusinessError(message);
      if (fieldErrors) {
        setRegisterErrors((current) => ({ ...current, ...fieldErrors }));
      } else {
        setErrorMessage(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClassName =
    'w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-[13px] font-semibold text-slate-700 transition-all focus:border-[#0052cc] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0052cc]';

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-white font-sans">
      <main className="flex h-full w-full flex-1">
        <div className="relative flex h-full w-full flex-col justify-center overflow-y-auto bg-white px-6 sm:px-12 md:px-20 lg:w-1/2">
          <div className="mx-auto my-auto w-full max-w-[420px] py-8">
            <h1 className="mb-2 text-[28px] font-bold tracking-tight text-slate-900">
              {activeTab === 'login' ? 'Chào mừng HR quay lại' : 'Tạo tài khoản doanh nghiệp'}
            </h1>
            <p className="mb-8 text-[14px] text-slate-500">
              {activeTab === 'login'
                ? 'Đăng nhập để tiếp tục quản lý tuyển dụng.'
                : 'Chỉ cần thông tin đăng ký tối thiểu; hồ sơ công ty sẽ hoàn thiện ở bước onboarding.'}
            </p>

            <div className="mb-8 flex items-center gap-8 border-b border-slate-200">
              {(['login', 'register'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab);
                    setErrorMessage(null);
                    setRegisterErrors({});
                  }}
                  className={`cursor-pointer border-b-2 pb-3 text-[15px] font-bold transition-colors ${
                    activeTab === tab
                      ? 'border-[#0052cc] text-[#0052cc]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab === 'login' ? 'Đăng nhập' : 'Đăng ký'}
                </button>
              ))}
            </div>

            {errorMessage && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {activeTab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-5">
                <Field label="Email">
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="hr@company.com"
                    className={inputClassName}
                    autoComplete="email"
                  />
                </Field>
                <Field label="Mật khẩu">
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    className={inputClassName}
                    autoComplete="current-password"
                  />
                </Field>
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#0052cc] py-3 text-[15px] font-bold text-white shadow-md shadow-blue-500/20 transition-colors hover:bg-[#0047b3] disabled:opacity-60"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Đăng nhập'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/admin/login')}
                  className="w-full text-center text-[11px] font-bold text-slate-400 underline decoration-slate-300 underline-offset-4 transition-colors hover:text-slate-600"
                >
                  Cổng Admin →
                </button>
              </form>
            )}

            {activeTab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="mb-2 flex items-center gap-2 text-[#0052cc]">
                  <Building2 className="h-5 w-5" />
                  <h3 className="text-sm font-bold">Thông tin đăng ký doanh nghiệp</h3>
                </div>
                <Field label="Họ và tên *" error={registerErrors.fullName}>
                  <input
                    type="text"
                    value={registerForm.fullName}
                    onChange={(event) => updateRegisterField('fullName', event.target.value)}
                    placeholder="Nguyễn Văn A"
                    className={inputClassName}
                    autoComplete="name"
                  />
                </Field>
                <Field label="Email *" error={registerErrors.email}>
                  <input
                    type="email"
                    value={registerForm.email}
                    onChange={(event) => updateRegisterField('email', event.target.value)}
                    placeholder="hr@company.com"
                    className={inputClassName}
                    autoComplete="email"
                  />
                </Field>
                <Field label="Mật khẩu *" error={registerErrors.password}>
                  <input
                    type="password"
                    value={registerForm.password}
                    onChange={(event) => updateRegisterField('password', event.target.value)}
                    placeholder="Tối thiểu 8 ký tự, gồm chữ hoa và chữ số"
                    className={inputClassName}
                    autoComplete="new-password"
                    maxLength={PASSWORD_MAX_LENGTH}
                  />
                </Field>
                <Field label="Tên công ty *" error={registerErrors.companyName}>
                  <input
                    type="text"
                    value={registerForm.companyName}
                    onChange={(event) => updateRegisterField('companyName', event.target.value)}
                    placeholder="Công ty CP Công nghệ EasyTech"
                    className={inputClassName}
                  />
                </Field>
                <Field label="Mã số thuế *" error={registerErrors.taxCode}>
                  <input
                    type="text"
                    value={registerForm.taxCode}
                    onChange={(event) => updateRegisterField('taxCode', event.target.value)}
                    placeholder="Mã số thuế"
                    className={inputClassName}
                  />
                </Field>
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#0052cc] py-3 text-[14px] font-bold text-white shadow-md shadow-blue-500/20 transition-colors hover:bg-[#0047b3] disabled:opacity-60"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Gửi đăng ký'}
                </button>
                <p className="text-center text-xs font-semibold text-slate-500">
                  Sau khi gửi, Company = PENDING và User = PENDING cho đến khi Admin duyệt.
                </p>
              </form>
            )}
          </div>
        </div>

        <div className="relative hidden w-1/2 items-center justify-center overflow-hidden bg-[#ebf2ff] p-12 lg:flex">
          <div className="relative z-10 w-full max-w-[440px] rounded-2xl border border-white bg-white/95 p-10 shadow-[0_20px_60px_-15px_rgba(0,30,100,0.15)] backdrop-blur-xl">
            <div className="mb-6 flex items-center gap-3.5">
              <ShieldCheck className="h-8 w-8 text-[#0052cc]" />
              <h2 className="text-2xl font-bold text-slate-800">EasyTech HRM</h2>
            </div>
            <p className="mb-10 text-[15px] font-medium leading-relaxed text-slate-500">
              Đăng ký doanh nghiệp được Admin phê duyệt trước khi HR truy cập workspace.
            </p>
            <div className="space-y-5">
              {['Authentication tách khỏi Workspace Authorization', 'Đăng ký tối giản theo US-02', 'Onboarding sau khi company ACTIVE'].map((text) => (
                <div key={text} className="flex items-center gap-4">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-[#0052cc]" />
                  <span className="text-[15px] font-semibold text-slate-700">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const Field: React.FC<{ label: string; error?: string; children: React.ReactNode }> = ({
  label,
  error,
  children,
}) => (
  <label className="block">
    <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</span>
    {children}
    {error && <span className="mt-1.5 block text-xs font-semibold text-red-600">{error}</span>}
  </label>
);

const normalizeRegister = (form: RegisterRequest): RegisterRequest => ({
  fullName: form.fullName.trim(),
  email: form.email.trim().toLowerCase(),
  password: form.password,
  companyName: form.companyName.trim(),
  taxCode: form.taxCode.trim(),
});

const mapRegisterBusinessError = (message: string): RegisterErrors | null => {
  const lower = message.toLowerCase();
  if (lower.includes('email')) return { email: message };
  if (lower.includes('mã số thuế') || lower.includes('tax')) return { taxCode: message };
  return null;
};
