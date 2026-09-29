import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Clock,
  DollarSign,
  Search,
  ArrowRight,
  Briefcase,
  Users,
  Trophy,
  Zap,
  ChevronRight,
  Building2,
} from 'lucide-react';

interface JobCard {
  id: string;
  slug: string;
  title: string;
  location: string;
  workType: string;
  salaryFrom: number;
  salaryTo: number;
  currency: string;
  experience: number;
  categoryName: string;
  applicantCount: number;
  postedAt: string;
  tags: string[];
}

const JOBS: JobCard[] = [
  {
    id: 'j1', slug: 'senior-ai-engineer',
    title: 'Senior AI Engineer',
    location: 'TP. Hồ Chí Minh (Hybrid)',
    workType: 'Full-time',
    salaryFrom: 50, salaryTo: 90, currency: 'triệu VND',
    experience: 5,
    categoryName: 'Kỹ thuật / AI',
    applicantCount: 24,
    postedAt: '2026-08-01',
    tags: ['Python', 'LangChain', 'Vector DB'],
  },
  {
    id: 'j2', slug: 'product-designer',
    title: 'Senior Product Designer',
    location: 'TP. Hồ Chí Minh (Remote)',
    workType: 'Full-time',
    salaryFrom: 35, salaryTo: 60, currency: 'triệu VND',
    experience: 3,
    categoryName: 'Thiết kế',
    applicantCount: 18,
    postedAt: '2026-08-02',
    tags: ['Figma', 'UX Research', 'Design System'],
  },
  {
    id: 'j3', slug: 'backend-developer-java',
    title: 'Backend Developer (Java)',
    location: 'TP. Hồ Chí Minh',
    workType: 'Full-time',
    salaryFrom: 30, salaryTo: 55, currency: 'triệu VND',
    experience: 3,
    categoryName: 'Kỹ thuật / Backend',
    applicantCount: 31,
    postedAt: '2026-07-28',
    tags: ['Java', 'Spring Boot', 'Microservices'],
  },
  {
    id: 'j4', slug: 'devops-engineer',
    title: 'DevOps / Platform Engineer',
    location: 'Hà Nội (Hybrid)',
    workType: 'Full-time',
    salaryFrom: 40, salaryTo: 75, currency: 'triệu VND',
    experience: 4,
    categoryName: 'Kỹ thuật / Infra',
    applicantCount: 12,
    postedAt: '2026-08-05',
    tags: ['Kubernetes', 'AWS', 'Terraform'],
  },
  {
    id: 'j5', slug: 'data-scientist',
    title: 'Data Scientist',
    location: 'TP. Hồ Chí Minh (On-site)',
    workType: 'Full-time',
    salaryFrom: 45, salaryTo: 80, currency: 'triệu VND',
    experience: 3,
    categoryName: 'Dữ liệu',
    applicantCount: 9,
    postedAt: '2026-08-06',
    tags: ['Python', 'ML', 'SQL'],
  },
  {
    id: 'j6', slug: 'product-manager',
    title: 'Product Manager (AI Products)',
    location: 'TP. Hồ Chí Minh (Hybrid)',
    workType: 'Full-time',
    salaryFrom: 55, salaryTo: 95, currency: 'triệu VND',
    experience: 5,
    categoryName: 'Sản phẩm',
    applicantCount: 7,
    postedAt: '2026-08-07',
    tags: ['Roadmap', 'Agile', 'AI Products'],
  },
];

const STATS = [
  { icon: Briefcase, label: 'Vị trí mở', value: '6+' },
  { icon: Users, label: 'Nhân viên', value: '120+' },
  { icon: Trophy, label: 'Năm thành lập', value: '2019' },
  { icon: Building2, label: 'Văn phòng', value: '2 thành phố' },
];

const WHY_JOIN = [
  { icon: Zap, title: 'AI-First Culture', desc: 'Làm việc với các công nghệ AI mới nhất, từ LLM đến Vector Embedding trong môi trường thực tế.' },
  { icon: DollarSign, title: 'Lương & Phúc lợi hấp dẫn', desc: 'Mức lương cạnh tranh + equity + review 2 lần/năm + 13th month + bảo hiểm sức khỏe cao cấp.' },
  { icon: Trophy, title: 'Phát triển không giới hạn', desc: 'Budget học hỏi hàng năm, mentorship từ senior engineers, cơ hội làm việc với khách hàng quốc tế.' },
];

export const CareerHomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const filtered = JOBS.filter(
    (j) =>
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary-500/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-amber-500/5 blur-2xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight tracking-tight mb-6">
            Cùng nhau xây dựng<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-amber-400">
              tương lai của AI
            </span>
          </h1>

          <p className="text-lg text-slate-400 font-semibold max-w-2xl mx-auto mb-10 leading-relaxed">
            TechA Solutions tìm kiếm những tài năng đam mê công nghệ, không ngại thử thách và muốn tạo ra tác động thực sự.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm vị trí, kỹ năng, địa điểm..."
              className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:outline-none focus:border-primary-500/50 text-slate-200 placeholder:text-slate-500 text-sm font-medium transition-all backdrop-blur-sm"
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-14 max-w-2xl mx-auto">
            {STATS.map((s) => {
              return (
                <div key={s.label} className="text-center">
                  <p className="text-2xl font-extrabold text-white">{s.value}</p>
                  <p className="text-xs text-slate-400 font-semibold mt-1">{s.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Tại sao chọn TechA?</h2>
          <p className="text-sm text-slate-400 font-semibold mt-2">Môi trường làm việc nơi bạn có thể phát triển tối đa tiềm năng</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {WHY_JOIN.map((w) => {
            const Icon = w.icon;
            return (
              <div key={w.title} className="premium-card bg-white p-6 space-y-4 text-left">
                <div className="h-11 w-11 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary-500" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800">{w.title}</h3>
                  <p className="text-xs text-slate-500 font-semibold mt-2 leading-relaxed">{w.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Job Listings */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Cơ hội đang chờ bạn</h2>
            <p className="text-sm text-slate-400 font-semibold mt-1">{filtered.length} vị trí đang tuyển dụng</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((job) => (
            <div key={job.id} className="premium-card bg-white p-6 space-y-5 group">
              {/* Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-primary-500 bg-primary-50 border border-primary-100 px-2.5 py-1 rounded-full">
                    {job.categoryName}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">{job.postedAt}</span>
                </div>
                <h3 className="text-base font-extrabold text-slate-800 leading-snug group-hover:text-primary-500 transition-colors">
                  {job.title}
                </h3>
              </div>

              {/* Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {job.location}
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  {job.workType} · {job.experience}+ năm kinh nghiệm
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                  <DollarSign className="h-3.5 w-3.5" />
                  {job.salaryFrom}–{job.salaryTo} {job.currency}
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {job.tags.map((tag) => (
                  <span key={tag} className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
                  <Users className="h-3 w-3" />
                  {job.applicantCount} ứng viên
                </div>
                <Link
                  to={`/careers/jobs/${job.slug}`}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold transition-all shadow-sm shadow-primary-500/20"
                >
                  Ứng tuyển
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Search className="h-10 w-10 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400 font-semibold">Không tìm thấy vị trí phù hợp với từ khóa "{searchQuery}"</p>
          </div>
        )}
      </section>
    </div>
  );
};
