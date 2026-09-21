import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, BriefcaseBusiness, CalendarDays, Loader2, MapPin, WifiOff } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { errorMessage } from '@/services/api';
import { careerService } from '@/services/career.service';
import { formatDate, formatSalaryRange } from '@/utils/format';

const labels: Record<string, string> = {
  ONSITE: 'Tại văn phòng',
  HYBRID: 'Linh hoạt',
  REMOTE: 'Từ xa',
  FULL_TIME: 'Toàn thời gian',
  PART_TIME: 'Bán thời gian',
  CONTRACT: 'Hợp đồng',
  INTERNSHIP: 'Thực tập',
  INTERN: 'Thực tập sinh',
  JUNIOR: 'Junior',
  MID: 'Mid-level',
  SENIOR: 'Senior',
  LEAD: 'Lead',
};

export const CareerJobDetailPage: React.FC = () => {
  const { companySlug = '', slug = '' } = useParams<{ companySlug: string; slug: string }>();
  const query = useQuery({
    queryKey: ['public-job', companySlug, slug],
    queryFn: () => careerService.getJob(companySlug, slug),
    enabled: Boolean(companySlug && slug),
    retry: 1,
  });

  if (query.isLoading) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;

  if (query.isError || !query.data) {
    return <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-3xl border border-red-100 bg-red-50 px-6 text-center"><WifiOff className="h-8 w-8 text-red-400" /><h1 className="mt-4 text-lg font-extrabold text-red-900">Không tìm thấy tin tuyển dụng</h1><p className="mt-2 max-w-md text-sm text-red-700">{errorMessage(query.error)}</p><div className="mt-5 flex gap-3"><button type="button" onClick={() => query.refetch()} className="rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-red-700">Thử lại</button><Link to={`/careers/${companySlug}`} className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-xs font-bold text-red-700">Quay lại Career Site</Link></div></div>;
  }

  const job = query.data;
  const company = job.company;

  return (
    <article className="space-y-6">
      <Link to={`/careers/${companySlug}`} className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 transition hover:text-slate-900"><ArrowLeft className="h-4 w-4" />Quay lại danh sách việc làm</Link>
      <header className="rounded-3xl bg-slate-900 px-6 py-10 text-white shadow-xl sm:px-10 lg:px-14">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-3xl"><p className="text-sm font-semibold text-white/60">{company.companyName}</p><h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl">{job.title}</h1><div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold text-white/75"><span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2"><MapPin className="h-4 w-4" />{job.location || 'Linh hoạt'}</span><span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2"><BriefcaseBusiness className="h-4 w-4" />{labels[job.workingType || ''] || labels[job.employmentType || ''] || 'Toàn thời gian'}</span>{job.publishedAt && <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2"><CalendarDays className="h-4 w-4" />Đăng {formatDate(job.publishedAt)}</span>}{(job.startDate || job.endDate) && <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2">Nhận hồ sơ {job.startDate || '—'} → {job.endDate || '—'}</span>}</div></div>
          <Link to={`/careers/${companySlug}/jobs/${job.slug}/apply`} className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-extrabold text-slate-900 shadow-lg transition hover:bg-slate-100">Ứng tuyển ngay</Link>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="grid gap-4 border-b border-slate-100 pb-6 sm:grid-cols-2 lg:grid-cols-4"><Info label="Mức lương" value={formatSalaryRange(job.salaryMin, job.salaryMax, job.currency || 'VND')} /><Info label="Loại hình" value={labels[job.employmentType || ''] || 'Chưa cập nhật'} /><Info label="Kinh nghiệm" value={job.experienceYearsMin ? `${job.experienceYearsMin} năm` : labels[job.experienceLevel || ''] || 'Không yêu cầu'} /><Info label="Danh mục" value={job.categoryName || 'Chưa phân loại'} /></div>
          <ContentSection title="Mô tả công việc" content={job.description} />
          <ContentSection title="Yêu cầu ứng viên" content={job.requirements} />
          <ContentSection title="Quyền lợi" content={job.benefits} />
        </div>

        <aside className="space-y-4"><div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-slate-100">{company.logoUrl ? <img src={company.logoUrl} alt={company.companyName} className="h-full w-full object-contain" /> : <BriefcaseBusiness className="h-6 w-6 text-slate-400" />}</div><div><p className="text-sm font-extrabold text-slate-900">{company.companyName}</p><p className="text-xs text-slate-500">Career Site</p></div></div><Link to={`/careers/${companySlug}/jobs/${job.slug}/apply`} className="mt-6 flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-blue-700">Ứng tuyển vị trí này</Link><Link to={`/careers/${companySlug}`} className="mt-3 flex w-full items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50">Xem các vị trí khác</Link></div></aside>
      </div>
    </article>
  );
};

const Info = ({ label, value }: { label: string; value: string }) => <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-2 text-sm font-extrabold text-slate-800">{value}</p></div>;
const ContentSection = ({ title, content }: { title: string; content?: string }) => content ? <section><h2 className="border-b border-slate-100 pb-3 text-sm font-extrabold uppercase tracking-wider text-slate-900">{title}</h2><p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">{content}</p></section> : null;
