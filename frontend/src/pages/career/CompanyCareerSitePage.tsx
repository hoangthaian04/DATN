import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { publicService } from '../../services/public.service';
import { Loader2 } from 'lucide-react';
import {
  MapPin,
  Search,
  ArrowRight,
  Globe2,
  Users,
  Send,
  Zap,
  Briefcase,
  Clock,
  FileText,
  Building2,
  Calendar,
  User,
  LayoutGrid,
  Box
} from 'lucide-react';

export const CompanyCareerSitePage: React.FC = () => {
  const { companySlug } = useParams<{ companySlug: string }>();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'about'>('overview');

  const { data: COMPANY, isLoading: isLoadingCompany } = useQuery({
    queryKey: ['public-company', companySlug],
    queryFn: () => publicService.getCompanySite(companySlug as string),
    enabled: !!companySlug,
  });

  const { data: JOBS = [], isLoading: isLoadingJobs } = useQuery({
    queryKey: ['public-jobs', companySlug, debouncedSearch],
    queryFn: () => publicService.getCompanyJobs(companySlug as string, debouncedSearch),
    enabled: !!companySlug,
  });

  if (isLoadingCompany || isLoadingJobs) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!COMPANY) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-slate-800">Không tìm thấy công ty</h1>
      </div>
    );
  }

  const filteredJobs = JOBS;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* HEADER TABS */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to={`/company/${COMPANY.slug}`} className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary-500 flex items-center justify-center text-white">
              <Building2 className="h-4 w-4" />
            </div>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">{COMPANY.name}</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`transition-colors py-5 border-b-2 ${activeTab === 'overview' ? 'text-primary-600 border-primary-600' : 'text-slate-500 border-transparent hover:text-primary-600'}`}
            >
              Tổng quan
            </button>
            <button 
              onClick={() => setActiveTab('jobs')}
              className={`transition-colors py-5 border-b-2 ${activeTab === 'jobs' ? 'text-primary-600 border-primary-600' : 'text-slate-500 border-transparent hover:text-primary-600'}`}
            >
              Tin tuyển dụng
            </button>
            <button 
              onClick={() => setActiveTab('about')}
              className={`transition-colors py-5 border-b-2 ${activeTab === 'about' ? 'text-primary-600 border-primary-600' : 'text-slate-500 border-transparent hover:text-primary-600'}`}
            >
              Giới thiệu công ty
            </button>
          </nav>
        </div>
      </header>

      {/* RENDER CONTENT BASED ON ACTIVE TAB */}
      
      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <>
          {/* BANNER SECTION */}
          <div className="bg-white pb-16 pt-10">
            <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left info */}
              <div>
                <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight mb-4">
                  {COMPANY.name}
                </h1>
                <p className="text-lg md:text-xl text-slate-600 font-medium mb-8">
                  {COMPANY.slogan}
                </p>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setActiveTab('about')}
                    className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-full transition-colors flex items-center gap-2"
                  >
                    Tìm hiểu thêm <ArrowRight className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setActiveTab('jobs')}
                    className="px-8 py-3 bg-white border-2 border-primary-600 text-primary-600 hover:bg-primary-50 font-bold rounded-full transition-colors"
                  >
                    Cơ hội việc làm
                  </button>
                </div>
              </div>
              {/* Right image */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl h-[400px]">
                <img 
                  src="https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?q=80&w=1200&auto=format&fit=crop" 
                  alt="Company Event" 
                  className="w-full h-full object-cover"
                />
                {/* Dots */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                  <div className="w-2 h-2 rounded-full bg-white/50 cursor-pointer hover:bg-white transition-colors"></div>
                  <div className="w-2 h-2 rounded-full bg-white/50 cursor-pointer hover:bg-white transition-colors"></div>
                  <div className="w-2 h-2 rounded-full bg-white/50 cursor-pointer hover:bg-white transition-colors"></div>
                  <div className="w-2 h-2 rounded-full bg-white/50 cursor-pointer hover:bg-white transition-colors"></div>
                </div>
              </div>
            </div>
          </div>

          {/* JOBS SECTION */}
          <section className="max-w-6xl mx-auto px-6 py-16 bg-slate-50">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Vị trí mới nhất</h2>
                <p className="text-sm font-semibold text-slate-400 mt-1">
                  Khám phá các cơ hội nghề nghiệp mới nhất tại {COMPANY.name}.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {JOBS.slice(0, 3).map((job) => (
                <article key={job.slug} className="premium-card bg-white p-7 space-y-6 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-300 ring-1 ring-slate-100 hover:ring-primary-100 group flex flex-col h-full rounded-2xl">
                  <div className="flex-1">
                    <h3 className="text-xl font-extrabold text-slate-800 leading-snug group-hover:text-primary-600 transition-colors">{job.title}</h3>
                    <p className="text-xs font-semibold text-slate-400 mt-2 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Đăng ngày {job.postedAt}</p>
                  </div>

                  <div className="space-y-3 text-xs font-semibold text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="flex items-center gap-2.5"><MapPin className="h-4 w-4 text-primary-500" />{job.location}</p>
                    <p className="flex items-center gap-2.5"><Briefcase className="h-4 w-4 text-primary-500" />{job.type}</p>
                    <p className="flex items-center gap-2.5"><FileText className="h-4 w-4 text-primary-500" />{job.salary}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {job.tags.map((tag) => (
                      <span key={tag} className="text-[11px] font-bold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2">
                    <Link
                      to={`/company/${COMPANY.slug}/jobs/${job.slug}`}
                      className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-bold shadow-md shadow-primary-500/20 hover:shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all"
                    >
                      {job.requiresCv ? 'Xem và nộp CV' : 'Xem và gửi thông tin'}
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
            
            <div className="mt-8 text-center">
              <button 
                onClick={() => setActiveTab('jobs')}
                className="inline-flex items-center gap-2 px-6 py-2 border border-slate-300 hover:border-primary-500 hover:text-primary-600 text-slate-600 text-sm font-bold rounded-full transition-colors"
              >
                Xem tất cả công việc <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>

          {/* SHORT ABOUT SECTION */}
          <div className="bg-white py-16 border-t border-slate-100">
            <div className="max-w-4xl mx-auto px-6 text-center">
              <h2 className="text-3xl font-extrabold text-slate-800 mb-8">Giới thiệu công ty</h2>
              <div className="text-slate-600 text-base leading-relaxed space-y-4 text-justify md:text-center mb-8">
                <p>
                  {COMPANY.description}
                </p>
                <p>
                  Với mục tiêu trở thành công ty hàng đầu trong lĩnh vực công nghệ, chúng tôi cam kết mang lại môi trường làm việc tốt nhất, chế độ đãi ngộ hấp dẫn và cơ hội phát triển sự nghiệp không giới hạn cho mọi thành viên.
                </p>
              </div>
              <button 
                onClick={() => setActiveTab('about')}
                className="inline-flex items-center gap-2 px-6 py-2.5 border border-primary-600 text-primary-600 hover:bg-primary-50 text-sm font-bold rounded-full transition-colors mb-12"
              >
                Tìm hiểu thêm về {COMPANY.name} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* 2. JOBS TAB */}
      {activeTab === 'jobs' && (
        <div className="bg-slate-50 py-16 min-h-screen">
          <div className="max-w-6xl mx-auto px-6">
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-8">Tất cả việc làm tại {COMPANY.name}</h1>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex-1 w-full">
                <label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-wide">Tìm kiếm công việc</label>
                <div className="relative w-full">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm vị trí, kỹ năng..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all"
                  />
                </div>
              </div>
              <div className="text-slate-500 text-sm font-medium pb-3 hidden md:block">
                Tìm thấy <span className="font-bold text-primary-600">{filteredJobs.length}</span> kết quả
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {filteredJobs.length > 0 ? filteredJobs.map((job) => (
                <article key={job.slug} className="premium-card bg-white p-7 space-y-6 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-300 ring-1 ring-slate-100 hover:ring-primary-100 group flex flex-col h-full rounded-2xl">
                  <div className="flex-1">
                    <h3 className="text-xl font-extrabold text-slate-800 leading-snug group-hover:text-primary-600 transition-colors">{job.title}</h3>
                    <p className="text-xs font-semibold text-slate-400 mt-2 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Đăng ngày {job.postedAt}</p>
                  </div>

                  <div className="space-y-3 text-xs font-semibold text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="flex items-center gap-2.5"><MapPin className="h-4 w-4 text-primary-500" />{job.location}</p>
                    <p className="flex items-center gap-2.5"><Briefcase className="h-4 w-4 text-primary-500" />{job.type}</p>
                    <p className="flex items-center gap-2.5"><FileText className="h-4 w-4 text-primary-500" />{job.salary}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {job.tags.map((tag) => (
                      <span key={tag} className="text-[11px] font-bold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2">
                    <Link
                      to={`/company/${COMPANY.slug}/jobs/${job.slug}`}
                      className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-bold shadow-md shadow-primary-500/20 hover:shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all"
                    >
                      {job.requiresCv ? 'Xem và nộp CV' : 'Xem và gửi thông tin'}
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </article>
              )) : (
                <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200">
                  <p className="text-slate-500 font-medium">Không tìm thấy công việc nào phù hợp với từ khóa của bạn.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. ABOUT TAB (FULL DETAILED VIEW) */}
      {activeTab === 'about' && (
        <div className="bg-white py-16 min-h-screen border-t border-slate-100">
          <div className="max-w-4xl mx-auto px-6">
            <h1 className="text-3xl font-extrabold text-slate-800 mb-10">Giới thiệu công ty {COMPANY.name}</h1>
            
            {/* Info Card */}
            <div className="text-left mb-12 border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
              <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200 border-b border-slate-200">
                <div className="p-6 md:col-span-4 lg:col-span-3 flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="text-sm font-semibold text-slate-700">Năm thành lập</span>
                </div>
                <div className="p-6 md:col-span-8 lg:col-span-9 flex items-center">
                  <span className="text-sm text-slate-600 font-medium">{COMPANY.founded}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200 border-b border-slate-200">
                <div className="p-6 md:col-span-4 lg:col-span-3 flex items-center gap-3">
                  <Users className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="text-sm font-semibold text-slate-700">Quy mô</span>
                </div>
                <div className="p-6 md:col-span-8 lg:col-span-9 flex items-center">
                  <span className="text-sm text-slate-600 font-medium">{COMPANY.size}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200 border-b border-slate-200">
                <div className="p-6 md:col-span-4 lg:col-span-3 flex items-center gap-3">
                  <User className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="text-sm font-semibold text-slate-700">Độ tuổi trung bình</span>
                </div>
                <div className="p-6 md:col-span-8 lg:col-span-9 flex items-center">
                  <span className="text-sm text-slate-600 font-medium">{COMPANY.averageAge}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200 border-b border-slate-200">
                <div className="p-6 md:col-span-4 lg:col-span-3 flex items-start gap-3">
                  <LayoutGrid className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-sm font-semibold text-slate-700">Ngành nghề kinh doanh</span>
                </div>
                <div className="p-6 md:col-span-8 lg:col-span-9">
                  <ul className="text-sm text-slate-600 space-y-3 font-medium">
                    {COMPANY.businessSectors.map((sector, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-slate-400">{idx + 1}.</span> {sector}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200">
                <div className="p-6 md:col-span-4 lg:col-span-3 flex items-start gap-3">
                  <Box className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-sm font-semibold text-slate-700">Ngành nghề chính</span>
                </div>
                <div className="p-6 md:col-span-8 lg:col-span-9">
                  <ul className="text-sm text-slate-600 space-y-3 font-medium">
                    {COMPANY.mainSector.map((sector, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-slate-400">{idx + 1}.</span> {sector}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Detailed Description */}
            <div className="text-slate-700 text-sm md:text-base leading-relaxed space-y-6 text-justify md:text-left font-medium">
              {COMPANY.fullDescription.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 mt-0">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-primary-500 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <p className="text-sm font-extrabold text-white">{COMPANY.name}</p>
              </div>
              <p className="text-xs font-semibold leading-relaxed">
                {COMPANY.footer.description}
              </p>
              <div className="flex gap-3">
                <a href={COMPANY.footer.facebook} target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-primary-500 transition-colors cursor-pointer">
                  <Globe2 className="h-4 w-4 text-slate-400 hover:text-white" />
                </a>
                <a href={COMPANY.footer.linkedin} target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-primary-500 transition-colors cursor-pointer">
                  <Users className="h-4 w-4 text-slate-400 hover:text-white" />
                </a>
                <a href={`mailto:${COMPANY.email}`} className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-primary-500 transition-colors cursor-pointer">
                  <Send className="h-4 w-4 text-slate-400 hover:text-white" />
                </a>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest">Liên kết</h4>
              <div className="space-y-2.5">
                <button onClick={() => setActiveTab('about')} className="block text-xs font-semibold hover:text-primary-400 transition-colors">Về chúng tôi</button>
                <button onClick={() => setActiveTab('jobs')} className="block text-xs font-semibold hover:text-primary-400 transition-colors">Vị trí đang tuyển</button>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest">Liên hệ</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <MapPin className="h-3.5 w-3.5 text-primary-500 shrink-0" />
                  <p className="text-xs font-semibold">{COMPANY.location}</p>
                </div>
                <div className="flex items-center gap-2.5">
                  <Globe2 className="h-3.5 w-3.5 text-primary-500 shrink-0" />
                  <p className="text-xs font-semibold">{COMPANY.website}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-xs font-semibold">{COMPANY.footer.copyright}</p>
            <p className="text-xs font-semibold text-slate-600">
              Tuyển dụng trực tuyến qua <span className="text-primary-500 font-bold">EasyTech Platform</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
