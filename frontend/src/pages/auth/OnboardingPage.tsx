import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Loader2,
  Save,
  Sparkles,
  Upload,
} from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import { AuthService } from '@/services/auth.service';
import type { OnboardingRequest } from '@/types/auth.types';

const inputClass = 'w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-600';

export const OnboardingPage: React.FC = () => {
  const { user, onboarding } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string>();
  const [form, setForm] = useState<OnboardingRequest>({ companyName: user?.companyName || '' });

  useEffect(() => {
    if (user?.onboardingCompleted) {
      navigate('/dashboard', { replace: true });
      return;
    }
    AuthService.getCompanyProfile()
      .then((profile) => {
        setLogoUrl(profile.logoUrl);
        setForm((current) => ({
          ...current,
          businessType: profile.businessType,
          industry: profile.industry,
          companySize: profile.companySize,
          description: profile.description,
          benefits: profile.benefits,
          logoUrl: profile.logoUrl,
        }));
      })
      .catch(() => setError('Không thể tải thông tin công ty đã lưu.'));
  }, [navigate, user?.onboardingCompleted]);

  const completeness = useMemo(() => {
    const required = [form.description, form.industry, form.companySize, form.website, form.address, form.phone];
    return Math.round((required.filter((value) => value?.trim()).length / required.length) * 100);
  }, [form]);

  const update = (field: keyof OnboardingRequest, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const saveAndContinue = async (nextStep: number) => {
    try {
      setLoading(true);
      setError(null);
      await AuthService.updateCompanyProfile(form);
      setStep(nextStep);
    } catch (requestError: unknown) {
      setError((requestError as { customMessage?: string }).customMessage || 'Không thể lưu thông tin.');
    } finally {
      setLoading(false);
    }
  };

  const uploadLogo = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setLoading(true);
      setError(null);
      const profile = await AuthService.uploadCompanyLogo(file);
      setLogoUrl(profile.logoUrl);
      update('logoUrl', profile.logoUrl || '');
    } catch (requestError: unknown) {
      setError((requestError as { customMessage?: string }).customMessage || 'Tải logo thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const finish = async (skip = false) => {
    try {
      setLoading(true);
      setError(null);
      await onboarding(form, skip);
      navigate('/dashboard', { replace: true });
    } catch (requestError: unknown) {
      setError((requestError as { customMessage?: string }).customMessage || 'Không thể hoàn tất onboarding.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans md:p-12">
      <main className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
              <Sparkles className="h-3.5 w-3.5" /> Lần đăng nhập đầu tiên
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">Thiết lập hồ sơ công ty</h1>
            <p className="mt-2 text-sm text-slate-500">Thông tin này được dùng cho trang tuyển dụng và nhận diện doanh nghiệp.</p>
          </div>
          <button type="button" disabled={loading} onClick={() => void finish(true)} className="rounded-xl px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100">
            Bỏ qua, thiết lập sau
          </button>
        </div>

        {error && (
          <div className="mb-6 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" /> {error}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            {[['Thông tin chung', 'Thương hiệu và lĩnh vực'], ['Liên hệ', 'Địa chỉ và website'], ['Xác nhận', 'Hoàn tất thiết lập']].map(([title, description], index) => {
              const number = index + 1;
              return (
                <div key={title} className="mb-6 flex gap-3 last:mb-0">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${step >= number ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    {step > number ? <Check className="h-4 w-4" /> : number}
                  </span>
                  <div><p className="text-sm font-bold text-slate-800">{title}</p><p className="text-xs text-slate-400">{description}</p></div>
                </div>
              );
            })}
            <div className="mt-6 border-t border-slate-100 pt-5">
              <div className="mb-2 flex justify-between text-xs font-bold"><span>Độ hoàn thiện</span><span className="text-blue-600">{completeness}%</span></div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-blue-600 transition-all" style={{ width: `${completeness}%` }} /></div>
            </div>
          </aside>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            {step === 1 && (
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50">
                    {logoUrl ? <img src={logoUrl} alt="Logo công ty" className="h-full w-full object-cover" /> : <Building2 className="h-8 w-8 text-slate-300" />}
                  </div>
                  <label className="cursor-pointer rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50">
                    <span className="flex items-center gap-2"><Upload className="h-4 w-4" /> Tải logo</span>
                    <input className="hidden" type="file" accept="image/png,image/jpeg,image/webp" onChange={uploadLogo} />
                  </label>
                </div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Tên công ty<input className={`${inputClass} mt-2`} value={form.companyName || ''} onChange={(e) => update('companyName', e.target.value)} /></label>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Loại hình doanh nghiệp<select className={`${inputClass} mt-2`} value={form.businessType || ''} onChange={(e) => update('businessType', e.target.value)}><option value="">Chọn loại hình</option><option>TNHH</option><option>Cổ phần</option><option>FDI</option><option>Khác</option></select></label>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Lĩnh vực *<input className={`${inputClass} mt-2`} value={form.industry || ''} onChange={(e) => update('industry', e.target.value)} /></label>
                </div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Quy mô nhân sự *<select className={`${inputClass} mt-2`} value={form.companySize || ''} onChange={(e) => update('companySize', e.target.value)}><option value="">Chọn quy mô</option><option>1-10</option><option>11-50</option><option>51-200</option><option>201-500</option><option>Trên 500</option></select></label>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Giới thiệu công ty *<textarea rows={4} className={`${inputClass} mt-2 resize-none`} value={form.description || ''} onChange={(e) => update('description', e.target.value)} /></label>
                <div className="flex justify-end"><button disabled={loading} onClick={() => void saveAndContinue(2)} className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white"><Save className="h-4 w-4" /> Lưu và tiếp tục <ArrowRight className="h-4 w-4" /></button></div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Số điện thoại *<input className={`${inputClass} mt-2`} value={form.phone || ''} onChange={(e) => update('phone', e.target.value)} /></label>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Website *<input className={`${inputClass} mt-2`} value={form.website || ''} onChange={(e) => update('website', e.target.value)} placeholder="https://company.vn" /></label>
                </div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Địa chỉ trụ sở *<input className={`${inputClass} mt-2`} value={form.address || ''} onChange={(e) => update('address', e.target.value)} /></label>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Phúc lợi nổi bật<textarea rows={4} className={`${inputClass} mt-2 resize-none`} value={form.benefits || ''} onChange={(e) => update('benefits', e.target.value)} /></label>
                <div className="flex justify-between"><button onClick={() => setStep(1)} className="flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600"><ArrowLeft className="h-4 w-4" /> Quay lại</button><button disabled={loading} onClick={() => void saveAndContinue(3)} className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white">Lưu và tiếp tục <ArrowRight className="h-4 w-4" /></button></div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 text-center">
                <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500" />
                <div><h2 className="text-2xl font-extrabold text-slate-900">Sẵn sàng sử dụng EasyTech HRM</h2><p className="mt-2 text-sm text-slate-500">Bạn có thể chỉnh sửa các thông tin này trong phần cài đặt công ty.</p></div>
                <div className="rounded-2xl bg-slate-50 p-5 text-left text-sm text-slate-600"><p><strong>Công ty:</strong> {form.companyName}</p><p className="mt-2"><strong>Lĩnh vực:</strong> {form.industry || 'Chưa cập nhật'}</p><p className="mt-2"><strong>Website:</strong> {form.website || 'Chưa cập nhật'}</p></div>
                <div className="flex justify-between"><button onClick={() => setStep(2)} className="flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600"><ArrowLeft className="h-4 w-4" /> Quay lại</button><button disabled={loading} onClick={() => void finish(false)} className="flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3 text-sm font-bold text-white">{loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />} Hoàn tất</button></div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};
