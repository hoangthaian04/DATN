import { useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, FileText, Loader2, RefreshCw, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link, useParams } from 'react-router-dom';

import { careerService } from '@/services/career.service';
import { errorMessage } from '@/services/api';
import type { PublicFormField } from '@/types/career.types';

export const CareerApplyFormPage: React.FC = () => {
  const { companySlug = '', slug = '' } = useParams<{ companySlug: string; slug: string }>();
  const [values, setValues] = useState<Record<string, string>>({});

  const query = useQuery({
    queryKey: ['public-job-apply', companySlug, slug],
    queryFn: () => careerService.getJob(companySlug, slug),
    enabled: Boolean(companySlug && slug),
  });

  if (query.isLoading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
  }

  if (query.isError || !query.data) {
    return <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-3xl border border-red-100 bg-red-50 px-6 text-center"><p className="text-lg font-extrabold text-red-900">Không tải được form ứng tuyển</p><p className="mt-2 max-w-md text-sm text-red-700">{errorMessage(query.error)}</p><button type="button" onClick={() => void query.refetch()} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-red-700"><RefreshCw className="h-4 w-4" />Thử lại</button></div>;
  }

  const job = query.data;
  const customFields = job.applicationForm?.fields || [];
  const setValue = (fieldName: string, value: string) => setValues(current => ({ ...current, [fieldName]: value }));
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!event.currentTarget.checkValidity()) return;
    toast('Biểu mẫu đã được kiểm tra. Chức năng gửi hồ sơ sẽ được xử lý trong US-26.', { icon: 'ℹ️' });
  };

  return <div className="mx-auto max-w-3xl space-y-6"><Link to={`/careers/${companySlug}/jobs/${job.slug}`} className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900"><ArrowLeft className="h-4 w-4" />Quay lại tin tuyển dụng</Link><div className="rounded-3xl bg-slate-950 p-7 text-white shadow-xl sm:p-10"><p className="text-sm font-semibold text-white/60">{job.company.companyName}</p><h1 className="mt-2 text-3xl font-extrabold tracking-tight">Ứng tuyển: {job.title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">Điền thông tin bên dưới. Các trường có dấu * là bắt buộc.</p></div><form onSubmit={submit} className="space-y-6"><section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="mb-6"><h2 className="text-base font-extrabold text-slate-900">Thông tin cá nhân</h2><p className="mt-1 text-xs text-slate-500">Thông tin mặc định của form ứng tuyển.</p></div><div className="grid gap-5 sm:grid-cols-2"><Input label="Họ và tên" required value={values.fullName || ''} onChange={value => setValue('fullName', value)} /><Input label="Email" type="email" required value={values.email || ''} onChange={value => setValue('email', value)} /><Input label="Số điện thoại" type="tel" required value={values.phone || ''} onChange={value => setValue('phone', value)} /><label className="block space-y-1.5"><span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">CV (PDF, tối đa 5MB) *</span><input type="file" required accept="application/pdf,.pdf" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-xs file:font-bold file:text-blue-700" /></label></div></section>{customFields.length > 0 ? <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="mb-6"><h2 className="text-base font-extrabold text-slate-900">Câu hỏi bổ sung</h2><p className="mt-1 text-xs text-slate-500">Các câu hỏi được HR cấu hình riêng cho vị trí này.</p></div><div className="space-y-5">{customFields.map(field => <DynamicField key={field.id} field={field} value={values[field.fieldName] || ''} onChange={value => setValue(field.fieldName, value)} />)}</div></section> : <section className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center"><FileText className="mx-auto h-7 w-7 text-slate-300" /><p className="mt-2 text-sm font-bold text-slate-600">Job đang dùng form mặc định</p><p className="mt-1 text-xs text-slate-500">Không có câu hỏi bổ sung từ HR.</p></section>}<div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-xs leading-5 text-blue-800">Form động đã được tải theo đúng Job. Việc upload CV, lưu application và gửi thông báo sẽ được hoàn thiện trong US-26.</div><button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"><Send className="h-4 w-4" />Kiểm tra thông tin ứng tuyển</button></form></div>;
};

const Input = ({ label, value, onChange, required = false, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; type?: string }) => <label className="block space-y-1.5"><span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}{required && ' *'}</span><input type={type} required={required} value={value} onChange={event => onChange(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white" /></label>;

const DynamicField = ({ field, value, onChange }: { field: PublicFormField; value: string; onChange: (value: string) => void }) => {
  const label = `${field.label}${field.required ? ' *' : ''}`;
  if (field.fieldType === 'SELECT') return <label className="block space-y-1.5"><span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</span><select required={field.required} value={value} onChange={event => onChange(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white"><option value="">-- Chọn một lựa chọn --</option>{field.options.map(option => <option key={option} value={option}>{option}</option>)}</select></label>;
  if (field.fieldType === 'TEXTAREA') return <label className="block space-y-1.5"><span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</span><textarea required={field.required} value={value} onChange={event => onChange(event.target.value)} rows={5} className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold leading-6 text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white" /></label>;
  if (field.fieldType === 'FILE') return <label className="block space-y-1.5"><span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</span><input type="file" required={field.required} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-xs file:font-bold file:text-blue-700" /></label>;
  return <Input label={label} value={value} onChange={onChange} required={field.required} type={field.fieldType === 'URL' ? 'url' : 'text'} />;
};
