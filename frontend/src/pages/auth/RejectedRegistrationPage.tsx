import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2, LogOut, RotateCcw, Save } from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import { AuthService } from '@/services/auth.service';
import type { CompanyDetail, CompanyRegistrationUpdateRequest } from '@/types/auth.types';
import { getPostLoginPath } from '@/utils/authRouting';

type FormErrors = Partial<Record<keyof CompanyRegistrationUpdateRequest, string>>;

export const RejectedRegistrationPage: React.FC = () => {
  const { logout, refreshUser, user } = useAuth();
  const navigate = useNavigate();
  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [form, setForm] = useState<CompanyRegistrationUpdateRequest>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (user.companyStatus === 'PENDING') {
      navigate('/pending', { replace: true });
      return;
    }
    if (user.companyStatus !== 'REJECTED') {
      navigate(getPostLoginPath(user), { replace: true });
      return;
    }

    AuthService.getOwnRegistration()
      .then((detail) => {
        setCompany(detail);
        setForm({
          fullName: user.fullName,
          companyName: detail.name,
          taxCode: detail.taxCode || '',
        });
      })
      .catch((error: unknown) => {
        setBanner((error as { customMessage?: string })?.customMessage || 'Không thể tải hồ sơ đăng ký.');
      })
      .finally(() => setLoading(false));
  }, [navigate, user]);

  const update = (field: keyof CompanyRegistrationUpdateRequest, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validate = () => {
    const next: FormErrors = {};
    if (!form.fullName?.trim()) next.fullName = 'Vui lòng nhập họ và tên.';
    if (!form.companyName?.trim()) next.companyName = 'Vui lòng nhập tên công ty.';
    if (!form.taxCode?.trim()) next.taxCode = 'Vui lòng nhập mã số thuế.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const save = async () => {
    if (!validate()) return;
    try {
      setSaving(true);
      setBanner(null);
      const updated = await AuthService.updateOwnRegistration(normalize(form));
      setCompany(updated);
      setBanner('Đã lưu thông tin chỉnh sửa.');
      await refreshUser();
    } catch (error: unknown) {
      const message = (error as { customMessage?: string })?.customMessage || 'Không thể lưu thông tin.';
      if (message.toLowerCase().includes('mã số thuế') || message.toLowerCase().includes('tax')) {
        setErrors((current) => ({ ...current, taxCode: message }));
      } else {
        setBanner(message);
      }
    } finally {
      setSaving(false);
    }
  };

  const resubmit = async () => {
    if (!validate()) return;
    try {
      setSaving(true);
      setBanner(null);
      await AuthService.updateOwnRegistration(normalize(form));
      await AuthService.resubmitOwnRegistration();
      await refreshUser();
      navigate('/pending', { replace: true });
    } catch (error: unknown) {
      setBanner((error as { customMessage?: string })?.customMessage || 'Không thể gửi lại hồ sơ.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <main className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">
              <AlertCircle className="h-3.5 w-3.5" /> Hồ sơ bị từ chối
            </span>
            <h1 className="mt-4 text-3xl font-extrabold text-slate-900">Chỉnh sửa đăng ký doanh nghiệp</h1>
            <p className="mt-2 text-sm text-slate-500">
              Bạn có session hợp lệ nhưng chưa được truy cập HR Workspace cho đến khi Admin duyệt lại.
            </p>
          </div>
          <button onClick={() => void handleLogout()} className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600">
            <LogOut className="h-4 w-4" /> Đăng xuất
          </button>
        </div>

        {company?.rejectedReason && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <p className="font-extrabold">Lý do từ chối</p>
            <p className="mt-1">{company.rejectedReason}</p>
          </div>
        )}

        {banner && (
          <div className="mb-6 flex items-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm font-semibold text-blue-700">
            <CheckCircle2 className="h-4 w-4" /> {banner}
          </div>
        )}

        <div className="space-y-4">
          <Field label="Họ và tên *" error={errors.fullName}>
            <input className={inputClass} value={form.fullName || ''} onChange={(event) => update('fullName', event.target.value)} />
          </Field>
          <Field label="Tên công ty *" error={errors.companyName}>
            <input className={inputClass} value={form.companyName || ''} onChange={(event) => update('companyName', event.target.value)} />
          </Field>
          <Field label="Mã số thuế *" error={errors.taxCode}>
            <input className={inputClass} value={form.taxCode || ''} onChange={(event) => update('taxCode', event.target.value)} />
          </Field>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button disabled={saving} onClick={() => void save()} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 disabled:opacity-60">
            <Save className="h-4 w-4" /> Lưu chỉnh sửa
          </button>
          <button disabled={saving} onClick={() => void resubmit()} className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />} Gửi lại hồ sơ
          </button>
        </div>
      </main>
    </div>
  );
};

const inputClass = 'mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-600';

const Field: React.FC<{ label: string; error?: string; children: React.ReactNode }> = ({ label, error, children }) => (
  <label className="block">
    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">{label}</span>
    {children}
    {error && <span className="mt-1.5 block text-xs font-semibold text-red-600">{error}</span>}
  </label>
);

const normalize = (form: CompanyRegistrationUpdateRequest): CompanyRegistrationUpdateRequest => ({
  fullName: form.fullName?.trim(),
  companyName: form.companyName?.trim(),
  taxCode: form.taxCode?.trim(),
});
