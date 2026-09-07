import { useEffect, useState, type DragEvent, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Check, GripVertical, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';
import { hiringRoundService } from '@/services/hiring-round.service';
import { jobService } from '@/services/job.service';
import type { HiringRound, HiringRoundRequest } from '@/types/hiring-round.types';

type EmailTemplateOption = { id: number; name: string };
const passEmailTemplates: EmailTemplateOption[] = [
  { id: 1, name: 'Chúc mừng qua vòng CV Screening' },
  { id: 2, name: 'Chúc mừng qua vòng Online Test' },
  { id: 3, name: 'Thông báo mời phỏng vấn' },
  { id: 4, name: 'Offer Letter' },
];
const failEmailTemplates: EmailTemplateOption[] = [
  { id: 5, name: 'Thông báo không đạt vòng CV' },
  { id: 6, name: 'Thông báo không đạt vòng Online Test' },
  { id: 7, name: 'Cảm ơn ứng viên đã ứng tuyển' },
];
const blankRound = (): HiringRoundRequest => ({ name: '', description: '', testLink: '', isFinalRound: false, passEmailTemplateId: null, failEmailTemplateId: null });
const asOptionalId = (value: string) => value === '' ? null : Number(value);
const errorMessage = (error: unknown, fallback: string) => (error as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback;

export const RoundsConfigPage = () => {
  const { id: jobId } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<HiringRound | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<HiringRoundRequest>(blankRound);
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const { data: job } = useQuery({ queryKey: ['job', jobId], queryFn: () => jobService.getJobById(jobId!), enabled: Boolean(jobId) });
  const { data: rounds = [], isLoading, isError } = useQuery({ queryKey: ['hiring-rounds', jobId], queryFn: () => hiringRoundService.getRounds(jobId!), enabled: Boolean(jobId) });
  const invalidate = () => { queryClient.invalidateQueries({ queryKey: ['hiring-rounds', jobId] }); queryClient.invalidateQueries({ queryKey: ['job', jobId] }); };
  const create = useMutation({ mutationFn: (data: HiringRoundRequest) => hiringRoundService.createRound(jobId!, data), onSuccess: () => { toast.success('Đã thêm vòng tuyển dụng'); setCreating(false); invalidate(); }, onError: error => toast.error(errorMessage(error, 'Không thể thêm vòng tuyển dụng')) });
  const update = useMutation({ mutationFn: ({ roundId, data }: { roundId: number; data: HiringRoundRequest }) => hiringRoundService.updateRound(jobId!, roundId, data), onSuccess: () => { toast.success('Đã cập nhật vòng tuyển dụng'); setEditing(null); invalidate(); }, onError: error => toast.error(errorMessage(error, 'Không thể cập nhật vòng tuyển dụng')) });
  const remove = useMutation({ mutationFn: (roundId: number) => hiringRoundService.deleteRound(jobId!, roundId), onSuccess: () => { toast.success('Đã xóa vòng tuyển dụng'); invalidate(); }, onError: error => toast.error(errorMessage(error, 'Không thể xóa vòng tuyển dụng')) });
  const reorder = useMutation({ mutationFn: (ids: number[]) => hiringRoundService.reorderRounds(jobId!, ids), onSuccess: invalidate, onError: error => { toast.error(errorMessage(error, 'Không thể đổi thứ tự vòng tuyển dụng')); invalidate(); } });
  const openCreate = () => { setForm(blankRound()); setCreating(true); };
  const openEdit = (round: HiringRound) => { setForm({ name: round.name, description: round.description || '', testLink: round.testLink || '', passEmailTemplateId: round.passEmailTemplateId ?? null, failEmailTemplateId: round.failEmailTemplateId ?? null, isFinalRound: round.isFinalRound }); setEditing(round); };
  const submit = (event: FormEvent) => { event.preventDefault(); const payload = { ...form, name: form.name.trim() }; if (!payload.name) return toast.error('Vui lòng nhập tên vòng tuyển dụng'); if (creating) create.mutate(payload); else if (editing) update.mutate({ roundId: editing.id, data: payload }); };
  const drop = (event: DragEvent<HTMLDivElement>, targetId: number) => { event.preventDefault(); if (draggedId === null || draggedId === targetId || reorder.isPending) return; const next = [...rounds]; const from = next.findIndex(round => round.id === draggedId); const to = next.findIndex(round => round.id === targetId); const [moved] = next.splice(from, 1); next.splice(to, 0, moved); reorder.mutate(next.map(round => round.id)); setDraggedId(null); };
  const closeModal = () => { setCreating(false); setEditing(null); };
  const modalOpen = creating || editing !== null;
  const isSaving = create.isPending || update.isPending;

  useEffect(() => {
    const roundId = Number(searchParams.get('round'));
    if (!roundId || editing || creating) return;
    const target = rounds.find(round => round.id === roundId);
    if (target) { openEdit(target); setSearchParams({}); }
  }, [rounds, searchParams, editing, creating, setSearchParams]);

  return <div className="min-h-[calc(100vh-4rem)] bg-[#F8FAFC] p-5 sm:p-8"><div className="mx-auto max-w-4xl space-y-6">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><button onClick={() => navigate(`/dashboard/jobs/${jobId}`)} className="mt-1 rounded-lg p-2 text-slate-500 hover:bg-white hover:text-slate-800" aria-label="Quay lại"><ArrowLeft className="h-5 w-5" /></button><div><p className="text-xs font-bold uppercase tracking-wider text-primary-500">Pipeline tuyển dụng</p><h1 className="mt-1 text-2xl font-extrabold text-slate-800">Cấu hình vòng tuyển dụng</h1><p className="mt-1 text-sm text-slate-500">{job ? `Thiết lập quy trình cho ${job.title}` : 'Thiết lập quy trình tuyển dụng'}</p></div></div><button onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-500 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-primary-600"><Plus className="h-4 w-4" />Thêm vòng mới</button></header>
    <section className="premium-card overflow-hidden bg-white"><div className="border-b border-slate-100 px-6 py-4"><h2 className="text-sm font-extrabold text-slate-800">Các vòng hiện có</h2><p className="mt-1 text-xs text-slate-500">Kéo thả để thay đổi thứ tự. Thay đổi được lưu ngay sau khi thả.</p></div>{isLoading ? <div className="flex justify-center p-12"><Loader2 className="h-7 w-7 animate-spin text-primary-500" /></div> : isError ? <div className="p-10 text-center text-sm text-red-500">Không thể tải danh sách vòng tuyển dụng. Vui lòng thử lại.</div> : rounds.length === 0 ? <div className="p-12 text-center"><p className="font-semibold text-slate-700">Chưa có vòng tuyển dụng nào</p><p className="mt-1 text-sm text-slate-500">Bắt đầu bằng cách thêm vòng sàng lọc hoặc phỏng vấn đầu tiên.</p></div> : <div className="divide-y divide-slate-100">{rounds.map((round, index) => <div key={round.id} draggable={!reorder.isPending} onDragStart={() => setDraggedId(round.id)} onDragOver={event => event.preventDefault()} onDrop={event => drop(event, round.id)} className={`flex items-center gap-3 px-4 py-4 transition-colors ${draggedId === round.id ? 'bg-primary-50 opacity-60' : 'hover:bg-slate-50'}`}><GripVertical className="h-5 w-5 shrink-0 cursor-grab text-slate-300" /><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-extrabold text-primary-600">{index + 1}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="truncate text-sm font-bold text-slate-800">{round.name}</p>{round.isFinalRound && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">VÒNG CUỐI</span>}</div>{round.description && <p className="mt-1 truncate text-xs text-slate-500">{round.description}</p>}</div><button onClick={() => openEdit(round)} className="rounded-lg p-2 text-slate-400 hover:bg-white hover:text-primary-600" aria-label={`Sửa ${round.name}`}><Pencil className="h-4 w-4" /></button><button onClick={() => { if (window.confirm(`Xóa vòng “${round.name}”? Không thể xóa nếu vòng đang có ứng viên.`)) remove.mutate(round.id); }} disabled={remove.isPending} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50" aria-label={`Xóa ${round.name}`}><Trash2 className="h-4 w-4" /></button></div>)}</div>}</section>
  </div>{modalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" role="dialog" aria-modal="true"><form onSubmit={submit} className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-xl"><div className="flex items-center justify-between border-b border-slate-100 px-6 py-4"><h2 className="text-lg font-extrabold text-slate-800">{creating ? 'Thêm vòng tuyển dụng' : 'Chỉnh sửa vòng tuyển dụng'}</h2><button type="button" onClick={closeModal} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100" aria-label="Đóng"><X className="h-5 w-5" /></button></div><div className="space-y-4 p-6"><TextInput label="Tên vòng" required autoFocus value={form.name} onChange={name => setForm({ ...form, name })} placeholder="Ví dụ: Phỏng vấn chuyên môn" /><label className="block text-sm font-bold text-slate-700">Mô tả<textarea value={form.description || ''} onChange={event => setForm({ ...form, description: event.target.value })} className="mt-1.5 min-h-20 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary-500" placeholder="Mục tiêu hoặc nội dung của vòng này" /></label><TextInput label="Link bài kiểm tra" value={form.testLink || ''} onChange={testLink => setForm({ ...form, testLink })} placeholder="https://..." /><div className="grid gap-4 sm:grid-cols-2"><EmailSelect label="Email Pass" value={form.passEmailTemplateId} templates={passEmailTemplates} emptyLabel="Không gửi email đạt" onChange={passEmailTemplateId => setForm({ ...form, passEmailTemplateId })} /><EmailSelect label="Email False" value={form.failEmailTemplateId} templates={failEmailTemplates} emptyLabel="Không gửi email không đạt" onChange={failEmailTemplateId => setForm({ ...form, failEmailTemplateId })} /></div></div><div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4"><button type="button" onClick={closeModal} className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100">Hủy</button><button disabled={isSaving} className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">{isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}{creating ? 'Thêm vòng' : 'Lưu thay đổi'}</button></div></form></div>}</div>;
};

const TextInput = ({ label, value, onChange, placeholder, required, autoFocus }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; required?: boolean; autoFocus?: boolean }) => <label className="block text-sm font-bold text-slate-700">{label} {required && <span className="text-red-500">*</span>}<input autoFocus={autoFocus} value={value} onChange={event => onChange(event.target.value)} maxLength={label === 'Tên vòng' ? 255 : undefined} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary-500" placeholder={placeholder} /></label>;
const EmailSelect = ({ label, value, templates, emptyLabel, onChange }: { label: string; value?: number | null; templates: EmailTemplateOption[]; emptyLabel: string; onChange: (value: number | null) => void }) => <label className="block text-sm font-bold text-slate-700">{label}<select value={value ?? ''} onChange={event => onChange(asOptionalId(event.target.value))} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary-500"><option value="">{emptyLabel}</option>{templates.map(template => <option key={template.id} value={template.id}>{template.name}</option>)}</select></label>;
