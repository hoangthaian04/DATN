import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, ArrowRight, Building2, Check, CheckCircle2, Loader2, Save, Upload } from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import { AuthService } from '@/services/auth.service';
import type { OnboardingRequest } from '@/types/auth.types';
import { getPostLoginPath } from '@/utils/authRouting';

type StepErrors = Partial<Record<'industry' | 'companySize' | 'description' | 'phone' | 'address' | 'website', string>>;

const inputClass = 'w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-600';
const hasValue = (value?: string) => Boolean(value?.trim());
const validUrl = (value?: string) => {
  const trimmed = value?.trim() ?? '';
  return !trimmed || /^https?:\/\/.+\..+/.test(trimmed);
};

export const OnboardingPage: React.FC = () => {
  const { user, onboarding, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<StepErrors>({});
  const [logoUrl, setLogoUrl] = useState<string>();
  const [form, setForm] = useState<OnboardingRequest>({});

  useEffect(() => {
    if (!user) return;
    const target = getPostLoginPath(user);
    if (target === '/pending' || target === '/registration/rejected' || target === '/403') {
      navigate(target, { replace: true });
      return;
    }
    if (user.onboardingCompleted) {
      navigate('/dashboard', { replace: true });
      return;
    }

    AuthService.getCompanyProfile()
      .then((profile) => {
        setLogoUrl(profile.logoUrl);
        setForm({
          companyName: profile.companyName || user.companyName || '',
          taxCode: profile.taxCode,
          email: profile.email || user.email,
          phone: profile.phone,
          website: profile.website,
          address: profile.address,
          industry: profile.industry,
          companySize: profile.companySize,
          description: profile.description,
          logoUrl: profile.logoUrl,
        });
      })
      .catch(() => setError('Không thể tải thông tin công ty đã lưu.'));
  }, [navigate, user]);

  const completeness = useMemo(() => {
    const required = [form.description, form.industry, form.companySize, form.website, form.address, form.phone];
    return Math.round((required.filter(hasValue).length / required.length) * 100);
  }, [form]);

  const update = (field: keyof OnboardingRequest, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validateStep = (targetStep: 1 | 2 | 3) => {
    const errors: StepErrors = {};
    if (targetStep === 1) {
      if (!hasValue(form.industry)) errors.industry = 'Vui lòng nhập lĩnh vực hoạt động.';
      if (!hasValue(form.companySize)) errors.companySize = 'Vui lòng chọn quy mô nhân sự.';
      if (!hasValue(form.website)) errors.website = 'Vui lòng nhập website.';
      else if (!validUrl(form.website)) errors.website = 'Website phải bắt đầu bằng http:// hoặc https://.';
      if (!hasValue(form.description)) errors.description = 'Vui lòng nhập mô tả công ty.';
    }
    if (targetStep === 3) {
      if (!hasValue(form.phone)) errors.phone = 'Vui lòng nhập số điện thoại.';
      if (!hasValue(form.address)) errors.address = 'Vui lòng nhập địa chỉ.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const saveStep = async (nextStep: 1 | 2 | 3) => {
    if (!validateStep(step)) return;
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
    if (!skip && !validateStep(3)) return;
    try {
      setLoading(true);
      setError(null);
      await onboarding(form, skip);
      await refreshUser();
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
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Thiết lập hồ sơ công ty</h1>
            <p className="mt-2 text-sm text-slate-500">
              Company Name, Company Email và Tax Code lấy từ registration; không cần nhập lại.
            </p>
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

        <div className="mb-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 md:grid-cols-3">
          <ReadOnlyItem label="Company Name" value={form.companyName || user?.companyName} />
          <ReadOnlyItem label="Company Email" value={form.email || user?.email} />
          <ReadOnlyItem label="Tax Code" value={form.taxCode} />
        </div>

        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            {[
              ['Thông tin doanh nghiệp', 'Lĩnh vực, quy mô, website, mô tả'],
              ['Logo', 'Không bắt buộc'],
              ['Thông tin liên hệ', 'Phone, address'],
            ].map(([title, description], index) => {
              const number = (index + 1) as 1 | 2 | 3;
              return (
                <div key={title} className="mb-6 flex gap-3 last:mb-0">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${step >= number ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    {step > number ? <Check className="h-4 w-4" /> : number}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{title}</p>
                    <p className="text-xs text-slate-400">{description}</p>
                  </div>
                </div>
              );
            })}
            <div className="mt-6 border-t border-slate-100 pt-5">
              <div className="mb-2 flex justify-between text-xs font-bold">
                <span>Độ hoàn thiện</span>
                <span className="text-blue-600">{completeness}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full bg-blue-600 transition-all" style={{ width: `${completeness}%` }} />
              </div>
            </div>
          </aside>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            {step === 1 && (
              <div className="space-y-5">
                <Field label="Lĩnh vực *" error={fieldErrors.industry}>
                  <input className={inputClass} value={form.industry || ''} onChange={(event) => update('industry', event.target.value)} />
                </Field>
                <Field label="Quy mô nhân sự *" error={fieldErrors.companySize}>
                  <select className={inputClass} value={form.companySize || ''} onChange={(event) => update('companySize', event.target.value)}>
                    <option value="">Chọn quy mô</option>
                    <option>1-10</option>
                    <option>11-50</option>
                    <option>51-200</option>
                    <option>201-500</option>
                    <option>Trên 500</option>
                  </select>
                </Field>
                <Field label="Website *" error={fieldErrors.website}>
                  <input className={inputClass} value={form.website || ''} onChange={(event) => update('website', event.target.value)} placeholder="https://company.vn" />
                </Field>
                <Field label="Giới thiệu công ty *" error={fieldErrors.description}>
                  <textarea rows={4} className={`${inputClass} resize-none`} value={form.description || ''} onChange={(event) => update('description', event.target.value)} />
                </Field>
                <div className="flex justify-end">
                  <button disabled={loading} onClick={() => void saveStep(2)} className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white disabled:opacity-60">
                    <Save className="h-4 w-4" /> Lưu và tiếp tục <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50">
                    {logoUrl ? <img src={logoUrl} alt="Logo công ty" className="h-full w-full object-cover" /> : <Building2 className="h-8 w-8 text-slate-300" />}
                  </div>
                  <label className="cursor-pointer rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50">
                    <span className="flex items-center gap-2"><Upload className="h-4 w-4" /> Tải logo tùy chọn</span>
                    <input className="hidden" type="file" accept="image/png,image/jpeg,image/webp" onChange={uploadLogo} />
                  </label>
                </div>
                <p className="rounded-xl bg-blue-50 p-4 text-sm font-semibold text-blue-700">
                  Logo là optional. Bạn có thể bỏ qua bước này và cập nhật sau trong settings.
                </p>
                <div className="flex justify-between">
                  <button onClick={() => setStep(1)} className="flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600">
                    <ArrowLeft className="h-4 w-4" /> Quay lại
                  </button>
                  <button disabled={loading} onClick={() => void saveStep(3)} className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white disabled:opacity-60">
                    Lưu và tiếp tục <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Số điện thoại *" error={fieldErrors.phone}>
                    <input className={inputClass} value={form.phone || ''} onChange={(event) => update('phone', event.target.value)} />
                  </Field>
                </div>
                <Field label="Địa chỉ trụ sở *" error={fieldErrors.address}>
                  <input className={inputClass} value={form.address || ''} onChange={(event) => update('address', event.target.value)} />
                </Field>
                <div className="flex justify-between">
                  <button onClick={() => setStep(2)} className="flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600">
                    <ArrowLeft className="h-4 w-4" /> Quay lại
                  </button>
                  <button disabled={loading} onClick={() => void finish(false)} className="flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3 text-sm font-bold text-white disabled:opacity-60">
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />} Hoàn tất
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

const Field: React.FC<{ label: string; error?: string; children: React.ReactNode }> = ({ label, error, children }) => (
  <label className="block">
    <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600">{label}</span>
    {children}
    {error && <span className="mt-1.5 block text-xs font-semibold text-red-600">{error}</span>}
  </label>
);

const ReadOnlyItem: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
  <div>
    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
    <p className="mt-1 font-bold text-slate-800">{value || 'Chưa có dữ liệu'}</p>
  </div>
);
