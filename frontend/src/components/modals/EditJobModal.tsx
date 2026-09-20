import React, { useEffect, useState } from 'react';
import { AlertCircle, Check, ChevronLeft, ChevronRight, GripVertical, Loader2, Plus, RefreshCw, Trash2, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { Job, SaveJobPipelineRequest, UpdateJobRequest } from '@/types/job.types';
import type { HiringRound, HiringRoundRequest } from '@/types/hiring-round.types';
import { hiringRoundService } from '@/services/hiring-round.service';
import { formFieldService } from '@/services/form-field.service';
import { jobCategoryService, type JobCategoryOption } from '@/services/job-category.service';
import { locationService } from '@/services/location.service';
import { FormFieldsEditor } from '@/components/jobs/FormFieldsEditor';
import { toFormFieldDraft, type FormField, type FormFieldDraft, type FormFieldRequest } from '@/types/form-field.types';

interface Props { isOpen: boolean; onClose: () => void; jobData?: Job; onSave: (data: SaveJobPipelineRequest) => void; isPending: boolean; }
const emptyRound = (): HiringRoundRequest => ({ name: '', description: '', testLink: '', passEmailTemplateId: null, failEmailTemplateId: null, isFinalRound: false });
const numberOrNull = (value: string) => value === '' ? null : Number(value);
const templateOptions = (selectedId: number | null | undefined, emptyLabel: string) => [
  { value: '', label: selectedId == null ? 'Chưa có template email khả dụng (US-29)' : emptyLabel, disabled: selectedId == null },
  ...(selectedId == null ? [] : [{ value: String(selectedId), label: `Template #${selectedId} (đang liên kết)` }]),
];

export const EditJobModal: React.FC<Props> = ({ isOpen, onClose, jobData, onSave, isPending }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [job, setJob] = useState<UpdateJobRequest>({ title: '' });
  const [rounds, setRounds] = useState<HiringRoundRequest[]>([]);
  const [formFields, setFormFields] = useState<FormFieldDraft[]>([]);
  const [savingFormFields, setSavingFormFields] = useState(false);
  const { data: provinces } = useQuery({ queryKey: ['provinces'], queryFn: locationService.getProvinces, staleTime: Infinity, enabled: isOpen });
  const { data: categories = [], isLoading: loadingCategories, isError: categoryLoadError, refetch: refetchCategories } = useQuery({ queryKey: ['job-categories', 'active'], queryFn: jobCategoryService.getActiveOptions, staleTime: 5 * 60 * 1000, enabled: isOpen });
  const { data: savedRounds = [], isLoading: loadingRounds } = useQuery({ queryKey: ['hiring-rounds', jobData?.id], queryFn: () => hiringRoundService.getRounds(jobData!.id), enabled: isOpen && Boolean(jobData?.id) });
  const { data: savedFormFields = [], isLoading: loadingFormFields, isError: formFieldsLoadError, refetch: refetchFormFields } = useQuery({ queryKey: ['form-fields', jobData?.id], queryFn: () => formFieldService.getFormFields(jobData!.id), enabled: isOpen && Boolean(jobData?.id) });
  const isClosed = jobData?.status === 'CLOSED';

  useEffect(() => {
    if (!isOpen || !jobData) return;
    setStep(1);
    setJob({ categoryId: jobData.categoryId, title: jobData.title, description: jobData.description, requirements: jobData.requirements, benefits: jobData.benefits, salaryMin: jobData.salaryMin, salaryMax: jobData.salaryMax, currency: jobData.currency || 'VND', location: jobData.location, workingType: jobData.workingType || 'ONSITE', employmentType: jobData.employmentType || 'FULL_TIME', experienceLevel: jobData.experienceLevel || 'MID', experienceYearsMin: jobData.experienceYearsMin });
  }, [isOpen, jobData]);
  useEffect(() => { if (isOpen) setRounds(savedRounds.map(toDraft)); }, [isOpen, savedRounds]);
  useEffect(() => { if (isOpen) setFormFields(savedFormFields.map(toFormFieldDraft)); }, [isOpen, savedFormFields]);
  if (!isOpen || !jobData) return null;
  const setField = <K extends keyof UpdateJobRequest>(key: K, value: UpdateJobRequest[K]) => setJob(current => ({ ...current, [key]: value }));
  const updateRound = (index: number, updates: Partial<HiringRoundRequest>) => setRounds(current => current.map((round, i) => i === index ? { ...round, ...updates } : round));
  const next = () => { if (!job.title.trim()) return; setStep(2); };
  const save = async () => {
    if (step === 2) {
      setStep(3);
      return;
    }
    if (formFieldsLoadError) {
      toast.error('Chưa tải được form ứng tuyển. Vui lòng thử lại trước khi lưu.');
      return;
    }
    const formValidationError = validateFormFields(formFields);
    if (formValidationError) {
      toast.error(formValidationError);
      return;
    }
    const categoryIsUnchanged = job.categoryId === jobData.categoryId;
    const currentCategoryIsUnavailable = categoryIsUnchanged
      && jobData.categoryId != null
      && !categories.some(category => category.id === jobData.categoryId);
    const jobPayload = { ...job, title: job.title.trim(), roundCount: rounds.length };
    if (currentCategoryIsUnavailable) delete jobPayload.categoryId;

    try {
      setSavingFormFields(true);
      await syncFormFields(jobData.id, savedFormFields, formFields);
      onSave({ job: jobPayload, rounds });
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setSavingFormFields(false);
    }
  };

  const removeRound = (index: number) => {
    const round = rounds[index];
    if (round?.id != null && !window.confirm(`Xóa vòng “${round.name}”? Nếu vòng đang có ứng viên, hệ thống sẽ từ chối và giữ nguyên dữ liệu.`)) return;
    setRounds(current => current.filter((_, i) => i !== index));
  };

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"><div className="flex max-h-[95vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"><header className="flex items-center justify-between border-b border-slate-100 px-6 py-4"><div><h2 className="text-base font-extrabold uppercase tracking-wider text-slate-800">{isClosed ? 'Xem chi tiết tin tuyển dụng' : 'Chỉnh sửa tin tuyển dụng'}</h2>{!isClosed && <p className="mt-1 text-xs text-slate-400">Bước {step}/3 · {step === 1 ? 'Thông tin tin tuyển dụng' : step === 2 ? 'Cấu hình các vòng' : 'Form ứng tuyển'}</p>}</div><button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50"><X className="h-5 w-5" /></button></header>{isClosed ? <div className="p-6 text-sm text-slate-500">Tin tuyển dụng này đã đóng, không thể chỉnh sửa.</div> : <><main className="flex-1 overflow-y-auto p-6 text-left">{step === 1 ? <JobFields job={job} setField={setField} provinces={provinces} categories={categories} loadingCategories={loadingCategories} categoryLoadError={categoryLoadError} retryCategories={() => void refetchCategories()} currentCategoryName={jobData.categoryName} /> : step === 2 ? <RoundsStep rounds={rounds} loading={loadingRounds} onChange={updateRound} onAdd={() => setRounds(current => [...current, emptyRound()])} onDelete={removeRound} onMove={(from, direction) => setRounds(current => { const to = from + direction; if (to < 0 || to >= current.length) return current; const nextRounds = [...current]; [nextRounds[from], nextRounds[to]] = [nextRounds[to], nextRounds[from]]; return nextRounds; })} /> : <FormFieldsStep fields={formFields} loading={loadingFormFields} error={formFieldsLoadError} onRetry={() => void refetchFormFields()} onChange={setFormFields} disabled={savingFormFields} />}</main><footer className="flex justify-between gap-3 border-t border-slate-100 px-6 py-4">{step > 1 ? <button onClick={() => setStep(current => current === 3 ? 2 : 1)} className="inline-flex items-center gap-1 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100"><ChevronLeft className="h-4 w-4" />Quay lại</button> : <button onClick={onClose} className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50">Hủy</button>}{step < 3 ? <button onClick={step === 1 ? next : () => setStep(3)} className="inline-flex items-center gap-1 rounded-xl bg-primary-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-primary-600">Tiếp tục<ChevronRight className="h-4 w-4" /></button> : <button disabled={isPending || savingFormFields || loadingRounds || loadingFormFields || Boolean(formFieldsLoadError)} onClick={() => void save()} className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-60">{isPending || savingFormFields ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}Lưu tất cả thay đổi</button>}</footer></>}</div></div>;
};

const JobFields = ({ job, setField, provinces, categories, loadingCategories, categoryLoadError, retryCategories, currentCategoryName }: { job: UpdateJobRequest; setField: <K extends keyof UpdateJobRequest>(key: K, value: UpdateJobRequest[K]) => void; provinces?: { code: string; name: string }[]; categories: JobCategoryOption[]; loadingCategories: boolean; categoryLoadError: boolean; retryCategories: () => void; currentCategoryName?: string }) => {
  const currentCategoryMissing = job.categoryId != null && !categories.some(category => category.id === job.categoryId);
  const categoryOptions = [
    ...(currentCategoryMissing ? [{ value: String(job.categoryId), label: `${currentCategoryName || 'Danh mục hiện tại'} (INACTIVE)`, disabled: true }] : []),
    ...(job.categoryId == null ? [{ value: '', label: '-- Chọn danh mục --' }] : []),
    ...categories.map(category => ({ value: String(category.id), label: category.name })),
  ];
  const categorySelectOptions = loadingCategories
    ? [{ value: job.categoryId?.toString() || '', label: 'Đang tải danh mục...' }]
    : categoryOptions;

  return <div className="space-y-5"><div className="grid gap-5 md:grid-cols-2"><Input label="Tiêu đề Job" required value={job.title} onChange={value => setField('title', value)} className="md:col-span-2" /><Select label="Danh mục" value={job.categoryId?.toString() || ''} onChange={value => setField('categoryId', value === '' ? undefined : Number(value))} options={categorySelectOptions} disabled={loadingCategories} /><Select label="Địa điểm" value={job.location || ''} onChange={value => setField('location', value)} options={[{ value: '', label: '-- Chọn địa điểm --' }, ...(provinces || []).map(item => ({ value: item.name, label: item.name }))]} /><Select label="Loại hình" value={job.employmentType || 'FULL_TIME'} onChange={value => setField('employmentType', value)} options={[{ value: 'FULL_TIME', label: 'Toàn thời gian' }, { value: 'PART_TIME', label: 'Bán thời gian' }, { value: 'CONTRACT', label: 'Hợp đồng' }]} /><Select label="Hình thức làm việc" value={job.workingType || 'ONSITE'} onChange={value => setField('workingType', value)} options={[{ value: 'ONSITE', label: 'Tại văn phòng' }, { value: 'HYBRID', label: 'Linh hoạt' }, { value: 'REMOTE', label: 'Từ xa' }]} /><Select label="Tiền tệ" value={job.currency || 'VND'} onChange={value => setField('currency', value)} options={[{ value: 'VND', label: 'VND' }, { value: 'USD', label: 'USD' }]} /><Input label="Mức lương từ" type="number" value={job.salaryMin?.toString() || ''} onChange={value => setField('salaryMin', value === '' ? undefined : Number(value))} /><Input label="Mức lương đến" type="number" value={job.salaryMax?.toString() || ''} onChange={value => setField('salaryMax', value === '' ? undefined : Number(value))} /><Input label="Kinh nghiệm tối thiểu (năm)" type="number" value={job.experienceYearsMin?.toString() || ''} onChange={value => setField('experienceYearsMin', value === '' ? undefined : Number(value))} /></div>{loadingCategories && <p className="-mt-3 text-xs text-slate-400">Đang tải danh mục đang hoạt động...</p>}{!loadingCategories && !categoryLoadError && categories.length === 0 && job.categoryId == null && <p className="-mt-3 text-xs text-slate-500">Chưa có danh mục ACTIVE để lựa chọn. Bạn vẫn có thể lưu các trường Job khác.</p>}{categoryLoadError && <div role="alert" className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><div className="flex-1"><p>Không tải được danh mục. Bạn vẫn có thể sửa các trường khác.</p><button type="button" onClick={retryCategories} className="mt-1 inline-flex items-center gap-1 font-bold underline"><RefreshCw className="h-3 w-3" />Thử lại</button></div></div>}{currentCategoryMissing && <p className="-mt-3 text-xs text-amber-600">Danh mục hiện tại đã INACTIVE hoặc không còn khả dụng. Nếu không chọn danh mục mới, hệ thống sẽ giữ nguyên liên kết cũ.</p>}<TextArea label="Mô tả công việc" value={job.description || ''} onChange={value => setField('description', value)} /><TextArea label="Yêu cầu ứng viên" value={job.requirements || ''} onChange={value => setField('requirements', value)} /><TextArea label="Quyền lợi" value={job.benefits || ''} onChange={value => setField('benefits', value)} /></div>;
};
const RoundsStep = ({ rounds, loading, onChange, onAdd, onDelete, onMove }: { rounds: HiringRoundRequest[]; loading: boolean; onChange: (index: number, updates: Partial<HiringRoundRequest>) => void; onAdd: () => void; onDelete: (index: number) => void; onMove: (index: number, direction: number) => void }) => <div><div className="mb-5 flex items-start justify-between gap-4"><div><h3 className="text-base font-extrabold text-slate-800">Các vòng tuyển dụng</h3><p className="mt-1 text-xs text-slate-500">Các thay đổi chỉ được lưu khi bấm “Lưu tất cả thay đổi”.</p></div><button onClick={onAdd} className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"><Plus className="h-4 w-4" />Thêm vòng</button></div>{loading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary-500" /></div> : rounds.length === 0 ? <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">Chưa có vòng tuyển dụng. Bấm “Thêm vòng” để bắt đầu.</div> : <div className="space-y-4">{rounds.map((round, index) => <section key={round.id || `new-${index}`} className="rounded-2xl border border-slate-200 p-4"><div className="mb-4 flex items-center gap-2"><GripVertical className="h-4 w-4 text-slate-300" /><span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-50 text-[11px] font-bold text-primary-600">{index + 1}</span><span className="text-xs font-bold text-slate-700">Thông tin vòng</span><div className="ml-auto flex gap-1"><button disabled={index === 0} onClick={() => onMove(index, -1)} className="rounded px-2 text-xs text-slate-500 disabled:opacity-30">↑</button><button disabled={index === rounds.length - 1} onClick={() => onMove(index, 1)} className="rounded px-2 text-xs text-slate-500 disabled:opacity-30">↓</button><button onClick={() => onDelete(index)} className="rounded p-1 text-red-400 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button></div></div><div className="grid gap-4 sm:grid-cols-2"><Input label="Tên vòng" required value={round.name} onChange={name => onChange(index, { name })} /><Input label="Link bài kiểm tra" value={round.testLink || ''} onChange={testLink => onChange(index, { testLink })} placeholder="https://..." /><Select label="Email Pass" value={round.passEmailTemplateId?.toString() || ''} onChange={value => onChange(index, { passEmailTemplateId: numberOrNull(value) })} options={templateOptions(round.passEmailTemplateId, 'Không gửi email đạt')} /><Select label="Email False" value={round.failEmailTemplateId?.toString() || ''} onChange={value => onChange(index, { failEmailTemplateId: numberOrNull(value) })} options={templateOptions(round.failEmailTemplateId, 'Không gửi email không đạt')} /></div><p className="mt-2 text-xs text-slate-500">Danh sách template thật sẽ dùng dữ liệu của US-29; không dùng dữ liệu mẫu trên UI.</p><div className="mt-4"><TextArea label="Mô tả" rows={2} value={round.description || ''} onChange={description => onChange(index, { description })} /></div><label className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-slate-600"><input type="checkbox" checked={Boolean(round.isFinalRound)} onChange={event => onChange(index, { isFinalRound: event.target.checked })} className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />Đánh dấu là vòng cuối</label></section>)}</div>}</div>;
const Input = ({ label, value, onChange, required, type = 'text', placeholder, className = '' }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; type?: string; placeholder?: string; className?: string }) => <label className={`block space-y-1.5 ${className}`}><span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label} {required && '*'}</span><input required={required} type={type} min={type === 'number' ? 0 : undefined} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-primary-500 focus:bg-white" /></label>;
const Select = ({ label, value, onChange, options, disabled = false }: { label: string; value: string; onChange: (value: string) => void; options: { value: string; label: string; disabled?: boolean }[]; disabled?: boolean }) => <label className="block space-y-1.5"><span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</span><select disabled={disabled} value={value} onChange={event => onChange(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-primary-500 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60">{options.map(option => <option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>)}</select></label>;
const TextArea = ({ label, value, onChange, rows = 4 }: { label: string; value: string; onChange: (value: string) => void; rows?: number }) => <label className="block space-y-1.5"><span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</span><textarea rows={rows} value={value} onChange={event => onChange(event.target.value)} className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold leading-relaxed text-slate-700 outline-none focus:border-primary-500 focus:bg-white" /></label>;
const toDraft = (round: HiringRound): HiringRoundRequest => ({ id: round.id, name: round.name, description: round.description || '', testLink: round.testLink || '', passEmailTemplateId: round.passEmailTemplateId ?? null, failEmailTemplateId: round.failEmailTemplateId ?? null, isFinalRound: round.isFinalRound });

const FormFieldsStep = ({ fields, loading, error, onRetry, onChange, disabled }: { fields: FormFieldDraft[]; loading: boolean; error: boolean; onRetry: () => void; onChange: (fields: FormFieldDraft[]) => void; disabled: boolean }) => {
  if (loading) return <div className="flex min-h-64 items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-primary-500" /></div>;
  if (error) return <div role="alert" className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center"><AlertCircle className="h-7 w-7 text-amber-500" /><p className="text-sm font-bold text-amber-800">Không tải được form ứng tuyển của Job.</p><button type="button" onClick={onRetry} className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 underline"><RefreshCw className="h-4 w-4" />Thử lại</button></div>;
  return <FormFieldsEditor fields={fields} onChange={onChange} disabled={disabled} />;
};

const toFormFieldRequest = (field: FormFieldDraft, displayOrder: number): FormFieldRequest => ({
  fieldName: field.fieldName,
  label: field.label.trim(),
  fieldType: field.fieldType,
  required: field.required,
  options: field.fieldType === 'SELECT' ? field.options.map(option => option.trim()) : [],
  displayOrder,
});

const syncFormFields = async (jobId: number, savedFields: FormField[], currentFields: FormFieldDraft[]) => {
  const currentIds = new Set(currentFields.flatMap(field => field.id == null ? [] : [field.id]));
  for (const savedField of savedFields) {
    if (!currentIds.has(savedField.id)) await formFieldService.deleteFormField(jobId, savedField.id);
  }

  const persistedIds: number[] = [];
  for (const [index, field] of currentFields.entries()) {
    const request = toFormFieldRequest(field, index);
    const persisted = field.id == null
      ? await formFieldService.createFormField(jobId, request)
      : await formFieldService.updateFormField(jobId, field.id, request);
    persistedIds.push(persisted.id);
  }
  await formFieldService.reorderFormFields(jobId, persistedIds);
};

const validateFormFields = (fields: FormFieldDraft[]): string | null => {
  if (fields.some(field => !field.label.trim())) return 'Nhãn câu hỏi không được để trống.';
  const selectField = fields.find(field => field.fieldType === 'SELECT' && (
    field.options.length === 0
    || field.options.some(option => !option.trim())
    || new Set(field.options.map(option => option.trim())).size !== field.options.length
  ));
  if (selectField) return 'Mỗi field SELECT phải có các lựa chọn không trống và không trùng nhau.';
  return null;
};

const apiErrorMessage = (error: unknown) => {
  const response = (error as { response?: { data?: { message?: string } } })?.response;
  return response?.data?.message || 'Không thể lưu form ứng tuyển. Vui lòng thử lại.';
};
