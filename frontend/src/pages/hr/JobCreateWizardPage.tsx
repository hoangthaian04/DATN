import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ArrowLeft, Loader2, RefreshCw, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { jobCategoryService } from '@/services/job-category.service';
import { jobService } from '@/services/job.service';
import { formFieldService } from '@/services/form-field.service';
import { locationService } from '@/services/location.service';
import { FormFieldsEditor } from '@/components/jobs/FormFieldsEditor';
import type { CreateJobRequest } from '@/types/job.types';
import type { FormFieldDraft, FormFieldRequest } from '@/types/form-field.types';

const initialForm: CreateJobRequest = {
  title: '',
  categoryId: 0,
  location: '',
  salaryMin: undefined,
  salaryMax: undefined,
  currency: 'VND',
  workingType: 'ONSITE',
  employmentType: 'FULL_TIME',
  experienceLevel: 'MID',
  experienceYearsMin: undefined,
  description: '',
  requirements: '',
  benefits: '',
};

export const JobCreateWizardPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<CreateJobRequest>(initialForm);
  const [formFields, setFormFields] = useState<FormFieldDraft[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const categoriesQuery = useQuery({
    queryKey: ['job-categories', 'active'],
    queryFn: jobCategoryService.getActiveOptions,
    staleTime: 5 * 60 * 1000,
  });
  const provincesQuery = useQuery({
    queryKey: ['provinces'],
    queryFn: locationService.getProvinces,
    staleTime: Infinity,
  });
  const createMutation = useMutation({
    mutationFn: async (data: CreateJobRequest) => {
      const createdJob = await jobService.createJob(data);
      try {
        for (const [index, field] of formFields.entries()) {
          await formFieldService.createFormField(createdJob.id, toFormFieldRequest(field, index));
        }
      } catch (error) {
        throw new FormFieldsSaveError(createdJob.id, error);
      }
      return createdJob;
    },
    onSuccess: createdJob => {
      toast.success('Đã lưu Job ở trạng thái bản nháp');
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobStats'] });
      navigate(`/dashboard/jobs/${createdJob.id}`);
    },
    onError: error => {
      if (error instanceof FormFieldsSaveError) {
        toast.error('Job đã được tạo nhưng form ứng tuyển chưa lưu đủ. Vui lòng mở Job để hoàn tất.');
        queryClient.invalidateQueries({ queryKey: ['job', error.jobId] });
        navigate(`/dashboard/jobs/${error.jobId}`);
        return;
      }
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message || 'Không thể tạo Job. Vui lòng kiểm tra lại thông tin.');
    },
  });

  const categories = categoriesQuery.data || [];
  const categoryOptions = useMemo(
    () => categories.map(category => ({ value: String(category.id), label: category.name })),
    [categories],
  );
  const update = <K extends keyof CreateJobRequest>(key: K, value: CreateJobRequest[K]) => {
    setForm(current => ({ ...current, [key]: value }));
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    if (!form.title.trim() || !form.location.trim() || !form.categoryId || form.salaryMin == null || form.salaryMax == null) {
      toast.error('Vui lòng nhập đủ tiêu đề, danh mục, địa điểm và khoảng lương.');
      return;
    }
    if (form.salaryMax < form.salaryMin) {
      toast.error('Mức lương tối đa phải lớn hơn hoặc bằng mức lương tối thiểu.');
      return;
    }
    createMutation.mutate({
      ...form,
      title: form.title.trim(),
      location: form.location.trim(),
      description: form.description?.trim(),
      requirements: form.requirements?.trim(),
      benefits: form.benefits?.trim(),
    });
  };

  const catalogError = categoriesQuery.isError;
  const catalogLoading = categoriesQuery.isLoading;
  const catalogEmpty = !catalogLoading && !catalogError && categories.length === 0;

  return <div className="min-h-[calc(100vh-4rem)] bg-[#F8FAFC] p-4 text-slate-800 sm:p-8"><div className="mx-auto max-w-5xl space-y-6"><div><button type="button" onClick={() => navigate('/dashboard/jobs')} className="mb-3 inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800"><ArrowLeft className="h-4 w-4" />Quay lại danh sách</button><p className="text-xs font-semibold text-slate-400">Dashboard &gt; Tin tuyển dụng &gt; Tạo mới</p><h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-800">Tạo tin tuyển dụng</h1><p className="mt-1 text-sm text-slate-500">Điền thông tin theo bố cục của mockup EasyTech_FE. Job mới sẽ được lưu ở trạng thái INACTIVE.</p></div>
      <form onSubmit={submit} className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="mb-5"><h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">Thông tin cơ bản</h2><p className="mt-1 text-xs text-slate-500">Các trường có dấu * là bắt buộc.</p></div><div className="grid gap-5 md:grid-cols-2"><Field label="Tiêu đề Job" required value={form.title} error={submitted && !form.title.trim()} onChange={value => update('title', value)} className="md:col-span-2" /><SelectField label="Danh mục" required value={form.categoryId ? String(form.categoryId) : ''} disabled={catalogLoading || catalogEmpty || createMutation.isPending} options={[{ value: '', label: catalogLoading ? 'Đang tải danh mục...' : catalogEmpty ? 'Chưa có category ACTIVE' : '-- Chọn danh mục --' }, ...categoryOptions]} error={submitted && !form.categoryId} onChange={value => update('categoryId', Number(value))} /><SelectField label="Địa điểm" required value={form.location} disabled={provincesQuery.isLoading || createMutation.isPending} options={[{ value: '', label: provincesQuery.isLoading ? 'Đang tải tỉnh thành...' : '-- Chọn địa điểm --' }, ...(provincesQuery.data || []).map(province => ({ value: province.name, label: province.name }))]} error={submitted && !form.location.trim()} onChange={value => update('location', value)} /><SelectField label="Loại hình" required value={form.employmentType} disabled={createMutation.isPending} options={[{ value: 'FULL_TIME', label: 'Toàn thời gian' }, { value: 'PART_TIME', label: 'Bán thời gian' }, { value: 'CONTRACT', label: 'Hợp đồng' }, { value: 'INTERNSHIP', label: 'Thực tập' }]} onChange={value => update('employmentType', value as CreateJobRequest['employmentType'])} /><SelectField label="Hình thức làm việc" required value={form.workingType || ''} disabled={createMutation.isPending} options={[{ value: 'ONSITE', label: 'Tại văn phòng' }, { value: 'HYBRID', label: 'Linh hoạt' }, { value: 'REMOTE', label: 'Từ xa' }]} onChange={value => update('workingType', value)} /><SelectField label="Kinh nghiệm" value={form.experienceLevel || ''} disabled={createMutation.isPending} options={[{ value: 'INTERN', label: 'Thực tập sinh' }, { value: 'JUNIOR', label: 'Junior' }, { value: 'MID', label: 'Mid-level' }, { value: 'SENIOR', label: 'Senior' }, { value: 'LEAD', label: 'Lead' }]} onChange={value => update('experienceLevel', value as CreateJobRequest['experienceLevel'])} /><Field label="Số năm kinh nghiệm tối thiểu" type="number" min={0} value={form.experienceYearsMin?.toString() || ''} onChange={value => update('experienceYearsMin', value === '' ? undefined : Number(value))} /><SelectField label="Tiền tệ" value={form.currency || 'VND'} disabled={createMutation.isPending} options={[{ value: 'VND', label: 'VND (đ)' }, { value: 'USD', label: 'USD ($)' }]} onChange={value => update('currency', value)} /><Field label="Mức lương từ" required type="number" min={0} value={form.salaryMin?.toString() || ''} error={submitted && form.salaryMin == null} onChange={value => update('salaryMin', value === '' ? undefined : Number(value))} /><Field label="Mức lương đến" required type="number" min={0} value={form.salaryMax?.toString() || ''} error={submitted && form.salaryMax == null} onChange={value => update('salaryMax', value === '' ? undefined : Number(value))} /></div></section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="mb-5"><h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">Nội dung JD</h2><p className="mt-1 text-xs text-slate-500">Có thể nhập thủ công; AI JD Writer sẽ được nối ở task riêng khi provider và contract được chốt.</p></div><div className="space-y-5"><TextAreaField label="Mô tả công việc" value={form.description || ''} disabled={createMutation.isPending} onChange={value => update('description', value)} /><TextAreaField label="Yêu cầu ứng viên" value={form.requirements || ''} disabled={createMutation.isPending} onChange={value => update('requirements', value)} /><TextAreaField label="Quyền lợi" value={form.benefits || ''} disabled={createMutation.isPending} onChange={value => update('benefits', value)} /></div></section>
        <FormFieldsEditor fields={formFields} onChange={setFormFields} disabled={createMutation.isPending} />
        {(catalogError || provincesQuery.isError) && <div role="alert" className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"><span className="flex-1">Không tải được {catalogError ? 'danh mục' : 'địa điểm'}. Bạn có thể thử lại trước khi lưu.</span><button type="button" onClick={() => { if (catalogError) void categoriesQuery.refetch(); if (provincesQuery.isError) void provincesQuery.refetch(); }} className="inline-flex items-center gap-1 font-bold underline"><RefreshCw className="h-4 w-4" />Thử lại</button></div>}
        <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-200 pt-5 sm:flex-row"><button type="button" onClick={() => navigate('/dashboard/jobs')} className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50">Hủy</button><button type="submit" disabled={createMutation.isPending || catalogLoading || catalogEmpty || categoriesQuery.isError} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-500 px-5 py-3 text-sm font-bold text-white shadow-md shadow-primary-500/10 hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60">{createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Lưu bản nháp</button></div>
      </form>
    </div></div>;
};

const Field = ({ label, value, onChange, error = false, required = false, type = 'text', min, className = '' }: { label: string; value: string; onChange: (value: string) => void; error?: boolean; required?: boolean; type?: string; min?: number; className?: string }) => <label className={`block space-y-1.5 ${className}`}><span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}{required && ' *'}</span><input required={required} type={type} min={min} value={value} onChange={event => onChange(event.target.value)} className={`w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-primary-500 focus:bg-white ${error ? 'border-red-300' : 'border-slate-200'}`} /></label>;

const SelectField = ({ label, value, onChange, options, error = false, required = false, disabled = false }: { label: string; value: string; onChange: (value: string) => void; options: { value: string; label: string }[]; error?: boolean; required?: boolean; disabled?: boolean }) => <label className="block space-y-1.5"><span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}{required && ' *'}</span><select required={required} disabled={disabled} value={value} onChange={event => onChange(event.target.value)} className={`w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-primary-500 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60 ${error ? 'border-red-300' : 'border-slate-200'}`}>{options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;

const TextAreaField = ({ label, value, onChange, disabled = false }: { label: string; value: string; onChange: (value: string) => void; disabled?: boolean }) => <label className="block space-y-1.5"><span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</span><textarea rows={6} value={value} disabled={disabled} onChange={event => onChange(event.target.value)} className="w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 outline-none transition-all focus:border-primary-500 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60" /></label>;

const toFormFieldRequest = (field: FormFieldDraft, displayOrder: number): FormFieldRequest => ({
  fieldName: field.fieldName,
  label: field.label.trim(),
  fieldType: field.fieldType,
  required: field.required,
  options: field.fieldType === 'SELECT' ? field.options.map(option => option.trim()) : [],
  displayOrder,
});

class FormFieldsSaveError extends Error {
  public readonly jobId: number;

  constructor(jobId: number, cause: unknown) {
    super('Không thể lưu form ứng tuyển', { cause });
    this.jobId = jobId;
  }
}
