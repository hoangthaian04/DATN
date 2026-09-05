import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Loader2,
  Share2,
  User,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Tabs: Login or Register
  const queryParams = new URLSearchParams(location.search);
  const defaultTab = queryParams.get('tab') === 'register' ? 'register' : 'login';
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab);

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register state (2 steps)
  const [registerStep, setRegisterStep] = useState<1 | 2>(1);

  // --- Step 1: Người đại diện ---
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // --- Step 2: Thông tin công ty ---
  const [companyName, setCompanyName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');

  // Xử lý đăng nhập
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      const user = await login({ email, password });

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
      setLoading(false);
    }
  };

  // Bước 1 đăng ký chuyển sang bước 2
  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !regEmail || !phone || !regPassword) {
      setErrorMessage('Vui lòng điền đầy đủ các thông tin bắt buộc (*)');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMessage('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    setErrorMessage(null);
    setRegisterStep(2);
  };

  // Hoàn tất đăng ký
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName) {
      setErrorMessage('Vui lòng nhập tên công ty pháp lý');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      await register({
        fullName,
        email: regEmail,
        password: regPassword,
        companyName,
        phone,
      });
      navigate('/onboarding', { replace: true });
    } catch (err: unknown) {
      const msg = (err as { customMessage?: string })?.customMessage || 'Đăng ký tài khoản thất bại. Vui lòng thử lại.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý Google OAuth
  const handleGoogleSuccess = async (idToken: string) => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const user = await loginWithGoogle(idToken);
      if (user.companyStatus === 'PENDING') {
        navigate('/pending', { replace: true });
      } else {
        const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      }
    } catch (err: unknown) {
      const msg = (err as { customMessage?: string })?.customMessage || 'Đăng nhập Google thất bại';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputClassName =
    'w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] focus:outline-none focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc] transition-all text-slate-700 bg-slate-50 focus:bg-white';
  const labelClassName =
    'text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block';

  return (
    <div className="h-screen w-full flex flex-col bg-white font-sans overflow-hidden">
      <main className="flex-1 flex w-full h-full">
        {/* Left Side: Form */}
        <div className="w-full lg:w-1/2 h-full flex flex-col justify-center px-6 sm:px-12 md:px-20 relative overflow-y-auto bg-white custom-scrollbar">
          <div className="max-w-[420px] w-full mx-auto my-auto py-8">
            <h1 className="text-[28px] font-bold text-slate-900 mb-2 tracking-tight">
              {activeTab === 'login' ? 'Chào mừng HR quay lại' : 'Tạo tài khoản Doanh nghiệp'}
            </h1>
            <p className="text-[14px] text-slate-500 mb-8">
              {activeTab === 'login'
                ? 'Nhập thông tin của bạn để truy cập hệ thống quản trị'
                : 'Bắt đầu sử dụng nền tảng tuyển dụng thông minh EasyHire'}
            </p>

            {/* Tabs */}
            <div className="flex items-center gap-8 border-b border-slate-200 mb-8">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setRegisterStep(1);
                  setErrorMessage(null);
                }}
                className={`pb-3 text-[15px] font-bold border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'login'
                    ? 'border-[#0052cc] text-[#0052cc]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setErrorMessage(null);
                }}
                className={`pb-3 text-[15px] font-bold border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'register'
                    ? 'border-[#0052cc] text-[#0052cc]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Register
              </button>
            </div>

            {/* Error banner */}
            {errorMessage && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 animate-in fade-in">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Login Form */}
            {activeTab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <label className={labelClassName}>EMAIL</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hr@company.com"
                    className={inputClassName}
                    required
                  />
                </div>
                <div>
                  <label className={labelClassName}>PASSWORD</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={inputClassName}
                    required
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-[13px] font-semibold text-slate-600 group-hover:text-slate-800 transition-colors">
                      Remember me
                    </span>
                  </label>
                  <button 
                    type="button" 
                    onClick={() => navigate('/forgot-password')}
                    className="text-[13px] font-bold text-[#0052cc] hover:text-blue-800 transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg bg-[#0052cc] hover:bg-[#0047b3] text-white text-[15px] font-bold transition-colors mt-4 flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-60"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sign In'}
                </button>

                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-[1px] bg-slate-200" />
                  <span className="text-xs text-slate-400 font-medium px-2">or</span>
                  <div className="flex-1 h-[1px] bg-slate-200" />
                </div>

                <GoogleLoginButton
                  onSuccess={handleGoogleSuccess}
                  isLoading={loading}
                  text="Đăng nhập với Google"
                  mode="login"
                />
              </form>
            )}

            {/* Register Wizard */}
            {activeTab === 'register' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* Stepper Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`flex items-center justify-center h-8 w-8 rounded-full font-bold text-xs ${
                      registerStep === 1 ? 'bg-[#0052cc] text-white' : 'bg-emerald-500 text-white'
                    }`}
                  >
                    {registerStep === 1 ? '1' : <CheckCircle2 className="h-4 w-4" />}
                  </div>
                  <div className={`h-1 flex-1 rounded-full ${registerStep === 2 ? 'bg-emerald-500' : 'bg-slate-100'}`} />
                  <div
                    className={`flex items-center justify-center h-8 w-8 rounded-full font-bold text-xs ${
                      registerStep === 2 ? 'bg-[#0052cc] text-white' : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    2
                  </div>
                </div>

                {/* STEP 1: Thông tin người đại diện */}
                {registerStep === 1 && (
                  <form onSubmit={handleNextStep} className="space-y-4">
                    <div className="flex items-center gap-2 mb-2 text-[#0052cc]">
                      <User className="h-5 w-5" />
                      <h3 className="font-bold text-sm">1. Thông tin người đại diện</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClassName}>Họ và tên *</label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Nguyễn Văn A"
                          className={inputClassName}
                          required
                        />
                      </div>
                      <div>
                        <label className={labelClassName}>Chức vụ *</label>
                        <input
                          type="text"
                          value={position}
                          onChange={(e) => setPosition(e.target.value)}
                          placeholder="HR Manager"
                          className={inputClassName}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelClassName}>Phòng ban</label>
                      <input
                        type="text"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="VD: Human Resources"
                        className={inputClassName}
                      />
                    </div>

                    <div>
                      <label className={labelClassName}>Email công ty *</label>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="name@company.com"
                        className={inputClassName}
                        required
                      />
                    </div>

                    <div>
                      <label className={labelClassName}>Số điện thoại *</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="09xx xxx xxx"
                        className={inputClassName}
                        required
                      />
                    </div>

                    <div>
                      <label className={labelClassName}>Mật khẩu *</label>
                      <input
                        type="password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="••••••••"
                        className={inputClassName}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-lg bg-[#0052cc] hover:bg-[#0047b3] text-white text-[14px] font-bold transition-colors mt-6 flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer"
                    >
                      Tiếp theo: Thông tin công ty
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </form>
                )}

                {/* STEP 2: Thông tin công ty */}
                {registerStep === 2 && (
                  <form onSubmit={handleRegisterSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center gap-2 mb-2 text-[#0052cc]">
                      <Building2 className="h-5 w-5" />
                      <h3 className="font-bold text-sm">2. Thông tin doanh nghiệp</h3>
                    </div>

                    <div>
                      <label className={labelClassName}>Tên công ty (Pháp lý) *</label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Công ty CP Công nghệ EasyHire..."
                        className={inputClassName}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClassName}>Mã số thuế (MST)</label>
                        <input
                          type="text"
                          value={taxId}
                          onChange={(e) => setTaxId(e.target.value)}
                          placeholder="0101xxxxxx"
                          className={inputClassName}
                        />
                      </div>
                      <div>
                        <label className={labelClassName}>Loại hình DN</label>
                        <select
                          value={businessType}
                          onChange={(e) => setBusinessType(e.target.value)}
                          className={inputClassName}
                        >
                          <option value="">Chọn loại hình</option>
                          <option value="tnhh">TNHH</option>
                          <option value="cp">Cổ phần</option>
                          <option value="fd">FDI</option>
                          <option value="other">Khác</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClassName}>Lĩnh vực hoạt động</label>
                        <select
                          value={industry}
                          onChange={(e) => setIndustry(e.target.value)}
                          className={inputClassName}
                        >
                          <option value="">Chọn lĩnh vực</option>
                          <option value="it">IT - Phần mềm</option>
                          <option value="fin">Tài chính - Ngân hàng</option>
                          <option value="man">Sản xuất</option>
                          <option value="edu">Giáo dục</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClassName}>Quy mô nhân sự</label>
                        <select
                          value={companySize}
                          onChange={(e) => setCompanySize(e.target.value)}
                          className={inputClassName}
                        >
                          <option value="">Chọn quy mô</option>
                          <option value="1-10">1 - 10</option>
                          <option value="11-50">11 - 50</option>
                          <option value="51-200">51 - 200</option>
                          <option value="200+">Trên 200</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className={labelClassName}>Địa chỉ trụ sở</label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Số nhà, Đường, Phường/Xã..."
                        className={inputClassName}
                      />
                    </div>

                    <div>
                      <label className={labelClassName}>Tỉnh / Thành phố</label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className={inputClassName}
                      >
                        <option value="">Chọn Tỉnh/Thành phố</option>
                        <option value="hanoi">Hà Nội</option>
                        <option value="hcm">Hồ Chí Minh</option>
                        <option value="danang">Đà Nẵng</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-3 mt-6">
                      <button
                        type="button"
                        onClick={() => setRegisterStep(1)}
                        className="py-3 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[14px] font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Quay lại
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-3 rounded-lg bg-[#0052cc] hover:bg-[#0047b3] text-white text-[14px] font-bold transition-colors flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-60"
                      >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Hoàn tất Đăng ký'}
                      </button>
                    </div>
                  </form>
                )}

                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-[1px] bg-slate-200" />
                  <span className="text-xs text-slate-400 font-medium px-2">hoặc</span>
                  <div className="flex-1 h-[1px] bg-slate-200" />
                </div>

                <GoogleLoginButton
                  onSuccess={handleGoogleSuccess}
                  isLoading={loading}
                  text="Đăng ký với Google"
                  mode="register"
                />
              </div>
            )}

            {/* Admin Portal Link */}
            {activeTab === 'login' && (
              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={() => navigate('/admin/login')}
                  className="text-[11px] text-slate-400 hover:text-slate-600 font-bold underline decoration-slate-300 underline-offset-4 cursor-pointer"
                >
                  Admin Portal &rarr;
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Visual/Feature List */}
        <div className="hidden lg:flex w-1/2 relative bg-[#ebf2ff] items-center justify-center overflow-hidden p-12 shadow-[inset_1px_0_10px_rgba(0,0,0,0.02)]">
          {/* Abstract Background pattern simulation */}
          <div className="absolute inset-0 opacity-70">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[80px] -translate-x-1/4 translate-y-1/4" />

            {/* Network pattern SVG */}
            <svg className="absolute inset-0 w-full h-full text-blue-400/30" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="network-pattern-full" x="0" y="0" width="160" height="160" patternUnits="userSpaceOnUse">
                  <circle cx="30" cy="30" r="5" fill="currentColor" />
                  <circle cx="120" cy="80" r="4" fill="currentColor" />
                  <circle cx="140" cy="140" r="6" fill="currentColor" />
                  <circle cx="20" cy="120" r="3" fill="currentColor" />
                  <path d="M30,30 L120,80 L140,140 L20,120 Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  <path d="M30,30 L20,120" stroke="currentColor" strokeWidth="1.5" fill="none" />
                </pattern>
              </defs>
              <rect x="0" y="0" width="100%" height="100%" fill="url(#network-pattern-full)" />
            </svg>
          </div>

          {/* Feature Card */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-10 max-w-[440px] w-full shadow-[0_20px_60px_-15px_rgba(0,30,100,0.15)] relative z-10 border border-white">
            <div className="flex items-center gap-3.5 mb-6">
              <Share2 className="h-8 w-8 text-[#0052cc]" />
              <h2 className="text-2xl font-bold text-slate-800">EasyHire</h2>
            </div>

            <p className="text-[15px] text-slate-500 mb-10 leading-relaxed font-medium">
              Trang bị cho chuyên gia nhân sự những phân tích chuyên sâu từ AI để tìm kiếm nhân tài hàng đầu nhanh chóng và thông minh hơn.
            </p>

            <div className="space-y-5">
              {[
                'Luồng ứng viên được tối ưu hóa',
                'Bảng điều khiển phân tích nâng cao',
                'Cộng tác nhóm liền mạch',
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-4">
                  <CheckCircle2 className="h-5 w-5 text-[#0052cc] shrink-0 stroke-[2.5]" />
                  <span className="text-[15px] text-slate-700 font-semibold">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#f4f7fb] py-5 px-8 md:px-16 flex flex-col md:flex-row items-center justify-between text-[12px] text-[#2c3e50] font-bold border-t border-slate-200 shrink-0">
        <div>© 2024 EasyHire. All rights reserved.</div>
        <div className="flex items-center gap-8 mt-4 md:mt-0">
          <a href="#" className="hover:text-[#0052cc] transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-[#0052cc] transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-[#0052cc] transition-colors">Help Center</a>
          <a href="#" className="hover:text-[#0052cc] transition-colors">Contact Support</a>
        </div>
      </footer>
    </div>
  );
};
