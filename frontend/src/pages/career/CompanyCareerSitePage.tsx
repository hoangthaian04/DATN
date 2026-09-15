import { useQuery } from '@tanstack/react-query';
import { Building2, ChevronLeft, ChevronRight, Loader2, MapPin, Search, WifiOff } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { errorMessage } from '@/services/api';
import { careerService } from '@/services/career.service';
import { formatDate, formatSalaryRange } from '@/utils/format';

const employmentLabels: Record<string, string> = {
  FULL_TIME: 'Toàn thời gian',
  PART_TIME: 'Bán thời gian',
  CONTRACT: 'Hợp đồng',
  INTERNSHIP: 'Thực tập',
};

const workingLabels: Record<string, string> = {
  ONSITE: 'Tại văn phòng',
  HYBRID: 'Linh hoạt',
  REMOTE: 'Từ xa',
};

export const CompanyCareerSitePage: React.FC = () => {
  const { companySlug = '' } = useParams<{ companySlug: string }>();
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [submittedFilters, setSubmittedFilters] = useState({ keyword: '', location: '', category: '' });

  const companyQuery = useQuery({
    queryKey: ['public-company', companySlug],
    queryFn: () => careerService.getCompany(companySlug),
    enabled: Boolean(companySlug),
    retry: 1,
  });

  const jobsQuery = useQuery({
    queryKey: ['public-jobs', companySlug, submittedFilters, page],
    queryFn: () => careerService.getJobs(companySlug, { ...submittedFilters, page, limit: 9 }),
    enabled: Boolean(companySlug && companyQuery.data),
    retry: 1,
  });

  useEffect(() => {
    document.title = companyQuery.data?.siteTitle || companyQuery.data?.companyName || 'Career Site';
  }, [companyQuery.data]);

  const accentColor = companyQuery.data?.accentColor || companyQuery.data?.primaryColor || '#2563eb';
  const company = companyQuery.data;
  const jobs = jobsQuery.data?.data || [];
  const totalPages = jobsQuery.data?.last_page || 1;

  const resultLabel = useMemo(() => {
    if (jobsQuery.isLoading) return 'Đang tải việc làm...';
    if (jobsQuery.data?.total === 0) return 'Chưa có vị trí phù hợp';
    return `${jobsQuery.data?.total || 0} vị trí đang tuyển`;
  }, [jobsQuery.data?.total, jobsQuery.isLoading]);

  const submitFilters = (event: React.FormEvent) => {
    event.preventDefault();
    setPage(1);
    setSubmittedFilters({ keyword: keyword.trim(), location: location.trim(), category });
  };

  if (companyQuery.isLoading) return <PageLoader label="Đang tải Career Site..." />;

  if (companyQuery.isError || !company) {
    return <PublicErrorState message={errorMessage(companyQuery.error)} onRetry={() => companyQuery.refetch()} />;
  }

  return (
    <div className="space-y-8" style={{ '--career-accent': accentColor } as React.CSSProperties}>
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 shadow-xl">
        {company.bannerUrl && <img src={company.bannerUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-slate-900/80 to-[var(--career-accent)]/70" />
        <div className="relative grid gap-8 px-6 py-12 sm:px-10 lg:grid-cols-[1fr_auto] lg:items-end lg:px-14">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-lg">
                {company.logoUrl ? <img src={company.logoUrl} alt={company.companyName} className="h-full w-full object-contain" /> : <Building2 className="h-8 w-8 text-slate-400" />}
              </div>
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white/80">Career Site</span>
            </div>
            <p className="mt-8 text-sm font-semibold text-white/70">{company.companyName}</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">{company.siteTitle || `Cơ hội nghề nghiệp tại ${company.companyName}`}</h1>
            {company.tagline && <p className="mt-4 max-w-2xl text-base leading-7 text-white/75">{company.tagline}</p>}
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-5 text-white backdrop-blur-sm lg:min-w-56">
            <p className="text-[11px] font-bold uppercase tracking-wider text-white/60">Đang tuyển dụng</p>
            <p className="mt-2 text-3xl font-extrabold">{jobsQuery.data?.total ?? '—'}</p>
            <p className="mt-1 text-xs text-white/65">vị trí công khai</p>
          </div>
        </div>
      </section>

      {company.description && <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><h2 className="text-lg font-extrabold text-slate-900">Về {company.companyName}</h2><p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">{company.description}</p></section>}

      <section className="space-y-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div><p className="text-xs font-bold uppercase tracking-wider text-[var(--career-accent)]">Cơ hội dành cho bạn</p><h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">Vị trí đang tuyển</h2><p className="mt-1 text-sm text-slate-500">{resultLabel}</p></div>
          <Link to="/careers" className="text-xs font-bold text-slate-500 hover:text-slate-900">Đổi Career Site</Link>
        </div>

        <form onSubmit={submitFilters} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1.4fr_1fr_1fr_auto]">
          <label className="relative block"><span className="sr-only">Tìm kiếm vị trí</span><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Tìm theo tên vị trí..." className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none transition focus:border-[var(--career-accent)] focus:ring-2 focus:ring-[var(--career-accent)]/10" /></label>
          <label><span className="sr-only">Địa điểm</span><input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Địa điểm" className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-[var(--career-accent)] focus:ring-2 focus:ring-[var(--career-accent)]/10" /></label>
          <label><span className="sr-only">Danh mục</span><select value={category} onChange={(event) => setCategory(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-[var(--career-accent)] focus:ring-2 focus:ring-[var(--career-accent)]/10"><option value="">Tất cả danh mục</option>{company.categories.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}</select></label>
          <button type="submit" className="h-11 rounded-xl bg-[var(--career-accent)] px-5 text-sm font-bold text-white transition hover:brightness-95">Tìm việc</button>
        </form>

        {jobsQuery.isLoading ? <JobGridLoader /> : jobsQuery.isError ? <PublicErrorState message={errorMessage(jobsQuery.error)} onRetry={() => jobsQuery.refetch()} compact /> : jobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center"><Search className="mx-auto h-8 w-8 text-slate-300" /><h3 className="mt-4 text-base font-bold text-slate-800">Không tìm thấy vị trí phù hợp</h3><p className="mt-1 text-sm text-slate-500">Thử thay đổi từ khóa, địa điểm hoặc danh mục.</p></div>
        ) : (
          <>
            <div className="grid gap-4 lg:grid-cols-2">{jobs.map((job) => <Link key={job.id} to={`/careers/${companySlug}/jobs/${job.slug}`} className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--career-accent)]/50 hover:shadow-md"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="text-xs font-semibold text-slate-400">{job.categoryName || 'Cơ hội nghề nghiệp'}</p><h3 className="mt-2 truncate text-lg font-extrabold text-slate-900 group-hover:text-[var(--career-accent)]">{job.title}</h3></div><span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">Đang tuyển</span></div><div className="mt-5 grid gap-2 text-xs font-medium text-slate-500 sm:grid-cols-2"><span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-slate-400" />{job.location || 'Linh hoạt'}</span><span>{workingLabels[job.workingType || ''] || employmentLabels[job.employmentType || ''] || 'Toàn thời gian'}</span><span>{formatSalaryRange(job.salaryMin, job.salaryMax, job.currency || 'VND')}</span>{job.publishedAt && <span>Đăng {formatDate(job.publishedAt)}</span>}</div><span className="mt-6 inline-flex text-xs font-extrabold text-[var(--career-accent)]">Xem chi tiết →</span></Link>)}</div>
            {totalPages > 1 && <div className="flex items-center justify-center gap-3 pt-3"><button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft className="h-4 w-4" />Trước</button><span className="text-xs font-bold text-slate-500">Trang {page} / {totalPages}</span><button type="button" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40">Sau<ChevronRight className="h-4 w-4" /></button></div>}
          </>
        )}
      </section>
    </div>
  );
};

const PageLoader = ({ label }: { label: string }) => <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-slate-500"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /><p className="text-sm font-semibold">{label}</p></div>;
const JobGridLoader = () => <div className="grid gap-4 lg:grid-cols-2">{[1, 2, 3, 4].map((item) => <div key={item} className="h-48 animate-pulse rounded-2xl bg-slate-200" />)}</div>;
const PublicErrorState = ({ message, onRetry, compact = false }: { message: string; onRetry: () => void; compact?: boolean }) => <div className={`flex flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50 px-6 text-center ${compact ? 'py-12' : 'min-h-[50vh] py-16'}`}><WifiOff className="h-8 w-8 text-red-400" /><h2 className="mt-4 text-base font-extrabold text-red-900">Career Site không khả dụng</h2><p className="mt-2 max-w-md text-sm text-red-700">{message}</p><button type="button" onClick={onRetry} className="mt-5 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-red-700">Thử lại</button></div>;
