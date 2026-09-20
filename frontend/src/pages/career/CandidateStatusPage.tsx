import { useQuery } from '@tanstack/react-query';
import { AlertCircle, CalendarDays, Clock3, Loader2, MapPin, RefreshCw } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

import { errorMessage } from '@/services/api';
import { careerService } from '@/services/career.service';

const formatDate = (value?: string) => value ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Chưa cập nhật';

export const CandidateStatusPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token')?.trim() || '';
  const email = searchParams.get('email')?.trim() || '';
  const query = useQuery({
    queryKey: ['public-application-status', token, email],
    queryFn: () => careerService.getApplicationStatus(token, email),
    enabled: Boolean(token && email),
  });

  if (!token || !email) {
    return <StatusError title="Thiếu thông tin xác thực" message="Hãy mở lại Magic Link trong email và nhập email ứng tuyển để tiếp tục." />;
  }
  if (query.isLoading) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
  if (query.isError || !query.data) {
    return <StatusError title="Không thể lấy trạng thái hồ sơ" message={errorMessage(query.error)} onRetry={() => void query.refetch()} />;
  }

  const application = query.data;
  return (
    <section className="mx-auto max-w-3xl space-y-6 py-8">
      <div className="rounded-3xl bg-slate-950 p-7 text-white shadow-xl sm:p-10">
        <p className="text-xs font-bold uppercase tracking-wider text-white/60">{application.companyName}</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight">{application.jobTitle}</h1>
        <p className="mt-3 text-sm text-white/65">Hồ sơ của {application.candidateName}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Trạng thái hồ sơ</p><p className="mt-2 text-xl font-extrabold text-emerald-700">{application.applicationStatus}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Vòng hiện tại</p><p className="mt-2 text-xl font-extrabold text-slate-800">{application.currentStage}</p></div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">Thông tin cập nhật</h2>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2"><div><dt className="text-xs text-slate-400">Cập nhật lần cuối</dt><dd className="mt-1 font-bold text-slate-700">{formatDate(application.lastUpdatedAt)}</dd></div><div><dt className="text-xs text-slate-400">Liên kết có hiệu lực đến</dt><dd className="mt-1 font-bold text-slate-700">{formatDate(application.expiresAt)}</dd></div></dl>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">Lịch phỏng vấn</h2>
        {application.interviews.length === 0 ? <p className="mt-4 text-sm text-slate-500">Chưa có lịch phỏng vấn được sắp xếp.</p> : <div className="mt-4 space-y-3">{application.interviews.map(interview => <div key={interview.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-sm font-extrabold text-slate-800">{interview.status}</span><span className="text-xs font-semibold text-slate-500">{formatDate(interview.interviewTime)}</span></div><div className="mt-3 flex flex-wrap gap-4 text-xs font-semibold text-slate-500"><span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" />{formatDate(interview.interviewTime)}</span>{interview.duration && <span className="inline-flex items-center gap-1.5"><Clock3 className="h-4 w-4" />{interview.duration} phút</span>}{interview.location && <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" />{interview.location}</span>}</div>{interview.rescheduleReason && <p className="mt-3 text-xs text-slate-600">Ghi chú đổi lịch: {interview.rescheduleReason}</p>}</div>)}</div>}
      </div>
      <Link to="/careers" className="inline-flex text-sm font-extrabold text-blue-600 hover:underline">Xem các vị trí đang tuyển →</Link>
    </section>
  );
};

const StatusError = ({ title, message, onRetry }: { title: string; message: string; onRetry?: () => void }) => (
  <section className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center py-12"><div className="w-full rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm sm:p-10"><AlertCircle className="mx-auto h-10 w-10 text-red-500" /><h1 className="mt-5 text-2xl font-extrabold text-slate-900">{title}</h1><p className="mt-3 text-sm leading-6 text-slate-500">{message}</p>{onRetry && <button type="button" onClick={onRetry} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-extrabold text-white hover:bg-red-700"><RefreshCw className="h-4 w-4" />Thử lại</button>}</div></section>
);
