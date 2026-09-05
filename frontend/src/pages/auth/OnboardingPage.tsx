import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Globe2,
  Loader2,
  MapPin,
  Phone,
  Send,
  Sparkles,
  Upload,
} from 'lucide-react';

export const OnboardingPage: React.FC = () => {
  const { user, onboarding } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [companyName, setCompanyName] = useState(user?.companyName || '');
  const [services, setServices] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const slug = user?.companySlug || '';
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const completeness = useMemo(() => {
    let score = 15;
    if (companyName.trim()) score += 20;
    if (services.trim()) score += 20;
    if (address.trim()) score += 15;
    if (phoneNumber.trim()) score += 10;
    if (website.trim()) score += 10;
    if (slug.trim()) score += 10;
    return Math.min(score, 100);
  }, [address, companyName, phoneNumber, services, slug, website]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setLogoUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !services.trim()) {
      setErrorMessage('Vui lòng điền tên công ty và dịch vụ/mô tả hoạt động');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);

      await onboarding({
        companyName,
        taxCode: taxCode || undefined,
        phone: phoneNumber || undefined,
        website: website || undefined,
        address: address || undefined,
        description: services || undefined,
        logoUrl: logoUrl || undefined,
      });

      navigate('/pending', { replace: true });
    } catch (err: unknown) {
      const msg = (err as { customMessage?: string })?.customMessage || 'Lưu thông tin thất bại. Vui lòng thử lại.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <PublicHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-12">
        <div className="mb-8 text-left">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[#0052cc] text-xs font-bold">
            <Sparkles className="h-3.5 w-3.5" />
            Lần đăng nhập đầu tiên
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mt-4">
            Thiết lập hồ sơ công ty trước khi vào HR Dashboard
          </h1>
          <p className="text-sm font-semibold text-slate-500 mt-2 max-w-3xl">
            EasyHire cần thông tin doanh nghiệp để Admin duyệt, tạo Career Site riêng và gắn branding cho email/tin tuyển dụng.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start w-full">
          {/* Stepper Sidebar */}
          <aside className="lg:col-span-1 premium-card bg-white p-6 space-y-6 text-left">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest">
              Luồng bắt buộc
            </h3>
            <div className="space-y-6 relative pl-2">
              <div className="absolute top-1 bottom-1 left-[14px] w-0.5 bg-slate-200" />
              {[
                { step: 1, title: 'Thông tin công ty', desc: 'Tên, dịch vụ, logo' },
                { step: 2, title: 'Liên hệ & Career Site', desc: 'Website, số điện thoại, slug' },
                { step: 3, title: 'Xác nhận', desc: 'Gửi hồ sơ chờ duyệt' },
              ].map((item) => (
                <button
                  key={item.step}
                  type="button"
                  onClick={() => setCurrentStep(item.step)}
                  className="flex items-start gap-4 relative z-10 text-left w-full cursor-pointer"
                >
                  <span
                    className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      currentStep >= item.step
                        ? 'bg-[#0052cc] text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {currentStep > item.step ? <Check className="h-4 w-4" /> : item.step}
                  </span>
                  <span>
                    <span className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                      {item.title}
                    </span>
                    <span className="block text-[10px] font-semibold text-slate-400 uppercase mt-0.5">
                      {item.desc}
                    </span>
                  </span>
                </button>
              ))}
            </div>

            {/* Progress bar */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-slate-600">Độ hoàn thiện</span>
                <span className="text-[#0052cc]">{completeness}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#0052cc] transition-all duration-300 rounded-full"
                  style={{ width: `${completeness}%` }}
                />
              </div>
            </div>
          </aside>

          {/* Center Form Section */}
          <section className="lg:col-span-3 premium-card bg-white p-8 space-y-6">
            <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
              <div className="text-left">
                <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                  {currentStep === 1 && '1. Thông tin doanh nghiệp'}
                  {currentStep === 2 && '2. Liên hệ & Cấu hình Career Site'}
                  {currentStep === 3 && '3. Xác nhận & Gửi hồ sơ'}
                </h2>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">
                  Các trường này sẽ được dùng cho Admin Approval và Career Site riêng.
                </p>
              </div>
              <Building2 className="h-6 w-6 text-[#0052cc]" />
            </div>

            <form onSubmit={handleComplete} className="space-y-6 text-left">
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Logo công ty
                    </label>
                    <div className="flex items-center gap-6">
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt="Preview"
                          className="h-16 w-16 rounded-xl object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-xl bg-slate-50 border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                          <Building2 className="h-6 w-6" />
                        </div>
                      )}
                      <label className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-600 cursor-pointer">
                        <span className="flex items-center gap-1.5">
                          <Upload className="h-4 w-4" />
                          Tải ảnh lên
                        </span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Tên công ty *
                    </label>
                    <input
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="VD: TechA Solutions JSC"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0052cc] text-sm font-semibold text-slate-800"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Mã số thuế (MST)
                    </label>
                    <input
                      value={taxCode}
                      onChange={(e) => setTaxCode(e.target.value)}
                      placeholder="VD: 0101234567"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0052cc] text-sm font-semibold text-slate-800"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Dịch vụ cung cấp / Mô tả hoạt động *
                    </label>
                    <textarea
                      value={services}
                      onChange={(e) => setServices(e.target.value)}
                      rows={3}
                      placeholder="VD: Tuyển dụng IT, outsourcing, sản phẩm AI, phát triển nền tảng Cloud..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0052cc] text-sm font-semibold text-slate-800 resize-none"
                      required
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="inline-flex items-center gap-1.5 px-6 py-3 rounded-xl bg-[#0052cc] hover:bg-[#0047b3] text-white text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer"
                    >
                      Tiếp tục
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Địa chỉ trụ sở
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                      <input
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Quận 1, TP. Hồ Chí Minh..."
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0052cc] text-sm font-semibold text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Số điện thoại hotline
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                        <input
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="09xx xxx xxx"
                          className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0052cc] text-sm font-semibold text-slate-800"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Website công ty
                      </label>
                      <div className="relative">
                        <Globe2 className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                        <input
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          placeholder="www.company.vn"
                          className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0052cc] text-sm font-semibold text-slate-800"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Quay lại
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="inline-flex items-center gap-1.5 px-6 py-3 rounded-xl bg-[#0052cc] hover:bg-[#0047b3] text-white text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer"
                    >
                      Tiếp tục
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="rounded-2xl bg-blue-50/70 border border-blue-100 p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-6 w-6 text-[#0052cc]" />
                      <h4 className="text-base font-bold text-slate-900">
                        Xác nhận thông tin doanh nghiệp
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
                      <div>
                        <span className="font-bold text-slate-500 block">TÊN DOANH NGHIỆP:</span>
                        <span className="font-semibold text-sm">{companyName}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-500 block">MÃ SỐ THUẾ:</span>
                        <span className="font-semibold text-sm">{taxCode || 'Chưa cập nhật'}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-500 block">ĐỊA CHỈ:</span>
                        <span className="font-semibold">{address || 'Chưa cập nhật'}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-500 block">HOTLINE / WEBSITE:</span>
                        <span className="font-semibold">{phoneNumber || website || 'Chưa cập nhật'}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    Sau khi bấm <strong>"Gửi hồ sơ chờ duyệt"</strong>, hồ sơ của bạn sẽ chuyển sang trạng thái{' '}
                    <span className="text-amber-600 font-bold">Chờ duyệt (PENDING)</span>. Quản trị viên EasyHire sẽ kiểm duyệt trong vòng 24h.
                  </p>

                  <div className="flex items-center justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Quay lại
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[#0052cc] hover:bg-[#0047b3] text-white text-sm font-bold shadow-lg shadow-blue-500/25 cursor-pointer disabled:opacity-60"
                    >
                      {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          <span>Gửi hồ sơ chờ duyệt</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};
